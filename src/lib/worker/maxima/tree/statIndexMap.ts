import { Stats, SubStats } from 'lib/constants/constants'
import type { SubstatCounts } from 'lib/simulations/statSimulationTypes'

export const SUBSTAT_COUNT = SubStats.length

export const STAT_INDEX: Record<string, number> = {}
for (let i = 0; i < SubStats.length; i++) {
  STAT_INDEX[SubStats[i]] = i
}

export const SPD_INDEX = STAT_INDEX[Stats.SPD]

export function toFloat32Array(record: SubstatCounts): Float32Array {
  const arr = new Float32Array(SUBSTAT_COUNT)
  for (let i = 0; i < SubStats.length; i++) {
    arr[i] = record[SubStats[i]] ?? 0
  }
  return arr
}

export function writeToSubstatCounts(arr: Float32Array, target: SubstatCounts): SubstatCounts {
  for (let i = 0; i < SubStats.length; i++) {
    target[SubStats[i]] = arr[i]
  }
  return target
}

export function toSubstatCounts(arr: Float32Array): SubstatCounts {
  const result: SubstatCounts = {}
  for (let i = 0; i < SubStats.length; i++) {
    result[SubStats[i]] = arr[i]
  }
  return result
}
