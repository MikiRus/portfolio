<script setup lang="ts">
import { projectById } from '~/data/projects'
import type { ContainerStatus, StackStatus } from '~/composables/useStacks'

const { t } = useI18n()
const { stacks, selected, start, stop } = useStacks()
const { launch } = useLaunch()
const { show } = useSafari()
const { open } = useWindows()

const list = computed(() => Object.values(stacks.value))
const stack = computed(() => (selected.value ? stacks.value[selected.value] : undefined))
const project = computed(() => (selected.value ? projectById(selected.value) : undefined))
const done = computed(() => stack.value?.containers.filter((c) => c.status === 'running').length ?? 0)

const dot: Record<ContainerStatus | StackStatus, string> = {
  waiting: 'bg-[#dee2e6]',
  pulling: 'bg-[#adb5bd]',
  starting: 'bg-wait animate-pulse',
  running: 'bg-ok',
  stopped: 'bg-[#adb5bd]',
}
const pill: Record<StackStatus, string> = {
  starting: 'bg-[#fff4db] text-[#8a5300]',
  running: 'bg-[#e3f5e6] text-[#22702f]',
  stopped: 'bg-[#f1f3f5] text-muted',
}
// У каждого сервиса свой цвет в логах, как в docker compose.
const palette = ['#79c0ff', '#ff7b72', '#d2a8ff', '#7ee787', '#f2cc60', '#ffa657']
const svcColor = (svc: string) => palette[(project.value?.containers.findIndex((c) => c.name === svc) ?? 0) % palette.length]

const logBox = useTemplateRef<HTMLElement>('logBox')
watch(
  () => stack.value?.logs.length,
  () => nextTick(() => logBox.value?.scrollTo({ top: logBox.value.scrollHeight })),
)

function openSafari() {
  if (!selected.value) return
  show(selected.value, stack.value?.sandbox ? 'demo' : 'about')
  open('safari')
}

// Обратный отсчёт до остановки песочницы без активности.
const now = ref(Date.now())
let tick: ReturnType<typeof setInterval> | undefined
onMounted(() => (tick = setInterval(() => (now.value = Date.now()), 1000)))
onBeforeUnmount(() => clearInterval(tick))
const left = computed(() => {
  const exp = stack.value?.sandbox?.expiresAt
  if (!exp) return ''
  const s = Math.max(0, Math.round((new Date(exp).getTime() - now.value) / 1000))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
})
</script>

