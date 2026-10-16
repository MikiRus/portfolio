package sandbox

import (
	"time"

	"portfolio/sandbox/internal/docker"
)

// Service — один контейнер стека. В Env можно писать {base} — подставится
// путь песочницы (/s/<id>/), под которым фронт демо отдаёт страницы.
type Service struct {
	Name        string
	Image       string
	Cmd         []string
	Env         []string
	MemoryMB    int64
	CPUs        float64
	Tmpfs       map[string]string
	Hardened    bool
	Healthcheck *docker.Healthcheck
	// WaitHealthy — следующий сервис стартует только после healthy этого.
	WaitHealthy bool
}

// Template — стек, который можно поднять по запросу. Клиент выбирает только
// id шаблона: образы, команды и лимиты задаются здесь, а не в запросе.
type Template struct {
	ID       string
	Services []Service
	// Web — сервис, в который проксируется /s/<id>/, и его порт.
	Web     string
	WebPort int
}

func health(test ...string) *docker.Healthcheck {
	return &docker.Healthcheck{Test: test, Interval: int64(time.Second), Timeout: int64(2 * time.Second), Retries: 30}
}

// BloggerCRM — демо из репозитория demo-blogger-crm. Лимиты с запасом
// под ≈250 МБ реального потребления на стек.
func BloggerCRM(apiImage, webImage string) Template {
	const db = "DATABASE_URL=postgres://crm:crm@postgres:5432/crm?sslmode=disable"
	return Template{
		ID:      "blogger-crm",
		Web:     "web",
		WebPort: 3000,
		Services: []Service{
			{
				Name:        "postgres",
				Image:       "postgres:18-alpine",
				Env:         []string{"POSTGRES_USER=crm", "POSTGRES_PASSWORD=crm", "POSTGRES_DB=crm"},
				MemoryMB:    192,
				CPUs:        0.5,
				Tmpfs:       map[string]string{"/var/lib/postgresql": "size=128m"},
				Healthcheck: health("CMD-SHELL", "pg_isready -U crm -d crm"),
				WaitHealthy: true,
			},
			{
				Name:        "api",
				Image:       apiImage,
				Cmd:         []string{"api"},
				Env:         []string{db, "DEMO_RESET=true"},
				MemoryMB:    96,
				CPUs:        0.5,
				Hardened:    true,
				Healthcheck: health("CMD", "wget", "-qO-", "http://localhost:8080/readyz"),
				WaitHealthy: true,
			},
			{
				Name:     "worker",
				Image:    apiImage,
				Cmd:      []string{"worker"},
				Env:      []string{db, "WORKER_EVERY=30s"},
				MemoryMB: 48,
				CPUs:     0.25,
				Hardened: true,
			},
			{
				Name:     "web",
				Image:    webImage,
				Env:      []string{"NUXT_API_BASE=http://api:8080", "NUXT_APP_BASE_URL={base}"},
				MemoryMB: 160,
				CPUs:     0.5,
				Hardened: true,
			},
		},
	}
}

// Admin — демо админки e-commerce: один контейнер Nuxt, данные в памяти Nitro.
func Admin(webImage string) Template {
	return Template{
		ID:      "admin",
		Web:     "web",
		WebPort: 3000,
		Services: []Service{
			{
				Name:     "web",
				Image:    webImage,
				Env:      []string{"NUXT_APP_BASE_URL={base}"},
				MemoryMB: 192,
				CPUs:     0.5,
				Hardened: true,
			},
		},
	}
}
