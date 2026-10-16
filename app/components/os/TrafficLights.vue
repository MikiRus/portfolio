<script setup lang="ts">
import type { AppId } from '~/composables/useWindows'

const props = defineProps<{ app: AppId }>()
const { close, minimize, toggleMaximize } = useWindows()
const { t } = useI18n()
</script>

<template>
  <div class="group/tl flex gap-2" data-no-drag>
    <button class="traffic bg-[#ff5f57]" :aria-label="t('window.close')" @click.stop="close(props.app)">
      <svg class="size-2 opacity-0 group-hover/tl:opacity-100" viewBox="0 0 8 8" aria-hidden="true"><path d="m2 2 4 4M6 2 2 6" stroke="#4d0000" stroke-width="1.2" stroke-linecap="round" /></svg>
    </button>
    <button class="traffic bg-[#febc2e]" :aria-label="t('window.minimize')" @click.stop="minimize(props.app)">
      <svg class="size-2 opacity-0 group-hover/tl:opacity-100" viewBox="0 0 8 8" aria-hidden="true"><path d="M1.5 4h5" stroke="#5c3b00" stroke-width="1.2" stroke-linecap="round" /></svg>
    </button>
    <button class="traffic bg-[#28c840] max-md:hidden" :aria-label="t('window.maximize')" @click.stop="toggleMaximize(props.app)">
      <svg class="size-2 opacity-0 group-hover/tl:opacity-100" viewBox="0 0 8 8" aria-hidden="true"><path d="M2 5V2h3M6 3v3H3" fill="none" stroke="#0a4d0a" stroke-width="1.2" stroke-linecap="round" /></svg>
    </button>
  </div>
</template>
