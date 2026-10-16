import type { Project } from '~/data/types'

export type ContainerStatus = 'pulling' | 'starting' | 'running' | 'stopped'
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
}

// Таймеры живут вне реактивного состояния: их нельзя сериализовать,
// а остановка стека должна отменять всё, что ещё не «случилось».
const timers = new Map<string, ReturnType<typeof setTimeout>[]>()
let logSeq = 0

// Имитация docker compose up: контейнеры поднимаются по очереди,
// каждый печатает свои строки лога. Настоящий запуск придёт на этапе 2.
export function useStacks() {
  const stacks = useState<Record<string, Stack>>('stacks', () => ({}))
  const selected = useState<string | null>('stacks-selected', () => null)

  function later(id: string, ms: number, fn: () => void) {
    const t = setTimeout(fn, ms)
    timers.set(id, [...(timers.get(id) ?? []), t])
  }

  function log(stack: Stack, svc: string, text: string) {
    stack.logs.push({ id: ++logSeq, svc, text })
    if (stack.logs.length > 200) stack.logs.splice(0, stack.logs.length - 200)
  }

  function start(project: Project): Promise<void> {
    const id = project.id
    selected.value = id
    const existing = stacks.value[id]
    if (existing?.status === 'running') return Promise.resolve()
    cancel(id)

    stacks.value[id] = {
      projectId: id,
      status: 'starting',
      containers: project.containers.map((c) => ({ name: c.name, image: c.image, port: c.port, status: 'pulling' })),
      logs: existing?.logs ?? [],
    }
    const stack = stacks.value[id]!
    const speed = matchMedia('(prefers-reduced-motion: reduce)').matches ? 0.3 : 1

    return new Promise((resolve) => {
      let t = 150
      project.containers.forEach((spec, i) => {
        later(id, t * speed, () => {
          stack.containers[i]!.status = 'starting'
          log(stack, spec.name, `Container ${project.id}-${spec.name}-1  Started`)
        })
        t += 180
        for (const line of spec.logs) {
          later(id, t * speed, () => log(stack, spec.name, line))
          t += 110 + Math.random() * 90
        }
        later(id, t * speed, () => {
          stack.containers[i]!.status = 'running'
        })
        t += 120
      })
      later(id, (t + 250) * speed, () => {
        stack.status = 'running'
        resolve()
      })
    })
  }

  function stop(id: string) {
    cancel(id)
    const stack = stacks.value[id]
    if (!stack) return
    stack.status = 'stopped'
    for (const c of [...stack.containers].reverse()) {
      if (c.status !== 'pulling') log(stack, c.name, `exited with code 0`)
      c.status = 'stopped'
    }
  }

  function cancel(id: string) {
    for (const t of timers.get(id) ?? []) clearTimeout(t)
    timers.delete(id)
  }

  return { stacks, selected, start, stop }
}
