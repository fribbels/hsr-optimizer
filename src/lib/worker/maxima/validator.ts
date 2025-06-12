export interface IStatDistributionValidator {
  isValidDistribution(point: Float32Array, dimensions: number): boolean
  getValidationErrors(point: Float32Array, dimensions: number): string[]
  suggestCorrections(point: Float32Array, dimensions: number): Float32Array[]
  validatePartialDistribution(point: Float32Array, dimensions: number): boolean
}
