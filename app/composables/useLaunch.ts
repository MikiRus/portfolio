import type { Project } from '~/data/types'

export function useSafari() {
  const tabs = useState<string[]>('safari-tabs', () => [])
  const current = useState<string | null>('safari-current', () => null)

  function show(projectId: string) {
    if (!tabs.value.includes(projectId)) tabs.value.push(projectId)
    current.value = projectId
  }

  function closeTab(projectId: string) {
    const i = tabs.value.indexOf(projectId)
    if (i === -1) return
    tabs.value.splice(i, 1)
    if (current.value === projectId) current.value = tabs.value[Math.min(i, tabs.value.length - 1)] ?? null
  }

  return { tabs, current, show, closeTab }
}

// Единый сценарий для любого проекта: сначала Docker поднимает контейнеры,
// потом проект открывается в Safari.
export function useLaunch() {
  const windows = useWindows()
  const { start } = useStacks()
  const safari = useSafari()

  async function launch(project: Project) {
    windows.open('docker')
    await start(project)
    safari.show(project.id)
    windows.open('safari')
  }

  return { launch }
}
