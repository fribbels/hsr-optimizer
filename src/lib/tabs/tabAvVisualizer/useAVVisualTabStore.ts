import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import type { ActionNodeOverride, Intervention, UltInsertion } from 'lib/tabs/tabAvVisualizer/types'
import { uuid } from 'lib/utils/miscUtils'

// ---- Type definitions ----

export type Slot = {
  characterId: string | null
  spdOverride: number | null
  // Energy Regeneration Rate override, stored as a bonus fraction (e.g. 0.185 for +18.5%), matching
  // the convention finalStats[Stats.ERR] uses elsewhere in the app. null/undefined = use the computed
  // value — optional (unlike spdOverride) because it was added after `slots` already existed, so saves
  // written before this point won't have it; consumers should treat undefined the same as null.
  errOverride?: number | null
  // Eidolon level override (0-6); same backward-compat reasoning as errOverride — added later, so
  // optional, and consumers should treat undefined the same as null (use the character's real Eidolon).
  eidolonOverride?: number | null
}

// The part that persists across sessions (written to localStorage with the global save), see saveState.ts /
// persistenceService.ts. `interventions`/`rowCount`/`mocFirstRow` were added after `slots`, so saves written
// before that point only have `slots` — persistenceService.ts reads this defensively with fallbacks.
export type AVVisualizerTabSavedSession = {
  slots: [Slot, Slot, Slot, Slot]
  interventions: Intervention[]
  actionOverrides: ActionNodeOverride[]
  ultInsertions: UltInsertion[]
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
  setSlotErrOverride: (slotIndex: number, err: number) => void
  resetSlotErrOverride: (slotIndex: number) => void
  setSlotEidolonOverride: (slotIndex: number, eidolon: number) => void
  resetSlotEidolonOverride: (slotIndex: number) => void
  setSavedSession: (session: Partial<AVVisualizerTabSavedSession>) => void
  addRow: () => void
  addIntervention: (iv: Omit<Intervention, 'id'>) => void
  removeIntervention: (id: string) => void
  updateIntervention: (id: string, patch: Partial<Omit<Intervention, 'id'>>) => void
  clearInterventions: () => void
  setActionOverride: (override: ActionNodeOverride) => void
  removeActionOverride: (characterId: string, actionIndex: number) => void
  clearActionOverrides: () => void
  addUltInsertion: (insertion: UltInsertion) => void
  addUltInsertionAfter: (afterId: string, insertion: UltInsertion) => void
  addUltInsertionBefore: (beforeId: string, insertion: UltInsertion) => void
  removeUltInsertion: (id: string) => void
  clearUltInsertions: () => void
  setMocFirstRow: (value: boolean) => void
  setPlayheadAv: (av: number) => void
}

type AVVisualTabState = AVVisualTabStateValues & AVVisualTabStateActions

// ---- Default state ----

const emptySlot = (): Slot => ({ characterId: null, spdOverride: null, errOverride: null })

const defaultState: AVVisualTabStateValues = {
  savedSession: {
    slots: [emptySlot(), emptySlot(), emptySlot(), emptySlot()],
    interventions: [],
    actionOverrides: [],
    ultInsertions: [],
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
        slots: updateSlot(s.savedSession.slots, slotIndex, {
          characterId, spdOverride: null, errOverride: null, eidolonOverride: null,
        }),
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

  setSlotErrOverride: (slotIndex, err) => {
    set((s) => ({
      savedSession: {
        ...s.savedSession,
        slots: updateSlot(s.savedSession.slots, slotIndex, { errOverride: err }),
      },
    }))
  },

  resetSlotErrOverride: (slotIndex) => {
    set((s) => ({
      savedSession: {
        ...s.savedSession,
        slots: updateSlot(s.savedSession.slots, slotIndex, { errOverride: null }),
      },
    }))
  },

  setSlotEidolonOverride: (slotIndex, eidolon) => {
    set((s) => ({
      savedSession: {
        ...s.savedSession,
        slots: updateSlot(s.savedSession.slots, slotIndex, { eidolonOverride: eidolon }),
      },
    }))
  },

  resetSlotEidolonOverride: (slotIndex) => {
    set((s) => ({
      savedSession: {
        ...s.savedSession,
        slots: updateSlot(s.savedSession.slots, slotIndex, { eidolonOverride: null }),
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

  setActionOverride: (override) => set((s) => {
    const list = s.savedSession.actionOverrides
    const idx = list.findIndex(
      (o) => o.characterId === override.characterId && o.actionIndex === override.actionIndex,
    )
    const next = idx >= 0
      ? list.map((o, i) => (i === idx ? override : o))
      : [...list, override]
    return { savedSession: { ...s.savedSession, actionOverrides: next } }
  }),

  removeActionOverride: (characterId, actionIndex) => set((s) => ({
    savedSession: {
      ...s.savedSession,
      actionOverrides: s.savedSession.actionOverrides.filter(
        (o) => !(o.characterId === characterId && o.actionIndex === actionIndex),
      ),
    },
  })),

  clearActionOverrides: () => set((s) => ({ savedSession: { ...s.savedSession, actionOverrides: [] } })),

  addUltInsertion: (insertion) => set((s) => ({
    savedSession: {
      ...s.savedSession,
      ultInsertions: [...s.savedSession.ultInsertions, insertion],
    },
  })),

  addUltInsertionAfter: (afterId, insertion) => set((s) => {
    const list = s.savedSession.ultInsertions
    const idx = list.findIndex((u) => u.id === afterId)
    const next = idx >= 0
      ? [...list.slice(0, idx + 1), insertion, ...list.slice(idx + 1)]
      : [...list, insertion]
    return { savedSession: { ...s.savedSession, ultInsertions: next } }
  }),

  addUltInsertionBefore: (beforeId, insertion) => set((s) => {
    const list = s.savedSession.ultInsertions
    const idx = list.findIndex((u) => u.id === beforeId)
    const next = idx >= 0
      ? [...list.slice(0, idx), insertion, ...list.slice(idx)]
      : [insertion, ...list]
    return { savedSession: { ...s.savedSession, ultInsertions: next } }
  }),

  removeUltInsertion: (id) => set((s) => ({
    savedSession: {
      ...s.savedSession,
      ultInsertions: s.savedSession.ultInsertions.filter((u) => u.id !== id),
    },
  })),

  clearUltInsertions: () => set((s) => ({ savedSession: { ...s.savedSession, ultInsertions: [] } })),

  setMocFirstRow: (value) => set((s) => ({ savedSession: { ...s.savedSession, mocFirstRow: value } })),

  setPlayheadAv: (av) => set({ playheadAv: av }),
}))

export { useAVVisualTabStore }
export type { AVVisualTabStateActions, AVVisualTabStateValues }
