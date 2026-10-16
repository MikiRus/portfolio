<script setup lang="ts">
// Экран-приложение: панель с «назад» сверху и содержимое на всю высоту.
defineProps<{ title: string; dark?: boolean }>()
const { t } = useI18n()
const { back } = usePhone()
</script>

<template>
  <div class="fixed inset-0 z-40 flex flex-col" :class="dark ? 'bg-[#14161c] text-white' : 'bg-white text-ink'">
    <header
      class="flex shrink-0 items-center gap-2 border-b px-3 pt-[max(env(safe-area-inset-top),10px)] pb-2"
      :class="dark ? 'border-white/10 bg-[#14161c]/95' : 'border-line bg-white/95'"
    >
      <button class="flex items-center gap-1 rounded-lg px-1.5 py-1 text-[17px] text-accent" @click="back">
        <svg width="12" height="20" viewBox="0 0 12 20" aria-hidden="true"><path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
        {{ t('phone.back') }}
      </button>
      <h1 class="min-w-0 flex-1 truncate pr-16 text-center text-[17px] font-semibold">{{ title }}</h1>
      <slot name="action" />
    </header>
    <div class="min-h-0 flex-1 overflow-y-auto overscroll-contain"><slot /></div>
  </div>
</template>
