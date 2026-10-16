<script setup lang="ts">
import type { FolderId } from '~/data/types'
import { folders } from '~/data/projects'

const { t } = useI18n()
const { open } = useWindows()
const finder = useState<FolderId>('finder-folder', () => 'ecommerce')
const selected = ref<FolderId | null>(null)

function openFolder(id: FolderId) {
  finder.value = id
  open('finder')
}

// Мышью — двойной клик, как в macOS; на тач-экране двойной тап неудобен.
function onClick(e: MouseEvent, id: FolderId) {
  selected.value = id
  if ((e as PointerEvent).pointerType === 'touch') openFolder(id)
}
</script>

<template>
  <nav class="absolute top-[52px] right-6 flex w-24 flex-col gap-3.5" :aria-label="t('finder.favorites')">
    <button
      v-for="id in folders"
      :key="id"
      class="flex flex-col items-center gap-1 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-white/70"
      @click.stop="onClick($event, id)"
      @dblclick="openFolder(id)"
      @keydown.enter="openFolder(id)"
    >
      <span class="flex rounded-md p-1" :class="{ 'bg-black/25': selected === id }"><FolderIcon /></span>
      <span
        class="rounded px-1.5 py-px text-center text-xs font-medium text-white"
        :class="selected === id ? 'bg-accent' : '[text-shadow:0_1px_3px_rgba(0,0,0,0.6)]'"
      >{{ t(`folders.${id}`) }}</span>
    </button>
  </nav>
</template>
