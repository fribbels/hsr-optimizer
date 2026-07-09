import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import type { ActionNodeOverride, Intervention, UltInsertion, WaveSeedState } from 'lib/tabs/tabAvVisualizer/types'
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

export type { WaveSeedState }

// One "wave" (混沌回忆里的一面) — its own independent timeline (rows/interventions/Ult insertions),
// starting its own AV back at 0. Everything except character selection (Slot, shared across all Waves)
// lives here, since clearing the enemies on one wave and moving to the next is modeled as cutting the
// current Wave's timeline at the Playhead and spinning up a new one seeded from that cut point.
export type Wave = {
  interventions: Intervention[]
  actionOverrides: ActionNodeOverride[]
  ultInsertions: UltInsertion[]
  rowCount: number
  // Memory of Chaos mode: when on, the first timeline row is 150 AV (matching the in-game first-cycle mechanic); other rows stay 100
  mocFirstRow: boolean
  seedState?: WaveSeedState
  // Set on THIS wave when it was cut to spawn the next one (see cutWaveAtPlayhead) — the exact AV where
  // it happened, so the timeline can mark it with a fixed (non-draggable) divider and grey out everything
  // after it within that row, instead of leaving "is this wave actually cut, and where" unanswerable just
  // from looking at the rendered rows.
  cutoffAv?: number
}

// The part that persists across sessions (written to localStorage with the global save), see saveState.ts /
// persistenceService.ts. Saves written before Waves existed only have the old flat shape (slots +
// interventions/actionOverrides/ultInsertions/rowCount/mocFirstRow directly) — persistenceService.ts
// migrates those into a single-Wave waves array on load; see migrateSavedSession below.
export type AVVisualizerTabSavedSession = {
  slots: [Slot, Slot, Slot, Slot]
  waves: Wave[]
  currentWaveIndex: number
}

interface AVVisualTabStateValues {
  savedSession: AVVisualizerTabSavedSession
  // Current Playhead position (integer AV). Drives the always-on Action Display Panel and the Playhead line on
  // the timeline. Session-only — intentionally not part of savedSession, never persisted.
  playheadAv: number
  // 'all' (default): every timeline row stacked vertically, as before. 'single': only one row at a time
  // (see singleRowIndex), with paging arrows — added so the always-visible side panels (energy overview/
  // character detail) stay in view without scrolling once there are more than 1-2 rows. Session-only,
  // same as playheadAv — a view preference, not part of the saved session.
  timelineDisplayMode: 'all' | 'single'
  // Which row is shown in 'single' mode. Clamped to [0, rowCount) by the controller, not here — this
  // store doesn't know about rowCount derivation (mocFirstRow etc.), see avVisualTabController.ts.
  singleRowIndex: number
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
  removeRow: () => void
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
  setTimelineDisplayMode: (mode: 'all' | 'single') => void
  setSingleRowIndex: (index: number) => void
  // Generic escape hatch for Wave-level fields not covered by a dedicated action above (e.g. the
  // truncate-on-cut step, which rewrites rowCount/interventions/actionOverrides/ultInsertions together).
  patchCurrentWave: (patch: Partial<Wave>) => void
  addWaveAndSwitch: (wave: Wave) => void
  setCurrentWaveIndex: (index: number) => void
  removeLastWave: () => void
}

type AVVisualTabState = AVVisualTabStateValues & AVVisualTabStateActions

// ---- Default state ----

const emptySlot = (): Slot => ({ characterId: null, spdOverride: null, errOverride: null })

export const emptyWave = (): Wave => ({
  interventions: [],
  actionOverrides: [],
  ultInsertions: [],
  rowCount: 3,
  mocFirstRow: false,
})

const defaultState: AVVisualTabStateValues = {
  savedSession: {
    slots: [emptySlot(), emptySlot(), emptySlot(), emptySlot()],
    waves: [emptyWave()],
    currentWaveIndex: 0,
  },
  playheadAv: 0,
  timelineDisplayMode: 'all',
  singleRowIndex: 0,
}

// ---- Helpers ----

function updateSlot(slots: [Slot, Slot, Slot, Slot], index: number, patch: Partial<Slot>): [Slot, Slot, Slot, Slot] {
  const next = slots.map((s, i) => i === index ? { ...s, ...patch } : s)
  return next as [Slot, Slot, Slot, Slot]
}

