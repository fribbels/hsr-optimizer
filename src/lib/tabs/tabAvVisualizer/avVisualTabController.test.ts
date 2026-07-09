// @vitest-environment jsdom
import { AvVisualTabController, mergeEffectiveOverrides } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import type { Slot } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'

function state() {
  return useAVVisualTabStore.getState()
}

function wave() {
  const s = state().savedSession
  return s.waves[s.currentWaveIndex]
}

beforeEach(() => {
  useAVVisualTabStore.setState(useAVVisualTabStore.getInitialState())
})

function emptySlot(): Slot {
  return { characterId: '1001', spdOverride: null, errOverride: null, eidolonOverride: null }
}

// Covers exportSession's "bake the effective SPD/ERR/Eidolon into explicit overrides" step — these are
// the only 3 numbers that affect the simulated action order/energy, so a session exported and opened on
// a different account needs them locked in rather than silently re-resolved against that other account's
// own character build.
describe('mergeEffectiveOverrides', () => {
  it('fills in null overrides from the resolved (real build) values', () => {
    const result = mergeEffectiveOverrides(emptySlot(), { spd: 134.5, err: 0.185, eidolon: 6 })
    expect(result.spdOverride).toBe(134.5)
    expect(result.errOverride).toBe(0.185)
    expect(result.eidolonOverride).toBe(6)
  })

  it('keeps an existing explicit override instead of overwriting it', () => {
    const slot: Slot = { characterId: '1001', spdOverride: 200, errOverride: 0.5, eidolonOverride: 2 }
    const result = mergeEffectiveOverrides(slot, { spd: 134.5, err: 0.185, eidolon: 6 })
    expect(result.spdOverride).toBe(200)
    expect(result.errOverride).toBe(0.5)
    expect(result.eidolonOverride).toBe(2)
  })

  it('leaves the slot untouched when nothing could be resolved (e.g. no matching character)', () => {
    const slot = emptySlot()
    const result = mergeEffectiveOverrides(slot, null)
    expect(result).toBe(slot)
  })

  it('only fills in the fields that are actually null, per-field independently', () => {
    const slot: Slot = { characterId: '1001', spdOverride: 200, errOverride: null, eidolonOverride: null }
    const result = mergeEffectiveOverrides(slot, { spd: 134.5, err: 0.185, eidolon: 6 })
    expect(result.spdOverride).toBe(200)
    expect(result.errOverride).toBe(0.185)
    expect(result.eidolonOverride).toBe(6)
  })
})

// Covers the single-row timeline display mode — switching into it should land on whatever row the
// Playhead is already on (not always row 0), and paging should move the Playhead along with it so the
// always-visible side panels (energy overview / character detail) stay in sync with what's on screen.
describe('AvVisualTabController — timeline display mode', () => {
  it('setTimelineDisplayMode("single") lands on the row containing the current Playhead', () => {
    useAVVisualTabStore.setState({ playheadAv: 250 })
    state().patchCurrentWave({ rowCount: 5 })
    AvVisualTabController.setTimelineDisplayMode('single')
    expect(state().timelineDisplayMode).toBe('single')
    expect(state().singleRowIndex).toBe(2)   // AV 250 falls in row 2 (200-300) at 100 AV/row
  })

  it('accounts for the Memory of Chaos first row being 150 AV wide', () => {
    useAVVisualTabStore.setState({ playheadAv: 200 })
    state().patchCurrentWave({ rowCount: 5, mocFirstRow: true })
    AvVisualTabController.setTimelineDisplayMode('single')
    // Row 0 = [0, 150), row 1 = [150, 250) — AV 200 falls in row 1, not row 2 like the non-MoC case above.
    expect(state().singleRowIndex).toBe(1)
  })

  it('setSingleRowIndex moves the Playhead to that row\'s start AV', () => {
    state().patchCurrentWave({ rowCount: 5 })
    AvVisualTabController.setSingleRowIndex(3)
    expect(state().singleRowIndex).toBe(3)
    expect(state().playheadAv).toBe(300)
  })

  it('clamps the row index to [0, rowCount - 1]', () => {
    state().patchCurrentWave({ rowCount: 3 })
    AvVisualTabController.setSingleRowIndex(99)
    expect(state().singleRowIndex).toBe(2)
    AvVisualTabController.setSingleRowIndex(-5)
    expect(state().singleRowIndex).toBe(0)
  })

  it('removeRow never drops rowCount below 1', () => {
    state().patchCurrentWave({ rowCount: 1 })
    AvVisualTabController.removeRow()
    expect(wave().rowCount).toBe(1)
  })

  it('removeRow pulls singleRowIndex back in bounds if it was showing a row that no longer exists', () => {
    state().patchCurrentWave({ rowCount: 5 })
    AvVisualTabController.setSingleRowIndex(4)
    state().patchCurrentWave({ rowCount: 2 })
    AvVisualTabController.removeRow()
    // rowCount is now 1 — singleRowIndex (was 4) must come back down to the only row left, index 0.
    expect(wave().rowCount).toBe(1)
    expect(state().singleRowIndex).toBe(0)
  })
})

