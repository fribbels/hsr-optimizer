import {
  StatDamageFunction,
  StatEvaluationRecord,
  StatOptimizationConfig,
  StatOptimizationResult,
  StatSearchState,
  StatValidatorFunction,
} from 'lib/worker/maxima/core'

export interface IStatOptimizationOrchestrator {
  optimize(damageFunction: StatDamageFunction, config: StatOptimizationConfig): Promise<StatOptimizationResult>
  initializeSearch(damageFunction: StatDamageFunction, config: StatOptimizationConfig): StatSearchState
  performIteration(searchState: StatSearchState, damageFunction: StatDamageFunction): StatSearchState
  updateBestSolution(searchState: StatSearchState, candidatePoint: Float32Array, candidateDamage: number, evaluationNumber: number): void
  recordEvaluation(
    evaluationHistory: StatEvaluationRecord[],
    point: Float32Array,
    damage: number,
    evaluationNumber: number,
    nodeId: number,
    wasImprovement: boolean,
  ): void
  shouldTerminate(searchState: StatSearchState): boolean
  getOptimizationProgress(searchState: StatSearchState): number
  exportSearchState(searchState: StatSearchState): string
  importSearchState(serializedState: string): StatSearchState
}

export class StatOptimizerFactory {
  static createDefault(validator: StatValidatorFunction, config: StatOptimizationConfig): IStatOptimizationOrchestrator
  static createWithCustomStrategies(
    validator: StatValidatorFunction,
    config: StatOptimizationConfig,
    strategies: {
      splitStrategy?: any,
      priorityStrategy?: any,
      representativeStrategy?: any,
    },
  ): IStatOptimizationOrchestrator
  static createForDimensions(dimensions: number, validator: StatValidatorFunction): IStatOptimizationOrchestrator
}

// test
