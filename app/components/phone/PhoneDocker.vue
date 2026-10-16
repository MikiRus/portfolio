<script setup lang="ts">
import { projectById } from '~/data/projects'

const { t } = useI18n()
const { stacks, stop } = useStacks()
const list = computed(() => Object.values(stacks.value).reverse())
const openLogs = ref<string | null>(list.value[0]?.projectId ?? null)
// Лог прижат к последним строкам, как в десктопном окне Docker.
const pinBottom = (el: unknown) => {
  if (el instanceof HTMLElement) el.scrollTop = el.scrollHeight
}
const dot = { waiting: 'bg-[#dee2e6]', pulling: 'bg-[#adb5bd]', starting: 'bg-wait animate-pulse', running: 'bg-ok', stopped: 'bg-[#6e7681]' } as Record<string, string>
</script>

<template>
  <PhoneScreen :title="t('apps.docker')" dark>
    <p v-if="!list.length" class="p-8 text-center text-[15px] text-white/60">{{ t('docker.empty') }}</p>
    <section v-for="s in list" :key="s.projectId" class="border-b border-white/10 px-4 py-4">
      <div class="flex items-center gap-3">
        <i class="size-2.5 shrink-0 rounded-full" :class="dot[s.status]" />
        <strong class="min-w-0 flex-1 truncate text-[17px]">{{ projectById(s.projectId)?.name }}</strong>
        <button v-if="s.status !== 'stopped'" class="rounded-full bg-[#3b1d1d] px-3 py-1 text-xs font-semibold text-[#ff8a80]" @click="stop(s.projectId)">{{ t('docker.stop') }}</button>
      </div>
      <ul class="mt-3 grid grid-cols-2 gap-2 text-[13px]">
        <li v-for="c in s.containers" :key="c.name" class="flex items-center gap-2 rounded-lg bg-white/5 px-2.5 py-1.5">
          <i class="size-2 shrink-0 rounded-full" :class="dot[c.status]" />
          <span class="truncate">{{ c.name }}</span>
        </li>
      </ul>
      <button class="mt-3 text-xs font-semibold text-[#79c0ff]" :aria-expanded="openLogs === s.projectId" @click="openLogs = openLogs === s.projectId ? null : s.projectId">
        {{ t('docker.logs') }} · {{ s.logs.length }}
      </button>
      <div v-if="openLogs === s.projectId" :ref="pinBottom" class="mt-2 max-h-72 overflow-y-auto rounded-lg bg-black/40 p-2.5 font-mono text-[11px] leading-relaxed text-[#c9d1d9]">
        <p v-for="l in s.logs.slice(-120)" :key="l.id" class="break-words"><b class="text-[#79c0ff]">{{ l.svc }}</b> {{ l.text }}</p>
      </div>
    </section>
  </PhoneScreen>
</template>
