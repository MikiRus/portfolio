<script setup lang="ts">
import type { Project } from '~/data/types'

const props = defineProps<{ project: Project; size?: number }>()
const px = computed(() => props.size ?? 72)
</script>

<template>
  <span
    class="grid shrink-0 place-items-center font-bold text-white shadow-[0_4px_12px_rgba(0,0,0,0.18)]"
    :style="{
      width: `${px}px`,
      height: `${px}px`,
      borderRadius: `${px / 4}px`,
      fontSize: `${px / 3}px`,
      background: `linear-gradient(145deg, ${project.colors[1]}, ${project.colors[0]})`,
    }"
    aria-hidden="true"
  >{{ project.short }}</span>
</template>
