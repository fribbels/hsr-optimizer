import { useMemo } from 'react'
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
  MENU_SIDEBAR = 'MENU_SIDEBAR',
  SCORING_MODAL = 'SCORING_MODAL',
}

interface OpenCloseStates {
  state: Record<OpenCloseIDs, boolean>
  setIsOpen: (id: OpenCloseIDs, isOpen: boolean) => void
}

// Hook for toggling interactive open/close states locally without parent rerender or using the main global store
// Don't use a subscription if only actions are needed

// No rerenders
// const { open: openScoringModal } = useOpenCloseActions(OpenCloseIDs.SCORING_MODAL)
export function useOpenCloseActions(id: OpenCloseIDs) {
  return useMemo(() => ({
    open: () => openCloseStore.getState().setIsOpen(id, true),
    close: () => openCloseStore.getState().setIsOpen(id, false),
    toggle: () => {
      const currentState = openCloseStore.getState().state[id] ?? false
      openCloseStore.getState().setIsOpen(id, !currentState)
    },
  }), [id])
}

// Subscribes and rerenders
// const { isOpen: isOpenScoringModal } = useIsOpen(OpenCloseIDs.SCORING_MODAL)
export function useIsOpen(id: OpenCloseIDs) {
  return openCloseStore((state) => state.state[id] ?? false)
}

// Subscribes and rerenders
// const { close: closeScoringModal, isOpen: isOpenScoringModal } = useOpenClose(OpenCloseIDs.SCORING_MODAL)
export function useOpenClose(id: OpenCloseIDs) {
  const actions = useOpenCloseActions(id)
  const isOpen = useIsOpen(id)

  return {
    ...actions,
    isOpen,
  }
}

// Simple helper functions for nonreactive setters
export function setOpen(id: OpenCloseIDs) {
  openCloseStore.getState().setIsOpen(id, true)
}

export function setClose(id: OpenCloseIDs) {
  openCloseStore.getState().setIsOpen(id, false)
}

export function toggleOpen(id: OpenCloseIDs) {
  const currentState = openCloseStore.getState().state[id] ?? false
  openCloseStore.getState().setIsOpen(id, !currentState)
}

export const openCloseStore = create<OpenCloseStates>((set) => ({
  state: {
    [OpenCloseIDs.MENU_SIDEBAR]: true,
  } as Record<OpenCloseIDs, boolean>,
  setIsOpen: (id: OpenCloseIDs, isOpen: boolean) => set((state) => ({
    state: {
      ...state.state,
      [id]: isOpen,
    },
  })),
}))
