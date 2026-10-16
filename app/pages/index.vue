<script setup lang="ts">
const { t } = useI18n()
const head = useLocaleHead()
useHead(() => ({ htmlAttrs: head.value.htmlAttrs, link: head.value.link, meta: head.value.meta }))
useSeoMeta({ title: () => t('meta.title'), description: () => t('meta.description'), ogTitle: () => t('meta.title'), ogDescription: () => t('meta.description') })

const { list } = useWindows()
const { background, restore: restoreSettings } = useSettings()
const { locked, restore: restoreLock } = useLock()

onMounted(() => {
  restoreSettings()
  restoreLock()
})
</script>

<template>
  <main class="fixed inset-0 overflow-hidden transition-[background] duration-500" :style="{ background }">
    <h1 class="sr-only">{{ t('meta.title') }}</h1>
    <MenuBar />
    <StickyNote />
    <DesktopIcons />

    <AppWindow v-for="w in list" :key="w.app" :app="w.app" :label="t(`apps.${w.app}`)">
      <FinderApp v-if="w.app === 'finder'" />
      <DockerApp v-else-if="w.app === 'docker'" />
      <SafariApp v-else-if="w.app === 'safari'" />
      <SettingsApp v-else />
    </AppWindow>

    <AppDock />

    <Transition name="fade">
      <LockScreen v-if="locked" />
    </Transition>
  </main>
</template>

<style scoped>
.fade-leave-active {
  transition:
    opacity 0.45s ease,
    transform 0.45s ease;
}
.fade-leave-to {
  opacity: 0;
  transform: scale(1.04);
}
</style>
