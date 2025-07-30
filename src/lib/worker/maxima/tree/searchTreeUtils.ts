import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import { sumArray } from 'lib/utils/mathUtils'
import {
  ProtoTreeStatNode,
  SearchTree,
  TreeConfig,
  TreeStatNode,
  TreeStatRegion,
} from 'lib/worker/maxima/tree/searchTree'

export function calculateMinMaxMetadata(lower: SubstatCounts, upper: SubstatCounts) {
  const fixedStats: SubstatCounts = {}
  const activeStats: string[] = []
  for (const stat of Object.keys(lower)) {
    if (lower[stat] == upper[stat]) {
      fixedStats[stat] = upper[stat]
    } else {
      activeStats.push(stat)
    }
  }
  const fixedSum = sumArray(Object.values(fixedStats))
  const dimensions = activeStats.length

  return {
    dimensions,
    fixedSum,
    fixedStats,
    activeStats,
  }
}

export function splitNode(node: TreeStatNode, dimension: string) {
  const midpoint = calculateRegionMidpoint(node.region, dimension)

  const lowerRegion: TreeStatRegion = {
    lower: {
      ...node.region.lower,
    },
    upper: {
      ...node.region.upper,
      [dimension]: midpoint - 1,
    },
  }

  const upperRegion: TreeStatRegion = {
    lower: {
      ...node.region.lower,
      [dimension]: midpoint,
    },
    upper: {
      ...node.region.upper,
    },
  }

  return {
    midpoint,
    lowerRegion,
    upperRegion,
  }
}

export function calculateRegionMidpoint(region: TreeStatRegion, dimension: string) {
  return Math.ceil((region.upper[dimension] - region.lower[dimension]) / 2) + region.lower[dimension]
}

// Efficient unique id generator for a point, only works up to 8 dimensions
export function pointToBitwiseId(point: SubstatCounts, activeStats: string[]) {
  let result = 0
  for (let i = 0; i < activeStats.length; i++) {
    result |= point[activeStats[i]] << (i * 6) // 6 bits per number, [0, 63]
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
      throw new Error()
  }
}

function generateConfig(maximumBudget: number): TreeConfig {
  return {
    explorationLimit: maximumBudget * 0.05,
    transitionLimit: maximumBudget * 0.5,
    refinementLimit: maximumBudget,
  }
}
