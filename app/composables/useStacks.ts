import type { Project } from '~/data/types'

export type ContainerStatus = 'waiting' | 'pulling' | 'starting' | 'running' | 'stopped'
export type StackStatus = 'starting' | 'running' | 'stopped'

export interface ContainerState {
  name: string
  image: string
  port?: string
  status: ContainerStatus
}

export interface LogLine {
  id: number
  svc: string
  text: string
}

export interface Stack {
  projectId: string
  status: StackStatus
  containers: ContainerState[]
  logs: LogLine[]
  // Настоящая песочница: id, путь демо для Safari и когда она остановится.
  sandbox?: { id: string; url: string; expiresAt: string }
  // Почему стек не запустился (нет мест и т.п.) — показываем в окне Docker.
  notice?: { key: string; minutes?: number }
}

// Результат запуска: live — открываем демо, case — только страницу кейса.
export type LaunchResult = 'live' | 'case'

// Таймеры, EventSource и пинги живут вне реактивного состояния: их нельзя
// сериализовать, а остановка стека должна отменять всё незавершённое.
const timers = new Map<string, ReturnType<typeof setTimeout>[]>()
const streams = new Map<string, { es: EventSource; ping: ReturnType<typeof setInterval> }>()
let logSeq = 0

const PING_EVERY = 60_000

export function useStacks() {
  const stacks = useState<Record<string, Stack>>('stacks', () => ({}))
  const selected = useState<string | null>('stacks-selected', () => null)

  function log(stack: Stack, svc: string, text: string) {
    stack.logs.push({ id: ++logSeq, svc, text })
    if (stack.logs.length > 300) stack.logs.splice(0, stack.logs.length - 300)
  }

  function fresh(project: Project, status: ContainerStatus): Stack {
    stacks.value[project.id] = {
      projectId: project.id,
      status: 'starting',
      containers: project.containers.map((c) => ({ name: c.name, image: c.image, port: c.port, status })),
      logs: [],
    }
    return stacks.value[project.id]!
  }

  async function start(project: Project): Promise<LaunchResult> {
    selected.value = project.id
    const existing = stacks.value[project.id]
    if (existing?.status === 'running') return existing.sandbox ? 'live' : 'case'
    cancel(project.id)
    if (project.sandbox) {
      const result = await startSandbox(project)
      if (result) return result
    }
    await simulate(project)
    return 'case'
  }

  // Настоящий запуск через сервис песочниц. null — сервиса нет (локальная
  // разработка, статический хостинг), тогда показываем имитацию.
  async function startSandbox(project: Project): Promise<LaunchResult | null> {
    const stack = fresh(project, 'waiting')
    let created: { id: string; url: string; expiresAt: string }
    try {
      created = await $fetch(`/api/sandbox/${project.sandbox}`, { method: 'POST' })
    } catch (e) {
      const res = (e as { response?: Response; data?: { reason?: string; retryAfter?: number } })
      if (res.response?.status === 503) {
        stack.status = 'stopped'
        stack.containers.forEach((c) => (c.status = 'stopped'))
        stack.notice = res.data?.reason === 'ip'
          ? { key: 'docker.busyIp' }
          : { key: 'docker.busy', minutes: Math.max(1, Math.ceil((res.data?.retryAfter ?? 60) / 60)) }
        return 'case'
      }
      return null
    }
    stack.sandbox = created

    return new Promise((resolve) => {
      const es = new EventSource(`/api/sandbox/${created.id}/events`)
      const ping = setInterval(() => keepAlive(project.id), PING_EVERY)
      streams.set(project.id, { es, ping })
      // При переподключении сервер заново пришлёт историю — начинаем лог с чистого листа.
      es.onopen = () => (stack.logs = [])
      es.onmessage = (msg) => {
        const e = JSON.parse(msg.data) as { type: string; service?: string; status?: string; text?: string }
        const c = stack.containers.find((x) => x.name === e.service)
        switch (e.type) {
          case 'state':
            if (c) c.status = e.status === 'pending' ? 'waiting' : (e.status as ContainerStatus)
            break
          case 'log':
            log(stack, e.service ?? '', e.text ?? '')
            break
          case 'ready':
            stack.status = 'running'
            resolve('live')
            break
          case 'error':
            stack.notice = { key: 'docker.failed' }
            resolve('case')
            break
          case 'stopped':
            finish(project.id)
            resolve('case')
            break
        }
      }
    })
  }

  async function keepAlive(projectId: string) {
    const stack = stacks.value[projectId]
    if (!stack?.sandbox || document.hidden) return
    try {
      const res = await $fetch<{ expiresAt: string }>(`/api/sandbox/${stack.sandbox.id}/ping`, { method: 'POST' })
      stack.sandbox.expiresAt = res.expiresAt
    } catch {
      finish(projectId)
    }
  }

  // Имитация docker compose up для проектов без живого демо.
  function simulate(project: Project): Promise<void> {
    const id = project.id
    const stack = fresh(project, 'pulling')
    const speed = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.3 : 1
    const later = (ms: number, fn: () => void) => timers.set(id, [...(timers.get(id) ?? []), setTimeout(fn, ms * speed)])

    return new Promise((resolve) => {
      let t = 150
      project.containers.forEach((spec, i) => {
        later(t, () => {
          stack.containers[i]!.status = 'starting'
          log(stack, spec.name, `Container ${project.id}-${spec.name}-1  Started`)
        })
        t += 180
        for (const line of spec.logs) {
          later(t, () => log(stack, spec.name, line))
          t += 110 + Math.random() * 90
        }
        later(t, () => (stack.containers[i]!.status = 'running'))
        t += 120
      })
      later(t + 250, () => {
        stack.status = 'running'
        resolve()
      })
    })
  }

  function stop(projectId: string) {
    const stack = stacks.value[projectId]
    if (!stack) return
    if (stack.sandbox && streams.has(projectId)) {
      // Контейнеры удаляет сервер; событие stopped придёт в поток и закроет его.
      $fetch(`/api/sandbox/${stack.sandbox.id}`, { method: 'DELETE' }).catch(() => finish(projectId))
      return
    }
    cancel(projectId)
    stack.status = 'stopped'
    for (const c of [...stack.containers].reverse()) {
      if (c.status !== 'pulling') log(stack, c.name, 'exited with code 0')
      c.status = 'stopped'
    }
  }

  // Стек остановлен на сервере (по кнопке, по простою или с ошибкой).
  function finish(projectId: string) {
    cancel(projectId)
    const stack = stacks.value[projectId]
    if (!stack) return
    stack.status = 'stopped'
    stack.sandbox = undefined
    stack.containers.forEach((c) => (c.status = 'stopped'))
  }

  function cancel(projectId: string) {
    for (const t of timers.get(projectId) ?? []) clearTimeout(t)
    timers.delete(projectId)
    const s = streams.get(projectId)
    if (s) {
      s.es.close()
      clearInterval(s.ping)
      streams.delete(projectId)
    }
  }

  return { stacks, selected, start, stop }
}
