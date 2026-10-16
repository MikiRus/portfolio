# Portfolio OS

Портфолио в виде рабочего стола macOS: проекты лежат в папках, двойной клик
поднимает их «контейнеры» в окне Docker, а потом открывает кейс в Safari.

Nuxt 4 · Tailwind 4 · @nuxtjs/i18n (RU/EN) · свой оконный менеджер без библиотек.

## Запуск

Нужен Node 22+.

```bash
npm ci
npm run dev        # http://localhost:3000
npm run build && node .output/server/index.mjs
```

Или в Docker: `docker build -t portfolio . && docker run -p 3000:3000 portfolio`.

## Где что

| Путь | Что там |
|---|---|
| `app/data/projects.ts` | проекты: тексты кейсов RU/EN, стек, цифры, контейнеры для окна Docker |
| `app/data/profile.ts` | имя и контакты; пустая ссылка — иконки нет в Dock |
| `app/composables/useWindows.ts` | оконный менеджер: порядок, свернуть, развернуть |
| `app/composables/useStacks.ts` | имитация `docker compose up` с логами |
| `app/composables/useLaunch.ts` | сценарий «Docker → Safari» для любого проекта |
| `i18n/locales/*.json` | строки интерфейса |

`overrides.esbuild` в `package.json`: `@nuxtjs/i18n` тянет `esbuild@0.25`,
а vite 8 ждёт `0.27+`; без override npm не может разрешить дерево.
