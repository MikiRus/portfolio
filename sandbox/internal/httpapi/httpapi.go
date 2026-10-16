// Package httpapi — HTTP-интерфейс песочницы для окна Docker и Safari.
package httpapi

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"log/slog"
	"math"
	"net"
	"net/http"
	"net/http/httputil"
	"strconv"
	"strings"
	"time"

	"portfolio/sandbox/internal/sandbox"
)

const visitorCookie = "pf_vid"

// upstreamKey — адрес фронта демо для прокси; кладём в контекст запроса,
// а не в заголовок, чтобы клиент не мог на него повлиять.
type upstreamKey struct{}

type Handler struct {
	m   *sandbox.Manager
	log *slog.Logger
	// trustProxy: сервис стоит за Caddy, IP клиента берём из X-Forwarded-For.
	trustProxy bool
	proxy      *httputil.ReverseProxy
}

func New(m *sandbox.Manager, log *slog.Logger, trustProxy bool) http.Handler {
	h := &Handler{m: m, log: log, trustProxy: trustProxy}
	h.proxy = &httputil.ReverseProxy{
		Rewrite: func(r *httputil.ProxyRequest) {
			r.Out.URL.Scheme = "http"
			r.Out.URL.Host = r.In.Context().Value(upstreamKey{}).(string)
			r.Out.Header.Del("Cookie") // куки портфолио демо не нужны
			r.SetXForwarded()
		},
		ErrorHandler: func(w http.ResponseWriter, r *http.Request, err error) {
			log.Warn("proxy error", "path", r.URL.Path, "err", err)
			http.Error(w, "демо не отвечает", http.StatusBadGateway)
		},
	}

	mux := http.NewServeMux()
	mux.HandleFunc("GET /healthz", func(w http.ResponseWriter, _ *http.Request) { w.WriteHeader(http.StatusNoContent) })
	mux.HandleFunc("POST /api/sandbox/{template}", h.create)
	mux.HandleFunc("GET /api/sandbox/{id}/events", h.events)
	mux.HandleFunc("POST /api/sandbox/{id}/ping", h.ping)
	mux.HandleFunc("DELETE /api/sandbox/{id}", h.stop)
	mux.HandleFunc("/s/{id}/", h.serve)
	return mux
}

type createResponse struct {
	ID        string    `json:"id"`
	URL       string    `json:"url"`
	ExpiresAt time.Time `json:"expiresAt"`
	Services  []string  `json:"services"`
}

func (h *Handler) create(w http.ResponseWriter, r *http.Request) {
	box, err := h.m.Create(r.PathValue("template"), h.visitor(w, r), h.clientIP(r))
	var busy *sandbox.BusyError
	switch {
	case errors.As(err, &busy):
		secs := int(math.Ceil(busy.RetryAfter.Seconds()))
		if secs > 0 {
			w.Header().Set("Retry-After", strconv.Itoa(secs))
		}
		writeJSON(w, http.StatusServiceUnavailable, map[string]any{"error": "busy", "reason": busy.Reason, "retryAfter": secs})
		return
	case errors.Is(err, sandbox.ErrUnknownTemplate):
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "unknown template"})
		return
	case err != nil:
		h.log.Error("create sandbox", "err", err)
		writeJSON(w, http.StatusInternalServerError, map[string]string{"error": "internal"})
		return
	}
	services := make([]string, len(box.Template.Services))
	for i, s := range box.Template.Services {
		services[i] = s.Name
	}
	writeJSON(w, http.StatusOK, createResponse{ID: box.ID, URL: box.BasePath(), ExpiresAt: h.m.ExpiresAt(box), Services: services})
}

// owned — песочница существует и принадлежит этому посетителю.
func (h *Handler) owned(w http.ResponseWriter, r *http.Request) (*sandbox.Box, bool) {
	box, err := h.m.Get(r.PathValue("id"))
	c, _ := r.Cookie(visitorCookie)
	if err != nil || c == nil || c.Value != box.Visitor {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return nil, false
	}
	return box, true
}

// events — поток событий стека (SSE): сначала история, потом новые.
func (h *Handler) events(w http.ResponseWriter, r *http.Request) {
	box, ok := h.owned(w, r)
	if !ok {
		return
	}
	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "streaming unsupported", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("X-Accel-Buffering", "no")

	history, ch, unsub := box.Subscribe()
	defer unsub()
	for _, e := range history {
		writeEvent(w, e)
	}
	flusher.Flush()

	keepalive := time.NewTicker(15 * time.Second)
	defer keepalive.Stop()
	for {
		select {
		case <-r.Context().Done():
			return
		case e, open := <-ch:
			if !open {
				return
			}
			writeEvent(w, e)
			flusher.Flush()
		case <-keepalive.C:
			fmt.Fprint(w, ": keepalive\n\n")
			flusher.Flush()
		}
	}
}

func writeEvent(w http.ResponseWriter, e sandbox.Event) {
	b, _ := json.Marshal(e)
	fmt.Fprintf(w, "data: %s\n\n", b)
}

func (h *Handler) ping(w http.ResponseWriter, r *http.Request) {
	box, ok := h.owned(w, r)
	if !ok {
		return
	}
	exp, err := h.m.Touch(box.ID)
	if err != nil {
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not found"})
		return
	}
	writeJSON(w, http.StatusOK, map[string]any{"status": box.Status(), "expiresAt": exp})
}

func (h *Handler) stop(w http.ResponseWriter, r *http.Request) {
	box, ok := h.owned(w, r)
	if !ok {
		return
	}
	// Удаление контейнеров занимает секунды; ход видно в потоке событий.
	go h.m.Stop(box.ID, "user")
	w.WriteHeader(http.StatusAccepted)
}

// serve проксирует /s/<id>/… во фронт демо. Ссылкой можно поделиться,
// поэтому владельца здесь не проверяем: id длинный и случайный.
func (h *Handler) serve(w http.ResponseWriter, r *http.Request) {
	box, err := h.m.Get(r.PathValue("id"))
	if err != nil {
		http.Error(w, "песочница остановлена — запустите проект заново", http.StatusNotFound)
		return
	}
	if box.Status() != sandbox.Ready {
		w.Header().Set("Retry-After", "2")
		http.Error(w, "демо ещё запускается", http.StatusServiceUnavailable)
		return
	}
	_, _ = h.m.Touch(box.ID)
	h.proxy.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), upstreamKey{}, box.WebHost())))
}

func (h *Handler) visitor(w http.ResponseWriter, r *http.Request) string {
	if c, err := r.Cookie(visitorCookie); err == nil && len(c.Value) == 32 {
		return c.Value
	}
	b := make([]byte, 16)
	_, _ = rand.Read(b)
	id := hex.EncodeToString(b)
	http.SetCookie(w, &http.Cookie{
		Name: visitorCookie, Value: id, Path: "/", MaxAge: 30 * 24 * 3600,
		HttpOnly: true, SameSite: http.SameSiteLaxMode, Secure: r.Header.Get("X-Forwarded-Proto") == "https",
	})
	return id
}

// clientIP: за прокси берём последний адрес X-Forwarded-For — его дописал
// наш Caddy; всё, что левее, мог подставить сам клиент.
func (h *Handler) clientIP(r *http.Request) string {
	if h.trustProxy {
		if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
			parts := strings.Split(xff, ",")
			return strings.TrimSpace(parts[len(parts)-1])
		}
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}
