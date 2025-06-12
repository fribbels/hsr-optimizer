import { StatRegion } from 'lib/worker/maxima/core'

export interface IStatSplitStrategy {
  chooseSplitDimension(region: StatRegion): number
  chooseSplitValue(region: StatRegion, dimension: number): number
  validateSplit(region: StatRegion, dimension: number, value: number): boolean
  estimateSplitQuality(region: StatRegion, dimension: number, value: number): number
}

export interface IAdaptiveStatSplitStrategy extends IStatSplitStrategy {
  updateStrategy(searchHistory: readonly any[]): void
  getStrategyStats(): Record<string, number>
}