<template>
  <nav class="flex w-48 shrink-0 flex-col gap-1 bg-[#f2f4f8] px-2.5 py-3.5 text-[13px] max-sm:hidden" data-drag>
    <div class="px-1.5 pb-4"><TrafficLights app="docker" /></div>
    <span class="px-2 pb-1 text-[11px] font-semibold text-muted">{{ t('docker.stacks') }}</span>
    <button
      v-for="s in list"
      :key="s.projectId"
      class="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-left"
      :class="selected === s.projectId ? 'bg-accent-soft font-semibold text-[#0b4fb3]' : 'hover:bg-black/[0.04]'"
      @click="selected = s.projectId"
    >
      <i class="size-2 shrink-0 rounded-full" :class="dot[s.status]" />
      <span class="truncate">{{ projectById(s.projectId)?.name }}</span>
    </button>
    <span class="flex-1" />
    <div class="rounded-lg bg-white p-2.5 text-[11px] leading-snug text-[#3a3a3c] ring-1 ring-[#e1e5ec] ring-inset">
      <strong class="block text-xs text-ink">{{ t('docker.sandbox') }}</strong>
      {{ t('docker.live') }}
      <span v-if="left && stack?.status === 'running'" class="mt-1.5 block font-medium text-ink tabular-nums">{{ t('docker.expires', { time: left }) }}</span>
    </div>
  </nav>

  <div class="flex min-w-0 flex-1 flex-col">
    <div class="flex shrink-0 flex-wrap items-center gap-3 border-b border-line px-5 py-4" data-drag>
      <div class="sm:hidden"><TrafficLights app="docker" /></div>
      <template v-if="stack && project">
        <div class="flex min-w-0 flex-col">
          <strong class="truncate text-lg">{{ project.name }}</strong>
          <span class="text-xs text-muted">{{ t('docker.compose', project.containers.length) }}</span>
        </div>
        <span class="flex-1" />
        <span class="flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold" :class="pill[stack.status]">
          <i class="size-2 rounded-full" :class="dot[stack.status]" />
          {{ stack.status === 'starting' ? t('docker.summary.starting', { done, total: stack.containers.length }) : t(`docker.summary.${stack.status}`) }}
        </span>
        <button v-if="stack.status === 'running'" class="rounded-lg bg-accent px-3.5 py-2 text-[13px] font-semibold text-white hover:bg-[#084aad]" @click="openSafari">
          {{ t('docker.open') }}
        </button>
        <button v-if="stack.status !== 'stopped'" class="rounded-lg bg-[#fde8e8] px-3.5 py-2 text-[13px] font-semibold text-stop hover:bg-[#fbd5d5]" @click="stop(stack.projectId)">
          {{ t('docker.stop') }}
        </button>
        <button v-else class="rounded-lg bg-[#e3f5e6] px-3.5 py-2 text-[13px] font-semibold text-[#22702f] hover:bg-[#d3eed8]" @click="launch(project)">
          {{ t('docker.start') }}
        </button>
      </template>
      <strong v-else class="text-lg">{{ t('docker.containers') }}</strong>
    </div>

    <template v-if="stack && project">
      <p v-if="stack.notice" class="mx-5 mt-3 rounded-lg bg-[#fff4db] px-3.5 py-2.5 text-[13px] text-[#8a5300]" role="status">
        {{ t(stack.notice.key, { minutes: stack.notice.minutes }) }}
      </p>
      <div class="overflow-x-auto px-5 py-2 text-[13px]">
        <table class="w-full min-w-[520px]">
          <thead>
            <tr class="text-left text-[11px] font-semibold tracking-wide text-muted uppercase">
              <th class="w-6 py-2" /><th class="py-2">{{ t('docker.name') }}</th><th class="py-2">{{ t('docker.image') }}</th>
              <th class="py-2">{{ t('docker.port') }}</th><th class="py-2">{{ t('docker.state') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="c in stack.containers" :key="c.name" class="border-t border-[#f0f0f3]">
              <td class="py-2.5"><i class="block size-2.5 rounded-full" :class="dot[c.status]" /></td>
              <td class="py-2.5 font-semibold">{{ c.name }}</td>
              <td class="py-2.5 font-mono text-xs text-[#3a3a3c]">{{ c.image }}</td>
              <td class="py-2.5 font-mono text-xs text-accent">{{ c.port ?? '—' }}</td>
              <td class="py-2.5 text-xs text-muted">{{ t(`docker.status.${c.status}`) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="mx-5 mt-1.5 mb-5 flex min-h-0 flex-1 flex-col rounded-[10px] bg-[#14161c] px-4 py-3.5">
        <span class="pb-1.5 text-[11px] font-semibold tracking-wide text-[#8b949e] uppercase">{{ t('docker.logs') }}</span>
        <div ref="logBox" class="min-h-0 flex-1 overflow-y-auto font-mono text-xs leading-relaxed text-[#c9d1d9] select-text" aria-live="polite">
          <p v-for="l in stack.logs" :key="l.id" class="whitespace-pre-wrap">
            <b :style="{ color: svcColor(l.svc) }">{{ l.svc.padEnd(10) }}</b>| {{ l.text }}
          </p>
        </div>
      </div>
    </template>
    <p v-else class="m-auto max-w-xs p-6 text-center text-sm text-muted">{{ t('docker.empty') }}</p>
  </div>
</template>
