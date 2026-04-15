import chroma from 'chroma-js'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_SEED = '#1668DC'

function isValidColor(color: string): boolean {
  try {
    chroma(color)
    return true
  } catch {
    return false
  }
}

type ThemeState = {
  seedColor: string,
}

type ThemeActions = {
  setSeedColor: (color: string) => void,
}

export type ThemeStore = ThemeState & ThemeActions

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      seedColor: DEFAULT_SEED,
      setSeedColor: (color) =>
        set((s) => {
          if (s.seedColor === color) return s
          if (!isValidColor(color)) return s
          return { seedColor: color }
        }),
    }),
    {
      name: 'theme-store-v1',
      merge: (persisted, current) => {
        const p = persisted as Partial<ThemeState> | undefined
        const seedColor = p?.seedColor && isValidColor(p.seedColor) ? p.seedColor : current.seedColor
        return { ...current, seedColor }
      },
    },
  ),
)
