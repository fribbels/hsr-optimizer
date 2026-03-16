import type { StatSimType } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'

export const STAT_SIMULATION_ROW_HEIGHT = 425
export const STAT_SIMULATION_GRID_WIDTH = 750
export const STAT_SIMULATION_OPTIONS_WIDTH = 215
export const STAT_SIMULATION_STATS_WIDTH = 190
export const STAT_SIMULATION_INPUT_WIDTH = 70

// Helper to read a field from the statSim store
export function useStatSimField<T = unknown>(simType: StatSimType, field: string): T | undefined {
  return useOptimizerRequestStore((s) => {
    const section = s.statSim?.[simType] as Record<string, unknown> | undefined
    return section?.[field] as T | undefined
  })
}

// Helper to read a stat value from the statSim store
export function useStatSimStat(simType: StatSimType, statName: string): number | undefined {
  return useOptimizerRequestStore((s) => {
    const section = s.statSim?.[simType] as Record<string, Record<string, number>> | undefined
    return section?.stats?.[statName]
  })
}
