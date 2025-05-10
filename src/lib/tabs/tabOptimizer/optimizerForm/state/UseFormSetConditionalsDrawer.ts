import { create } from 'zustand'

export enum SetConditionalDrawers {
  OPTIMIZER = 'OPTIMIZER',
  BENCHMARKS = 'BENCHMARKS',
}

interface FormSetConditionalsState {
  drawerStatus: Record<SetConditionalDrawers, boolean>
  setIsOpen: (id: SetConditionalDrawers, isOpen: boolean) => void
}

export const formSetConditionalsStore = create<FormSetConditionalsState>((set) => ({
  drawerStatus: {} as Record<SetConditionalDrawers, boolean>,
  setIsOpen: (id: SetConditionalDrawers, isOpen: boolean) => set((state) => ({
    drawerStatus: {
      ...state.drawerStatus,
      [id]: isOpen,
    },
  })),
}))

// Usage
// const { isOpen, openConditionalDrawer, closeConditionalDrawer } = useFormSetConditionalsDrawer(drawerId)
export function useFormSetConditionalsDrawer(id: SetConditionalDrawers) {
  const isOpen = formSetConditionalsStore((state) => state.drawerStatus[id] ?? false)
  const setIsOpen = formSetConditionalsStore((state) => state.setIsOpen)

  return {
    isOpen,
    openConditionalDrawer: () => setIsOpen(id, true),
    closeConditionalDrawer: () => setIsOpen(id, false),
  }
}
