import { StatRegion } from 'lib/worker/maxima/core'

export interface IStatRegionCalculator {
  createInitialRegion(dimensions: number, globalBounds: readonly [number, number]): StatRegion
  calculateVolume(region: StatRegion): number
  calculateRange(region: StatRegion, dimension: number): number
  findLargestRangeDimension(region: StatRegion): number
  calculateMidpoint(region: StatRegion, dimension: number): number
  splitAtValue(region: StatRegion, dimension: number, value: number): readonly [StatRegion, StatRegion]
  isValid(region: StatRegion): boolean
  isSplittable(region: StatRegion, minRange: number): boolean
  validateDimensions(region: StatRegion, expectedDimensions: number): boolean
  createRegionFromBounds(lower: Float32Array, upper: Float32Array): StatRegion
  copyRegion(region: StatRegion): StatRegion
  getRegionCenter(region: StatRegion): Float32Array
  getRegionSize(region: StatRegion): Float32Array
  intersectRegions(region1: StatRegion, region2: StatRegion): StatRegion | null
  containsPoint(region: StatRegion, point: Float32Array): boolean
}
