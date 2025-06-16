import { SubstatCounts } from 'lib/simulations/statSimulationTypes'

export interface StatRegion {
  lower: SubstatCounts
  upper: SubstatCounts
  statNames: readonly string[]
  variableStats: readonly string[]
  fixedStats: readonly string[]
}

export interface StatNode {
  region: StatRegion
  representative: SubstatCounts
  damage: number | null
  priority: number
  splitDimension: string | null
  splitValue: number | null
  leftChild: StatNode | null
  rightChild: StatNode | null
  isLeaf: boolean
  nodeId: number
}
