// Package sandbox поднимает стеки демо по запросу посетителей: у каждого
// своя изолированная сеть и контейнеры, общий лимит на число стеков
// и автоматическая остановка без активности.
package sandbox

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"io"
	"log/slog"
	"slices"
	"strings"
	"sync"
	"time"

	"portfolio/sandbox/internal/docker"
)

// Label отмечает всё, что создала песочница: по ней убираем хвосты после рестарта.
const Label = "portfolio.sandbox"

type Docker interface {
	CreateNetwork(ctx context.Context, name string, labels map[string]string) (string, error)
	ConnectNetwork(ctx context.Context, network, container string) error
	RemoveNetwork(ctx context.Context, network, self string) error
	CreateContainer(ctx context.Context, spec docker.Container) (string, error)
	StartContainer(ctx context.Context, id string) error
	InspectContainer(ctx context.Context, id string) (docker.State, error)
	RemoveContainer(ctx context.Context, id string) error
	Logs(ctx context.Context, id string) (io.ReadCloser, error)
	Labeled(ctx context.Context, label string) (containers, networks []string, err error)
}

type Config struct {
	Max          int           // стеков одновременно на весь сервер
	PerIP        int           // стеков с одного IP
	IdleTTL      time.Duration // остановить без активности
	MaxTTL       time.Duration // остановить в любом случае
	StartTimeout time.Duration
	// Self — имя контейнера самого сервиса: его подключаем к сети песочницы,
	// чтобы проксировать запросы во фронт демо. Пусто — не подключаем (тесты).
	Self string
}

var (
	ErrUnknownTemplate = errors.New("unknown template")
	ErrNotFound        = errors.New("sandbox not found")
)

// BusyError — свободных мест нет; RetryAfter — когда освободится ближайшее.
type BusyError struct {
	Reason     string // capacity | ip
	RetryAfter time.Duration
}

func (e *BusyError) Error() string { return "sandbox busy: " + e.Reason }

type Status string

const (
	Starting Status = "starting"
	Ready    Status = "ready"
	Stopping Status = "stopping"
	Failed   Status = "failed"
)

type Box struct {
	ID       string
	Template *Template
	Visitor  string
	IP       string
	Created  time.Time

	// ctx живёт, пока жив стек: отменяется в Stop и обрывает запуск и чтение логов.
	ctx    context.Context
	cancel context.CancelFunc

	mu         sync.Mutex
	status     Status
	lastActive time.Time
	network    string
	containers []string // в порядке запуска
	hub        *hub
}

func (b *Box) Status() Status {
	b.mu.Lock()
	defer b.mu.Unlock()
	return b.status
}

func (b *Box) setStatus(s Status) {
	b.mu.Lock()
	b.status = s
	b.mu.Unlock()
}

// BasePath — путь, под которым фронт демо отдаёт страницы.
func (b *Box) BasePath() string { return "/s/" + b.ID + "/" }

// WebHost — адрес фронта демо внутри сети песочницы.
func (b *Box) WebHost() string {
	return fmt.Sprintf("%s:%d", containerName(b.ID, b.Template.Web), b.Template.WebPort)
}

func (b *Box) Subscribe() ([]Event, chan Event, func()) { return b.hub.subscribe() }

type Manager struct {
	docker    Docker
	cfg       Config
	log       *slog.Logger
	templates map[string]*Template
	// probe проверяет, что фронт демо отвечает; в тестах подменяется.
	probe func(ctx context.Context, url string) error
	now   func() time.Time

	mu    sync.Mutex
	boxes map[string]*Box
}

func NewManager(d Docker, cfg Config, log *slog.Logger, probe func(context.Context, string) error, templates ...Template) *Manager {
	m := &Manager{docker: d, cfg: cfg, log: log, probe: probe, now: time.Now, templates: map[string]*Template{}, boxes: map[string]*Box{}}
	for i := range templates {
		m.templates[templates[i].ID] = &templates[i]
	}
	return m
}

// Create поднимает стек или возвращает уже запущенный стек этого посетителя.
func (m *Manager) Create(templateID, visitor, ip string) (*Box, error) {
	tmpl, ok := m.templates[templateID]
	if !ok {
		return nil, ErrUnknownTemplate
	}
	m.mu.Lock()
	defer m.mu.Unlock()

	now := m.now()
	live, sameIP := 0, 0
	var soonest time.Duration = -1
	for _, b := range m.boxes {
		st := b.Status()
		if st == Stopping || st == Failed {
			continue
		}
		if b.Visitor == visitor && b.Template.ID == templateID {
			b.touch(now)
			return b, nil
		}
		live++
		if b.IP == ip {
			sameIP++
		}
		if left := m.expiresAt(b).Sub(now); soonest < 0 || left < soonest {
			soonest = left
		}
	}
	if live >= m.cfg.Max {
		return nil, &BusyError{Reason: "capacity", RetryAfter: max(soonest, 0)}
	}
	if sameIP >= m.cfg.PerIP {
		return nil, &BusyError{Reason: "ip"}
	}

	ctx, cancel := context.WithCancel(context.Background())
	b := &Box{
		ID: newID(), Template: tmpl, Visitor: visitor, IP: ip, Created: now,
		ctx: ctx, cancel: cancel, status: Starting, lastActive: now, hub: newHub(),
	}
	m.boxes[b.ID] = b
	m.log.Info("sandbox requested", "id", b.ID, "template", tmpl.ID, "live", live+1)
	go m.run(b)
	return b, nil
}