// Covers cutWaveAtPlayhead — the 混沌回忆换面 feature: cutting the current wave's timeline at a given AV
// truncates everything after that point (the fight is over there) and spins up a new wave starting fresh
// at AV 0, seeded with whatever energy/buffs/team SP the cut point captured.
describe('AvVisualTabController — cutWaveAtPlayhead', () => {
  it('creates a new wave seeded with the given state and switches to it', () => {
    AvVisualTabController.cutWaveAtPlayhead(150, {
      energyByChar: { A: 80 },
      activeInterventionsByChar: {},
      teamSp: { sp: 4, spMax: 6 },
    })
    expect(state().savedSession.waves).toHaveLength(2)
    expect(state().savedSession.currentWaveIndex).toBe(1)
    expect(wave().seedState).toEqual({ energyByChar: { A: 80 }, activeInterventionsByChar: {}, teamSp: { sp: 4, spMax: 6 } })
    expect(wave().interventions).toEqual([])
    expect(wave().rowCount).toBe(3)
  })

  it('drops rows after the one containing the cutoff AV from the OLD wave', () => {
    state().patchCurrentWave({ rowCount: 5 })
    AvVisualTabController.cutWaveAtPlayhead(150, { energyByChar: {}, activeInterventionsByChar: {}, teamSp: { sp: 3, spMax: 5 } })
    // AV 150 falls in row 1 (100-200) at 100 AV/row (no MoC) — rows 2-4 are dropped, row 1 is kept.
    expect(state().savedSession.waves[0].rowCount).toBe(2)
  })

  it('drops interventions scheduled strictly after the cutoff from the OLD wave', () => {
    state().addIntervention({ triggerAv: 50, type: 'spd_up', targets: ['A'], value: 10, unit: 'flat', durationTurns: 1 })
    state().addIntervention({ triggerAv: 200, type: 'spd_up', targets: ['A'], value: 10, unit: 'flat', durationTurns: 1 })
    AvVisualTabController.cutWaveAtPlayhead(150, { energyByChar: {}, activeInterventionsByChar: {}, teamSp: { sp: 3, spMax: 5 } })
    expect(state().savedSession.waves[0].interventions).toHaveLength(1)
    expect(state().savedSession.waves[0].interventions[0].triggerAv).toBe(50)
  })

  it('records the exact cutoff AV on the OLD wave, for the timeline marker', () => {
    AvVisualTabController.cutWaveAtPlayhead(123, { energyByChar: {}, activeInterventionsByChar: {}, teamSp: { sp: 3, spMax: 5 } })
    expect(state().savedSession.waves[0].cutoffAv).toBe(123)
    // The new wave itself was never cut — no marker on it.
    expect(wave().cutoffAv).toBeUndefined()
  })
})

// Covers removeLastWave — the mirror image of cutWaveAtPlayhead: only ever removes the LAST wave, and
// is a no-op with just one left (there's always at least one, same floor as removeRow).
describe('AvVisualTabController — removeLastWave', () => {
  it('removes the last wave and switches back to the one before it', () => {
    AvVisualTabController.cutWaveAtPlayhead(100, { energyByChar: {}, activeInterventionsByChar: {}, teamSp: { sp: 3, spMax: 5 } })
    expect(state().savedSession.waves).toHaveLength(2)
    AvVisualTabController.removeLastWave()
    expect(state().savedSession.waves).toHaveLength(1)
    expect(state().savedSession.currentWaveIndex).toBe(0)
  })

  it('does not remove the only wave left', () => {
    AvVisualTabController.removeLastWave()
    expect(state().savedSession.waves).toHaveLength(1)
  })

  it('does NOT restore what the previous cut deleted from the wave before it', () => {
    state().addIntervention({ triggerAv: 200, type: 'spd_up', targets: ['A'], value: 10, unit: 'flat', durationTurns: 1 })
    AvVisualTabController.cutWaveAtPlayhead(100, { energyByChar: {}, activeInterventionsByChar: {}, teamSp: { sp: 3, spMax: 5 } })
    // The AV-200 intervention was already dropped by the cut, before removeLastWave even runs.
    expect(state().savedSession.waves[0].interventions).toHaveLength(0)
    AvVisualTabController.removeLastWave()
    expect(state().savedSession.waves[0].interventions).toHaveLength(0)
  })

  it('clears cutoffAv on the wave that becomes the new last one — it\'s the active frontier again', () => {
    AvVisualTabController.cutWaveAtPlayhead(123, { energyByChar: {}, activeInterventionsByChar: {}, teamSp: { sp: 3, spMax: 5 } })
    expect(state().savedSession.waves[0].cutoffAv).toBe(123)
    AvVisualTabController.removeLastWave()
    expect(state().savedSession.waves[0].cutoffAv).toBeUndefined()
  })
})
