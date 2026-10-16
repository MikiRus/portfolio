<script setup lang="ts">
import type { Project } from '~/data/types'

const props = defineProps<{ project: Project }>()
const { t } = useI18n()
const tr = useTr()
const accent = computed(() => props.project.colors[0])
</script>

<template>
  <article class="text-ink">
    <header class="px-6 pt-10 pb-8 text-white @2xl:px-12 @2xl:pt-14" :style="{ background: `linear-gradient(140deg, ${project.colors[0]}, ${project.colors[1]})` }">
      <div class="mx-auto max-w-4xl">
        <div class="flex items-center gap-4">
          <span class="grid size-14 shrink-0 place-items-center rounded-2xl bg-white/20 text-xl font-bold ring-1 ring-white/30">{{ project.short }}</span>
          <div class="min-w-0">
            <h1 class="truncate text-3xl font-bold tracking-tight @2xl:text-4xl">{{ project.name }}</h1>
            <p class="text-sm text-white/85">{{ tr(project.period) }} · {{ tr(project.role) }}</p>
          </div>
        </div>
        <p class="mt-6 max-w-2xl text-lg leading-snug font-medium @2xl:text-xl">{{ tr(project.tagline) }}</p>
        <ul class="mt-5 flex flex-wrap gap-1.5" :aria-label="t('case.stack')">
          <li v-for="s in project.stack" :key="s" class="rounded-full bg-white/18 px-2.5 py-1 text-xs font-semibold ring-1 ring-white/25">{{ s }}</li>
        </ul>
      </div>
    </header>

    <div class="mx-auto max-w-4xl px-6 py-8 @2xl:px-12">
      <dl class="grid grid-cols-2 gap-3 @xl:grid-cols-4">
        <div v-for="s in project.stats" :key="s.value + s.label.en" class="rounded-2xl bg-[#f5f5f7] px-4 py-3.5">
          <dt class="sr-only">{{ tr(s.label) }}</dt>
          <dd class="text-2xl font-bold tabular-nums" :style="{ color: accent }">{{ s.value }}</dd>
          <dd class="mt-0.5 text-xs text-muted">{{ tr(s.label) }}</dd>
        </div>
      </dl>

      <section class="mt-10">
        <h2 class="text-xl font-bold">{{ t('case.task') }}</h2>
        <p class="mt-3 max-w-3xl leading-relaxed text-[#3a3a3c]">{{ tr(project.task) }}</p>
      </section>

      <section class="mt-10">
        <h2 class="text-xl font-bold">{{ t('case.done') }}</h2>
        <ul class="mt-4 grid gap-3 @2xl:grid-cols-2">
          <li v-for="(d, i) in project.done" :key="i" class="flex gap-3 rounded-2xl border border-line p-4 text-[15px] leading-relaxed">
            <svg class="mt-1 size-4 shrink-0" viewBox="0 0 16 16" aria-hidden="true" :style="{ color: accent }">
              <path d="m3 8.5 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            {{ tr(d) }}
          </li>
        </ul>
      </section>

      <section class="mt-10 grid gap-8 @2xl:grid-cols-[1fr_16rem]">
        <div>
          <h2 class="text-xl font-bold">{{ t('case.architecture') }}</h2>
          <ul class="mt-4 space-y-3">
            <li v-for="(a, i) in project.architecture" :key="i" class="leading-relaxed text-[#3a3a3c]">
              <span class="mr-2 font-mono text-xs font-semibold" :style="{ color: accent }">{{ String(i + 1).padStart(2, '0') }}</span>{{ tr(a) }}
            </li>
          </ul>
        </div>
        <div>
          <h2 class="text-sm font-semibold text-muted">{{ t('case.services') }}</h2>
          <ul class="mt-3 divide-y divide-line rounded-2xl border border-line">
            <li v-for="c in project.containers" :key="c.name" class="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
              <span class="font-medium">{{ c.name }}</span>
              <span class="truncate font-mono text-xs text-muted">{{ c.image }}</span>
            </li>
          </ul>
        </div>
      </section>

      <p v-if="!project.repo" class="mt-10 rounded-2xl bg-[#f5f5f7] px-5 py-4 text-sm text-[#3a3a3c]">{{ t('case.private') }}</p>
      <a
        v-else
        :href="`https://github.com/${project.repo}`"
        target="_blank"
        rel="noopener"
        class="mt-10 inline-flex rounded-xl bg-ink px-4 py-2.5 text-sm font-semibold text-white hover:bg-black"
      >{{ t('case.github') }}</a>
    </div>
  </article>
</template>
