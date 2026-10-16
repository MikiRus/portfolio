// Часы обновляются раз в минуту, в начале минуты.
export function useClock() {
  const now = ref(new Date())
  let timer: ReturnType<typeof setTimeout> | undefined
  function tick() {
    now.value = new Date()
    timer = setTimeout(tick, 60_000 - (Date.now() % 60_000))
  }
  onMounted(tick)
  onBeforeUnmount(() => clearTimeout(timer))
  return now
}