func (m *Manager) Get(id string) (*Box, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	b, ok := m.boxes[id]
	if !ok {
		return nil, ErrNotFound
	}
	return b, nil
}

// Touch продлевает жизнь стека: любой запрос в демо или пинг окна.
func (m *Manager) Touch(id string) (time.Time, error) {
	b, err := m.Get(id)
	if err != nil {
		return time.Time{}, err
	}
	b.touch(m.now())
	return m.expiresAt(b), nil
}

func (b *Box) touch(t time.Time) {
	b.mu.Lock()
	b.lastActive = t
	b.mu.Unlock()
}

// expiresAt — когда стек остановится, если активности больше не будет.
func (m *Manager) expiresAt(b *Box) time.Time {
	b.mu.Lock()
	idle := b.lastActive.Add(m.cfg.IdleTTL)
	b.mu.Unlock()
	hard := b.Created.Add(m.cfg.MaxTTL)
	if hard.Before(idle) {
		return hard
	}
	return idle
}

func (m *Manager) ExpiresAt(b *Box) time.Time { return m.expiresAt(b) }

func (m *Manager) run(b *Box) {
	err := m.start(b.ctx, b)
	if err == nil {
		b.setStatus(Ready)
		b.hub.emit(Event{Type: "ready"})
		m.log.Info("sandbox ready", "id", b.ID, "took", m.now().Sub(b.Created).Round(time.Millisecond))
		return
	}
	if b.ctx.Err() != nil {
		// Остановили во время запуска. Stop убрал то, что успел увидеть,
		// а контейнер, создававшийся в этот момент, найдём по метке.
		m.purge(b.ID)
		return
	}
	m.log.Error("sandbox failed", "id", b.ID, "err", err)
	b.setStatus(Failed)
	b.hub.emit(Event{Type: "error", Text: "не удалось запустить стек"})
	m.Stop(b.ID, "failed")
}

func (m *Manager) start(ctx context.Context, b *Box) error {
	ctx, cancel := context.WithTimeout(ctx, m.cfg.StartTimeout)
	defer cancel()
	labels := map[string]string{Label: b.ID, Label + ".template": b.Template.ID}

	for _, s := range b.Template.Services {
		b.hub.emit(Event{Type: "state", Service: s.Name, Status: "pending"})
	}
	netID, err := m.docker.CreateNetwork(ctx, "sbx-"+b.ID, labels)
	if err != nil {
		return fmt.Errorf("create network: %w", err)
	}
	b.mu.Lock()
	b.network = netID
	b.mu.Unlock()
	if m.cfg.Self != "" {
		if err := m.docker.ConnectNetwork(ctx, netID, m.cfg.Self); err != nil {
			return fmt.Errorf("connect self: %w", err)
		}
	}

	for _, s := range b.Template.Services {
		id, err := m.docker.CreateContainer(ctx, docker.Container{
			Name:        containerName(b.ID, s.Name),
			Image:       s.Image,
			Cmd:         s.Cmd,
			Env:         expand(s.Env, b.BasePath()),
			Labels:      labels,
			Network:     "sbx-" + b.ID,
			Alias:       s.Name,
			Memory:      s.MemoryMB << 20,
			NanoCPUs:    int64(s.CPUs * 1e9),
			PidsLimit:   256,
			Tmpfs:       s.Tmpfs,
			Hardened:    s.Hardened,
			Healthcheck: s.Healthcheck,
		})
		if err != nil {
			return fmt.Errorf("create %s: %w", s.Name, err)
		}
		b.mu.Lock()
		b.containers = append(b.containers, id)
		b.mu.Unlock()
		if err := m.docker.StartContainer(ctx, id); err != nil {
			return fmt.Errorf("start %s: %w", s.Name, err)
		}
		b.hub.emit(Event{Type: "state", Service: s.Name, Status: "starting"})
		go m.follow(b, s.Name, id)

		if s.WaitHealthy {
			if err := m.waitHealthy(ctx, id); err != nil {
				return fmt.Errorf("%s: %w", s.Name, err)
			}
		}
		b.hub.emit(Event{Type: "state", Service: s.Name, Status: "running"})
	}

	// Фронт готов, когда отдаёт страницу по своему пути, а не когда процесс стартовал.
	url := "http://" + b.WebHost() + b.BasePath()
	for {
		if err := m.probe(ctx, url); err == nil {
			return nil
		}
		select {
		case <-ctx.Done():
			return fmt.Errorf("web not ready: %w", ctx.Err())
		case <-time.After(300 * time.Millisecond):
		}
	}
}

