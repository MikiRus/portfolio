<script setup lang="ts">
import { profile } from '~/data/profile'

const { t } = useI18n()
const tr = useTr()
const contacts = [
  { label: 'GitHub', href: profile.github, text: profile.github.replace('https://', '') },
  { label: 'Telegram', href: profile.telegram, text: profile.telegram.replace('https://t.me/', '@') },
  { label: 'Email', href: profile.email && `mailto:${profile.email}`, text: profile.email },
].filter((c) => c.href)
</script>

<template>
  <PhoneScreen :title="t('phone.about')">
    <div class="space-y-6 px-5 py-6">
      <div class="flex flex-col items-center gap-2 text-center">
        <span class="grid size-24 place-items-center rounded-full bg-gradient-to-br from-[#e9ecef] to-[#adb5bd] text-3xl font-bold text-[#343a40]">{{ tr(profile.initials) }}</span>
        <h2 class="text-2xl font-bold">{{ tr(profile.name) }}</h2>
        <p class="text-[15px] text-muted">{{ tr(profile.role) }}</p>
      </div>
      <p class="text-[15px] leading-relaxed text-[#3a3a3c]">{{ t('note.body') }}</p>
      <ul class="divide-y divide-line rounded-2xl bg-[#f2f2f7]">
        <li v-for="c in contacts" :key="c.label">
          <a :href="c.href" target="_blank" rel="noopener" class="flex items-center justify-between px-4 py-3 text-[15px]">
            <span>{{ c.label }}</span><span class="truncate pl-4 text-accent">{{ c.text }}</span>
          </a>
        </li>
      </ul>
    </div>
  </PhoneScreen>
</template>
