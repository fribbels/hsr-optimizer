import {
  Simulation,
  SubstatCounts,
} from 'lib/simulations/statSimulationTypes'
import { StatRegion } from 'lib/worker/maxima/types/substatOptimizationTypes'

export class OptimalSubstatDistributionSearchTree {
  private rootRegion: StatRegion

  constructor(
    public dimensions: number,
    public lower: SubstatCounts,
    public upper: SubstatCounts,
    public effectiveStats: string[],
  ) {
    this.rootRegion = this.createRootRegion()
  }

  private createRootRegion(): StatRegion {
    // Identify fixed vs variable stats
    const fixedStats: string[] = []
    const variableStats: string[] = []

    for (const stat of this.effectiveStats) {
      if (this.lower[stat] === this.upper[stat]) {
        fixedStats.push(stat)
      } else {
        variableStats.push(stat)
      }
    }

    return {
      lower: { ...this.lower },
      upper: { ...this.upper },
      statNames: this.effectiveStats,
      variableStats,
      fixedStats,
    }
  }

  private getStatRange(region: StatRegion, stat: string): number {
    return region.upper[stat] - region.lower[stat]
  }

  public debugRootRegion(): void {
    if (!this.rootRegion) return

    console.log('Root Region Debug:')
    console.log('- Total stats:', this.rootRegion.statNames.length)
    console.log('- Variable stats:', this.rootRegion.variableStats)
    console.log('- Fixed stats:', this.rootRegion.fixedStats)

    for (const stat of this.rootRegion.statNames) {
      const range = this.getStatRange(this.rootRegion, stat)
      console.log(`- ${stat}: [${this.rootRegion.lower[stat]}, ${this.rootRegion.upper[stat]}] (range: ${range})`)
    }
  }
}
