export interface StatRegion {
  readonly lower: Float32Array
  readonly upper: Float32Array
  readonly dimensions: number
}

export interface StatNode {
  readonly region: StatRegion
  representative: Float32Array | null
  damage: number | null
  priority: number
  splitDimension: number | null
  splitValue: number | null
  leftChild: StatNode | null
  rightChild: StatNode | null
  isLeaf: boolean
  readonly nodeId: number
}

export interface StatAdjustmentCapacity {
  readonly dimension: number
  readonly canIncrease: number
  readonly canDecrease: number
}

export interface StatOptimizationConfig {
  readonly dimensions: number
  readonly targetSum: number
  readonly maxEvaluations: number
  readonly explorationWeight: number
  readonly minSplitRange: number
  readonly constraintTolerance: number
  readonly globalBounds: readonly [number, number]
}

export interface StatSearchState {
  readonly root: StatNode
  bestPoint: Float32Array
  bestDamage: number
  evaluationsUsed: number
  readonly maxEvaluations: number
  readonly explorationWeight: number
  readonly evaluationHistory: StatEvaluationRecord[]
  readonly dimensions: number
  readonly targetSum: number
}

export interface StatOptimizationResult {
  readonly bestPoint: Float32Array
  readonly bestDamage: number
  readonly evaluationsUsed: number
  readonly totalNodes: number
  readonly searchTree: StatNode
  readonly evaluationHistory: readonly StatEvaluationRecord[]
  readonly dimensions: number
}

export interface StatEvaluationRecord {
  readonly point: Float32Array
  readonly damage: number
  readonly evaluationNumber: number
  readonly nodeId: number
  readonly wasImprovement: boolean
  readonly dimensions: number
}

export interface StatConstraintProjectionResult {
  readonly point: Float32Array
  readonly converged: boolean
  readonly iterations: number
  readonly finalError: number
  readonly dimensions: number
}

export interface StatValidationResult {
  readonly isValid: boolean
  readonly sumValid: boolean
  readonly boundsValid: boolean
  readonly gameRulesValid: boolean
  readonly dimensionsValid: boolean
  readonly errors: readonly string[]
}

export interface StatTreeStats {
  readonly totalNodes: number
  readonly leafNodes: number
  readonly internalNodes: number
  readonly maxDepth: number
  readonly avgLeafDepth: number
  readonly dimensions: number
}

export type StatDamageFunction = (point: Float32Array, dimensions: number) => number
export type StatValidatorFunction = (point: Float32Array, dimensions: number) => boolean
