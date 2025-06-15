import {
  Simulation,
  SubstatCounts,
} from 'lib/simulations/statSimulationTypes'

export class Tree {
  constructor(
    public dimensions: number,
    public lower: SubstatCounts,
    public upper: SubstatCounts,
    public effectiveStats: string[]
  ) {
  }
}
