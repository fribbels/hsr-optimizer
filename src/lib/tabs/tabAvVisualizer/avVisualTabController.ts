import { SaveState } from 'lib/state/saveState'
import { simulateTimeline } from 'lib/tabs/tabAvVisualizer/simulation/simulateTimeline'
import { ROW_SIZE } from 'lib/tabs/tabAvVisualizer/constants'
import type { Intervention, SimEvent } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'

// TimelineCharacter is defined in Timeline.tsx; here we only need id + spd + baseSpd
// baseSpd (white value, no relics) is required by simulateTimeline for percent-based speed buff math
type SimInput = {
  id: string
  spd: number
  baseSpd: number
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

  addRow() {
    useAVVisualTabStore.getState().addRow()
  },

  setMocFirstRow(value: boolean) {
    useAVVisualTabStore.getState().setMocFirstRow(value)
  },

  // ---- Intervention CRUD ----

  addIntervention(iv: Omit<Intervention, 'id'>) {
    useAVVisualTabStore.getState().addIntervention(iv)
  },

  removeIntervention(id: string) {
    useAVVisualTabStore.getState().removeIntervention(id)
  },

  updateIntervention(id: string, patch: Partial<Omit<Intervention, 'id'>>) {
    useAVVisualTabStore.getState().updateIntervention(id, patch)
  },

  clearInterventions() {
    useAVVisualTabStore.getState().clearInterventions()
  },

  // ---- Simulation engine wrapper ----

  simulate(characters: SimInput[], interventions: Intervention[], totalAv: number): SimEvent[] {
    return simulateTimeline(characters, interventions, totalAv)
  },

  // ---- Helper math ----

  avToRowPercent(av: number, rowStart: number, rowSize: number): number {
    return ((av - rowStart) / rowSize) * 100
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
