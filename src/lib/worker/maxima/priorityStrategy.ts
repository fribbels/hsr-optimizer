export interface IStatPriorityStrategy {
  calculatePriority(damage: number, regionSize: number, explorationWeight: number, additionalMetrics?: Record<string, number>): number
  updateExplorationWeight(searchProgress: number): number
  shouldBoostPriority(node: any, searchContext: any): boolean
}
