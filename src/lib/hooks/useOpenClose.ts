import { create } from 'zustand'

export enum OpenCloseIDs {
  OPTIMIZER_SETS_DRAWER = 'OPTIMIZER_SETS_DRAWER',
  BENCHMARKS_SETS_DRAWER = 'BENCHMARKS_SETS_DRAWER',
  COMBO_DRAWER = 'COMBO_DRAWER',
  COMBAT_BUFFS_DRAWER = 'COMBAT_BUFFS_DRAWER',
  SETTINGS_DRAWER = 'SETTINGS_DRAWER',
  GETTING_STARTED_DRAWER = 'GETTING_STARTED_DRAWER',
  TRACES_DRAWER = 'TRACES_DRAWER',
  ENEMY_DRAWER = 'ENEMY_DRAWER',
  ZERO_RESULTS_MODAL = 'ZERO_RESULTS_MODAL',
  ZERO_PERMS_MODAL = 'ZERO_PERMS_MODAL',
}

interface OpenCloseStates {
  state: Record<OpenCloseIDs, boolean>
  setIsOpen: (id: OpenCloseIDs, isOpen: boolean) => void
}

export const openCloseStore = create<OpenCloseStates>((set) => ({
  state: {} as Record<OpenCloseIDs, boolean>,
  setIsOpen: (id: OpenCloseIDs, isOpen: boolean) => set((state) => ({
    state: {
      ...state.state,
      [id]: isOpen,
    },
  })),
}))

// Hook for toggling interactive open/close states locally without parent rerender or using the main global store
// Usage:
// const { open: openSetsDrawer, close: closeSetsDrawer } = useOpenClose(OpenCloseIDs.BENCHMARKS_SETS_DRAWER)
export function useOpenClose(id: OpenCloseIDs) {
  const isOpen = openCloseStore((state) => state.state[id] ?? false)
  const setIsOpen = openCloseStore((state) => state.setIsOpen)

  return {
    isOpen,
    open: () => setIsOpen(id, true),
    close: () => setIsOpen(id, false),
  }
}
