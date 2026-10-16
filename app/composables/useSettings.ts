import { wallpapers, type WallpaperId } from '~/data/wallpapers'

const KEY = 'portfolio:wallpaper'

export function useSettings() {
  const wallpaper = useState<WallpaperId>('wallpaper', () => 'sunset')

  // Выбор обоев переживает перезагрузку; читаем только на клиенте.
  function restore() {
    try {
      const saved = localStorage.getItem(KEY)
      if (saved && saved in wallpapers) wallpaper.value = saved as WallpaperId
    } catch {}
  }

  function setWallpaper(id: WallpaperId) {
    wallpaper.value = id
    try {
      localStorage.setItem(KEY, id)
    } catch {}
  }

  return { wallpaper, background: computed(() => wallpapers[wallpaper.value]), restore, setWallpaper }
}

export function useLock() {
  const locked = useState('locked', () => true)

  function restore() {
    try {
      if (sessionStorage.getItem('portfolio:unlocked')) locked.value = false
    } catch {}
  }

  function unlock() {
    locked.value = false
    try {
      sessionStorage.setItem('portfolio:unlocked', '1')
    } catch {}
  }

  function lock() {
    locked.value = true
    try {
      sessionStorage.removeItem('portfolio:unlocked')
    } catch {}
  }

  return { locked, restore, unlock, lock }
}
