<script setup lang="ts">
import { DOCK_H, MENU_H, clamp, type AppId } from '~/composables/useWindows'

const props = defineProps<{ app: AppId; label: string }>()
const { wins, focus, active } = useWindows()
const win = computed(() => wins.value[props.app]!)

const MIN_W = 420
const MIN_H = 300

const style = computed(() => {
  const w = win.value
  if (w.maximized) {
    return { left: '0px', top: `${MENU_H}px`, width: '100vw', height: `calc(100dvh - ${MENU_H + DOCK_H}px)`, zIndex: w.z }
  }
  return { left: `${w.x}px`, top: `${w.y}px`, width: `${w.w}px`, height: `${w.h}px`, zIndex: w.z }
})

// Перетаскивание: тянуть можно за любой элемент с data-drag (тулбар, сайдбар),
// кроме кнопок и полей ввода внутри него.
function startDrag(e: PointerEvent) {
  const target = e.target as HTMLElement
  if (e.button !== 0 || win.value.maximized) return
  if (!target.closest('[data-drag]') || target.closest('button, a, input, select, textarea, [data-no-drag]')) return
  const w = win.value
  const ox = e.clientX - w.x
  const oy = e.clientY - w.y
  track(e, (ev) => {
    w.x = clamp(ev.clientX - ox, 80 - w.w, window.innerWidth - 80)
    w.y = clamp(ev.clientY - oy, MENU_H, window.innerHeight - 40)
  })
}

function startResize(e: PointerEvent, dir: 'r' | 'b' | 'rb') {
  if (win.value.maximized) return
  const w = win.value
  const sx = e.clientX
  const sy = e.clientY
  const sw = w.w
  const sh = w.h
  track(e, (ev) => {
    if (dir !== 'b') w.w = clamp(sw + ev.clientX - sx, MIN_W, window.innerWidth - w.x)
    if (dir !== 'r') w.h = clamp(sh + ev.clientY - sy, MIN_H, window.innerHeight - w.y)
  })
}

function track(e: PointerEvent, move: (ev: PointerEvent) => void) {
  e.preventDefault()
  const el = e.currentTarget as HTMLElement
  el.setPointerCapture(e.pointerId)
  const up = () => {
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', up)
  }
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
}
</script>

<template>
  <Transition name="win" appear>
    <section
      v-show="!win.minimized"
      class="fixed flex overflow-hidden bg-white shadow-[0_30px_80px_rgba(0,0,0,0.35),0_0_0_0.5px_rgba(0,0,0,0.25)]"
      :class="[win.maximized ? 'rounded-none' : 'rounded-xl', { 'saturate-[0.92]': active !== app }]"
      :style="style"
      role="region"
      :aria-label="label"
      @pointerdown.capture="focus(app)"
      @pointerdown="startDrag"
    >
      <slot />
      <template v-if="!win.maximized">
        <span class="absolute inset-y-0 right-0 w-1.5 cursor-ew-resize" aria-hidden="true" @pointerdown.stop="startResize($event, 'r')" />
        <span class="absolute inset-x-0 bottom-0 h-1.5 cursor-ns-resize" aria-hidden="true" @pointerdown.stop="startResize($event, 'b')" />
        <span class="absolute right-0 bottom-0 size-4 cursor-nwse-resize" aria-hidden="true" @pointerdown.stop="startResize($event, 'rb')" />
      </template>
    </section>
  </Transition>
</template>

<style scoped>
.win-enter-active,
.win-leave-active {
  transition:
    transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 0.18s ease;
}
.win-enter-from,
.win-leave-to {
  transform: translateY(40px) scale(0.94);
  opacity: 0;
}
@media (prefers-reduced-motion: reduce) {
  .win-enter-active,
  .win-leave-active {
    transition: opacity 0.1s;
  }
  .win-enter-from,
  .win-leave-to {
    transform: none;
  }
}
</style>
