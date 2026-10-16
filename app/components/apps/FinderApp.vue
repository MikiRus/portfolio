<script setup lang="ts">
import type { FolderId, Project } from '~/data/types'
import { folders, projects } from '~/data/projects'

const { t } = useI18n()
const tr = useTr()
const { launch } = useLaunch()
const folder = useState<FolderId>('finder-folder', () => 'ecommerce')
const query = ref('')
const selected = ref<string | null>(null)

// Поиск идёт по всем папкам, как Spotlight внутри Finder.
const items = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return projects.filter((p) => p.folder === folder.value)
  return projects.filter((p) => [p.name, tr(p.tagline), ...p.stack].join(' ').toLowerCase().includes(q))
})

const kindStyle: Record<Project['kind'], string> = {
  front: 'bg-[#e7f0fb] text-[#1864ab]',
  back: 'bg-[#fdf0e2] text-[#a14a00]',
  full: 'bg-[#efeafd] text-[#5f3dc4]',
}

function onClick(e: MouseEvent, p: Project) {
  selected.value = p.id
  if ((e as PointerEvent).pointerType === 'touch') launch(p)
}
</script>

<template>
  <nav class="flex w-48 shrink-0 flex-col gap-1 bg-sidebar/95 px-2.5 py-3.5 text-[13px] max-sm:hidden" data-drag>
    <div class="px-1.5 pb-4"><TrafficLights app="finder" /></div>
    <span class="px-2 pb-1 text-[11px] font-semibold text-muted">{{ t('finder.favorites') }}</span>
    <button
      v-for="id in folders"
      :key="id"
      class="flex items-center gap-2 rounded-md px-2 py-1.5 text-left"
      :class="folder === id && !query ? 'bg-black/[0.08] font-semibold' : 'hover:bg-black/[0.04]'"
      :aria-current="folder === id && !query ? 'page' : undefined"
      @click="(folder = id), (query = '')"
    >
      <svg class="size-4 text-accent" viewBox="0 0 16 16" aria-hidden="true"><path d="M1.5 4a1.5 1.5 0 0 1 1.5-1.5h3.2l1.5 1.5H13A1.5 1.5 0 0 1 14.5 5.5v6.5A1.5 1.5 0 0 1 13 13.5H3A1.5 1.5 0 0 1 1.5 12z" fill="currentColor" opacity="0.85" /></svg>
      {{ t(`folders.${id}`) }}
    </button>
  </nav>

  <div class="flex min-w-0 flex-1 flex-col">
    <div class="flex h-[52px] shrink-0 items-center gap-3 border-b border-line px-4" data-drag>
      <div class="sm:hidden"><TrafficLights app="finder" /></div>
      <strong class="truncate text-sm">{{ query ? t('finder.search') : t(`folders.${folder}`) }}</strong>
      <span class="flex-1" />
      <label class="flex items-center gap-1.5 rounded-lg bg-[#f2f2f7] px-2.5 py-1.5 text-xs text-muted focus-within:ring-2 focus-within:ring-accent/40">
        <svg class="size-3" viewBox="0 0 12 12" aria-hidden="true"><circle cx="5" cy="5" r="3.8" fill="none" stroke="currentColor" stroke-width="1.4" /><path d="m8 8 3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" /></svg>
        <span class="sr-only">{{ t('finder.search') }}</span>
        <input v-model="query" type="search" :placeholder="t('finder.search')" class="w-28 bg-transparent text-ink outline-none">
      </label>
    </div>

    <div class="grid flex-1 grid-cols-[repeat(auto-fill,minmax(130px,1fr))] content-start gap-5 overflow-auto p-6" @click.self="selected = null">
      <button
        v-for="p in items"
        :key="p.id"
        class="flex flex-col items-center gap-2 rounded-xl p-2 outline-none focus-visible:ring-2 focus-visible:ring-accent"
        :class="{ 'bg-accent-soft': selected === p.id }"
        :title="tr(p.tagline)"
        @click="onClick($event, p)"
        @dblclick="launch(p)"
        @keydown.enter="launch(p)"
      >
        <ProjectIcon :project="p" />
        <span class="max-w-full truncate text-[13px] font-medium">{{ p.name }}</span>
        <span class="rounded-full px-2 py-0.5 text-[10px] font-semibold" :class="kindStyle[p.kind]">{{ t(`kind.${p.kind}`) }}</span>
      </button>
      <p v-if="!items.length" class="col-span-full py-10 text-center text-sm text-muted">{{ t('finder.empty') }}</p>
    </div>

    <div class="flex h-7 shrink-0 items-center justify-center border-t border-line text-[11px] text-muted">
      {{ t('finder.items', items.length) }} · {{ t('finder.hint') }}
    </div>
  </div>
</template>
