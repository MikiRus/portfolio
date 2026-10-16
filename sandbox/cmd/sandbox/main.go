// Сервис песочниц: поднимает стеки демо в Docker по запросу посетителей
// портфолио, отдаёт их логи и проксирует фронт демо в окно Safari.
package main

import (
	"context"
	"errors"
	"log/slog"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"portfolio/sandbox/internal/docker"
	"portfolio/sandbox/internal/httpapi"
	"portfolio/sandbox/internal/sandbox"
)

func main() {
	log := slog.New(slog.NewTextHandler(os.Stdout, nil)).With("svc", "sandbox")
	if err := run(log); err != nil {
		log.Error("fatal", "err", err)
		os.Exit(1)
	}
}

func run(log *slog.Logger) error {
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)
	defer stop()

	dc, err := docker.New(env("DOCKER_HOST", "unix:///var/run/docker.sock"))
	if err != nil {
		return err
	}
	cfg := sandbox.Config{
		Max:          envInt("SANDBOX_MAX", 5),
		PerIP:        envInt("SANDBOX_PER_IP", 2),
		IdleTTL:      envDuration("SANDBOX_IDLE_TTL", 15*time.Minute),
		MaxTTL:       envDuration("SANDBOX_MAX_TTL", time.Hour),
		StartTimeout: envDuration("SANDBOX_START_TIMEOUT", 90*time.Second),
		Self:         os.Getenv("SANDBOX_SELF"),
	}
	m := sandbox.NewManager(dc, cfg, log, probe,
		sandbox.BloggerCRM(env("DEMO_API_IMAGE", "blogger-crm-demo-api"), env("DEMO_WEB_IMAGE", "blogger-crm-demo-web")),
		sandbox.Admin(env("DEMO_ADMIN_IMAGE", "demo-admin-web")))

	cleanupCtx, cancel := context.WithTimeout(ctx, 30*time.Second)
	err = m.Cleanup(cleanupCtx)
	cancel()
	if err != nil {
		return err
	}

	go func() {
		t := time.NewTicker(30 * time.Second)
		defer t.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-t.C:
				m.Reap()
			}
		}
	}()

	addr := env("HTTP_ADDR", ":8080")
	srv := &http.Server{
		Addr:              addr,
		Handler:           httpapi.New(m, log, os.Getenv("TRUST_PROXY") == "true"),
		ReadHeaderTimeout: 5 * time.Second,
	}
	errCh := make(chan error, 1)
	go func() {
		log.Info("listening", "addr", addr, "max", cfg.Max, "idle_ttl", cfg.IdleTTL)
		if err := srv.ListenAndServe(); !errors.Is(err, http.ErrServerClosed) {
			errCh <- err
		}
	}()

	select {
	case err := <-errCh:
		return err
	case <-ctx.Done():
	}
	log.Info("shutting down, stopping sandboxes")
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()
	_ = srv.Shutdown(shutdownCtx)
	m.StopAll()
	return nil
}

var probeClient = &http.Client{Timeout: 2 * time.Second}

func probe(ctx context.Context, url string) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, url, nil)
	if err != nil {
		return err
	}
	resp, err := probeClient.Do(req)
	if err != nil {
		return err
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return errors.New(resp.Status)
	}
	return nil
}

func env(key, def string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return def
}

func envInt(key string, def int) int {
	if v, err := strconv.Atoi(os.Getenv(key)); err == nil && v > 0 {
		return v
	}
	return def
}

func envDuration(key string, def time.Duration) time.Duration {
	if v, err := time.ParseDuration(os.Getenv(key)); err == nil && v > 0 {
		return v
	}
	return def
}
