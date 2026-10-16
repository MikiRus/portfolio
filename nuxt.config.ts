import tailwindcss from '@tailwindcss/vite'

export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: false },
  modules: ['@nuxtjs/i18n', '@nuxt/fonts'],
  css: ['~/assets/css/main.css'],
  // Компоненты из подпапок без префикса: <MenuBar>, а не <OsMenuBar>.
  components: [{ path: '~/components', pathPrefix: false }],
  vite: { plugins: [tailwindcss()] },
  // Шрифты скачиваются при сборке и отдаются с нашего домена с preload,
  // а запасной шрифт подгоняется по метрикам — без мигания при первой загрузке.
  fonts: {
    families: [
      { name: 'Onest', provider: 'google', weights: [400, 500, 600, 700], subsets: ['cyrillic', 'latin'], preload: true },
      { name: 'JetBrains Mono', provider: 'google', weights: [400, 600], subsets: ['cyrillic', 'latin'] },
    ],
  },
  i18n: {
    defaultLocale: 'ru',
    baseUrl: 'https://mikkirus.dev',
    strategy: 'prefix_except_default',
    locales: [
      { code: 'ru', language: 'ru-RU', name: 'Русский', file: 'ru.json' },
      { code: 'en', language: 'en-US', name: 'English', file: 'en.json' },
    ],
    detectBrowserLanguage: false,
    vueI18n: './i18n.config.ts',
  },
  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#3b3fa8' },
      ],
    },
  },
})
