<script setup lang="ts">
// Иконка домашнего экрана: квадрат 60 px с подписью. Содержимое — в слоте.
defineProps<{ label: string; href?: string }>()
const emit = defineEmits<{ open: [] }>()
</script>

<template>
  <component
    :is="href ? 'a' : 'button'"
    :href="href"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener' : undefined"
    class="flex flex-col items-center gap-1.5 text-white outline-none active:scale-95 active:brightness-75 transition-transform focus-visible:ring-2 focus-visible:ring-white/70 rounded-2xl"
    @click="!href && emit('open')"
  >
    <span class="grid size-[60px] place-items-center overflow-hidden rounded-[15px] shadow-[0_3px_8px_rgba(0,0,0,0.2)]"><slot /></span>
    <span class="max-w-[72px] truncate text-[11px] font-medium [text-shadow:0_1px_3px_rgba(0,0,0,0.45)]">{{ label }}</span>
  </component>
</template>
