<script setup lang="ts">
import { profile } from '~/data/profile'

const { t, locale, setLocale } = useI18n()
const tr = useTr()
const { active, open } = useWindows()
const { lock } = useLock()
const now = useClock()

const clock = computed(() =>
  new Intl.DateTimeFormat(locale.value === 'ru' ? 'ru-RU' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(now.value),
)

const menuOpen = ref(false)
const menu = useTemplateRef<HTMLElement>('menu')
onClickOutside(menu, () => (menuOpen.value = false))

function pick(action: () => void) {
  menuOpen.value = false
  action()
}

// Небольшая замена VueUse: закрыть меню по клику мимо или по Escape.
function onClickOutside(el: Ref<HTMLElement | null>, fn: () => void) {
  const handler = (e: Event) => {
    if (el.value && !el.value.contains(e.target as Node)) fn()
  }
  const esc = (e: KeyboardEvent) => e.key === 'Escape' && fn()
  onMounted(() => {
    document.addEventListener('pointerdown', handler)
    document.addEventListener('keydown', esc)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('pointerdown', handler)
    document.removeEventListener('keydown', esc)
  })
}
</script>

<template>
  <header class="glass fixed inset-x-0 top-0 z-[9000] flex h-[30px] items-center justify-between px-3 text-[13px] text-ink">
    <nav class="flex min-w-0 items-center gap-4">
      <div ref="menu" class="relative">
        <button
          class="grid h-6 w-7 place-items-center rounded-md hover:bg-black/10"
          :class="{ 'bg-black/10': menuOpen }"
          :aria-expanded="menuOpen"
          aria-haspopup="menu"
          aria-label="Menu"
          @click="menuOpen = !menuOpen"
        >
          <svg width="14" height="16" viewBox="0 0 14 16" aria-hidden="true">
            <path
              d="M11.6 8.5c0-2 1.6-2.9 1.7-3-.9-1.4-2.4-1.6-2.9-1.6-1.2-.1-2.4.7-3 .7s-1.6-.7-2.6-.7C3.4 4 1 5.4 1 8.7 1 10.7 1.8 12.8 2.7 14c.7 1 1.4 1.9 2.4 1.9s1.3-.6 2.5-.6 1.5.6 2.5.6 1.7-1 2.3-1.9c.7-1.1 1-2.1 1-2.2 0 0-2-.8-1.8-3.3zM9.7 2.6c.5-.7.9-1.6.8-2.6-.8 0-1.8.5-2.4 1.2-.5.6-1 1.6-.8 2.5.9.1 1.8-.4 2.4-1.1z"
              fill="currentColor"
            />
          </svg>
        </button>
        <div v-if="menuOpen" role="menu" class="absolute top-7 left-0 w-56 rounded-lg bg-white/90 p-1 shadow-xl ring-1 ring-black/10 backdrop-blur-xl">
          <button role="menuitem" class="w-full rounded-md px-3 py-1.5 text-left hover:bg-accent hover:text-white" @click="pick(() => open('settings'))">
            {{ t('menu.settings') }}
          </button>
          <hr class="my-1 border-line">
          <button role="menuitem" class="w-full rounded-md px-3 py-1.5 text-left hover:bg-accent hover:text-white" @click="pick(lock)">
            {{ t('menu.lock') }}
          </button>
        </div>
      </div>
      <strong class="truncate font-bold">{{ tr(profile.name) }}</strong>
      <span v-if="active" class="max-sm:hidden">{{ t(`apps.${active}`) }}</span>
    </nav>
    <div class="flex items-center gap-4">
      <div class="flex rounded-md bg-black/[0.08] p-0.5 text-[11px] font-semibold" role="group" :aria-label="t('settings.language')">
        <button
          v-for="code in ['ru', 'en'] as const"
          :key="code"
          class="rounded px-2 py-0.5 uppercase"
          :class="locale === code ? 'bg-white text-ink shadow-sm' : 'text-ink/70'"
          :aria-pressed="locale === code"
          @click="setLocale(code)"
        >
          {{ code }}
        </button>
      </div>
      <ClientOnly><span class="font-medium tabular-nums max-sm:hidden">{{ clock }}</span></ClientOnly>
    </div>
  </header>
</template>
