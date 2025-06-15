import { SubstatCounts } from 'lib/simulations/statSimulationTypes'

export interface StatRegion {
  lower: SubstatCounts
  upper: SubstatCounts
  statNames: readonly string[]
  variableStats: readonly string[]
  fixedStats: readonly string[]
}
