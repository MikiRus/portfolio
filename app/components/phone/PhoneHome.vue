<script setup lang="ts">
import { profile } from '~/data/profile'
import { folders, projects } from '~/data/projects'
import type { FolderId } from '~/data/types'

const { t, locale, setLocale } = useI18n()
const tr = useTr()
const { folder, open } = usePhone()
const { stacks } = useStacks()

const inFolder = (id: FolderId) => projects.filter((p) => p.folder === id)
const running = computed(() => Object.values(stacks.value).some((s) => s.status !== 'stopped'))
const links = [{ name: 'github' as const, label: 'GitHub', href: profile.github }].filter((l) => l.href)
const dockLinks = [
  { name: 'telegram' as const, label: 'Telegram', href: profile.telegram },
  { name: 'mail' as const, label: t('phone.mail'), href: profile.email && `mailto:${profile.email}` },
].filter((l) => l.href)
</script>

<template>
  <div class="flex min-h-dvh flex-col px-5 pt-[max(env(safe-area-inset-top),20px)] pb-[calc(env(safe-area-inset-bottom)+112px)]">
    <section class="mt-4 flex items-center gap-3.5 rounded-[22px] bg-white/22 px-4 py-3.5 text-white backdrop-blur-2xl" :aria-label="tr(profile.name)">
      <span class="grid size-[52px] shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#e9ecef] to-[#adb5bd] font-bold text-[#343a40]">{{ tr(profile.initials) }}</span>
      <div class="min-w-0 flex-1 leading-tight">
        <p class="truncate font-semibold">{{ tr(profile.name) }}</p>
        <p class="mt-0.5 text-xs text-white/90">{{ tr(profile.role) }}</p>
      </div>
      <div class="flex rounded-full bg-black/15 p-0.5 text-[11px] font-bold" role="group" :aria-label="t('settings.language')">
        <button
          v-for="code in ['ru', 'en'] as const"
          :key="code"
          class="rounded-full px-2 py-1 uppercase"
          :class="locale === code ? 'bg-white text-ink' : 'text-white/85'"
          :aria-pressed="locale === code"
          @click="setLocale(code)"
        >{{ code }}</button>
      </div>
    </section>

    <section class="mt-7 grid grid-cols-4 justify-items-center gap-x-2 gap-y-6" :aria-label="t('phone.apps')">
      <PhoneAppIcon v-for="id in folders" :key="id" :label="t(`folders.${id}`)" @open="folder = id">
        <span class="grid size-full grid-cols-3 content-start gap-1 bg-white/28 p-2 backdrop-blur-xl">
          <i v-for="p in inFolder(id).slice(0, 9)" :key="p.id" class="aspect-square rounded-[4px]" :style="{ background: `linear-gradient(145deg, ${p.colors[1]}, ${p.colors[0]})` }" />
        </span>
      </PhoneAppIcon>
      <PhoneAppIcon :label="t('phone.about')" @open="open({ kind: 'about' })">
        <span class="grid size-full place-items-center bg-gradient-to-b from-[#ffd43b] to-[#f59f00] text-2xl font-bold text-white">i</span>
      </PhoneAppIcon>
      <PhoneAppIcon :label="t('apps.settings')" @open="open({ kind: 'settings' })"><AppIcon name="settings" :size="60" /></PhoneAppIcon>
      <PhoneAppIcon v-for="l in links" :key="l.name" :label="l.label" :href="l.href"><AppIcon :name="l.name" :size="60" /></PhoneAppIcon>
    </section>

    <footer class="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+12px)] flex h-[86px] items-center justify-around rounded-[30px] bg-white/28 backdrop-blur-2xl">
      <button :aria-label="t('apps.safari')" class="active:scale-95" @click="open({ kind: 'safari', id: '' })"><AppIcon name="safari" :size="60" /></button>
      <button :aria-label="t('apps.docker')" class="relative active:scale-95" @click="open({ kind: 'docker' })">
        <AppIcon name="docker" :size="60" />
        <i v-if="running" class="absolute -top-1 -right-1 size-3.5 rounded-full border-2 border-white bg-ok" />
      </button>
      <a v-for="l in dockLinks" :key="l.name" :href="l.href" target="_blank" rel="noopener" :aria-label="l.label" class="active:scale-95"><AppIcon :name="l.name" :size="60" /></a>
    </footer>
  </div>
</template>
