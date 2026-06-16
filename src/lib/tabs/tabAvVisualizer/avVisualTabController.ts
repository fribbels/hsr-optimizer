import { SaveState } from 'lib/state/saveState'
import { simulateTimeline } from 'lib/tabs/tabAvVisualizer/simulation/simulateTimeline'
import { ROW_SIZE } from 'lib/tabs/tabAvVisualizer/constants'
import type { Intervention, SimEvent } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'

// TimelineCharacter 在 Timeline.tsx 中定义，此处只需要 id + spd + baseSpd 三个字段
// baseSpd（白值，不含遗器）是 simulateTimeline 计算百分比速度 buff 的必需输入
type SimInput = {
  id: string
  spd: number
  baseSpd: number
}

// 混沌回忆首回合 AV：游戏内首回合机制固定为 150，其余回合为 100（= ROW_SIZE）
const MOC_FIRST_ROW_SIZE = 150

// 第 rowIndex 行的起始 AV：开启混沌回忆模式时第 0 行宽度为 150，其余行仍按 ROW_SIZE 累加
function rowStartAt(rowIndex: number, mocFirstRow: boolean): number {
  if (!mocFirstRow) return rowIndex * ROW_SIZE
  if (rowIndex <= 0) return 0
  return MOC_FIRST_ROW_SIZE + (rowIndex - 1) * ROW_SIZE
}

// 第 rowIndex 行的宽度（AV 跨度）
function rowSizeAt(rowIndex: number, mocFirstRow: boolean): number {
  return (mocFirstRow && rowIndex === 0) ? MOC_FIRST_ROW_SIZE : ROW_SIZE
}

export const AvVisualTabController = {

  // ---- 槽位操作（角色选择跨会话持久化，见 savedSession） ----

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

  // ---- 干预 CRUD ----

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

  // ---- 模拟引擎包装 ----

  simulate(characters: SimInput[], interventions: Intervention[], totalAv: number): SimEvent[] {
    return simulateTimeline(characters, interventions, totalAv)
  },

  // ---- 辅助计算 ----

  avToRowPercent(av: number, rowStart: number, rowSize: number): number {
    return ((av - rowStart) / rowSize) * 100
  },

  // ---- 行尺寸计算（混沌回忆模式：第 0 行 150 AV，其余行 100）----

  getRowStart(rowIndex: number, mocFirstRow: boolean): number {
    return rowStartAt(rowIndex, mocFirstRow)
  },

  getRowSize(rowIndex: number, mocFirstRow: boolean): number {
    return rowSizeAt(rowIndex, mocFirstRow)
  },

  // 等价于"第 rowCount 行"的起始 AV，即前 rowCount 行的 AV 总跨度
  getTotalAv(rowCount: number, mocFirstRow: boolean): number {
    return rowStartAt(rowCount, mocFirstRow)
  },

  // @deprecated 将在后续版本中移除（已被 simulate() 替代）
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
