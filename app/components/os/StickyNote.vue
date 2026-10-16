<script setup lang="ts">
const { t } = useI18n()
</script>

<template>
  <aside class="absolute top-[52px] left-6 flex w-64 flex-col gap-2 rounded-[20px] bg-white/60 px-4.5 py-4 shadow-[0_10px_30px_rgba(0,0,0,0.12)] backdrop-blur-2xl max-md:hidden">
    <span class="text-[11px] font-semibold tracking-[0.06em] text-[#9a4500] uppercase">{{ t('note.label') }}</span>
    <p class="text-[15px] leading-snug font-semibold">{{ t('note.title') }}</p>
    <p class="text-[13px] leading-relaxed text-[#3a3a3c]">{{ t('note.body') }}</p>
  </aside>
</template>
