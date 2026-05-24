import { create } from 'zustand'

type ShowcaseDebugVizStore = {
  setBonusMode: string
  substatRollsMode: string
  colorMode: string
  setsOnTop: boolean
  showScore: boolean
  setSetBonusMode: (mode: string) => void
  setSubstatRollsMode: (mode: string) => void
  setColorMode: (mode: string) => void
  toggleSetsOnTop: () => void
  toggleShowScore: () => void
}

export const useShowcaseDebugVizStore = create<ShowcaseDebugVizStore>((set) => ({
  setBonusMode: 'b12',
  substatRollsMode: 's1',
  colorMode: 'c3',
  setsOnTop: true,
  showScore: true,
  setSetBonusMode: (mode) => set({ setBonusMode: mode }),
  setSubstatRollsMode: (mode) => set({ substatRollsMode: mode }),
  setColorMode: (mode) => set({ colorMode: mode }),
  toggleSetsOnTop: () => set((s) => ({ setsOnTop: !s.setsOnTop })),
  toggleShowScore: () => set((s) => ({ showScore: !s.showScore })),
}))
