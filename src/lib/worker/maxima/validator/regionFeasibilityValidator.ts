import {
  SearchTree,
  TreeStatRegion,
} from 'lib/worker/maxima/tree/searchTree'

/**
 * This is used as a region-level validator, used to prune impossible region from the search tree.
 * This return false only when no possible points in the region could be a valid point.
 * We check constraints using the upper and lower bounds to rule out possible points.
 * However, this does not say that there is a valid point in the region, just that there could be one.
 */
export function isRegionFeasible(region: TreeStatRegion, tree: SearchTree): boolean {
  let sumMin = 0
  let sumMax = 0
  let sumPossibleSlots = 0

  for (let i = 0; i < tree.allStats.length; i++) {
    const stat = tree.allStats[i]
    const lowerVal = region.lower[stat]
    sumMin += lowerVal
    sumMax += region.upper[stat]
    sumPossibleSlots += Math.min(lowerVal, tree.getAvailablePieces(stat))
  }

  sumMin = Math.ceil(sumMin)
  sumMax = Math.ceil(sumMax)

  // The possible ranges must include the target
  if (sumMin > tree.targetSum || sumMax < tree.targetSum) return false

  // Find the unfixable possible slot deficits
  const slotsThatNeedToBeFilled = 24 - Math.ceil(sumPossibleSlots)
  const remainingSubstatRolls = tree.targetSum - sumMin
  if (slotsThatNeedToBeFilled > remainingSubstatRolls) return false

  return true
}