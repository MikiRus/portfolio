import type { FolderId, Project } from './types'

export const folders: FolderId[] = ['ecommerce', 'sites', 'crm', 'demo']

const pg = (v: string, db: string) => ({
  name: 'postgres',
  image: `postgres:${v}`,
  logs: [`PostgreSQL ${v} on x86_64-pc-linux-musl`, `database "${db}" is ready to accept connections`],
})

export const projects: Project[] = [
  // ─── E-commerce ───────────────────────────────────────────────
  {
    id: 'monolith',
    folder: 'ecommerce',
    name: 'monolith',
    short: 'Mo',
    colors: ['#5f3dc4', '#9775fa'],
    kind: 'back',
    url: 'localhost:50051',
    period: { ru: '2025 — сейчас', en: '2025 — present' },
    role: { ru: 'Бэкенд-разработчик, один из основных авторов', en: 'Backend developer, one of the core authors' },
    tagline: {
      ru: 'gRPC-ядро e-commerce платформы Garlyn: заказы, оплата, доставка, лояльность, каталог',
      en: 'The gRPC core of the Garlyn e-commerce platform: orders, payments, delivery, loyalty, catalog',
    },
    task: {
      ru: 'Собрать бизнес-логику магазина, админки, мобильного приложения и маркетплейсов в одном сервисе с понятными границами доменов, чтобы сайты и каналы продаж работали поверх общего ядра.',
      en: 'Bring the business logic of the store, admin panel, mobile app and marketplaces into one service with clear domain boundaries, so every website and sales channel runs on a shared core.',
    },
    done: [
      {
        ru: 'Checkout, оплата и доставка: Альфа-эквайринг, Сбер и T-Bank BNPL, рассрочка, кошелёк WB, чеки через АТОЛ; CDEK, 5Post, Ozon, Почта России, Яндекс',
        en: 'Checkout, payments and delivery: Alfa acquiring, Sber and T-Bank BNPL, installments, WB wallet, receipts via ATOL; CDEK, 5Post, Ozon, Russian Post, Yandex',
      },
      {
        ru: 'Импорт и синхронизация каталога с маркетплейсами, включая LLM-синк свойств товаров в атрибуты Ozon/WB с детерминированной проверкой и CLI для оценки качества',
        en: 'Catalog import and marketplace sync, including LLM-based mapping of product properties to Ozon/WB attributes with deterministic validation and a CLI to score quality',
      },
      {
        ru: 'Интеграция с RetailCRM и Mindbox, подарочные сертификаты, лояльность',
        en: 'RetailCRM and Mindbox integration, gift certificates, loyalty',
      },
      { ru: 'Внешний API для партнёров: журнал запросов и индивидуальные лимиты', en: 'A partner API with request logging and per-client limits' },
    ],
    architecture: [
      {
        ru: 'Clean architecture по доменам: domain → port → usecase → adapter → transport, сборка зависимостей только в main',
        en: 'Clean architecture per domain: domain → port → usecase → adapter → transport, wiring only in main',
      },
      {
        ru: 'Transactional outbox: события пишутся в той же транзакции, воркер отправляет их в RabbitMQ; несколько инстансов не мешают друг другу',
        en: 'Transactional outbox: events are written in the same transaction and a worker ships them to RabbitMQ; several instances run safely side by side',
      },
      { ru: 'OpenTelemetry-спан на каждом use case, cron-задачи только на одном инстансе', en: 'An OpenTelemetry span on every use case; cron jobs run on a single instance' },
    ],
    stack: ['Go 1.25', 'gRPC', 'PostgreSQL', 'Redis', 'RabbitMQ', 'OpenSearch', 'S3', 'OpenTelemetry'],
    stats: [
      { value: '45', label: { ru: 'домены', en: 'domains' } },
      { value: '≈135k', label: { ru: 'строки Go', en: 'lines of Go' } },
      { value: '109', label: { ru: 'миграции', en: 'migrations' } },
      { value: '267', label: { ru: 'мои коммиты', en: 'my commits' } },
    ],
    containers: [
      pg('18', 'ecom'),
      { name: 'redis', image: 'redis:8.2', logs: ['Redis version=8.2.1, bits=64', 'Ready to accept connections tcp'] },
      {
        name: 'app',
        image: 'garlyn/monolith',
        port: ':50051',
        logs: ['migrations: up to date (000109)', 'registered 42 gRPC services', 'outbox worker started, batch=50 every=10s', 'gRPC server listening on :50051'],
      },
    ],
  },
  {
    id: 'gateway',
    folder: 'ecommerce',
    name: 'gateway',
    short: 'Gw',
    colors: ['#0b7285', '#3bc9db'],
    kind: 'back',
    url: 'localhost:8080/api/openapi.json',
    period: { ru: '2025 — сейчас', en: '2025 — present' },
    role: { ru: 'Бэкенд-разработчик, основной автор', en: 'Backend developer, main author' },
    tagline: {
      ru: 'Единая точка входа в платформу: REST поверх gRPC для админки, витрин, мобильного приложения и партнёров',
      en: 'The single entry point to the platform: REST over gRPC for the admin panel, storefronts, the mobile app and partners',
    },
    task: {
      ru: 'Дать всем клиентам один HTTP API с авторизацией и правами, не перенося в него бизнес-логику, и открыть часть API внешним партнёрам с лимитами.',
      en: 'Give every client one HTTP API with authentication and permissions, without moving business logic into it, and open part of the API to external partners with rate limits.',
    },
    done: [
      { ru: 'Явная карта маршрутов и прав: каждый эндпоинт привязан к разрешению RBAC', en: 'An explicit route-and-permission map: every endpoint is bound to an RBAC permission' },
      {
        ru: 'Собственный rate limiter на token bucket с бакетами по ключу, сборкой мусора и индивидуальными RPS для партнёров',
        en: 'A custom token-bucket rate limiter with per-key buckets, garbage collection and per-partner RPS',
      },
      {
        ru: 'Документация из одного спека: OpenAPI со Scalar UI и llms.txt для ИИ-ассистентов',
        en: 'Docs from a single spec: OpenAPI with Scalar UI plus llms.txt for AI assistants',
      },
      { ru: 'Журнал запросов внешнего API, который не держит в памяти файлы и большие ответы', en: 'A request log for the partner API that never buffers files or large responses' },
    ],
    architecture: [
      { ru: 'grpc-gateway: 44 сервиса ядра опубликованы как REST', en: 'grpc-gateway: 44 core services exposed as REST' },
      {
        ru: 'Цепочка middleware: JWT, проверка прав, CORS, client IP, identity-заголовки, телеметрия',
        en: 'Middleware chain: JWT, permission checks, CORS, client IP, identity headers, telemetry',
      },
      { ru: 'В проде за Traefik, e2e-тесты маршрутов и прав', en: 'Runs behind Traefik in production, with e2e tests for routes and permissions' },
    ],
    stack: ['Go 1.25', 'grpc-gateway', 'JWT', 'OpenAPI', 'Traefik', 'OpenTelemetry'],
    stats: [
      { value: '44', label: { ru: 'сервисы за шлюзом', en: 'services behind it' } },
      { value: '≈7.9k', label: { ru: 'строки Go', en: 'lines of Go' } },
      { value: '126', label: { ru: 'мои коммиты', en: 'my commits' } },
    ],
    containers: [
      { name: 'traefik', image: 'traefik:v3.6', port: ':443', logs: ['Configuration loaded from flags', 'Starting provider *docker.Provider'] },
      {
        name: 'app',
        image: 'garlyn/gateway',
        port: ':8080',
        logs: ['upstream monolith:50051 healthy', 'rate limiter: 12 API clients loaded', 'OpenAPI spec served at /api/openapi.json', 'HTTP server listening on :8080'],
      },
    ],
  },
  {
    id: 'marketplaces',
    folder: 'ecommerce',
    name: 'marketplaces',
    short: 'Mp',
    colors: ['#c2410c', '#fb923c'],
    kind: 'back',
    url: 'localhost:8090/admin/v1/marketplaces',
    period: { ru: '2025 — сейчас', en: '2025 — present' },
    role: { ru: 'Бэкенд-разработчик, основной автор каналов Ozon, WB, ВсеИнструменты', en: 'Backend developer, main author of the Ozon, WB and VseInstrumenty channels' },
    tagline: {
      ru: 'Монорепозиторий из 11 Go-сервисов: каталог, остатки и заказы для Ozon, Wildberries, Яндекс.Маркета и других',
      en: 'A monorepo of 11 Go services: catalog, stock and orders for Ozon, Wildberries, Yandex Market and more',
    },
    task: {
      ru: 'Подключить каталог и склад бренда к маркетплейсам так, чтобы заказы попадали в RetailCRM, статусы возвращались обратно, а падение одного канала не задевало остальные.',
      en: "Connect the brand's catalog and warehouse to marketplaces so orders land in RetailCRM, statuses flow back, and one failing channel never affects the others.",
    },
    done: [
      { ru: 'Ozon: FBO, FBS и FBP, мультикабинет — цены, картинки и рич-контент по кабинетам', en: 'Ozon: FBO, FBS and FBP, multiple seller accounts with per-account prices, images and rich content' },
      { ru: 'Wildberries: FBW и FBS, автосборка, стикеры', en: 'Wildberries: FBW and FBS, auto-assembly, labels' },
      { ru: 'ВсеИнструменты по EDI через Контур: ORDERS → ORDRSP → DESADV', en: 'VseInstrumenty over EDI via Kontur: ORDERS → ORDRSP → DESADV' },
      { ru: 'Планировщики синка заказов, статусов и остатков; один битый заказ не останавливает выгрузку', en: 'Schedulers for orders, statuses and stock; one broken order never blocks the export' },
    ],
    architecture: [
      { ru: 'Каждый канал — отдельный сервис со своей базой PostgreSQL', en: 'Each channel is a separate service with its own PostgreSQL database' },
      { ru: 'Общие RetailCRM и gRPC-ядро, события через RabbitMQ', en: 'Shared RetailCRM and gRPC core, events via RabbitMQ' },
      { ru: 'traceparent пробрасывается в gRPC, у каждого сервиса своё имя в телеметрии', en: 'traceparent is propagated over gRPC, every service has its own telemetry name' },
    ],
    stack: ['Go 1.25', 'PostgreSQL', 'RabbitMQ', 'gRPC', 'EDI', 'cron', 'OpenTelemetry'],
    stats: [
      { value: '11', label: { ru: 'каналы продаж', en: 'sales channels' } },
      { value: '≈78k', label: { ru: 'строки Go', en: 'lines of Go' } },
      { value: '157', label: { ru: 'миграции', en: 'migrations' } },
      { value: '198', label: { ru: 'мои коммиты', en: 'my commits' } },
    ],
    containers: [
      pg('18', 'marketplaces'),
      { name: 'ozon', image: 'marketplaces/ozon', port: ':8090', logs: ['scheduler: orders every 5m, stock every 15m', 'accounts loaded: 3'] },
      { name: 'wildberries', image: 'marketplaces/wildberries', logs: ['FBS assembly worker started', 'accounts loaded: 2'] },
      { name: 'yandex', image: 'marketplaces/yandex', logs: ['taxonomy cache warmed'] },
      { name: 'vseinstrumenty', image: 'marketplaces/vseinstrumenty', logs: ['EDI: polling Kontur inbox'] },
    ],
  },

  {
    id: 'admin',
    folder: 'ecommerce',
    name: 'admin',
    short: 'Ad',
    colors: ['#c2410c', '#fe8a4a'],
    kind: 'front',
    url: 'localhost:3000',
    sandbox: 'admin',
    repo: 'MikiRus/demo-admin',
    period: { ru: '2025 — сейчас', en: '2025 — present' },
    role: { ru: 'Фронтенд-разработчик, один из основных авторов', en: 'Frontend developer, one of the core authors' },
    tagline: {
      ru: 'Админка e-commerce платформы: каталог, заказы, лояльность, 9 маркетплейсов, роли и мониторинг сервисов в одном интерфейсе',
      en: 'The e-commerce platform admin: catalog, orders, loyalty, 9 marketplaces, roles and service monitoring in one interface',
    },
    task: {
      ru: 'Дать команде один интерфейс ко всему ядру и его сервисам: от карточки товара до передачи остатков на маркетплейсы, с правами по ролям. Демо — копия меню и сценариев на выдуманных данных: его можно потрогать.',
      en: "Give the team one interface to the whole core and its services, from product cards to pushing stock to marketplaces, with role-based access. The demo mirrors the menu and flows on made-up data — you can actually click through it.",
    },
    done: [
      { ru: 'Разделы маркетплейсов: кабинеты, передача остатков, журнал синхронизаций и заказы по каждому каналу', en: 'Marketplace sections: accounts, stock push, sync log and orders per channel' },
      { ru: 'Лояльность: бонусные счета с лотами и историей, ручные начисления, подарочные сертификаты, правила списания', en: 'Loyalty: bonus accounts with lots and history, manual accruals, gift certificates, redemption rules' },
      { ru: 'Короткие ссылки с QR-кодами и статистикой переходов, клиенты API с лимитами', en: 'Short links with QR codes and click stats, API clients with rate limits' },
      { ru: 'Состояние сервисов: живая проверка ядра, хранилищ и внешних интеграций', en: 'Service health: a live check of the core, storage and external integrations' },
    ],
    architecture: [
      { ru: 'Nuxt 4 SPA + Nuxt UI 4, Nitro как BFF к gateway', en: 'Nuxt 4 SPA + Nuxt UI 4, Nitro as a BFF to the gateway' },
      { ru: 'Меню и права из одного описания: пункт виден, только если у роли есть разрешение', en: 'Menu and permissions from one definition: an item shows only if the role has the permission' },
      { ru: 'В демо данные живут в памяти Nitro: правки сохраняются, пока жива песочница', en: 'In the demo, data lives in Nitro memory: edits persist while the sandbox is alive' },
    ],
    stack: ['Nuxt 4', 'Nuxt UI 4', 'Vue 3', 'TypeScript', 'Tailwind 4', 'Nitro BFF'],
    stats: [
      { value: '74', label: { ru: 'страницы', en: 'pages' } },
      { value: '35', label: { ru: 'пункты меню', en: 'menu items' } },
      { value: '101', label: { ru: 'мои коммиты', en: 'my commits' } },
    ],
    containers: [
      { name: 'web', image: 'demo-admin-web', port: ':3000', logs: ['Listening on http://0.0.0.0:3000'] },
    ],
  },

  // ─── Сайты ────────────────────────────────────────────────────
  {
    id: 'garlyn',
    folder: 'sites',
    name: 'garlyn.ru',
    short: 'Ga',
    colors: ['#1864ab', '#4dabf7'],
    kind: 'full',
    url: 'garlyn.ru',
    period: { ru: '2023 — сейчас', en: '2023 — present' },
    role: { ru: 'Fullstack-разработчик, веду релизы', en: 'Fullstack developer, release owner' },
    tagline: {
      ru: 'Интернет-магазин бытовой техники Garlyn: SSR-витрина, рецепты и блог, админка для контента и заказов',
      en: 'The Garlyn home appliance store: SSR storefront, recipes and blog, admin panel for content and orders',
    },
    task: {
      ru: 'Развивать магазин с высокой нагрузкой и десятками интеграций и при этом постепенно переносить логику в Go-ядро, не останавливая продажи.',
      en: 'Grow a high-traffic store with dozens of integrations while gradually moving its logic into the Go core without stopping sales.',
    },
    done: [
      { ru: 'Фичи витрины и админки: подарочные сертификаты, оформление заказа, личный кабинет', en: 'Storefront and admin features: gift certificates, checkout, customer account' },
      { ru: 'Шесть платёжных провайдеров за единым PaymentService с фоновой сверкой статусов', en: 'Six payment providers behind one PaymentService with background status polling' },
      { ru: 'Доставка через общий интерфейс: Apiship, ПВЗ Ozon, Почта России, собственная доставка', en: 'Delivery behind one interface: Apiship, Ozon pickup points, Russian Post, own couriers' },
      {
        ru: 'Переключение лояльности на сервис ядра под фичефлагом с ночной сверкой; импорт карточек из Go-ядра',
        en: 'Switched loyalty to the core service behind a feature flag with nightly reconciliation; product import from the Go core',
      },
      { ru: 'RetailCRM, фиды для маркетплейсов и партнёров, sitemap, синк остатков', en: 'RetailCRM, feeds for marketplaces and partners, sitemap, stock sync' },
    ],
    architecture: [
      { ru: 'Laravel: контроллеры → сервисы → джобы и события, очереди на Redis', en: 'Laravel: controllers → services → jobs and events, Redis queues' },
      { ru: 'Inertia + Vue 3 с SSR, отдельные входы для витрины и админки', en: 'Inertia + Vue 3 with SSR, separate entry points for storefront and admin' },
      { ru: 'Деплой из GitLab CI на две веб-ноды и отдельную фоновую ноду', en: 'GitLab CI deploys to two web nodes and a separate background node' },
    ],
    stack: ['PHP 8.2', 'Laravel 10', 'Vue 3', 'Inertia SSR', 'PostgreSQL', 'Redis', 'Vite'],
    stats: [
      { value: '162', label: { ru: 'страницы Inertia', en: 'Inertia pages' } },
      { value: '141', label: { ru: 'миграции', en: 'migrations' } },
      { value: '≈43', label: { ru: 'фоновые задачи', en: 'background jobs' } },
      { value: '1041', label: { ru: 'мои коммиты', en: 'my commits' } },
    ],
    containers: [
      pg('15', 'garlyn'),
      { name: 'redis', image: 'redis:alpine', logs: ['Ready to accept connections tcp'] },
      {
        name: 'garlyn_shop',
        image: 'sail-8.2/app',
        port: ':80',
        logs: ['INFO  Nothing to migrate.', 'INFO  Processing jobs from the [default] queue.', 'Inertia SSR server started on :13714', 'Server running on [http://0.0.0.0:80]'],
      },
    ],
  },
  {
    id: 'stoewer',
    folder: 'sites',
    name: 'stoewer.ru',
    short: 'St',
    colors: ['#343a40', '#868e96'],
    kind: 'front',
    url: 'stoewer.ru',
    period: { ru: '2025 — сейчас', en: '2025 — present' },
    role: { ru: 'Фронтенд-разработчик в команде', en: 'Frontend developer on the team' },
    tagline: {
      ru: 'Витрина и админка на Nuxt поверх общего Go-бэкенда: каталог, корзина, checkout, кабинет, лояльность',
      en: 'A Nuxt storefront and admin panel on top of the shared Go backend: catalog, cart, checkout, account, loyalty',
    },
    task: {
      ru: 'Сделать второй сайт на той же платформе, не дублируя бэкенд: витрина и админка ходят в gateway через свой BFF.',
      en: 'Ship a second website on the same platform without duplicating the backend: the storefront and admin talk to the gateway through their own BFF.',
    },
    done: [
      { ru: 'Админка: товары, категории, пользователи, пагинация', en: 'Admin: products, categories, users, pagination' },
      { ru: 'Витрина: адрес курьерской доставки в checkout, страница дополнительной гарантии, личный кабинет', en: 'Storefront: courier address in checkout, extended warranty page, customer account' },
      { ru: 'Серверные ручки BFF в Nitro для админки', en: 'Nitro BFF endpoints for the admin panel' },
    ],
    architecture: [
      { ru: 'Два Nuxt-приложения: client и admin', en: 'Two Nuxt apps: client and admin' },
      { ru: 'Nitro как BFF-прокси к gateway, адрес API не попадает в браузер', en: 'Nitro as a BFF proxy to the gateway, the API address never reaches the browser' },
      { ru: 'Яндекс.Метрика с e-commerce dataLayer, прод за Traefik', en: 'Yandex Metrica with an e-commerce dataLayer, Traefik in production' },
    ],
    stack: ['Nuxt 3', 'Vue 3', 'Tailwind', 'Nuxt UI', 'Nitro BFF'],
    stats: [
      { value: '89', label: { ru: 'страницы', en: 'pages' } },
      { value: '129', label: { ru: 'файлы BFF', en: 'BFF files' } },
      { value: '69', label: { ru: 'мои коммиты', en: 'my commits' } },
    ],
    containers: [
      { name: 'traefik', image: 'traefik:v3.0', port: ':443', logs: ['Starting provider *docker.Provider'] },
      { name: 'client', image: 'stoewer/client', port: ':3000', logs: ['Nuxt 3.15 · Nitro node-server', 'Listening on http://0.0.0.0:3000'] },
      { name: 'admin', image: 'stoewer/admin', port: ':3001', logs: ['Listening on http://0.0.0.0:3001'] },
    ],
  },

  // ─── CRM ──────────────────────────────────────────────────────
  {
    id: 'crm-bloggers',
    folder: 'crm',
    name: 'crm-bloggers',
    short: 'Bl',
    colors: ['#2b8a3e', '#69db7c'],
    kind: 'full',
    url: 'localhost:3000',
    period: { ru: 'ноябрь 2025 — сейчас', en: 'Nov 2025 — present' },
    role: { ru: 'Единственный разработчик: фронт и бэк', en: 'Sole developer, front and back' },
    tagline: {
      ru: 'Внутренняя CRM маркетинга: блогеры, рекламные кампании, затраты, выручка по промокодам и маркировка рекламы',
      en: 'An internal marketing CRM: bloggers, ad campaigns, costs, promo-code revenue and ad labeling',
    },
    task: {
      ru: 'Заменить таблицы маркетинга системой, где видно, сколько стоила каждая интеграция и сколько она принесла, а реклама маркируется по закону через ОРД.',
      en: 'Replace the marketing spreadsheets with a system that shows what each integration cost and earned, with ads labeled through the ORD as the law requires.',
    },
    done: [
      { ru: 'Кампании, интеграции, плановые показатели, календарь, аналитика и Excel-отчёты', en: 'Campaigns, integrations, targets, calendar, analytics and Excel reports' },
      { ru: 'Выручка по промокодам и UTM из RetailCRM, сверка рекламных отчётов Ozon', en: 'Promo-code and UTM revenue from RetailCRM, reconciliation of Ozon ad reports' },
      { ru: 'Маркировка рекламы через ОРД Ozon: контрагенты, договоры, креативы', en: 'Ad labeling via the Ozon ORD: counterparties, contracts, creatives' },
      { ru: 'Агентский API с llms.txt для ИИ-ассистентов сотрудников', en: 'An agent API with llms.txt for staff AI assistants' },
    ],
    architecture: [
      {
        ru: 'Nuxt 4 SPA + Nitro BFF: токены в httpOnly-cookie, обновление access-токена на сервере',
        en: 'Nuxt 4 SPA + Nitro BFF: tokens in httpOnly cookies, access-token refresh on the server',
      },
      { ru: 'Go на stdlib: 16 доменов, ≈148 маршрутов, два пула Postgres (свой и read-only к БД сайта)', en: 'Go on the stdlib: 16 domains, ≈148 routes, two Postgres pools (own and read-only to the site DB)' },
      { ru: 'Деплой с Caddy и автоматическим HTTPS', en: 'Deployed with Caddy and automatic HTTPS' },
    ],
    stack: ['Go 1.25', 'Nuxt 4', 'PostgreSQL', 'S3', 'Chart.js', 'Caddy'],
    stats: [
      { value: '16', label: { ru: 'домены', en: 'domains' } },
      { value: '62', label: { ru: 'миграции', en: 'migrations' } },
      { value: '215', label: { ru: 'коммиты, все мои', en: 'commits, all mine' } },
    ],
    containers: [
      pg('18', 'crm'),
      { name: 'backend', image: 'crm-bloggers/back', port: ':8080', logs: ['migrations applied: 62', 'listening on :8080'] },
      { name: 'nuxt', image: 'crm-bloggers/front', port: ':3000', logs: ['Nitro BFF → backend:8080', 'Listening on http://0.0.0.0:3000'] },
    ],
  },
  {
    id: 'retailcrm-helper',
    folder: 'crm',
    name: 'retailcrm-helper',
    short: 'Rc',
    colors: ['#7048e8', '#b197fc'],
    kind: 'full',
    url: 'localhost:8080/widget',
    period: { ru: 'апрель 2026 — сейчас', en: 'Apr 2026 — present' },
    role: { ru: 'Единственный разработчик', en: 'Sole developer' },
    tagline: {
      ru: 'Модули, встроенные в RetailCRM: бонусная программа в карточке заказа, электронное подписание, сопутствующие товары',
      en: 'Modules embedded in RetailCRM: a loyalty widget in the order card, e-signing, related products',
    },
    task: {
      ru: 'Дать менеджерам CRM то, чего нет в коробке, прямо в их интерфейсе, и перенести старые PHP-интеграции на Go.',
      en: "Give CRM managers what the product lacks, right inside their interface, and move the old PHP integrations to Go.",
    },
    done: [
      {
        ru: 'Виджет «Бонусная программа» в карточке заказа: резерв бонусов в ядре и скидка в CRM; если скидка не записалась, резерв отпускается',
        en: 'A loyalty widget in the order card: bonus reservation in the core plus a CRM discount; if the discount fails, the reservation is released',
      },
      {
        ru: 'Электронное подписание F.Doc: токен с автообновлением, поллинг архива, синк статусов и выгрузка в S3',
        en: 'F.Doc e-signing: auto-refreshing token, archive polling, status sync and upload to S3',
      },
      {
        ru: 'Сопутствующие товары: ручка, которая никогда не отвечает ошибкой и собирает ответ одним индексным запросом',
        en: 'Related products: an endpoint that never returns an error and builds the answer with one indexed query',
      },
      { ru: 'Синк LiveSklad ↔ RetailCRM и отправка заявок в WMS — порт PHP-джобы, работавшей с 2021 года', en: 'LiveSklad ↔ RetailCRM sync and WMS requests, ported from a PHP job running since 2021' },
    ],
    architecture: [
      { ru: 'Go stdlib + pgx, слои domain → usecase → infrastructure → transport', en: 'Go stdlib + pgx, layers domain → usecase → infrastructure → transport' },
      { ru: 'Vue 3 + Pinia виджет на @retailcrm/embed-ui, собирается в том же образе', en: 'A Vue 3 + Pinia widget on @retailcrm/embed-ui, built into the same image' },
      { ru: 'CORS с конкретным origin, доступ по белому списку пользователей CRM', en: 'CORS pinned to one origin, access limited to an allowlist of CRM users' },
    ],
    stack: ['Go 1.25', 'Vue 3', 'Pinia', 'TypeScript', 'PostgreSQL', 'S3'],
    stats: [
      { value: '≈12.6k', label: { ru: 'строки Go', en: 'lines of Go' } },
      { value: '5', label: { ru: 'модули в CRM', en: 'CRM modules' } },
      { value: '88', label: { ru: 'коммиты, все мои', en: 'commits, all mine' } },
    ],
    containers: [
      pg('18', 'helper'),
      { name: 'app', image: 'retailcrm-helper', port: ':8080', logs: ['fdoc: status sync every 30m', 'widget assets embedded', 'listening on :8080'] },
    ],
  },

  // ─── Демо ─────────────────────────────────────────────────────
  {
    id: 'blogger-crm-demo',
    folder: 'demo',
    name: 'blogger-crm-demo',
    short: 'Dm',
    colors: ['#5b3fd9', '#a78bfa'],
    kind: 'full',
    url: 'localhost:3000',
    sandbox: 'blogger-crm',
    repo: 'MikiRus/demo-blogger-crm',
    period: { ru: 'октябрь 2026', en: 'Oct 2026' },
    role: { ru: 'Сделано с нуля для портфолио', en: 'Built from scratch for this portfolio' },
    tagline: {
      ru: 'Упрощённая CRM для блогеров с выдуманными данными — её можно потрогать',
      en: 'A simplified blogger CRM with made-up data — you can actually try it',
    },
    task: {
      ru: 'Показать подход из настоящей CRM на открытом коде: окупаемость интеграций через ДРР, отчёты Ozon по дням, фоновый воркер.',
      en: 'Show the approach of the real CRM in open code: integration payback via ad-spend ratio, daily Ozon reports, a background worker.',
    },
    done: [
      { ru: 'Дашборд: расходы и выручка по месяцам, ДРР, топ блогеров, тепловая карта', en: 'Dashboard: monthly cost and revenue, ad-spend ratio, top bloggers, heatmap' },
      { ru: 'Журнал отчётов Ozon: очередь в Postgres, FOR UPDATE SKIP LOCKED, повтор после 429', en: 'Ozon report journal: a Postgres queue, FOR UPDATE SKIP LOCKED, retry after 429' },
      { ru: 'Кампании, интеграции с промокодами, пользователи и роли', en: 'Campaigns, promo-code integrations, users and roles' },
    ],
    architecture: [
      { ru: 'Go API + отдельный воркер, advisory-лок для миграций и сида', en: 'Go API + a separate worker, advisory lock for migrations and seeding' },
      { ru: 'Nuxt 4 SPA с Nitro BFF, Tailwind 4, Chart.js', en: 'Nuxt 4 SPA with a Nitro BFF, Tailwind 4, Chart.js' },
    ],
    stack: ['Go 1.25', 'pgx', 'Nuxt 4', 'Tailwind 4', 'Chart.js', 'Docker Compose'],
    stats: [
      { value: '4', label: { ru: 'контейнеры', en: 'containers' } },
      { value: '180', label: { ru: 'дни отчётов', en: 'days of reports' } },
    ],
    containers: [
      { name: 'postgres', image: 'postgres:18-alpine', logs: ['database system is ready to accept connections'] },
      { name: 'api', image: 'blogger-crm-demo-api', port: ':8080', logs: ['migration applied: 002_ozon_users.sql', 'demo data seeded bloggers=36 campaigns=10', 'listening addr=:8080'] },
      { name: 'worker', image: 'blogger-crm-demo-api', logs: ['worker started every=30s', 'отчёт по продажам запрошен'] },
      { name: 'web', image: 'blogger-crm-demo-web', port: ':3000', logs: ['Listening on http://0.0.0.0:3000'] },
    ],
  },
]

export const projectById = (id: string) => projects.find((p) => p.id === id)
