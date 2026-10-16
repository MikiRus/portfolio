<script setup lang="ts">
import { profile } from '~/data/profile'
import type { AppId } from '~/composables/useWindows'

const { t } = useI18n()
const { wins, dockClick } = useWindows()

const apps: AppId[] = ['finder', 'safari', 'docker', 'settings']
const links = computed(() =>
  [
    { name: 'github' as const, label: 'GitHub', href: profile.github },
    { name: 'telegram' as const, label: 'Telegram', href: profile.telegram },
    { name: 'mail' as const, label: 'Email', href: profile.email && `mailto:${profile.email}` },
  ].filter((l) => l.href),
)
</script>

<template>
  <footer
    class="fixed bottom-2.5 left-1/2 z-[8000] flex -translate-x-1/2 items-end gap-2.5 rounded-[22px] bg-white/30 px-2.5 pt-2 pb-1.5 shadow-[0_0_0_0.5px_rgba(255,255,255,0.5),0_10px_30px_rgba(0,0,0,0.18)] backdrop-blur-2xl"
  >
    <button v-for="app in apps" :key="app" class="group relative flex flex-col items-center gap-1" :aria-label="t(`apps.${app}`)" @click="dockClick(app)">
      <span class="pointer-events-none absolute bottom-[74px] rounded-md bg-[#f0f0f4]/95 px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-ink opacity-0 shadow transition-opacity group-hover:opacity-100">
        {{ t(`apps.${app}`) }}
      </span>
      <span class="transition-transform duration-150 group-hover:-translate-y-1.5 group-active:brightness-75"><AppIcon :name="app" /></span>
      <i class="size-1 rounded-full" :class="wins[app] ? 'bg-ink' : 'bg-transparent'" />
    </button>
    <template v-if="links.length">
      <span class="mx-0.5 mb-2 h-[52px] w-px bg-black/20" aria-hidden="true" />
      <a v-for="l in links" :key="l.name" :href="l.href" target="_blank" rel="noopener" class="group relative flex flex-col items-center gap-1" :aria-label="l.label">
        <span class="transition-transform duration-150 group-hover:-translate-y-1.5"><AppIcon :name="l.name" /></span>
        <i class="size-1" />
      </a>
    </template>
  </footer>
</template>
