import {
  StatAdjustmentCapacity,
  StatConstraintProjectionResult,
  StatRegion,
  StatValidationResult,
} from 'lib/worker/maxima/core'

export interface IStatConstraintSolver {
  generateRepresentative(region: StatRegion, targetSum: number): Float32Array
  projectToConstraint(point: Float32Array, region: StatRegion, targetSum: number): StatConstraintProjectionResult
  validatePoint(point: Float32Array, region: StatRegion, targetSum: number, tolerance: number): boolean
  validateConstraints(point: Float32Array, region: StatRegion, targetSum: number): StatValidationResult
  calculateAdjustmentCapacities(point: Float32Array, region: StatRegion): StatAdjustmentCapacity[]
  calculateGeometricMidpoint(region: StatRegion): Float32Array
  distributeAdjustment(point: Float32Array, adjustment: number, capacities: readonly StatAdjustmentCapacity[]): Float32Array
  clampToRegionBounds(point: Float32Array, region: StatRegion): Float32Array
  calculateSum(point: Float32Array): number
  calculateDistance(point1: Float32Array, point2: Float32Array): number
  findConstraintBoundary(region: StatRegion, targetSum: number): Float32Array[]
  repairConstraintViolations(point: Float32Array, region: StatRegion, targetSum: number): Float32Array
  generateAlternativeRepresentatives(region: StatRegion, targetSum: number, count: number): Float32Array[]
}
