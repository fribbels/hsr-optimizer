import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { simulateBattle, type SimulationResult } from 'lib/tabs/tabAvVisualizer/simulation/simulateBattle'
import { ELEMENT_COLORS, ROW_SIZE, SLOT_COLORS } from 'lib/tabs/tabAvVisualizer/constants'
import type { ActionNodeOverride, BattleEntity, Intervention, UltInsertion } from 'lib/tabs/tabAvVisualizer/types'
import type { AVVisualizerTabSavedSession } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { uuid } from 'lib/utils/miscUtils'
import type { CharacterId } from 'types/character'

// Loose shape check before accepting an imported file as a real saved session — rejects anything that's
// clearly not one (wrong file, unrelated JSON, corrupted data) rather than silently applying garbage.
function isValidSavedSession(json: unknown): json is AVVisualizerTabSavedSession {
  if (!json || typeof json !== 'object') return false
  const s = json as Record<string, unknown>
  return Array.isArray(s.slots) && s.slots.length === 4
    && Array.isArray(s.interventions)
    && Array.isArray(s.actionOverrides)
    && Array.isArray(s.ultInsertions)
    && typeof s.rowCount === 'number'
    && typeof s.mocFirstRow === 'boolean'
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

  setMocFirstRow(value: boolean) {
    useAVVisualTabStore.getState().setMocFirstRow(value)
    SaveState.delayedSave()
  },

  // Not persisted (session-only view state), so no delayedSave() here
  setPlayheadAv(av: number) {
    useAVVisualTabStore.getState().setPlayheadAv(av)
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

  // Clears every added intervention/override/ult insertion, back to the state right after picking
  // characters — leaves slots (character/SPD/ERR/eidolon picks) and row count/MoC toggle untouched.
  resetTimeline() {
    useAVVisualTabStore.getState().setSavedSession({ interventions: [], actionOverrides: [], ultInsertions: [] })
    SaveState.delayedSave()
  },

  // ---- Simulation engine wrapper ----

  simulate(entities: BattleEntity[], interventions: Intervention[], totalAv: number): SimulationResult {
    const { actionOverrides, ultInsertions } = useAVVisualTabStore.getState().savedSession
    return simulateBattle(entities, interventions, actionOverrides, ultInsertions, totalAv)
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
    const blob = new Blob([JSON.stringify(session, null, 2)], { type: 'text/json;charset=utf-8' })
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
