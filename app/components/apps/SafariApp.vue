<script setup lang="ts">
import { projectById } from '~/data/projects'

const { t } = useI18n()
const { tabs, current, view, closeTab } = useSafari()
const { stacks } = useStacks()
const { launch } = useLaunch()
const project = computed(() => (current.value ? projectById(current.value) : undefined))

// Живое демо есть, пока песочница проекта запущена.
const live = computed(() => (current.value ? stacks.value[current.value]?.sandbox : undefined))
const mode = computed(() => (project.value?.sandbox && current.value ? (view.value[current.value] ?? 'about') : 'about'))
const address = computed(() => {
  if (mode.value === 'demo' && live.value) return `${location.host}${live.value.url}`
  return project.value?.url ?? ''
})

// Новая вкладка — страница кейса заново с прокруткой наверх.
const page = useTemplateRef<HTMLElement>('page')
watch(current, () => page.value?.scrollTo({ top: 0 }))
</script>

<template>
  <div class="flex min-w-0 flex-1 flex-col">
    <div class="flex h-[52px] shrink-0 items-center gap-3.5 border-b border-line bg-chrome px-4" data-drag>
      <TrafficLights app="safari" />
      <span class="flex gap-1 text-[#c7c7cc] max-sm:hidden" aria-hidden="true">
        <svg width="18" height="18" viewBox="0 0 18 18"><path d="M11 4 6 9l5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
        <svg width="18" height="18" viewBox="0 0 18 18"><path d="m7 4 5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </span>
      <div class="flex min-w-0 flex-1 justify-center">
        <div class="flex w-full max-w-md min-w-0 items-center justify-center gap-2 rounded-lg bg-[#e9e9ee] px-3 py-1.5 text-[13px] text-[#3a3a3c]" :aria-label="t('safari.address')">
          <svg v-if="project" width="11" height="13" viewBox="0 0 11 13" aria-hidden="true"><rect x="1" y="6" width="9" height="6.5" rx="1.5" fill="#6e6e73" /><path d="M3 6V4a2.5 2.5 0 0 1 5 0v2" fill="none" stroke="#6e6e73" stroke-width="1.4" /></svg>
          <span class="truncate select-text">{{ address }}</span>
        </div>
      </div>
      <div v-if="project?.sandbox" class="flex rounded-lg bg-[#e9e9ee] p-0.5 text-xs" role="group">
        <button
          v-for="m in ['demo', 'about'] as const"
          :key="m"
          class="rounded-md px-2.5 py-1"
          :class="mode === m ? 'bg-white font-semibold shadow-sm' : 'text-muted'"
          :aria-pressed="mode === m"
          @click="view[project.id] = m"
        >
          {{ t(`safari.${m}`) }}
        </button>
      </div>
      <span v-else class="w-[52px] max-sm:hidden" />
    </div>

    <div v-if="tabs.length > 1" class="flex h-[30px] shrink-0 border-b border-line bg-[#ececf0] text-xs" role="tablist">
      <div
        v-for="id in tabs"
        :key="id"
        class="group relative flex min-w-0 flex-1 items-center justify-center border-r border-line"
        :class="current === id ? 'bg-white font-medium' : 'text-muted hover:bg-[#e2e2e7]'"
      >
        <button role="tab" :aria-selected="current === id" class="h-full w-full truncate px-6" @click="current = id">
          {{ projectById(id)?.name }}
        </button>
        <button
          class="absolute left-1.5 grid size-4 place-items-center rounded opacity-0 group-hover:opacity-100 hover:bg-black/10 focus-visible:opacity-100"
          :aria-label="t('safari.closeTab')"
          @click="closeTab(id)"
        >
          <svg class="size-2.5" viewBox="0 0 8 8" aria-hidden="true"><path d="m2 2 4 4M6 2 2 6" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" /></svg>
        </button>
      </div>
    </div>

    <div ref="page" class="@container min-h-0 flex-1 overflow-y-auto bg-white select-text">
      <template v-if="project && mode === 'demo'">
        <iframe v-if="live" :key="live.id" :src="live.url" :title="project.name" class="block h-full w-full border-0" />
        <div v-else class="grid h-full place-items-center p-6 text-center text-sm text-muted">
          <div>
            <p>{{ t('safari.stopped') }}</p>
            <button class="mt-3 rounded-lg bg-accent px-3.5 py-2 font-semibold text-white hover:bg-[#084aad]" @click="launch(project)">{{ t('safari.restart') }}</button>
          </div>
        </div>
      </template>
      <CasePage v-else-if="project" :key="project.id" :project="project" />
      <p v-else class="grid h-full place-items-center p-6 text-sm text-muted">{{ t('safari.start') }}</p>
    </div>
  </div>
</template>
