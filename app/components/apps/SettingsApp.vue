<script setup lang="ts">
import { wallpapers, type WallpaperId } from '~/data/wallpapers'

const { t, locale, locales, setLocale } = useI18n()
const { wallpaper, setWallpaper } = useSettings()
const { lock } = useLock()
const ids = Object.keys(wallpapers) as WallpaperId[]
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col bg-chrome">
    <div class="flex h-[52px] shrink-0 items-center gap-4 border-b border-line px-4" data-drag>
      <TrafficLights app="settings" />
      <strong class="text-sm">{{ t('apps.settings') }}</strong>
    </div>

    <div class="flex-1 space-y-6 overflow-y-auto p-6">
      <section>
        <h2 class="mb-3 text-sm font-semibold">{{ t('settings.wallpaper') }}</h2>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-4" role="radiogroup" :aria-label="t('settings.wallpaper')">
          <button
            v-for="id in ids"
            :key="id"
            role="radio"
            :aria-checked="wallpaper === id"
            class="flex flex-col items-center gap-2 text-xs"
            @click="setWallpaper(id)"
          >
            <span
              class="aspect-[16/10] w-full rounded-lg shadow-sm ring-offset-2 ring-offset-chrome"
              :class="wallpaper === id ? 'ring-[3px] ring-accent' : 'ring-1 ring-black/10'"
              :style="{ background: wallpapers[id] }"
            />
            <span :class="{ 'font-semibold': wallpaper === id }">{{ t(`settings.wallpapers.${id}`) }}</span>
          </button>
        </div>
      </section>

      <section class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-line">
        <h2 class="text-sm font-semibold">{{ t('settings.language') }}</h2>
        <div class="flex rounded-lg bg-[#e9e9ee] p-0.5 text-sm" role="group" :aria-label="t('settings.language')">
          <button
            v-for="l in locales"
            :key="l.code"
            class="rounded-md px-3 py-1"
            :class="locale === l.code ? 'bg-white font-semibold shadow-sm' : 'text-muted'"
            :aria-pressed="locale === l.code"
            @click="setLocale(l.code)"
          >
            {{ l.name }}
          </button>
        </div>
      </section>

      <section class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 ring-1 ring-line">
        <h2 class="text-sm font-semibold">{{ t('settings.lockScreen') }}</h2>
        <button class="rounded-lg bg-[#e9e9ee] px-3 py-1.5 text-sm font-medium hover:bg-[#dedee4]" @click="lock">{{ t('settings.lockNow') }}</button>
      </section>
    </div>
  </div>
</template>
