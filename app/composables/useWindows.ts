export type AppId = 'finder' | 'safari' | 'docker' | 'settings'

export interface Win {
  app: AppId
  x: number
  y: number
  w: number
  h: number
  z: number
  minimized: boolean
  maximized: boolean
}

// Высота строки меню и место под Dock — окна в них не заезжают.
export const MENU_H = 30
export const DOCK_H = 88

const defaults: Record<AppId, { w: number; h: number; dx: number; dy: number }> = {
  finder: { w: 780, h: 480, dx: -120, dy: -60 },
  docker: { w: 880, h: 580, dx: -200, dy: -20 },
  safari: { w: 1040, h: 700, dx: 60, dy: 10 },
  settings: { w: 620, h: 460, dx: 40, dy: -40 },
}

export const isCompact = () => import.meta.client && window.innerWidth < 768

// Оконный менеджер: одно окно на приложение, порядок — через z.
export function useWindows() {
  const wins = useState<Partial<Record<AppId, Win>>>('windows', () => ({}))
  const top = useState('windows-top', () => 10)

  const list = computed(() => Object.values(wins.value) as Win[])
  const active = computed<AppId | null>(() => {
    const visible = list.value.filter((w) => !w.minimized)
    return visible.length ? visible.reduce((a, b) => (a.z > b.z ? a : b)).app : null
  })

  function place(app: AppId): Win {
    const d = defaults[app]
    const vw = window.innerWidth
    const vh = window.innerHeight
    const w = Math.min(d.w, vw - 32)
    const h = Math.min(d.h, vh - MENU_H - DOCK_H - 16)
    const x = clamp(Math.round((vw - w) / 2 + d.dx), 16, vw - w - 16)
    const y = clamp(Math.round((vh - h) / 2 + d.dy), MENU_H + 12, Math.max(MENU_H + 12, vh - DOCK_H - h))
    return { app, x, y, w, h, z: ++top.value, minimized: false, maximized: isCompact() }
  }

  function open(app: AppId) {
    const w = wins.value[app]
    if (w) {
      w.minimized = false
      focus(app)
    } else {
      wins.value[app] = place(app)
    }
  }

  function focus(app: AppId) {
    const w = wins.value[app]
    if (w && w.z !== top.value) w.z = ++top.value
  }

  function close(app: AppId) {
    delete wins.value[app]
  }

  function minimize(app: AppId) {
    const w = wins.value[app]
    if (w) w.minimized = true
  }

  function toggleMaximize(app: AppId) {
    const w = wins.value[app]
    if (w) w.maximized = !w.maximized
  }

  // Клик по иконке в Dock: открыть, развернуть из Dock или свернуть активное.
  function dockClick(app: AppId) {
    const w = wins.value[app]
    if (w && !w.minimized && active.value === app) minimize(app)
    else open(app)
  }

  return { wins, list, active, open, focus, close, minimize, toggleMaximize, dockClick }
}

export function clamp(v: number, lo: number, hi: number) {
  return Math.min(Math.max(v, lo), Math.max(lo, hi))
}
