import { IStatConstraintSolver } from 'lib/worker/maxima/constraintSolver'
import {
  StatDamageFunction,
  StatNode,
} from 'lib/worker/maxima/core'
import { IStatRegionCalculator } from 'lib/worker/maxima/regionCalculator'

export interface IStatSearchEngine {
  calculatePriority(damage: number, regionSize: number, explorationWeight: number): number
  shouldSplit(node: StatNode, evaluationsUsed: number, maxEvaluations: number, minSplitRange: number): boolean
  selectNextNode(leaves: readonly StatNode[]): StatNode | null
  selectNextNodes(leaves: readonly StatNode[], count: number): StatNode[]
  hasRemainingBudget(evaluationsUsed: number, maxEvaluations: number, reserveCount?: number): boolean
  evaluateNode(node: StatNode, damageFunction: StatDamageFunction, constraintSolver: IStatConstraintSolver, targetSum: number): number
  updateNodePriority(node: StatNode, explorationWeight: number, regionCalculator: IStatRegionCalculator): void
  updateAllPriorities(nodes: StatNode[], explorationWeight: number, regionCalculator: IStatRegionCalculator): void
  estimateRemainingIterations(evaluationsUsed: number, avgEvaluationsPerIteration: number, maxEvaluations: number): number
  calculateBudgetUtilization(evaluationsUsed: number, maxEvaluations: number): number
  determineOptimalExplorationWeight(currentProgress: number): number
  shouldTerminateEarly(evaluationsUsed: number, bestDamageHistory: readonly number[]): boolean
}
