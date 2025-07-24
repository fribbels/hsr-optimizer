import { SubstatCounts } from 'lib/simulations/statSimulationTypes'
import { sumArray } from 'lib/utils/mathUtils'
import {
  ProtoTreeStatNode,
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
