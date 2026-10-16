<script setup lang="ts">
import { wallpapers, type WallpaperId } from '~/data/wallpapers'

const { t, locale, locales, setLocale } = useI18n()
const { wallpaper, setWallpaper } = useSettings()
const { lock } = useLock()
const { home } = usePhone()
const ids = Object.keys(wallpapers) as WallpaperId[]

function lockNow() {
  home()
  lock()
}
</script>

<template>
  <PhoneScreen :title="t('apps.settings')">
    <div class="min-h-full space-y-6 bg-[#f2f2f7] px-4 py-5">
      <section>
        <h2 class="mb-2 px-3 text-xs text-muted uppercase">{{ t('settings.wallpaper') }}</h2>
        <div class="grid grid-cols-4 gap-3 rounded-2xl bg-white p-3" role="radiogroup" :aria-label="t('settings.wallpaper')">
          <button v-for="id in ids" :key="id" role="radio" :aria-checked="wallpaper === id" class="flex flex-col items-center gap-1.5 text-[11px]" @click="setWallpaper(id)">
            <span class="aspect-[9/16] w-full rounded-lg" :class="wallpaper === id ? 'ring-[3px] ring-accent ring-offset-2' : 'ring-1 ring-black/10'" :style="{ background: wallpapers[id] }" />
            {{ t(`settings.wallpapers.${id}`) }}
          </button>
        </div>
      </section>
      <section>
        <h2 class="mb-2 px-3 text-xs text-muted uppercase">{{ t('settings.language') }}</h2>
        <div class="divide-y divide-line rounded-2xl bg-white">
          <button v-for="l in locales" :key="l.code" class="flex w-full items-center justify-between px-4 py-3 text-[17px]" :aria-pressed="locale === l.code" @click="setLocale(l.code)">
            {{ l.name }}
            <svg v-if="locale === l.code" class="size-5 text-accent" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8.5 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" /></svg>
          </button>
        </div>
      </section>
      <button class="w-full rounded-2xl bg-white px-4 py-3 text-left text-[17px] text-stop" @click="lockNow">{{ t('settings.lockNow') }}</button>
    </div>
  </PhoneScreen>
</template>
