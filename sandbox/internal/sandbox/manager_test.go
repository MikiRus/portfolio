package sandbox

import (
	"context"
	"errors"
	"io"
	"log/slog"
	"strings"
	"sync"
	"testing"
	"time"

	"portfolio/sandbox/internal/docker"
)

// fakeDocker хранит «контейнеры» в памяти; все сразу healthy.
type fakeDocker struct {
	mu         sync.Mutex
	seq        int
	containers map[string]docker.Container
	networks   map[string]bool
}

func newFake() *fakeDocker {
	return &fakeDocker{containers: map[string]docker.Container{}, networks: map[string]bool{}}
}

func (f *fakeDocker) CreateNetwork(_ context.Context, name string, _ map[string]string) (string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.networks[name] = true
	return name, nil
}
func (f *fakeDocker) ConnectNetwork(context.Context, string, string) error { return nil }
func (f *fakeDocker) RemoveNetwork(_ context.Context, n, _ string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	delete(f.networks, n)
	return nil
}
func (f *fakeDocker) CreateContainer(_ context.Context, s docker.Container) (string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.seq++
	id := s.Name
	f.containers[id] = s
	return id, nil
}
func (f *fakeDocker) StartContainer(context.Context, string) error { return nil }
func (f *fakeDocker) InspectContainer(context.Context, string) (docker.State, error) {
	return docker.State{Status: "running", Health: "healthy"}, nil
}
func (f *fakeDocker) RemoveContainer(_ context.Context, id string) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	delete(f.containers, id)
	return nil
}
func (f *fakeDocker) Logs(ctx context.Context, _ string) (io.ReadCloser, error) {
	r, w := io.Pipe()
	go func() { <-ctx.Done(); w.Close() }()
	return r, nil
}
func (f *fakeDocker) Labeled(_ context.Context, label string) ([]string, []string, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	var cs, ns []string
	for id, c := range f.containers {
		for k, v := range c.Labels {
			if label == k || label == k+"="+v {
				cs = append(cs, id)
				break
			}
		}
	}
	for n := range f.networks {
		ns = append(ns, n)
	}
	return cs, ns, nil
}
func (f *fakeDocker) count() (int, int) {
	f.mu.Lock()
	defer f.mu.Unlock()
	return len(f.containers), len(f.networks)
}

// clock — подменяемое время, безопасное для горутин менеджера.
type clock struct {
	mu sync.Mutex
	t  time.Time
}

func (c *clock) Now() time.Time {
	c.mu.Lock()
	defer c.mu.Unlock()
	return c.t
}

func (c *clock) Add(d time.Duration) {
	c.mu.Lock()
	c.t = c.t.Add(d)
	c.mu.Unlock()
}

func newTestManager(t *testing.T, cfg Config) (*Manager, *fakeDocker, *clock) {
	t.Helper()
	f := newFake()
	if cfg.StartTimeout == 0 {
		cfg.StartTimeout = 5 * time.Second
	}
	m := NewManager(f, cfg, slog.New(slog.NewTextHandler(io.Discard, nil)),
		func(context.Context, string) error { return nil },
		BloggerCRM("api", "web"))
	now := &clock{t: time.Date(2026, 10, 16, 12, 0, 0, 0, time.UTC)}
	m.now = now.Now
	t.Cleanup(m.StopAll)
	return m, f, now
}

func waitStatus(t *testing.T, b *Box, want Status) {
	t.Helper()
	deadline := time.Now().Add(2 * time.Second)
	for b.Status() != want {
		if time.Now().After(deadline) {
			t.Fatalf("status = %s, want %s", b.Status(), want)
		}
		time.Sleep(5 * time.Millisecond)
	}
}

func TestCreateStartsWholeStack(t *testing.T) {
	m, f, _ := newTestManager(t, Config{Max: 5, PerIP: 2, IdleTTL: time.Minute, MaxTTL: time.Hour})
	b, err := m.Create("blogger-crm", "v1", "1.1.1.1")
	if err != nil {
		t.Fatal(err)
	}
	waitStatus(t, b, Ready)

	if c, n := f.count(); c != 4 || n != 1 {
		t.Fatalf("containers=%d networks=%d, want 4 and 1", c, n)
	}
	web := f.containers["sbx-"+b.ID+"-web"]
	if !strings.Contains(strings.Join(web.Env, " "), "NUXT_APP_BASE_URL=/s/"+b.ID+"/") {
		t.Errorf("base path not passed to web: %v", web.Env)
	}
	if !web.Hardened || f.containers["sbx-"+b.ID+"-postgres"].Hardened {
		t.Error("web must be hardened, postgres must not")
	}

	history, _, unsub := b.Subscribe()
	defer unsub()
	if last := history[len(history)-1]; last.Type != "ready" {
		t.Errorf("last event = %+v, want ready", last)
	}
}

