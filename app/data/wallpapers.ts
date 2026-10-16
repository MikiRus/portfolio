export const wallpapers = {
  sunset:
    'radial-gradient(120% 90% at 15% 110%, #f6a35c 0%, transparent 55%), radial-gradient(90% 80% at 85% 0%, #6b5bd6 0%, transparent 60%), linear-gradient(160deg, #3b3fa8 0%, #b25c9a 55%, #f08a5d 100%)',
  ocean:
    'radial-gradient(100% 80% at 80% 100%, #39c3c9 0%, transparent 55%), linear-gradient(170deg, #0b2a5b 0%, #145ea8 55%, #2fa6c9 100%)',
  graphite:
    'radial-gradient(90% 70% at 70% 20%, #4a4a52 0%, transparent 60%), linear-gradient(180deg, #1c1c21 0%, #2c2c33 100%)',
  forest:
    'radial-gradient(110% 80% at 20% 100%, #8fbf5a 0%, transparent 55%), linear-gradient(165deg, #12352a 0%, #1f6b4f 55%, #6ea96a 100%)',
} as const

export type WallpaperId = keyof typeof wallpapers
