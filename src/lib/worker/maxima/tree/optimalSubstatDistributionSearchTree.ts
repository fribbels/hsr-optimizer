import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import {
  StatNode,
  StatRegion,
} from 'lib/worker/maxima/types/substatOptimizationTypes'

export class OptimalSubstatDistributionSearchTree {
  private rootRegion: StatRegion
  private rootNode: StatNode
  private nextNodeId: number = 0

  constructor(
    public dimensions: number,
    public targetSum: number,
    public lower: SubstatCounts,
    public upper: SubstatCounts,
    public effectiveStats: string[],
    public damageFunction: (stats: SubstatCounts) => number,
  ) {
    this.rootRegion = this.createRootRegion()
    this.rootNode = this.createRootNode()
    this.rootNode.damage = damageFunction(this.rootNode.representative)
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

  private generateStartingPoint(): SubstatCounts {
    if (!this.rootRegion) throw new Error('Root region not initialized')

    const result: SubstatCounts = {}

    // Initialize all stats and apply fixed values
    for (const stat of this.rootRegion.statNames) {
      result[stat] = this.rootRegion.fixedStats.includes(stat) ? this.rootRegion.lower[stat] : 0
    }

    // Calculate remaining budget and distribute evenly
    const fixedBudget = this.rootRegion.fixedStats.reduce((sum, stat) => sum + Math.ceil(result[stat]), 0)
    const remaining = this.targetSum - fixedBudget
    const base = Math.floor(remaining / this.rootRegion.variableStats.length)
    const extra = remaining % this.rootRegion.variableStats.length

    this.rootRegion.variableStats.forEach((stat, i) => {
      result[stat] = Math.max(this.rootRegion.lower[stat], Math.min(this.rootRegion.upper[stat], base + (i < extra ? 1 : 0)))
    })

    return result
  }

  private createRootNode(): StatNode {
    const startingPoint = this.generateStartingPoint()
    return {
      region: this.rootRegion,
      representative: startingPoint,
      damage: null, // Will be set when we add damage evaluation
      priority: 0, // Will be calculated when we add priority system
      splitDimension: null,
      splitValue: null,
      leftChild: null,
      rightChild: null,
      isLeaf: true,
      nodeId: this.nextNodeId++,
    }
  }

  public debugStartingPoint(): void {
    if (!this.rootRegion) return

    const point = this.generateStartingPoint()
    const budgetUsed = this.rootRegion.fixedStats.reduce((sum, stat) => sum + Math.ceil(point[stat]), 0)
      + this.rootRegion.variableStats.reduce((sum, stat) => sum + point[stat], 0)

    console.log('Starting Point:', point)
    console.log('Budget used:', budgetUsed, '/ target:', this.targetSum)
  }

  public debugRootNode(): void {
    if (!this.rootNode) return

    console.log('Root Node Debug:')
    console.log('- Node ID:', this.rootNode.nodeId)
    console.log('- Is Leaf:', this.rootNode.isLeaf)
    console.log('- Representative:', this.rootNode.representative)
    console.log('- Damage:', this.rootNode.damage)
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
