import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import type { Intervention } from 'lib/tabs/tabAvVisualizer/types'
import { uuid } from 'lib/utils/miscUtils'

// ---- Type definitions ----

export type Slot = {
  characterId: string | null
  spdOverride: number | null
}

// The part that persists across sessions (written to localStorage with the global save), see saveState.ts /
// persistenceService.ts. `interventions`/`rowCount`/`mocFirstRow` were added after `slots`, so saves written
// before that point only have `slots` — persistenceService.ts reads this defensively with fallbacks.
export type AVVisualizerTabSavedSession = {
  slots: [Slot, Slot, Slot, Slot]
  interventions: Intervention[]
  rowCount: number
  // Memory of Chaos mode: when on, the first timeline row is 150 AV (matching the in-game first-cycle mechanic); other rows stay 100
  mocFirstRow: boolean
}

interface AVVisualTabStateValues {
  savedSession: AVVisualizerTabSavedSession
  // Current Playhead position (integer AV). Drives the always-on Action Display Panel and the Playhead line on
  // the timeline. Session-only — intentionally not part of savedSession, never persisted.
  playheadAv: number
}

interface AVVisualTabStateActions {
  setSlotCharacter: (slotIndex: number, characterId: string | null) => void
  setSlotSpdOverride: (slotIndex: number, spd: number) => void
  resetSlotSpdOverride: (slotIndex: number) => void
  setSavedSession: (session: Partial<AVVisualizerTabSavedSession>) => void
  addRow: () => void
  addIntervention: (iv: Omit<Intervention, 'id'>) => void
  removeIntervention: (id: string) => void
  updateIntervention: (id: string, patch: Partial<Omit<Intervention, 'id'>>) => void
  clearInterventions: () => void
  setMocFirstRow: (value: boolean) => void
  setPlayheadAv: (av: number) => void
}

type AVVisualTabState = AVVisualTabStateValues & AVVisualTabStateActions

// ---- Default state ----

const emptySlot = (): Slot => ({ characterId: null, spdOverride: null })

const defaultState: AVVisualTabStateValues = {
  savedSession: {
    slots: [emptySlot(), emptySlot(), emptySlot(), emptySlot()],
    interventions: [],
    rowCount: 3,
    mocFirstRow: false,
  },
  playheadAv: 0,
}

// ---- Helpers ----

function updateSlot(slots: [Slot, Slot, Slot, Slot], index: number, patch: Partial<Slot>): [Slot, Slot, Slot, Slot] {
  const next = slots.map((s, i) => i === index ? { ...s, ...patch } : s)
  return next as [Slot, Slot, Slot, Slot]
}

// ---- Store ----

const useAVVisualTabStore = createTabAwareStore<AVVisualTabState>((set) => ({
  ...defaultState,

  setSlotCharacter: (slotIndex, characterId) => {
    set((s) => ({
      savedSession: {
        ...s.savedSession,
        slots: updateSlot(s.savedSession.slots, slotIndex, { characterId, spdOverride: null }),
      },
    }))
  },

  setSlotSpdOverride: (slotIndex, spd) => {
    set((s) => ({
      savedSession: {
        ...s.savedSession,
        slots: updateSlot(s.savedSession.slots, slotIndex, { spdOverride: spd }),
      },
    }))
  },

  resetSlotSpdOverride: (slotIndex) => {
    set((s) => ({
      savedSession: {
        ...s.savedSession,
        slots: updateSlot(s.savedSession.slots, slotIndex, { spdOverride: null }),
      },
    }))
  },

  setSavedSession: (session) => set((s) => ({ savedSession: { ...s.savedSession, ...session } })),

  addRow: () => set((s) => ({ savedSession: { ...s.savedSession, rowCount: s.savedSession.rowCount + 1 } })),

  addIntervention: (iv) => {
    set((s) => ({
      savedSession: { ...s.savedSession, interventions: [...s.savedSession.interventions, { ...iv, id: uuid() }] },
    }))
  },

  removeIntervention: (id) => {
    set((s) => ({
      savedSession: {
        ...s.savedSession,
        interventions: s.savedSession.interventions.filter((iv) => iv.id !== id),
      },
    }))
  },

  updateIntervention: (id, patch) => {
    set((s) => ({
      savedSession: {
        ...s.savedSession,
        interventions: s.savedSession.interventions.map((iv) => iv.id === id ? { ...iv, ...patch } : iv),
      },
    }))
  },

  clearInterventions: () => set((s) => ({ savedSession: { ...s.savedSession, interventions: [] } })),

  setMocFirstRow: (value) => set((s) => ({ savedSession: { ...s.savedSession, mocFirstRow: value } })),

  setPlayheadAv: (av) => set({ playheadAv: av }),
}))

export { useAVVisualTabStore }
export type { AVVisualTabStateActions, AVVisualTabStateValues }
