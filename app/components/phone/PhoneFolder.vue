<script setup lang="ts">
import { projects } from '~/data/projects'

const { t } = useI18n()
const { folder, open } = usePhone()
const items = computed(() => projects.filter((p) => p.folder === folder.value))

function pick(id: string) {
  folder.value = null
  open({ kind: 'project', id })
}
</script>

<template>
  <Transition name="folder">
    <div v-if="folder" class="fixed inset-0 z-30 grid place-items-center bg-black/25 px-8 backdrop-blur-xl" @click.self="folder = null">
      <div class="w-full max-w-[330px]" role="dialog" :aria-label="t(`folders.${folder}`)">
        <h2 class="mb-4 text-center text-[28px] font-bold text-white [text-shadow:0_2px_8px_rgba(0,0,0,0.25)]">{{ t(`folders.${folder}`) }}</h2>
        <div class="grid grid-cols-3 justify-items-center gap-x-3 gap-y-5 rounded-[34px] bg-white/30 p-6 backdrop-blur-2xl">
          <button v-for="p in items" :key="p.id" class="flex w-full flex-col items-center gap-1.5 active:scale-95" @click="pick(p.id)">
            <ProjectIcon :project="p" :size="60" />
            <span class="max-w-full truncate text-[11px] font-medium text-white [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]">{{ p.name }}</span>
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.folder-enter-active,
.folder-leave-active {
  transition: opacity 0.2s ease;
}
.folder-enter-active > div,
.folder-leave-active > div {
  transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.folder-enter-from,
.folder-leave-to {
  opacity: 0;
}
.folder-enter-from > div,
.folder-leave-to > div {
  transform: scale(0.8);
}
</style>
