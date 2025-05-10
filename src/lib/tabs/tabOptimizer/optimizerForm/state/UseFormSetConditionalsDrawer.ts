import { create } from 'zustand'

export enum SetConditionalDrawers {
  OPTIMIZER = 'OPTIMIZER',
  BENCHMARKS = 'BENCHMARKS',
}

interface FormSetConditionalsState {
  drawers: Record<SetConditionalDrawers, boolean>
  setDrawerOpen: (id: SetConditionalDrawers, drawerOpen: boolean) => void
}

export const formSetConditionalsStore = create<FormSetConditionalsState>((set) => ({
  drawers: {} as Record<SetConditionalDrawers, boolean>,
  setDrawerOpen: (id: SetConditionalDrawers, drawerOpen: boolean) => set((state) => ({
    drawers: {
      ...state.drawers,
      [id]: drawerOpen,
    },
  })),
}))

// Custom hook
export function useFormSetConditionalsDrawer(id: SetConditionalDrawers) {
  const isOpen = formSetConditionalsStore((state) => state.drawers[id] ?? false)
  const setDrawerOpen = formSetConditionalsStore((state) => state.setDrawerOpen)

  return {
    isOpen,
    open: () => setDrawerOpen(id, true),
    close: () => setDrawerOpen(id, false),
  }
}
