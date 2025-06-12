import {
  StatOptimizationConfig,
  StatRegion,
} from 'lib/worker/maxima/core'

export class StatValidationUtils {
  static validateDimensions(point: Float32Array, expectedDimensions: number): void
  static validateBounds(point: Float32Array, min: Float32Array, max: Float32Array): void
  static validateSum(point: Float32Array, expectedSum: number, tolerance: number): void
  static validateRegion(region: StatRegion): void
  static validateConfig(config: StatOptimizationConfig): void
  static sanitizePoint(point: Float32Array): Float32Array
  static sanitizeRegion(region: StatRegion): StatRegion
}
