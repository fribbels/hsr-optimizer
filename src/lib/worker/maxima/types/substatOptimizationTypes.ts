import { SubstatCounts } from 'lib/simulations/statSimulationTypes'

export interface StatRegion {
  lower: SubstatCounts
  upper: SubstatCounts
  statNames: string[]
  variableStats: string[]
  fixedStats: string[]
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
