import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'

export const STAT_SIMULATION_ROW_HEIGHT = 425
export const STAT_SIMULATION_GRID_WIDTH = 680
export const STAT_SIMULATION_OPTIONS_WIDTH = 215
export const STAT_SIMULATION_STATS_WIDTH = 190

// Helper to read a field from the statSim store
export function useStatSimField<T = unknown>(simType: string, field: string): T | undefined {
  return useOptimizerFormStore((s) => {
    const sim = s.statSim as Record<string, Record<string, unknown>> | undefined
    return sim?.[simType]?.[field] as T | undefined
  })
}

// Helper to read a stat value from the statSim store
export function useStatSimStat(simType: string, statName: string): number | undefined {
  return useOptimizerFormStore((s) => {
    const sim = s.statSim as Record<string, Record<string, Record<string, number>>> | undefined
    return sim?.[simType]?.stats?.[statName]
  })
}
