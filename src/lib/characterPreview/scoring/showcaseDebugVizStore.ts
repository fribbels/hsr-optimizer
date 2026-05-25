import { create } from 'zustand'

type ShowcaseDebugVizStore = {
  setBonusMode: string
  substatRollsMode: string
  colorMode: string
  colorAlpha: number
  setsOnTop: boolean
  showScore: boolean
  setSetBonusMode: (mode: string) => void
  setSubstatRollsMode: (mode: string) => void
  setColorMode: (mode: string) => void
  setColorAlpha: (alpha: number) => void
  toggleSetsOnTop: () => void
  toggleShowScore: () => void
}

export const useShowcaseDebugVizStore = create<ShowcaseDebugVizStore>((set) => ({
  setBonusMode: 'b12',
  substatRollsMode: 's5',
  colorMode: 'c3',
  colorAlpha: 1.0,
  setsOnTop: true,
  showScore: false,
  setSetBonusMode: (mode) => set({ setBonusMode: mode }),
  setSubstatRollsMode: (mode) => set({ substatRollsMode: mode }),
  setColorMode: (mode) => set({ colorMode: mode }),
  setColorAlpha: (alpha) => set({ colorAlpha: alpha }),
  toggleSetsOnTop: () => set((s) => ({ setsOnTop: !s.setsOnTop })),
  toggleShowScore: () => set((s) => ({ showScore: !s.showScore })),
}))
