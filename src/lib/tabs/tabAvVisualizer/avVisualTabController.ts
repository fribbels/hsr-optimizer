import { ShowcaseSource } from 'lib/characterPreview/CharacterPreviewComponents'
import { getPreviewRelics, getShowcaseStats } from 'lib/characterPreview/characterPreviewController'
import { Stats } from 'lib/constants/constants'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import { simulateBattle, type SimulationResult } from 'lib/tabs/tabAvVisualizer/simulation/simulateBattle'
import { ELEMENT_COLORS, ROW_SIZE, SLOT_COLORS } from 'lib/tabs/tabAvVisualizer/constants'
import type { ActionNodeOverride, ActiveIntervention, BattleEntity, Intervention, UltInsertion } from 'lib/tabs/tabAvVisualizer/types'
import type { AVVisualizerTabSavedSession, Slot, Wave, WaveSeedState } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { emptyWave, useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { uuid } from 'lib/utils/miscUtils'
import type { CharacterId } from 'types/character'

// Pure merge step, decoupled from the getShowcaseStats/getPreviewRelics pipeline so it's unit-testable
// without a full character/relic fixture — keeps any override the slot already has, only filling in
// from `resolved` (the character's currently-computed real values) where one's missing.
export function mergeEffectiveOverrides(slot: Slot, resolved: { spd?: number; err?: number; eidolon?: number } | null): Slot {
  if (!resolved) return slot
  return {
    ...slot,
    spdOverride: slot.spdOverride ?? resolved.spd ?? slot.spdOverride,
    errOverride: slot.errOverride ?? resolved.err ?? slot.errOverride,
    eidolonOverride: slot.eidolonOverride ?? resolved.eidolon ?? slot.eidolonOverride,
  }
}

// Bakes each slot's currently-effective SPD/ERR/Eidolon into explicit overrides before export — these are
// the only 3 numbers that affect the simulated action order/energy (ATK/CR/CD etc. don't, so they're left
// alone). Without this, a slot left at "use my own build" (override === null) would silently resolve
// against whoever's account the file is later opened on, instead of reproducing the exporter's own result.
// Slots that already have an explicit override keep it untouched.
function bakeEffectiveOverrides(slots: AVVisualizerTabSavedSession['slots']): AVVisualizerTabSavedSession['slots'] {
  const charactersById = useCharacterStore.getState().charactersById
  const relicsById = useRelicStore.getState().relicsById
  return slots.map((slot): Slot => {
    if (!slot.characterId) return slot
    const character = charactersById[slot.characterId as CharacterId]
    if (!character) return slot
    const { displayRelics } = getPreviewRelics(ShowcaseSource.CHARACTER_TAB, character, relicsById, null)
    const stats = getShowcaseStats(character, displayRelics, null)
    return mergeEffectiveOverrides(slot, {
      spd: stats[Stats.SPD],
      err: stats[Stats.ERR],
      eidolon: character.form.characterEidolon,
    })
  }) as AVVisualizerTabSavedSession['slots']
}

// Loose shape check before accepting an imported file as a real saved session — rejects anything that's
// clearly not one (wrong file, unrelated JSON, corrupted data) rather than silently applying garbage.
function isValidSavedSession(json: unknown): json is AVVisualizerTabSavedSession {
  if (!json || typeof json !== 'object') return false
  const s = json as Record<string, unknown>
  return Array.isArray(s.slots) && s.slots.length === 4
    && Array.isArray(s.waves) && s.waves.length > 0 && s.waves.every(isValidWave)
    && typeof s.currentWaveIndex === 'number'
}

function isValidWave(json: unknown): json is Wave {
  if (!json || typeof json !== 'object') return false
  const w = json as Record<string, unknown>
  return Array.isArray(w.interventions)
    && Array.isArray(w.actionOverrides)
    && Array.isArray(w.ultInsertions)
    && typeof w.rowCount === 'number'
    && typeof w.mocFirstRow === 'boolean'
}

function currentWave(session: AVVisualizerTabSavedSession): Wave {
  return session.waves[session.currentWaveIndex]
}

// Memory of Chaos first-cycle AV: the in-game first cycle is fixed at 150, every other cycle is 100 (= ROW_SIZE)
const MOC_FIRST_ROW_SIZE = 150

// Start AV of row rowIndex: when MoC mode is on, row 0 is 150 wide; every other row still accumulates by ROW_SIZE
function rowStartAt(rowIndex: number, mocFirstRow: boolean): number {
  if (!mocFirstRow) return rowIndex * ROW_SIZE
  if (rowIndex <= 0) return 0
  return MOC_FIRST_ROW_SIZE + (rowIndex - 1) * ROW_SIZE
}

// Width (AV span) of row rowIndex
function rowSizeAt(rowIndex: number, mocFirstRow: boolean): number {
  return (mocFirstRow && rowIndex === 0) ? MOC_FIRST_ROW_SIZE : ROW_SIZE
}

// Inverse of rowStartAt — which row index a given AV falls into. Used so switching into single-row
// display mode lands on whichever row the Playhead is already on, instead of always resetting to row 0.
function rowIndexForAv(av: number, mocFirstRow: boolean): number {
  if (mocFirstRow) {
    if (av < MOC_FIRST_ROW_SIZE) return 0
    return 1 + Math.floor((av - MOC_FIRST_ROW_SIZE) / ROW_SIZE)
  }
  return Math.floor(av / ROW_SIZE)
}

export const AvVisualTabController = {

  // ---- Slot operations (character selection persists across sessions, see savedSession) ----

  setSlotCharacter(slotIndex: number, characterId: string | null) {
    useAVVisualTabStore.getState().setSlotCharacter(slotIndex, characterId)
    SaveState.delayedSave()
  },

  setSlotSpdOverride(slotIndex: number, spd: number) {
    useAVVisualTabStore.getState().setSlotSpdOverride(slotIndex, spd)
    SaveState.delayedSave()
  },

  resetSlotSpdOverride(slotIndex: number) {
    useAVVisualTabStore.getState().resetSlotSpdOverride(slotIndex)
    SaveState.delayedSave()
  },

  setSlotErrOverride(slotIndex: number, err: number) {
    useAVVisualTabStore.getState().setSlotErrOverride(slotIndex, err)
    SaveState.delayedSave()
  },

  resetSlotErrOverride(slotIndex: number) {
    useAVVisualTabStore.getState().resetSlotErrOverride(slotIndex)
    SaveState.delayedSave()
  },

  setSlotEidolonOverride(slotIndex: number, eidolon: number) {
    useAVVisualTabStore.getState().setSlotEidolonOverride(slotIndex, eidolon)
    SaveState.delayedSave()
  },

  resetSlotEidolonOverride(slotIndex: number) {
    useAVVisualTabStore.getState().resetSlotEidolonOverride(slotIndex)
    SaveState.delayedSave()
  },

  addRow() {
    useAVVisualTabStore.getState().addRow()
    SaveState.delayedSave()
  },

  removeRow() {
    useAVVisualTabStore.getState().removeRow()
    SaveState.delayedSave()
    // Keep singleRowIndex in bounds — rowCount may have just shrunk past whatever row was showing.
    const state = useAVVisualTabStore.getState()
    const clamped = Math.min(currentWave(state.savedSession).rowCount - 1, state.singleRowIndex)
    if (clamped !== state.singleRowIndex) state.setSingleRowIndex(clamped)
  },

  setMocFirstRow(value: boolean) {
    useAVVisualTabStore.getState().setMocFirstRow(value)
    SaveState.delayedSave()
  },

  // Not persisted (session-only view state), so no delayedSave() here
  setPlayheadAv(av: number) {
    useAVVisualTabStore.getState().setPlayheadAv(av)
  },

  // ---- Timeline display mode (session-only view state, no delayedSave()) ----

  setTimelineDisplayMode(mode: 'all' | 'single') {
    const state = useAVVisualTabStore.getState()
    state.setTimelineDisplayMode(mode)
    // Land on whichever row the Playhead is already on, not always row 0 — switching modes shouldn't
    // make the user lose their place.
    if (mode === 'single') {
      const { mocFirstRow, rowCount } = currentWave(state.savedSession)
      const rowIndex = Math.min(rowCount - 1, Math.max(0, rowIndexForAv(state.playheadAv, mocFirstRow)))
      state.setSingleRowIndex(rowIndex)
    }
  },

  // Paging in single-row mode also moves the Playhead to the new row's start, so the always-visible side
  // panels (energy overview / character detail) refresh to match what's now on screen.
  setSingleRowIndex(index: number) {
    const state = useAVVisualTabStore.getState()
    const { mocFirstRow, rowCount } = currentWave(state.savedSession)
    const clamped = Math.min(rowCount - 1, Math.max(0, index))
    state.setSingleRowIndex(clamped)
    state.setPlayheadAv(rowStartAt(clamped, mocFirstRow))
  },

  // ---- Intervention CRUD ----

  addIntervention(iv: Omit<Intervention, 'id'>) {
    useAVVisualTabStore.getState().addIntervention(iv)
    SaveState.delayedSave()
  },

  removeIntervention(id: string) {
    useAVVisualTabStore.getState().removeIntervention(id)
    SaveState.delayedSave()
  },

  updateIntervention(id: string, patch: Partial<Omit<Intervention, 'id'>>) {
    useAVVisualTabStore.getState().updateIntervention(id, patch)
    SaveState.delayedSave()
  },

  clearInterventions() {
    useAVVisualTabStore.getState().clearInterventions()
    SaveState.delayedSave()
  },

  // ---- ActionNodeOverride CRUD ----

  setActionOverride(override: ActionNodeOverride) {
    useAVVisualTabStore.getState().setActionOverride(override)
    SaveState.delayedSave()
  },

  removeActionOverride(characterId: string, actionIndex: number) {
    useAVVisualTabStore.getState().removeActionOverride(characterId, actionIndex)
    SaveState.delayedSave()
  },

  clearActionOverrides() {
    useAVVisualTabStore.getState().clearActionOverrides()
    SaveState.delayedSave()
  },

  // ---- UltInsertion CRUD ----

  addUltInsertion(insertion: Omit<UltInsertion, 'id'>, insertAfterId?: string, insertBeforeUltId?: string) {
    const full = { ...insertion, id: uuid() }
    const store = useAVVisualTabStore.getState()
    if (insertAfterId) {
      store.addUltInsertionAfter(insertAfterId, full)
    } else if (insertBeforeUltId) {
      store.addUltInsertionBefore(insertBeforeUltId, full)
    } else {
      store.addUltInsertion(full)
    }
    SaveState.delayedSave()
  },

  removeUltInsertion(id: string) {
    useAVVisualTabStore.getState().removeUltInsertion(id)
    SaveState.delayedSave()
  },

  clearUltInsertions() {
    useAVVisualTabStore.getState().clearUltInsertions()
    SaveState.delayedSave()
  },

  // Clears every added intervention/override/ult insertion in the CURRENT wave, back to the state right
  // after picking characters (or, for a later wave, right after its own seedState) — leaves slots
  // (character/SPD/ERR/eidolon picks) and row count/MoC toggle untouched.
  resetTimeline() {
    useAVVisualTabStore.getState().patchCurrentWave({ interventions: [], actionOverrides: [], ultInsertions: [] })
    SaveState.delayedSave()
  },

  // ---- Simulation engine wrapper ----

  simulate(entities: BattleEntity[], interventions: Intervention[], totalAv: number): SimulationResult {
    const wave = currentWave(useAVVisualTabStore.getState().savedSession)
    return simulateBattle(entities, interventions, wave.actionOverrides, wave.ultInsertions, totalAv, wave.seedState)
  },

  // ---- Wave (混沌回忆换面) operations ----

  setCurrentWaveIndex(index: number) {
    useAVVisualTabStore.getState().setCurrentWaveIndex(index)
    // Not persisted as a meaningful "edit" by itself, but the index IS part of savedSession, so still
    // worth remembering which wave was last being viewed across reloads.
    SaveState.delayedSave()
  },

  // Cuts the current wave's timeline at `cutoffAv`: rows after the one containing the cutoff are
  // dropped, along with anything (interventions/overrides/Ult insertions) scheduled strictly after the
  // cutoff point — the fight is over there, so nothing after it is meaningful. A new wave is created
  // starting fresh at AV 0, seeded with `seedState` (the carried-over energy/buffs/team SP at that exact
  // point) instead of the normal onBattleStart baseline.
  cutWaveAtPlayhead(cutoffAv: number, seedState: WaveSeedState) {
    const state = useAVVisualTabStore.getState()
    const wave = currentWave(state.savedSession)
    const keptRowCount = Math.max(1, rowIndexForAv(cutoffAv, wave.mocFirstRow) + 1)
    state.patchCurrentWave({
      rowCount: keptRowCount,
      interventions: wave.interventions.filter((iv) => iv.triggerAv <= cutoffAv),
      actionOverrides: wave.actionOverrides,
      ultInsertions: wave.ultInsertions.filter((u) => u.timing.type !== 'at_av' || u.timing.av <= cutoffAv),
      cutoffAv,
    })
    state.addWaveAndSwitch({ ...emptyWave(), seedState })
    SaveState.delayedSave()
  },

  // Only ever removes the LAST wave (no-op with just one left) — deleting a middle wave would orphan
  // whatever comes after it, and there's no stored history to undo the wave before it being cut in the
  // first place (see cutWaveAtPlayhead's own doc comment) — that wave stays however the cut left it.
  removeLastWave() {
    useAVVisualTabStore.getState().removeLastWave()
    SaveState.delayedSave()
  },

  // ---- Helper math ----

  avToRowPercent(av: number, rowStart: number, rowSize: number): number {
    return ((av - rowStart) / rowSize) * 100
  },

  // Color by the character's actual element (matches the element icon's color in-game) rather than slot
  // position. Companions (e.g. Mimi) have no element of their own in metadata, so they fall back to
  // their owner's — passed in via ownerId. SLOT_COLORS is only a last-resort fallback for characters
  // metadata can't resolve at all (shouldn't happen for real playable characters).
  getCharacterColor(characterId: string, ownerId?: string, slotIndex = 0): string {
    const element = getGameMetadata().characters?.[characterId as CharacterId]?.element
      ?? (ownerId ? getGameMetadata().characters?.[ownerId as CharacterId]?.element : undefined)
    return element ? ELEMENT_COLORS[element] : SLOT_COLORS[slotIndex % SLOT_COLORS.length]
  },

  // ---- Row sizing (Memory of Chaos mode: row 0 is 150 AV, every other row is 100) ----

  getRowStart(rowIndex: number, mocFirstRow: boolean): number {
    return rowStartAt(rowIndex, mocFirstRow)
  },

  getRowSize(rowIndex: number, mocFirstRow: boolean): number {
    return rowSizeAt(rowIndex, mocFirstRow)
  },

  // Equivalent to the start AV of "row rowCount", i.e. the total AV span of the first rowCount rows
  getTotalAv(rowCount: number, mocFirstRow: boolean): number {
    return rowStartAt(rowCount, mocFirstRow)
  },

  // ---- Session export/import (for sharing an exact reproducible state, e.g. when reporting a bug) ----

  exportSession(): void {
    const session = useAVVisualTabStore.getState().savedSession
    const exportedSession: AVVisualizerTabSavedSession = { ...session, slots: bakeEffectiveOverrides(session.slots) }
    const blob = new Blob([JSON.stringify(exportedSession, null, 2)], { type: 'text/json;charset=utf-8' })
    const blobURL = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = blobURL
    a.download = 'av-visualizer-session.json'
    a.style.display = 'none'
    document.body.append(a)
    a.click()
    setTimeout(() => {
      URL.revokeObjectURL(blobURL)
      a.remove()
    }, 1000)
  },

  // Returns false (and applies nothing) if json doesn't look like a real saved session.
  importSession(json: unknown): boolean {
    if (!isValidSavedSession(json)) return false
    useAVVisualTabStore.getState().setSavedSession(json)
    SaveState.delayedSave()
    return true
  },

  // @deprecated Will be removed in a future version (superseded by simulate())
  computeActionPoints(spd: number, totalAv: number): number[] {
    if (spd <= 0) return []
    const interval = 10000 / spd
    const points: number[] = []
    let current = interval
    while (current < totalAv) {
      points.push(current)
      current += interval
    }
    return points
  },
}
