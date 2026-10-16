<script setup lang="ts">
import { profile } from '~/data/profile'

const { t, locale, setLocale } = useI18n()
const tr = useTr()
const { unlock } = useLock()
const { background } = useSettings()
const now = useClock()

const intl = computed(() => (locale.value === 'ru' ? 'ru-RU' : 'en-US'))
const date = computed(() => new Intl.DateTimeFormat(intl.value, { weekday: 'long', day: 'numeric', month: 'long' }).format(now.value))
const time = computed(() => new Intl.DateTimeFormat(intl.value, { hour: '2-digit', minute: '2-digit' }).format(now.value))

const input = useTemplateRef<HTMLInputElement>('input')
onMounted(() => input.value?.focus())
</script>

<template>
  <div class="fixed inset-0 z-[10000] overflow-hidden text-white" :style="{ background }">
    <div class="absolute inset-0 bg-[rgba(20,16,40,0.28)] backdrop-blur-md" />

    <div class="absolute top-4 right-5 flex gap-2 text-xs font-semibold" role="group" :aria-label="t('settings.language')">
      <button
        v-for="code in ['ru', 'en'] as const"
        :key="code"
        class="rounded-md px-2.5 py-1 uppercase"
        :class="locale === code ? 'bg-white/90 text-ink' : 'bg-white/20 text-white hover:bg-white/30'"
        :aria-pressed="locale === code"
        @click="setLocale(code)"
      >
        {{ code }}
      </button>
    </div>

    <ClientOnly>
      <div class="absolute inset-x-0 top-[10vh] flex flex-col items-center gap-1 [text-shadow:0_2px_12px_rgba(0,0,0,0.25)]">
        <span class="text-xl font-medium first-letter:uppercase md:text-[22px]">{{ date }}</span>
        <span class="text-8xl leading-none font-bold tracking-tight md:text-[120px]">{{ time }}</span>
      </div>
    </ClientOnly>

    <form class="absolute inset-x-0 bottom-[12vh] flex flex-col items-center gap-3.5 px-4 text-center" @submit.prevent="unlock">
      <div class="grid size-24 place-items-center rounded-full bg-gradient-to-br from-[#e9ecef] to-[#adb5bd] text-3xl font-bold text-[#343a40] shadow-[0_8px_24px_rgba(0,0,0,0.3)]">
        {{ tr(profile.initials) }}
      </div>
      <h1 class="text-xl font-semibold [text-shadow:0_1px_6px_rgba(0,0,0,0.3)]">{{ tr(profile.name) }}</h1>
      <p class="text-sm text-white/90">{{ tr(profile.role) }}</p>
      <label class="mt-1.5 flex w-64 items-center gap-2 rounded-full bg-white/20 py-2 pr-2 pl-4 backdrop-blur-xl focus-within:ring-2 focus-within:ring-white/60">
        <span class="sr-only">{{ t('lock.hint') }}</span>
        <input ref="input" type="password" autocomplete="off" :placeholder="t('lock.hint')" class="min-w-0 flex-1 bg-transparent text-[13px] text-white outline-none placeholder:text-white/80">
        <button class="grid size-7 place-items-center rounded-full bg-white/35 hover:bg-white/50" :aria-label="t('lock.enter')">
          <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M3 7h8M8 4l3 3-3 3" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
        </button>
      </label>
      <p class="text-xs text-white/85">{{ t('lock.note') }}</p>
    </form>
  </div>
</template>