// Every mutator below targets "the Wave currently being viewed/edited" — this is the one seam all of
// them go through, so switching currentWaveIndex transparently redirects every existing action (add
// intervention, add row, etc.) at whichever Wave is active, with no change needed at the call sites.
function updateCurrentWave(
  session: AVVisualizerTabSavedSession,
  patch: Partial<Wave> | ((w: Wave) => Partial<Wave>),
): AVVisualizerTabSavedSession {
  const waves = session.waves.map((w, i) => {
    if (i !== session.currentWaveIndex) return w
    return { ...w, ...(typeof patch === 'function' ? patch(w) : patch) }
  })
  return { ...session, waves }
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

  addRow: () => set((s) => ({ savedSession: updateCurrentWave(s.savedSession, (w) => ({ rowCount: w.rowCount + 1 })) })),

  // Floor of 1 — there's always at least one cycle's worth of timeline, same as rowCount's initial value.
  removeRow: () => set((s) => ({ savedSession: updateCurrentWave(s.savedSession, (w) => ({ rowCount: Math.max(1, w.rowCount - 1) })) })),

  addIntervention: (iv) => {
    set((s) => ({
      savedSession: updateCurrentWave(s.savedSession, (w) => ({ interventions: [...w.interventions, { ...iv, id: uuid() }] })),
    }))
  },

  removeIntervention: (id) => {
    set((s) => ({
      savedSession: updateCurrentWave(s.savedSession, (w) => ({ interventions: w.interventions.filter((iv) => iv.id !== id) })),
    }))
  },

  updateIntervention: (id, patch) => {
    set((s) => ({
      savedSession: updateCurrentWave(s.savedSession, (w) => ({
        interventions: w.interventions.map((iv) => iv.id === id ? { ...iv, ...patch } : iv),
      })),
    }))
  },

  clearInterventions: () => set((s) => ({ savedSession: updateCurrentWave(s.savedSession, { interventions: [] }) })),

  setActionOverride: (override) => set((s) => ({
    savedSession: updateCurrentWave(s.savedSession, (w) => {
      const idx = w.actionOverrides.findIndex(
        (o) => o.characterId === override.characterId && o.actionIndex === override.actionIndex,
      )
      const next = idx >= 0
        ? w.actionOverrides.map((o, i) => (i === idx ? override : o))
        : [...w.actionOverrides, override]
      return { actionOverrides: next }
    }),
  })),

  removeActionOverride: (characterId, actionIndex) => set((s) => ({
    savedSession: updateCurrentWave(s.savedSession, (w) => ({
      actionOverrides: w.actionOverrides.filter(
        (o) => !(o.characterId === characterId && o.actionIndex === actionIndex),
      ),
    })),
  })),

  clearActionOverrides: () => set((s) => ({ savedSession: updateCurrentWave(s.savedSession, { actionOverrides: [] }) })),

  addUltInsertion: (insertion) => set((s) => ({
    savedSession: updateCurrentWave(s.savedSession, (w) => ({ ultInsertions: [...w.ultInsertions, insertion] })),
  })),

  addUltInsertionAfter: (afterId, insertion) => set((s) => ({
    savedSession: updateCurrentWave(s.savedSession, (w) => {
      const idx = w.ultInsertions.findIndex((u) => u.id === afterId)
      const next = idx >= 0
        ? [...w.ultInsertions.slice(0, idx + 1), insertion, ...w.ultInsertions.slice(idx + 1)]
        : [...w.ultInsertions, insertion]
      return { ultInsertions: next }
    }),
  })),

  addUltInsertionBefore: (beforeId, insertion) => set((s) => ({
    savedSession: updateCurrentWave(s.savedSession, (w) => {
      const idx = w.ultInsertions.findIndex((u) => u.id === beforeId)
      const next = idx >= 0
        ? [...w.ultInsertions.slice(0, idx), insertion, ...w.ultInsertions.slice(idx)]
        : [insertion, ...w.ultInsertions]
      return { ultInsertions: next }
    }),
  })),

  removeUltInsertion: (id) => set((s) => ({
    savedSession: updateCurrentWave(s.savedSession, (w) => ({ ultInsertions: w.ultInsertions.filter((u) => u.id !== id) })),
  })),

  clearUltInsertions: () => set((s) => ({ savedSession: updateCurrentWave(s.savedSession, { ultInsertions: [] }) })),

  setMocFirstRow: (value) => set((s) => ({ savedSession: updateCurrentWave(s.savedSession, { mocFirstRow: value }) })),

  setPlayheadAv: (av) => set({ playheadAv: av }),

  setTimelineDisplayMode: (mode) => set({ timelineDisplayMode: mode }),
  setSingleRowIndex: (index) => set({ singleRowIndex: index }),

  patchCurrentWave: (patch) => set((s) => ({ savedSession: updateCurrentWave(s.savedSession, patch) })),

  addWaveAndSwitch: (wave) => set((s) => ({
    savedSession: {
      ...s.savedSession,
      waves: [...s.savedSession.waves, wave],
      currentWaveIndex: s.savedSession.waves.length,
    },
  })),

  setCurrentWaveIndex: (index) => set((s) => ({
    savedSession: {
      ...s.savedSession,
      currentWaveIndex: Math.max(0, Math.min(s.savedSession.waves.length - 1, index)),
    },
  })),

  // No-op with a single Wave left — there's always at least one (mirrors removeRow's floor of 1).
  removeLastWave: () => set((s) => {
    if (s.savedSession.waves.length <= 1) return s
    // The wave that becomes the new last one is no longer "cut" — it's the active frontier again (free
    // to grow more rows/actions past that point), so its cutoffAv marker/overlay no longer applies.
    const waves = s.savedSession.waves.slice(0, -1)
    const newLastIndex = waves.length - 1
    waves[newLastIndex] = { ...waves[newLastIndex], cutoffAv: undefined }
    return {
      savedSession: {
        ...s.savedSession,
        waves,
        currentWaveIndex: Math.min(s.savedSession.currentWaveIndex, newLastIndex),
      },
    }
  }),
}))

export { useAVVisualTabStore }
export type { AVVisualTabStateActions, AVVisualTabStateValues }
