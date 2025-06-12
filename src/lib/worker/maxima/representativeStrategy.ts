import { StatRegion } from 'lib/worker/maxima/core'

export interface IStatRepresentativeStrategy {
  generateRepresentative(region: StatRegion, targetSum: number): Float32Array
  generateMultipleRepresentatives(region: StatRegion, targetSum: number, count: number): Float32Array[]
  validateRepresentative(point: Float32Array, region: StatRegion, targetSum: number): boolean
  estimateRepresentativeQuality(point: Float32Array, region: StatRegion): number
}
