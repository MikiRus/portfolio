import type { FolderId } from '~/data/types'

export type PhoneScreen =
  | { kind: 'project'; id: string }
  | { kind: 'safari'; id: string }
  | { kind: 'docker' }
  | { kind: 'settings' }
  | { kind: 'about' }

// Навигация мобильной версии: открытая папка поверх домашнего экрана
// и стек экранов-приложений. Системная кнопка «назад» закрывает верхний.
export function usePhone() {
  const folder = useState<FolderId | null>('phone-folder', () => null)
  const stack = useState<PhoneScreen[]>('phone-stack', () => [])
  const top = computed(() => stack.value.at(-1) ?? null)

  function open(screen: PhoneScreen) {
    stack.value.push(screen)
    history.pushState({ phone: stack.value.length }, '')
  }

  // Закрываем через history.back(), чтобы кнопка «назад» и жест работали одинаково.
  function back() {
    if (stack.value.length) history.back()
  }

  function home() {
    const n = stack.value.length
    folder.value = null
    if (n) history.go(-n)
  }

  return { folder, stack, top, open, back, home }
}

// Подписка на popstate: вызывается один раз в корне мобильной версии.
export function usePhoneHistory() {
  const { stack } = usePhone()
  // В каждой записи истории лежит глубина стека: так один переход на
  // несколько шагов назад («Домой») закрывает сразу все экраны.
  const onPop = (e: PopStateEvent) => {
    const depth = (e.state as { phone?: number } | null)?.phone ?? 0
    if (stack.value.length > depth) stack.value.splice(depth)
  }
  onMounted(() => window.addEventListener('popstate', onPop))
  onBeforeUnmount(() => window.removeEventListener('popstate', onPop))
}
