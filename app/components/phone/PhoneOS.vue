<script setup lang="ts">
import { projectById } from '~/data/projects'

// Мобильная версия: домашний экран iOS, папки поверх и стопка экранов.
// Все открытые экраны остаются смонтированными, поэтому iframe живого демо
// не перезагружается, если сходить в Docker и вернуться.
const { t } = useI18n()
const { stack } = usePhone()
usePhoneHistory()

const folderTitle = (id: string) => {
  const p = projectById(id)
  return p ? t(`folders.${p.folder}`) : ''
}
</script>

<template>
  <div>
    <PhoneHome />
    <PhoneFolder />
    <TransitionGroup name="screen">
      <template v-for="(s, i) in stack" :key="`${i}-${s.kind}`">
        <PhoneScreen v-if="s.kind === 'project'" :title="folderTitle(s.id)"><PhoneProject :id="s.id" /></PhoneScreen>
        <PhoneSafari v-else-if="s.kind === 'safari'" :id="s.id" />
        <PhoneDocker v-else-if="s.kind === 'docker'" />
        <PhoneSettings v-else-if="s.kind === 'settings'" />
        <PhoneAbout v-else />
      </template>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.screen-enter-active,
.screen-leave-active {
  transition: transform 0.32s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.screen-enter-from,
.screen-leave-to {
  transform: translateX(100%);
}
@media (prefers-reduced-motion: reduce) {
  .screen-enter-active,
  .screen-leave-active {
    transition: none;
  }
}
</style>
