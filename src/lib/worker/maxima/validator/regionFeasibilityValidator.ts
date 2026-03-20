import {
  type SearchTree,
  type TreeStatRegion,
} from 'lib/worker/maxima/tree/searchTree'

export function isRegionFeasible(region: TreeStatRegion, tree: SearchTree): boolean {
  let sumMin = 0
  let sumMax = 0
  let sumPossibleSlots = 0

  for (let i = 0; i < tree.allStats.length; i++) {
    const statIdx = tree.allStats[i]
    const lowerVal = region.lower[statIdx]
    sumMin += lowerVal
    sumMax += region.upper[statIdx]
    sumPossibleSlots += Math.min(lowerVal, tree.getAvailablePieces(statIdx))
  }

  sumMin = Math.ceil(sumMin)
  sumMax = Math.ceil(sumMax)

  if (sumMin > tree.targetSum || sumMax < tree.targetSum) return false

  const slotsThatNeedToBeFilled = 24 - Math.ceil(sumPossibleSlots)
  const remainingSubstatRolls = tree.targetSum - sumMin
  if (slotsThatNeedToBeFilled > remainingSubstatRolls) return false

  return true
}