func (m *Manager) waitHealthy(ctx context.Context, id string) error {
	for {
		st, err := m.docker.InspectContainer(ctx, id)
		if err != nil {
			return err
		}
		switch {
		case st.Status == "exited" || st.Status == "dead":
			return fmt.Errorf("container exited with code %d", st.ExitCode)
		case st.Health == "healthy":
			return nil
		case st.Health == "unhealthy":
			return errors.New("container unhealthy")
		}
		select {
		case <-ctx.Done():
			return ctx.Err()
		case <-time.After(250 * time.Millisecond):
		}
	}
}

// follow пересылает логи контейнера в окно Docker, пока стек жив.
func (m *Manager) follow(b *Box, service, id string) {
	rc, err := m.docker.Logs(b.ctx, id)
	if err != nil {
		return
	}
	defer rc.Close()
	_ = docker.Demux(rc, func(line string) {
		if line = strings.TrimSpace(line); line != "" {
			b.hub.emit(Event{Type: "log", Service: service, Text: truncate(line, 300)})
		}
	})
}

// Stop удаляет контейнеры и сеть. Повторный вызов безопасен.
func (m *Manager) Stop(id, reason string) {
	m.mu.Lock()
	b, ok := m.boxes[id]
	if ok {
		delete(m.boxes, id)
	}
	m.mu.Unlock()
	if !ok {
		return
	}

	b.mu.Lock()
	if b.status != Failed {
		b.status = Stopping
	}
	containers := slices.Clone(b.containers)
	network := b.network
	b.mu.Unlock()
	b.cancel()

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	slices.Reverse(containers)
	for i, c := range containers {
		if err := m.docker.RemoveContainer(ctx, c); err != nil {
			m.log.Error("remove container", "id", id, "err", err)
		}
		name := b.Template.Services[len(containers)-1-i].Name
		b.hub.emit(Event{Type: "state", Service: name, Status: "stopped"})
	}
	if network != "" {
		if err := m.docker.RemoveNetwork(ctx, network, m.cfg.Self); err != nil {
			m.log.Error("remove network", "id", id, "err", err)
		}
	}
	b.hub.emit(Event{Type: "stopped", Text: reason})
	b.hub.close()
	m.log.Info("sandbox stopped", "id", id, "reason", reason, "lived", m.now().Sub(b.Created).Round(time.Second))
}

// Reap останавливает стеки без активности; вызывается по таймеру.
func (m *Manager) Reap() {
	now := m.now()
	m.mu.Lock()
	var expired []string
	for id, b := range m.boxes {
		if !now.Before(m.expiresAt(b)) {
			expired = append(expired, id)
		}
	}
	m.mu.Unlock()
	for _, id := range expired {
		m.Stop(id, "idle")
	}
}

// StopAll — при остановке сервиса не оставляем контейнеры.
func (m *Manager) StopAll() {
	m.mu.Lock()
	ids := make([]string, 0, len(m.boxes))
	for id := range m.boxes {
		ids = append(ids, id)
	}
	m.mu.Unlock()
	var wg sync.WaitGroup
	for _, id := range ids {
		wg.Go(func() { m.Stop(id, "shutdown") })
	}
	wg.Wait()
}

// Cleanup удаляет контейнеры и сети прошлого запуска сервиса.
func (m *Manager) Cleanup(ctx context.Context) error {
	return m.removeLabeled(ctx, Label)
}

func (m *Manager) purge(id string) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()
	if err := m.removeLabeled(ctx, Label+"="+id); err != nil {
		m.log.Error("purge sandbox", "id", id, "err", err)
	}
}

func (m *Manager) removeLabeled(ctx context.Context, label string) error {
	containers, networks, err := m.docker.Labeled(ctx, label)
	if err != nil {
		return err
	}
	for _, c := range containers {
		if err := m.docker.RemoveContainer(ctx, c); err != nil {
			return err
		}
	}
	for _, n := range networks {
		if err := m.docker.RemoveNetwork(ctx, n, m.cfg.Self); err != nil {
			return err
		}
	}
	if len(containers)+len(networks) > 0 {
		m.log.Info("removed leftovers", "label", label, "containers", len(containers), "networks", len(networks))
	}
	return nil
}

func containerName(id, service string) string { return "sbx-" + id + "-" + service }

func expand(env []string, base string) []string {
	out := make([]string, len(env))
	for i, e := range env {
		out[i] = strings.ReplaceAll(e, "{base}", base)
	}
	return out
}

func truncate(s string, n int) string {
	if len(s) <= n {
		return s
	}
	return s[:n] + "…"
}

func newID() string {
	b := make([]byte, 8)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}
