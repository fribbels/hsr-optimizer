import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const DEFAULT_SEED = '#1668DC'

type ThemeState = {
  seedColor: string
}

type ThemeActions = {
  setSeedColor: (color: string) => void
}

export type ThemeStore = ThemeState & ThemeActions

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      seedColor: DEFAULT_SEED,
      setSeedColor: (color) => set((s) => (s.seedColor === color ? s : { seedColor: color })),
    }),
    { name: 'theme-store-v1' },
  ),
)
