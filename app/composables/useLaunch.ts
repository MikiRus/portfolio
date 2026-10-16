import type { Project } from '~/data/types'

export function useSafari() {
  const tabs = useState<string[]>('safari-tabs', () => [])
  const current = useState<string | null>('safari-current', () => null)
  // Что открыто во вкладке проекта с живым демо: само демо или страница кейса.
  const view = useState<Record<string, 'demo' | 'about'>>('safari-view', () => ({}))

  function show(projectId: string, mode: 'demo' | 'about' = 'about') {
    if (!tabs.value.includes(projectId)) tabs.value.push(projectId)
    current.value = projectId
    view.value[projectId] = mode
  }

  function closeTab(projectId: string) {
    const i = tabs.value.indexOf(projectId)
    if (i === -1) return
    tabs.value.splice(i, 1)
    if (current.value === projectId) current.value = tabs.value[Math.min(i, tabs.value.length - 1)] ?? null
  }

  return { tabs, current, view, show, closeTab }
}

// Единый сценарий для любого проекта: сначала Docker поднимает контейнеры,
// потом проект открывается в Safari.
export function useLaunch() {
  const windows = useWindows()
  const { start } = useStacks()
  const safari = useSafari()

  async function launch(project: Project) {
    windows.open('docker')
    const result = await start(project)
    safari.show(project.id, result === 'live' ? 'demo' : 'about')
    windows.open('safari')
  }

  return { launch }
}
