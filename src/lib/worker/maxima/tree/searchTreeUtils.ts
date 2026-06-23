import {
  type SearchTree,
  type TreeConfig,
  type TreeStatRegion,
} from 'lib/worker/maxima/tree/searchTree'
import { SUBSTAT_COUNT } from 'lib/worker/maxima/tree/statIndexMap'

export function calculateMinMaxMetadata(lower: Float32Array, upper: Float32Array) {
  const activeStats: number[] = []
  let fixedSum = 0
  for (let i = 0; i < SUBSTAT_COUNT; i++) {
    if (lower[i] === upper[i]) {
      fixedSum += upper[i]
    } else {
      activeStats.push(i)
    }
  }
  const dimensions = activeStats.length

  return {
    dimensions,
    fixedSum,
    activeStats,
  }
}

export function calculateRegionMidpoint(region: TreeStatRegion, dimension: number) {
  return Math.ceil((region.upper[dimension] - region.lower[dimension]) / 2) + region.lower[dimension]
}

export function pointToBitwiseId(point: Float32Array, activeStats: number[]) {
  let result = 0
  for (let i = 0; i < activeStats.length; i++) {
    result = result * 64 + point[activeStats[i]]
  }
  return result
}

export function getSearchTreeConfig(tree: SearchTree): TreeConfig {
  switch (tree.dimensions) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
    case 5:
      return generateConfig(5000)
    case 6:
      return generateConfig(10000)
    case 7:
      return generateConfig(15000)
    case 8:
      return generateConfig(20000)
    default:
      throw new Error(`Unsupported search tree dimensions: ${tree.dimensions}`)
  }
}

function generateConfig(maximumBudget: number): TreeConfig {
  return {
    explorationLimit: maximumBudget * 0.05,
    transitionLimit: maximumBudget * 0.5,
    refinementLimit: maximumBudget,
  }
}

// Dimension-tuned queue capacities from production profiling.
// damageQueue peaks at ~1× budget. volumeQueue accumulates during refinement and peaks much higher.
// [damageCapacity, volumeCapacity] with ~2-3× headroom over observed maximums.
export function getQueueCapacities(dimensions: number): [number, number] {
  switch (dimensions) {
    case 0:
    case 1:
    case 2:
    case 3:
    case 4:
      return [5_000, 10_000]
    case 5:
      return [10_000, 50_000]
    case 6:
      return [15_000, 100_000]
    case 7:
      return [20_000, 100_000]
    case 8:
      return [20_000, 200_000]
    default:
      return [20_000, 200_000]
  }
}
