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
    id: 'core',
    folder: 'ecommerce',
    name: 'core',
    short: 'Co',
    colors: ['#5f3dc4', '#9775fa'],
    kind: 'back',
    url: 'localhost:50051',
    period: { ru: '2025 — сейчас', en: '2025 — present' },
    role: { ru: 'Основной разработчик', en: 'Lead developer' },
    tagline: {
      ru: 'Центральная система компании Garlyn: товар от закупки до продажи на сайтах, в приложении и на маркетплейсах',
      en: "Garlyn's central system: a product's whole path from purchasing to sale on websites, in the app and on marketplaces",
    },
    task: {
      ru: 'Центральная система компании для ведения товара и его сопровождения от закупки до продажи на разных платформах. Здесь живут каталог и контент для всех витрин, остатки на складах, заказы, клиенты и платежи, управление сайтами и мобильным приложением и вся работа с внешними сервисами.',
      en: "The company's central system that carries a product from purchasing to sale on every platform. It holds the catalog and content for all storefronts, warehouse stock, orders, customers and payments, website and mobile app management, and every external integration.",
    },
    done: [
      { ru: 'Каталог и контент: карточки, категории и атрибуты, наполнение контента под каждую витрину — сайты, приложение, маркетплейсы', en: 'Catalog and content: product cards, categories and attributes, content tailored for every storefront — websites, the app, marketplaces' },
      { ru: 'Склады и остатки: учёт по складам, резервы под заказы, синхронизация со складскими системами и передача остатков на витрины', en: 'Warehouses and stock: per-warehouse stock, order reservations, sync with warehouse systems and stock push to storefronts' },
      { ru: 'Заказы со всех каналов — сайтов, приложения и маркетплейсов — в одной модели статусов, обмен с RetailCRM в обе стороны', en: 'Orders from every channel — websites, the app, marketplaces — in one status model, two-way exchange with RetailCRM' },
      { ru: 'Платёжный шлюз: Альфа-эквайринг, Сбер BNPL, T-Bank BNPL и рассрочка, кошелёк WB; фискальные чеки через АТОЛ, возвраты и сверка статусов', en: 'Payment gateway: Alfa acquiring, Sber BNPL, T-Bank BNPL and installments, WB wallet; fiscal receipts via ATOL, refunds and status reconciliation' },
      { ru: 'Доставка: Apiship, CDEK (курьер и ПВЗ), 5Post, Магнит, Ozon, Почта России, Яндекс Доставка — расчёт, пункты выдачи, создание отправлений и трекинг', en: 'Delivery: Apiship, CDEK (courier and pickup), 5Post, Magnit, Ozon, Russian Post, Yandex Delivery — quotes, pickup points, shipment creation and tracking' },
      { ru: 'Клиенты и лояльность: профили, бонусные счета с лотами, подарочные сертификаты, акции и правила списания', en: 'Customers and loyalty: profiles, bonus accounts with lots, gift certificates, promotions and redemption rules' },
      { ru: 'Управление витринами и мобильным приложением: настройки сайтов, контент, отдельный адаптер для приложения', en: 'Storefront and mobile app management: website settings, content, a dedicated adapter for the app' },
      { ru: 'Маркетплейсы: клиенты Ozon, Wildberries и Яндекс.Маркета, LLM-синк свойств товаров в атрибуты маркетплейсов с проверкой и CLI для оценки качества', en: 'Marketplaces: Ozon, Wildberries and Yandex Market clients, LLM mapping of product properties to marketplace attributes with validation and a quality-scoring CLI' },
      { ru: 'Внешние сервисы: RetailCRM, LiveSklad, DaData, Mindbox, банки и службы доставки', en: 'External services: RetailCRM, LiveSklad, DaData, Mindbox, banks and delivery services' },
      { ru: 'Уведомления по email, SMS и в Telegram; поиск по каталогу на OpenSearch; фиды для партнёров', en: 'Email, SMS and Telegram notifications; catalog search on OpenSearch; partner feeds' },
      { ru: 'Роли и права, аудит изменений карточек, внешний API для партнёров с журналом запросов и лимитами', en: 'Roles and permissions, an audit log of product changes, a partner API with request logging and rate limits' },
      { ru: 'Служебные CLI: сверка каталога, дедупликация, перенос маппингов маркетплейсов, синк с CRM', en: 'Maintenance CLIs: catalog diff, deduplication, marketplace mapping migration, CRM sync' },
    ],
    architecture: [
      { ru: 'Clean architecture по доменам: domain → port → usecase → adapter → transport, сборка зависимостей только в main', en: 'Clean architecture per domain: domain → port → usecase → adapter → transport, wiring only in main' },
      { ru: 'RabbitMQ как шина событий между core, маркетплейсами и интеграциями; transactional outbox: событие пишется в той же транзакции, что и данные', en: 'RabbitMQ as the event bus between core, marketplaces and integrations; a transactional outbox writes each event in the same transaction as the data' },
      { ru: 'gRPC-сервисы наружу через gateway, хранилища: PostgreSQL, Redis, S3, OpenSearch', en: 'gRPC services exposed through the gateway; storage: PostgreSQL, Redis, S3, OpenSearch' },
      { ru: 'OpenTelemetry-спан на каждом use case: логи, метрики и трейсы уходят в общую телеметрию', en: 'An OpenTelemetry span on every use case: logs, metrics and traces go to the shared telemetry stack' },
    ],
    stack: ['Go 1.25', 'gRPC', 'PostgreSQL', 'Redis', 'RabbitMQ', 'OpenSearch', 'S3', 'OpenTelemetry'],
    stats: [
      { value: '45', label: { ru: 'домены', en: 'domains' } },
      { value: '42', label: { ru: 'gRPC-сервисы', en: 'gRPC services' } },
      { value: '109', label: { ru: 'миграции', en: 'migrations' } },
      { value: '267', label: { ru: 'мои коммиты', en: 'my commits' } },
    ],
    containers: [
      pg('18', 'ecom'),
      { name: 'redis', image: 'redis:8.2', logs: ['Redis version=8.2.1, bits=64', 'Ready to accept connections tcp'] },
      { name: 'rabbitmq', image: 'rabbitmq:4-management', logs: ['Server startup complete; 4 plugins started', 'accepting AMQP connection'] },
      {
        name: 'app',
        image: 'garlyn/core',
        port: ':50051',
        logs: ['migrations: up to date (000109)', 'registered 42 gRPC services', 'outbox worker started → rabbitmq', 'gRPC server listening on :50051'],
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
      { ru: 'grpc-gateway: 44 сервиса core опубликованы как REST', en: 'grpc-gateway: 44 core services exposed as REST' },
      {
        ru: 'Цепочка middleware: JWT, проверка прав, CORS, client IP, identity-заголовки, телеметрия',
        en: 'Middleware chain: JWT, permission checks, CORS, client IP, identity headers, telemetry',
      },
      { ru: 'В проде за Traefik, e2e-тесты маршрутов и прав', en: 'Runs behind Traefik in production, with e2e tests for routes and permissions' },
    ],
    stack: ['Go 1.25', 'grpc-gateway', 'JWT', 'OpenAPI', 'Traefik', 'OpenTelemetry'],
    stats: [
      { value: '44', label: { ru: 'сервисы за шлюзом', en: 'services behind it' } },
      { value: '126', label: { ru: 'мои коммиты', en: 'my commits' } },
    ],
    containers: [
      { name: 'traefik', image: 'traefik:v3.6', port: ':443', logs: ['Configuration loaded from flags', 'Starting provider *docker.Provider'] },
      {
        name: 'app',
        image: 'garlyn/gateway',
        port: ':8080',
        logs: ['upstream core:50051 healthy', 'rate limiter: 12 API clients loaded', 'OpenAPI spec served at /api/openapi.json', 'HTTP server listening on :8080'],
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
      ru: 'Подключить каталог и склад бренда к маркетплейсам так, чтобы заказы попадали в core и RetailCRM, статусы возвращались обратно, а падение одного канала не задевало остальные.',
      en: "Connect the brand's catalog and warehouse to marketplaces so orders land in core and RetailCRM, statuses flow back, and one failing channel never affects the others.",
    },
    done: [
      { ru: 'Ozon: FBO, FBS и FBP, мультикабинет — цены, картинки и рич-контент по кабинетам', en: 'Ozon: FBO, FBS and FBP, multiple seller accounts with per-account prices, images and rich content' },
      { ru: 'Wildberries: FBW и FBS, автосборка, стикеры', en: 'Wildberries: FBW and FBS, auto-assembly, labels' },
      { ru: 'ВсеИнструменты по EDI через Контур: ORDERS → ORDRSP → DESADV', en: 'VseInstrumenty over EDI via Kontur: ORDERS → ORDRSP → DESADV' },
      { ru: 'Заказы маркетплейсов попадают в core и в RetailCRM, статусы из CRM возвращаются на площадку', en: 'Marketplace orders land in core and RetailCRM; statuses from the CRM flow back to the marketplace' },
      { ru: 'Планировщики синка заказов, статусов и остатков; один битый заказ не останавливает выгрузку', en: 'Schedulers for orders, statuses and stock; one broken order never blocks the export' },
    ],
    architecture: [
      { ru: 'Каждый канал — отдельный сервис со своей базой PostgreSQL', en: 'Each channel is a separate service with its own PostgreSQL database' },
      { ru: 'Заказы и остатки — через gRPC к core и RetailCRM, события через RabbitMQ', en: 'Orders and stock go to core over gRPC and to RetailCRM; events via RabbitMQ' },
      { ru: 'traceparent пробрасывается в gRPC, у каждого сервиса своё имя в телеметрии', en: 'traceparent is propagated over gRPC, every service has its own telemetry name' },
    ],
    stack: ['Go 1.25', 'PostgreSQL', 'RabbitMQ', 'gRPC', 'EDI', 'cron', 'OpenTelemetry'],
    stats: [
      { value: '11', label: { ru: 'каналы продаж', en: 'sales channels' } },
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
    period: { ru: '2025 — сейчас', en: '2025 — present' },
    role: { ru: 'Фронтенд-разработчик, один из основных авторов', en: 'Frontend developer, one of the core authors' },
    tagline: {
      ru: 'Админка e-commerce платформы: каталог, заказы, лояльность, 9 маркетплейсов, роли и мониторинг сервисов в одном интерфейсе',
      en: 'The e-commerce platform admin: catalog, orders, loyalty, 9 marketplaces, roles and service monitoring in one interface',
    },
    task: {
      ru: 'Дать команде один интерфейс ко всему core и его сервисам: от карточки товара до передачи остатков на маркетплейсы, с правами по ролям. Живая копия меню на выдуманных данных — в папке «Демо», ecommerce-demo.',
      en: 'Give the team one interface to the whole core and its services, from product cards to pushing stock to marketplaces, with role-based access. A live copy of the menu on made-up data is in the Demos folder: ecommerce-demo.',
    },
    done: [
      { ru: 'Разделы маркетплейсов: кабинеты, передача остатков, журнал синхронизаций и заказы по каждому каналу', en: 'Marketplace sections: accounts, stock push, sync log and orders per channel' },
      { ru: 'Лояльность: бонусные счета с лотами и историей, ручные начисления, подарочные сертификаты, правила списания', en: 'Loyalty: bonus accounts with lots and history, manual accruals, gift certificates, redemption rules' },
      { ru: 'Короткие ссылки с QR-кодами и статистикой переходов, клиенты API с лимитами', en: 'Short links with QR codes and click stats, API clients with rate limits' },
      { ru: 'Состояние сервисов: живая проверка core, хранилищ и внешних интеграций', en: 'Service health: a live check of the core, storage and external integrations' },
    ],
    architecture: [
      { ru: 'Nuxt 4 SPA + Nuxt UI 4, Nitro как BFF к gateway', en: 'Nuxt 4 SPA + Nuxt UI 4, Nitro as a BFF to the gateway' },
      { ru: 'Меню и права из одного описания: пункт виден, только если у роли есть разрешение', en: 'Menu and permissions from one definition: an item shows only if the role has the permission' },
      { ru: 'Карта состояния сервисов опрашивает gateway: видно, какой сервис лежит и почему', en: 'The service health map polls the gateway: you see which service is down and why' },
    ],
    stack: ['Nuxt 4', 'Nuxt UI 4', 'Vue 3', 'TypeScript', 'Tailwind 4', 'Nitro BFF'],
    stats: [
      { value: '74', label: { ru: 'страницы', en: 'pages' } },
      { value: '35', label: { ru: 'пункты меню', en: 'menu items' } },
      { value: '101', label: { ru: 'мои коммиты', en: 'my commits' } },
    ],
    containers: [
      { name: 'admin', image: 'garlyn/admin', port: ':3000', logs: ['Nitro BFF → gateway:8080', 'Listening on http://0.0.0.0:3000'] },
    ],
  },
  {
    id: 'short-link',
    folder: 'ecommerce',
    name: 'short-link',
    short: 'Sl',
    colors: ['#0f766e', '#2dd4bf'],
    kind: 'full',
    url: 'l.garlyn.ru',
    period: { ru: '2026 — сейчас', en: '2026 — present' },
    role: { ru: 'Интеграция в платформу: маршруты gateway, права, раздел админки', en: 'Platform integration: gateway routes, permissions, admin section' },
    tagline: {
      ru: 'Короткие ссылки l.garlyn.ru с QR-кодами для коробок и инструкций и статистикой переходов',
      en: 'l.garlyn.ru short links with QR codes for boxes and manuals, plus click analytics',
    },
    task: {
      ru: 'На коробку, инструкцию или промо-материал нужен QR, который ведёт в нужное место и который можно перенастроить без перепечатки. И видеть, сколько людей реально по нему перешли.',
      en: 'Boxes, manuals and promo materials need a QR code that leads to the right place and can be repointed without reprinting — and the team wants to see how many people actually scanned it.',
    },
    done: [
      { ru: 'Раздел «Короткие ссылки» в админке: создание, подбор свободного кода, комментарий для канала, правка адреса без смены QR', en: 'A short-links section in the admin: create links, suggest a free code, tag the channel, change the target without changing the QR' },
      { ru: 'Скачивание QR-кода файлом для печати на коробках и в инструкциях', en: 'QR code download as a file for printing on boxes and manuals' },
      { ru: 'Статистика: переходы людей и ботов отдельно, график по дням, источники и последние переходы', en: 'Analytics: humans and bots counted separately, a daily chart, sources and latest visits' },
      { ru: 'Маршруты в gateway с правами short_link.view и short_link.manage и проверка сервиса на карте состояния', en: 'Gateway routes with short_link.view and short_link.manage permissions, plus the service on the health map' },
      { ru: 'API для других систем: например, CRM блогеров сама получает готовые ссылки на страницы товаров', en: 'An API for other systems: for example, the blogger CRM fetches ready links to product pages by itself' },
    ],
    architecture: [
      { ru: 'Отдельный сервис за gateway: админка ходит через общий API с RBAC', en: 'A separate service behind the gateway: the admin talks to it through the shared RBAC-protected API' },
      { ru: 'Смотреть статистику можно шире, чем заводить ссылки: два разных права', en: 'Viewing stats is allowed more widely than creating links: two separate permissions' },
      { ru: 'QR отдаётся файлом: BFF пробрасывает байты и заголовки, чтобы браузер сохранил картинку, а не JSON', en: 'The QR is served as a file: the BFF passes bytes and headers through so the browser saves an image, not JSON' },
    ],
    stack: ['Nuxt 4', 'Nuxt UI 4', 'Go gateway', 'RBAC', 'QR'],
    stats: [
      { value: '6', label: { ru: 'маршруты API', en: 'API routes' } },
      { value: '2', label: { ru: 'права доступа', en: 'permissions' } },
    ],
    containers: [
      { name: 'short-link', image: 'garlyn/short-link', port: ':8080', logs: ['redirects loaded', 'listening on :8080'] },
      { name: 'gateway', image: 'garlyn/gateway', port: ':8081', logs: ['route /admin/v1/short-link/* → short-link:8080'] },
    ],
  },

  {
    id: 'telemetry',
    folder: 'ecommerce',
    name: 'telemetry',
    short: 'Tm',
    colors: ['#b45309', '#f59e0b'],
    kind: 'back',
    url: 'localhost:3000/grafana',
    period: { ru: '2025 — сейчас', en: '2025 — present' },
    role: { ru: 'Настройка и подключение сервисов', en: 'Setup and service onboarding' },
    tagline: {
      ru: 'Телеметрия всей платформы в одном месте: логи всех сервисов, нагрузка на серверы и базы, количество и скорость запросов',
      en: 'Telemetry for the whole platform in one place: logs from every service, server and database load, request counts and latency',
    },
    task: {
      ru: 'Когда сервисов больше десятка, ошибку в логах одного контейнера не найти. Нужно одно место, где видны логи всех сервисов, нагрузка на серверы и базы данных, сколько запросов приходит и как быстро на них отвечают.',
      en: "With more than a dozen services you can't hunt for an error in one container's logs. The team needs one place showing logs from every service, server and database load, how many requests arrive and how fast they are served.",
    },
    done: [
      { ru: 'Общий Go-модуль telemetry: сервис подключается одной секцией конфига и сам отправляет логи, метрики и трейсы по OTLP', en: 'A shared Go telemetry module: a service plugs in with one config section and ships logs, metrics and traces over OTLP' },
      { ru: 'Логи всех сервисов в Loki: поиск по сервису, уровню и trace id', en: 'Logs from every service in Loki: search by service, level and trace id' },
      { ru: 'Дашборды Grafana: нагрузка на серверы, базы данных, количество запросов, скорость ответов и ошибки', en: 'Grafana dashboards: server load, databases, request counts, latency and errors' },
      { ru: 'Сквозные трейсы: один запрос виден целиком — gateway, core, маркетплейсы', en: 'End-to-end traces: one request is visible across gateway, core and marketplaces' },
    ],
    architecture: [
      { ru: 'Сервисы → OpenTelemetry SDK → OTLP gRPC → коллектор → Loki и метрики → Grafana', en: 'Services → OpenTelemetry SDK → OTLP gRPC → collector → Loki and metrics → Grafana' },
      { ru: 'Метрики PostgreSQL, Redis и RabbitMQ рядом с метриками сервисов: видно, где узкое место', en: 'PostgreSQL, Redis and RabbitMQ metrics next to service metrics: you see where the bottleneck is' },
      { ru: 'У каждого сервиса своё имя и версия в телеметрии, traceparent передаётся через gRPC и HTTP', en: 'Every service reports its own name and version; traceparent travels over gRPC and HTTP' },
    ],
    stack: ['Grafana', 'Loki', 'OpenTelemetry', 'OTLP', 'Go'],
    stats: [
      { value: '3', label: { ru: 'сигнала: логи, метрики, трейсы', en: 'signals: logs, metrics, traces' } },
    ],
    containers: [
      { name: 'otel-collector', image: 'otel/opentelemetry-collector-contrib', port: ':4317', logs: ['Starting GRPC server endpoint=0.0.0.0:4317', 'Everything is ready. Begin running and processing data.'] },
      { name: 'loki', image: 'grafana/loki', port: ':3100', logs: ['Loki started', 'ingester: ready'] },
      { name: 'grafana', image: 'grafana/grafana', port: ':3000', logs: ['HTTP Server Listen address=[::]:3000', 'datasources provisioned: Loki'] },
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
      ru: 'Интернет-магазин бытовой техники Garlyn: SSR-витрина, полная админка, гарантия и сервис, аналитика в ClickHouse и Mindbox',
      en: 'The Garlyn home appliance store: SSR storefront, a full admin panel, warranty and service pages, analytics in ClickHouse and Mindbox',
    },
    task: {
      ru: 'Развивать магазин с высокой нагрузкой и десятками интеграций, дать команде админку для всего сайта и при этом постепенно переносить логику в core, не останавливая продажи.',
      en: 'Grow a high-traffic store with dozens of integrations, give the team an admin panel for the whole site, and gradually move its logic into core without stopping sales.',
    },
    done: [
      {
        ru: 'Админка сайта целиком: товары, категории, вариации и бейджи товаров, акции, промо-каталоги, купоны и товар дня, заказы, платежи и службы доставки, клиенты и группы, рецепты, блог, документы, сервисные центры, доп. гарантия, email-рассылки, медиа, пользователи, роли и права, история изменений',
        en: 'The whole site admin: products, categories, product variations and badges, promotions, promo catalogs, coupons and deal of the day, orders, payments and delivery services, customers and groups, recipes, blog, documents, service centers, extended warranty, emails, media, users, roles and permissions, change history',
      },
      { ru: 'Вариации товаров (цвета и модификации) и бейджи на карточках — от админки до витрины', en: 'Product variations (colors and models) and badges on product cards — from the admin to the storefront' },
      { ru: 'Страницы гарантии и сервиса: гарантия 5 лет, регистрация доп. гарантии, сервисные центры по городам', en: 'Warranty and service pages: 5-year warranty, extended warranty registration, service centers by city' },
      {
        ru: 'Сбор данных: события в ClickHouse для аналитики; Mindbox — клиенты, заказы, корзина, просмотры товаров, брошенное оформление, трек-номера, гарантия и бонусы',
        en: 'Data collection: events into ClickHouse for analytics; Mindbox — customers, orders, cart, product views, abandoned checkout, tracking numbers, warranty and bonuses',
      },
      { ru: 'Подарочные сертификаты, оформление заказа, личный кабинет', en: 'Gift certificates, checkout, customer account' },
      { ru: 'Шесть платёжных провайдеров за единым PaymentService с фоновой сверкой статусов', en: 'Six payment providers behind one PaymentService with background status polling' },
      { ru: 'Доставка через общий интерфейс: Apiship, ПВЗ Ozon, Почта России, собственная доставка', en: 'Delivery behind one interface: Apiship, Ozon pickup points, Russian Post, own couriers' },
      {
        ru: 'Переключение лояльности на сервис core под фичефлагом с ночной сверкой; импорт карточек из core',
        en: 'Switched loyalty to the core service behind a feature flag with nightly reconciliation; product import from core',
      },
      { ru: 'RetailCRM, фиды для маркетплейсов и партнёров, sitemap, синк остатков', en: 'RetailCRM, feeds for marketplaces and partners, sitemap, stock sync' },
    ],
    architecture: [
      { ru: 'Laravel: контроллеры → сервисы → джобы и события, очереди на Redis', en: 'Laravel: controllers → services → jobs and events, Redis queues' },
      { ru: 'Inertia + Vue 3 с SSR, отдельные входы для витрины и админки', en: 'Inertia + Vue 3 with SSR, separate entry points for storefront and admin' },
      { ru: 'Деплой из GitLab CI на две веб-ноды и отдельную фоновую ноду', en: 'GitLab CI deploys to two web nodes and a separate background node' },
    ],
    stack: ['PHP 8.2', 'Laravel 10', 'Vue 3', 'Inertia SSR', 'PostgreSQL', 'Redis', 'ClickHouse', 'Mindbox'],
    stats: [
      { value: '162', label: { ru: 'страницы Inertia', en: 'Inertia pages' } },
      { value: '50', label: { ru: 'страницы админки', en: 'admin pages' } },
      { value: '141', label: { ru: 'миграции', en: 'migrations' } },
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
    kind: 'full',
    url: 'stoewer.ru',
    period: { ru: '2025 — сейчас', en: '2025 — present' },
    role: { ru: 'Разработчик в команде: витрина, админка и их BFF', en: 'Developer on the team: storefront, admin and their BFF' },
    tagline: {
      ru: 'Витрина и админка бренда Stoewer на Nuxt: каталог, корзина, checkout с доставкой, кабинет, лояльность и обмен с CRM',
      en: 'The Stoewer storefront and admin on Nuxt: catalog, cart, checkout with delivery, account, loyalty and CRM exchange',
    },
    task: {
      ru: 'Запустить сайт второго бренда: витрина с полноценным оформлением заказа и доставкой, админка для команды и обмен данными с CRM в обе стороны.',
      en: 'Launch the second brand\'s website: a storefront with full checkout and delivery, an admin panel for the team and two-way data exchange with the CRM.',
    },
    done: [
      { ru: 'Админка: товары, категории, пользователи, пагинация', en: 'Admin: products, categories, users, pagination' },
      {
        ru: 'Блок доставки в checkout целиком: Москва и регионы, курьер и пункты выдачи на карте, расчёт через CDEK, подсказки адресов DaData, выбор способа оплаты',
        en: 'The whole delivery block in checkout: Moscow and regions, courier and pickup points on a map, CDEK quotes, DaData address suggestions, payment method choice',
      },
      { ru: 'Связь с CRM: обмен данными в обе стороны — заказы и клиенты уходят в CRM, статусы возвращаются на сайт', en: 'CRM link: two-way data exchange — orders and customers go to the CRM, statuses come back to the site' },
      { ru: 'Страница дополнительной гарантии и личный кабинет', en: 'Extended warranty page and customer account' },
      { ru: 'Серверная часть на Nitro: API для витрины и админки, интеграции CDEK и DaData на сервере', en: 'Server side on Nitro: APIs for the storefront and admin, CDEK and DaData integrations server-side' },
    ],
    architecture: [
      { ru: 'Два Nuxt-приложения: client и admin', en: 'Two Nuxt apps: client and admin' },
      { ru: 'Nitro-сервер у каждого приложения: ключи CDEK и DaData и адрес API бэкенда не попадают в браузер', en: 'A Nitro server in each app: CDEK and DaData keys and the backend API address never reach the browser' },
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
      {
        ru: 'Готовая ссылка для блогера без ручной работы: CRM сама берёт по API у сервиса коротких ссылок ссылку на страницу товара с метками',
        en: 'A ready link for each blogger with no manual work: the CRM asks the short-link service API for a tagged link to the product page',
      },
      { ru: 'Отслеживание заказов с сайта и повторных заказов этих клиентов — видно, кто вернулся после интеграции', en: 'Tracking site orders and repeat orders from those customers — you see who came back after an integration' },
      { ru: 'Агентский API с llms.txt для ИИ-ассистентов сотрудников', en: 'An agent API with llms.txt for staff AI assistants' },
    ],
    architecture: [
      {
        ru: 'Nuxt 4 SPA + Nitro BFF: токены в httpOnly-cookie, обновление access-токена на сервере',
        en: 'Nuxt 4 SPA + Nitro BFF: tokens in httpOnly cookies, access-token refresh on the server',
      },
      { ru: 'Go на stdlib: 16 доменов, ≈148 маршрутов', en: 'Go on the stdlib: 16 domains, ≈148 routes' },
      { ru: 'Работа по API с e-commerce платформой: товары, категории, короткие ссылки и заказы', en: 'Works with the e-commerce platform over its API: products, categories, short links and orders' },
      { ru: 'Деплой с Caddy и автоматическим HTTPS', en: 'Deployed with Caddy and automatic HTTPS' },
    ],
    stack: ['Go 1.25', 'Nuxt 4', 'PostgreSQL', 'S3', 'Chart.js', 'Caddy'],
    stats: [
      { value: '16', label: { ru: 'домены', en: 'domains' } },
      { value: '62', label: { ru: 'миграции', en: 'migrations' } },
      { value: '215', label: { ru: 'коммиты', en: 'commits' } },
    ],
    containers: [
      pg('18', 'crm'),
      { name: 'backend', image: 'crm-bloggers/back', port: ':8080', logs: ['migrations applied: 62', 'listening on :8080'] },
      { name: 'nuxt', image: 'crm-bloggers/front', port: ':3000', logs: ['Nitro BFF → backend:8080', 'Listening on http://0.0.0.0:3000'] },
    ],
  },
  {
    id: 'retailcrm-helper',
    folder: 'ecommerce',
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
        ru: 'Виджет «Бонусная программа» в карточке заказа: резерв бонусов в core и скидка в CRM; если скидка не записалась, резерв отпускается',
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
  {
    id: 'ecommerce-demo',
    folder: 'demo',
    name: 'ecommerce-demo',
    short: 'Ec',
    colors: ['#c2410c', '#fe8a4a'],
    kind: 'full',
    url: 'localhost:3000',
    sandbox: 'admin',
    repo: 'MikiRus/demo-admin',
    period: { ru: 'октябрь 2026', en: 'Oct 2026' },
    role: { ru: 'Сделано с нуля для портфолио', en: 'Built from scratch for this portfolio' },
    tagline: {
      ru: 'Админка e-commerce платформы на выдуманных данных — её можно потрогать',
      en: 'The e-commerce platform admin on made-up data — you can actually try it',
    },
    task: {
      ru: 'Показать настоящую админку (кейс admin в папке E-commerce) без доступа к боевым данным: то же меню из 35 разделов, живые сценарии и данные, которые можно менять.',
      en: 'Show the real admin (the admin case in the E-commerce folder) without production data: the same 35-section menu, live flows and data you can change.',
    },
    done: [
      { ru: 'Заказы со сменой статуса и историей, бонусные счета с ручными начислениями', en: 'Orders with status changes and history, bonus accounts with manual accruals' },
      { ru: 'Передача остатков на маркетплейс пачками: видно лимит запросов, 429 и повторы', en: 'Stock push to a marketplace in batches: rate limit, 429s and retries are visible' },
      { ru: 'Короткие ссылки с QR-кодом и графиком переходов', en: 'Short links with a QR code and a click chart' },
      { ru: 'Матрица прав по ролям и мониторинг сервисов в реальном времени', en: 'A role permission matrix and live service monitoring' },
    ],
    architecture: [
      { ru: 'Nuxt 4 SPA + Nuxt UI 4, один движок таблиц на 20 разделов', en: 'Nuxt 4 SPA + Nuxt UI 4, one table engine for 20 sections' },
      { ru: 'Данные генерируются детерминированно и живут в памяти Nitro, пока жива песочница', en: 'Data is generated deterministically and lives in Nitro memory while the sandbox is alive' },
      { ru: 'Работает без интернета: иконки и шрифты в бандле', en: 'Works offline: icons and fonts are bundled' },
    ],
    stack: ['Nuxt 4', 'Nuxt UI 4', 'TypeScript', 'Tailwind 4', 'Docker'],
    stats: [
      { value: '35', label: { ru: 'пункты меню', en: 'menu items' } },
      { value: '1', label: { ru: 'контейнер', en: 'container' } },
    ],
    containers: [
      { name: 'web', image: 'demo-admin-web', port: ':3000', logs: ['Listening on http://0.0.0.0:3000'] },
    ],
  },
]

export const projectById = (id: string) => projects.find((p) => p.id === id)
