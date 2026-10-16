<script setup lang="ts">
import { projectById } from '~/data/projects'

const props = defineProps<{ id: string }>()
const { t } = useI18n()
const tr = useTr()
const { open, back } = usePhone()
const { stacks, start } = useStacks()

const project = computed(() => projectById(props.id)!)
const stack = computed(() => stacks.value[props.id])
const starting = computed(() => stack.value?.status === 'starting')
const ready = computed(() => stack.value?.status === 'running')
const doneCount = computed(() => stack.value?.containers.filter((c) => c.status === 'running').length ?? 0)

// Живое демо после запуска сразу открывается во весь экран.
async function launch() {
  if (ready.value && stack.value?.sandbox) return open({ kind: 'safari', id: props.id })
  const result = await start(project.value)
  if (result === 'live') open({ kind: 'safari', id: props.id })
}
const button = computed(() => {
  if (starting.value) return t('phone.starting')
  if (ready.value && stack.value?.sandbox) return t('phone.open')
  if (ready.value) return t('docker.summary.running')
  return t('phone.launch')
})
</script>

<template>
  <div class="min-h-full bg-white pb-12 text-ink">
    <div class="px-5 pt-5">
      <div class="flex gap-4">
        <ProjectIcon :project="project" :size="104" />
        <div class="flex min-w-0 flex-1 flex-col">
          <h1 class="truncate text-[22px] font-bold">{{ project.name }}</h1>
          <p class="text-[13px] leading-snug text-muted">{{ t(`folders.${project.folder}`) }} · {{ t(`kind.${project.kind}`) }}</p>
          <span class="flex-1" />
          <div class="mt-2 flex items-center gap-2">
            <button
              v-if="project.sandbox"
              class="min-w-[104px] rounded-full px-4 py-1.5 text-[13px] font-bold uppercase disabled:opacity-80"
              :class="ready && !stack?.sandbox ? 'bg-[#f2f2f7] text-ink' : 'bg-accent text-white'"
              :disabled="starting || (ready && !stack?.sandbox)"
              @click="launch"
            >{{ button }}</button>
            <a v-if="project.repo" :href="`https://github.com/${project.repo}`" target="_blank" rel="noopener" class="grid size-8 place-items-center rounded-full bg-[#f2f2f7]" :aria-label="t('case.github')">
              <AppIcon name="github" :size="20" />
            </a>
          </div>
        </div>
      </div>

      <div v-if="project.sandbox && stack" class="mt-5 rounded-2xl bg-[#f5f5f7] p-3.5 text-[13px]" role="status">
        <div class="flex items-center justify-between">
          <strong>{{ t('docker.sandbox') }}</strong>
          <span class="font-semibold" :class="ready ? 'text-ok' : stack.status === 'stopped' ? 'text-muted' : 'text-[#8a5300]'">
            {{ stack.status === 'starting' ? t('docker.summary.starting', { done: doneCount, total: stack.containers.length }) : t(`docker.summary.${stack.status}`) }}
          </span>
        </div>
        <div class="mt-2 h-1.5 overflow-hidden rounded-full bg-[#e5e5ea]">
          <div class="h-full rounded-full bg-accent transition-[width] duration-300" :style="{ width: `${(doneCount / stack.containers.length) * 100}%` }" />
        </div>
        <p class="mt-2 text-xs text-muted">
          <span v-for="(c, i) in stack.containers" :key="c.name">{{ i ? ' · ' : '' }}{{ c.name }} {{ c.status === 'running' ? '✓' : c.status === 'stopped' ? '—' : '…' }}</span>
        </p>
        <p v-if="stack.notice" class="mt-2 text-xs text-[#8a5300]">{{ t(stack.notice.key, { minutes: stack.notice.minutes }) }}</p>
        <button class="mt-2 text-xs font-semibold text-accent" @click="open({ kind: 'docker' })">{{ t('phone.logs') }}</button>
      </div>

      <p class="mt-5 text-[17px] leading-snug font-semibold">{{ tr(project.tagline) }}</p>
      <p class="mt-1 text-[13px] text-muted">{{ tr(project.period) }} · {{ tr(project.role) }}</p>
    </div>

    <div class="mt-5 flex snap-x gap-3 overflow-x-auto px-5 pb-1">
      <div v-for="s in project.stats" :key="s.value + s.label.en" class="w-32 shrink-0 snap-start rounded-2xl bg-[#f5f5f7] px-3.5 py-3">
        <p class="text-xl font-bold tabular-nums" :style="{ color: project.colors[0] }">{{ s.value }}</p>
        <p class="mt-0.5 text-xs text-muted">{{ tr(s.label) }}</p>
      </div>
    </div>

    <div class="space-y-7 px-5 pt-7">
      <section>
        <h2 class="text-lg font-bold">{{ t('case.task') }}</h2>
        <p class="mt-2 text-[15px] leading-relaxed text-[#3a3a3c]">{{ tr(project.task) }}</p>
      </section>
      <section>
        <h2 class="text-lg font-bold">{{ t('case.done') }}</h2>
        <ul class="mt-2 divide-y divide-line">
          <li v-for="(d, i) in project.done" :key="i" class="flex gap-2.5 py-2.5 text-[15px] leading-relaxed">
            <svg class="mt-1.5 size-3.5 shrink-0" viewBox="0 0 16 16" aria-hidden="true" :style="{ color: project.colors[0] }"><path d="m3 8.5 3 3 7-7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" /></svg>
            {{ tr(d) }}
          </li>
        </ul>
      </section>
      <section>
        <h2 class="text-lg font-bold">{{ t('case.architecture') }}</h2>
        <ol class="mt-2 space-y-2.5 text-[15px] leading-relaxed text-[#3a3a3c]">
          <li v-for="(a, i) in project.architecture" :key="i"><span class="mr-1.5 font-mono text-xs font-semibold" :style="{ color: project.colors[0] }">{{ String(i + 1).padStart(2, '0') }}</span>{{ tr(a) }}</li>
        </ol>
      </section>
      <section>
        <h2 class="text-lg font-bold">{{ t('case.stack') }}</h2>
        <ul class="mt-2 flex flex-wrap gap-1.5">
          <li v-for="s in project.stack" :key="s" class="rounded-full bg-[#f2f2f7] px-2.5 py-1 text-xs font-semibold">{{ s }}</li>
        </ul>
      </section>
      <p v-if="!project.repo" class="rounded-2xl bg-[#f5f5f7] px-4 py-3 text-[13px] text-[#3a3a3c]">{{ t('case.private') }}</p>
      <button class="w-full rounded-xl bg-[#f2f2f7] py-3 text-[15px] font-semibold text-accent" @click="back">{{ t('phone.back') }}</button>
    </div>
  </div>
</template>
