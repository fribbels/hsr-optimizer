import { create } from 'zustand'

export enum SetConditionalDrawers {
  OPTIMIZER = 'OPTIMIZER',
  BENCHMARKS = 'BENCHMARKS',
}

interface FormSetConditionalsState {
  drawerStatus: Record<SetConditionalDrawers, boolean>
  setOpen: (id: SetConditionalDrawers, drawerOpen: boolean) => void
}

export const formSetConditionalsStore = create<FormSetConditionalsState>((set) => ({
  drawerStatus: {} as Record<SetConditionalDrawers, boolean>,
  setOpen: (id: SetConditionalDrawers, drawerOpen: boolean) => set((state) => ({
    drawerStatus: {
      ...state.drawerStatus,
      [id]: drawerOpen,
    },
  })),
}))

// Usage
// const { open, close, isOpen } = useFormSetConditionalsDrawer(drawerId)
export function useFormSetConditionalsDrawer(id: SetConditionalDrawers) {
  const isOpen = formSetConditionalsStore((state) => state.drawerStatus[id] ?? false)
  const setOpen = formSetConditionalsStore((state) => state.setOpen)

  return {
    isOpen,
    open: () => setOpen(id, true),
    close: () => setOpen(id, false),
  }
}
