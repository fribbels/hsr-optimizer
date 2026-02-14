import { OptimizerContext } from 'types/optimizer'
import { create } from 'zustand'

type OptimizerTabState = {
  context: OptimizerContext | null,

  setContext: (context: OptimizerContext) => void,
}

export const useOptimizerTabStore = create<OptimizerTabState>()((set) => ({
  context: null,

  setContext: (context: OptimizerContext) => set({ context }),
}))