func TestSameVisitorReusesStack(t *testing.T) {
	m, _, _ := newTestManager(t, Config{Max: 5, PerIP: 2, IdleTTL: time.Minute, MaxTTL: time.Hour})
	a, _ := m.Create("blogger-crm", "v1", "1.1.1.1")
	b, err := m.Create("blogger-crm", "v1", "1.1.1.1")
	if err != nil || a.ID != b.ID {
		t.Fatalf("second create: id %s vs %s, err %v", a.ID, b.ID, err)
	}
}

func TestLimits(t *testing.T) {
	m, _, _ := newTestManager(t, Config{Max: 2, PerIP: 1, IdleTTL: time.Minute, MaxTTL: time.Hour})
	if _, err := m.Create("blogger-crm", "v1", "1.1.1.1"); err != nil {
		t.Fatal(err)
	}

	var busy *BusyError
	_, err := m.Create("blogger-crm", "v2", "1.1.1.1")
	if !errors.As(err, &busy) || busy.Reason != "ip" {
		t.Fatalf("same IP: err = %v, want ip limit", err)
	}
	if _, err := m.Create("blogger-crm", "v3", "2.2.2.2"); err != nil {
		t.Fatal(err)
	}
	_, err = m.Create("blogger-crm", "v4", "3.3.3.3")
	if !errors.As(err, &busy) || busy.Reason != "capacity" || busy.RetryAfter != time.Minute {
		t.Fatalf("capacity: err = %v (%+v), want capacity with retry 1m", err, busy)
	}
	if _, err := m.Create("nope", "v5", "4.4.4.4"); !errors.Is(err, ErrUnknownTemplate) {
		t.Fatalf("unknown template: err = %v", err)
	}
}

func TestReapStopsIdleAndFreesSlot(t *testing.T) {
	m, f, now := newTestManager(t, Config{Max: 1, PerIP: 1, IdleTTL: 15 * time.Minute, MaxTTL: time.Hour})
	b, _ := m.Create("blogger-crm", "v1", "1.1.1.1")
	waitStatus(t, b, Ready)

	now.Add(10 * time.Minute)
	if _, err := m.Touch(b.ID); err != nil {
		t.Fatal(err)
	}
	now.Add(10 * time.Minute) // 10 минут после пинга — ещё жив
	m.Reap()
	if _, err := m.Get(b.ID); err != nil {
		t.Fatal("stopped too early")
	}

	now.Add(6 * time.Minute)
	m.Reap()
	if _, err := m.Get(b.ID); !errors.Is(err, ErrNotFound) {
		t.Fatal("idle sandbox not stopped")
	}
	if c, n := f.count(); c != 0 || n != 0 {
		t.Fatalf("leftovers: containers=%d networks=%d", c, n)
	}
	if _, err := m.Create("blogger-crm", "v2", "2.2.2.2"); err != nil {
		t.Fatalf("slot not freed: %v", err)
	}
}

func TestMaxTTLBeatsActivity(t *testing.T) {
	m, _, now := newTestManager(t, Config{Max: 1, PerIP: 1, IdleTTL: 15 * time.Minute, MaxTTL: 30 * time.Minute})
	b, _ := m.Create("blogger-crm", "v1", "1.1.1.1")
	for range 4 {
		now.Add(9 * time.Minute)
		_, _ = m.Touch(b.ID)
		m.Reap()
	}
	if _, err := m.Get(b.ID); !errors.Is(err, ErrNotFound) {
		t.Fatal("sandbox outlived MaxTTL")
	}
}

func TestCleanupRemovesLeftovers(t *testing.T) {
	m, f, _ := newTestManager(t, Config{Max: 1, PerIP: 1, IdleTTL: time.Minute, MaxTTL: time.Hour})
	f.containers["old"] = docker.Container{Labels: map[string]string{Label: "dead"}}
	f.containers["foreign"] = docker.Container{Labels: map[string]string{"other": "x"}}
	f.networks["sbx-dead"] = true
	if err := m.Cleanup(context.Background()); err != nil {
		t.Fatal(err)
	}
	if _, ok := f.containers["old"]; ok {
		t.Error("sandbox container left")
	}
	if _, ok := f.containers["foreign"]; !ok {
		t.Error("foreign container removed")
	}
}
