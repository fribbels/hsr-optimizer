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
  const { sumMin, sumMax } = calculateSums(region, tree)

  if (!isValidBoundarySums(region, tree, sumMin, sumMax)) return false
  if (!isValidDistributableSlots(region, tree, sumMin)) return false
  
  // Disabled validations:
  // if (!isValidEligibleStats(region, tree)) return false
  // if (!isValidMinimumRolls(region, tree)) return false

  return true
}

function calculateSums(region: TreeStatRegion, tree: SearchTree) {
  let sumMin = 0
  let sumMax = 0

  for (let i = 0; i < tree.allStats.length; i++) {
    const stat = tree.allStats[i]
    sumMin += region.lower[stat]
    sumMax += region.upper[stat]
  }

  return {
    sumMin: Math.ceil(sumMin),
    sumMax: Math.ceil(sumMax),
  }
}

function isValidBoundarySums(region: TreeStatRegion, tree: SearchTree, sumMin: number, sumMax: number) {
  // The possible ranges must include the target
  if ((sumMin > tree.targetSum || sumMax < tree.targetSum)) return false

  return true
}

// Find the unfixable possible slot deficits
// If n slots need to be filled, then we need at least n remaining rolls to distribute in order to fix it
function isValidDistributableSlots(region: TreeStatRegion, tree: SearchTree, sumMin: number) {
  let sumPossibleSlots = 0
  for (let i = 0; i < tree.allStats.length; i++) {
    const stat = tree.allStats[i]
    const availablePieces = tree.getAvailablePieces(stat)
    const possibleSlots = Math.min(region.lower[stat], availablePieces)
    sumPossibleSlots += possibleSlots
  }
  const slotsThatNeedToBeFilled = 24 - Math.ceil(sumPossibleSlots)
  const remainingSubstatRolls = tree.targetSum - sumMin
  if (slotsThatNeedToBeFilled > remainingSubstatRolls) {
    return false
  }

  return true
}

// Must have enough pieces to fit each stat with minimum rolls
// Note: In theory this is useful but in practice this never triggers
// Note: Tests disabled
function isValidMinimumRolls(region: TreeStatRegion, tree: SearchTree) {
  for (let i = 0; i < tree.activeStats.length; i++) {
    const stat = tree.activeStats[i]
    const minRolls = Math.ceil(region.lower[stat])
    const availablePieces = tree.getAvailablePieces(stat)
    if (minRolls > availablePieces * tree.maxStatRollsPerPiece) return false
  }

  return true
}

// Each piece must have at least 4 eligible substats available
// Note: In theory this is useful but in practice this triggers so rarely that the performance hit to calculate is
// not worth it vs just checking the region directly
// Note: Tests disabled
function isValidEligibleStats(region: TreeStatRegion, tree: SearchTree) {
  for (let pieceIndex = 0; pieceIndex < 6; pieceIndex++) {
    const pieceMainStat = tree.mainStats[pieceIndex]
    let eligibleStats = 0
    for (let i = 0; i < tree.allStats.length; i++) {
      // Stat is eligible if:
      // 1. Not the same as piece main stat
      // 2. Could potentially have rolls in this cell (maxs[i] > 0)
      const stat = tree.allStats[i]
      if (stat != pieceMainStat && region.upper[stat] > 0) eligibleStats++
    }
    if (eligibleStats < 4) return false
  }

  return true
}
