import {
  AllStats,
  Constants,
  SubStatValues,
  PartsMainStats,
} from 'lib/constants/constants'
import type {
  MainStats,
  Parts,
  StatsValues,
  SubStats,
} from 'lib/constants/constants'
import {
  POSSIBLE_SUBSTATS,
  STAT_NORMALIZATION,
} from 'lib/relics/scoring/scoringConstants'
import { hasMainStat } from 'lib/relics/scoring/substatScoring'
import type { ScorerMetadata } from 'lib/relics/scoring/types'

export enum ScoringCase {
  SINGLE_STAT,
  HP,
  ATK,
  DEF,
  NORMAL,
  NONE,
}

/**
 * Determines the handling case for optimal scoring based on how many substats
 * have nonzero weight and whether the top two are a flat/percent pair.
 */
export function getHandlingCase(meta: ScorerMetadata): ScoringCase {
  const substats = meta.sortedSubstats
  if (substats[0][1] === 0) return ScoringCase.NONE
  if (substats[1][1] === 0) return ScoringCase.SINGLE_STAT
  if (substats[2][1] > 0) return ScoringCase.NORMAL
  if (substats[1][0] === Constants.Stats.HP && substats[0][0] === Constants.Stats.HP_P) return ScoringCase.HP
  if (substats[1][0] === Constants.Stats.HP_P && substats[0][0] === Constants.Stats.HP) return ScoringCase.HP
  if (substats[1][0] === Constants.Stats.ATK && substats[0][0] === Constants.Stats.ATK_P) return ScoringCase.ATK
  if (substats[1][0] === Constants.Stats.ATK_P && substats[0][0] === Constants.Stats.ATK) return ScoringCase.ATK
  if (substats[1][0] === Constants.Stats.DEF && substats[0][0] === Constants.Stats.DEF_P) return ScoringCase.DEF
  if (substats[1][0] === Constants.Stats.DEF_P && substats[0][0] === Constants.Stats.DEF) return ScoringCase.DEF
  return ScoringCase.NORMAL
}

/**
 * Computes the optimal (maximum possible) substat score for a given part/mainstat/meta.
 * Replaces scoreOptimalRelic — computes the weighted sum directly instead of building fake relics.
 */
export function computeOptimalScore(part: Parts, mainstat: MainStats, meta: ScorerMetadata): number {
  const handlingCase = getHandlingCase(meta)

  switch (handlingCase) {
    case ScoringCase.NONE:
      return Infinity

    case ScoringCase.HP:
    case ScoringCase.ATK:
    case ScoringCase.DEF: {
      const stat1 = meta.sortedSubstats[0][0]
      const stat2 = meta.sortedSubstats[1][0]
      if (
        part === Constants.Parts.Head && handlingCase === ScoringCase.HP
        || part === Constants.Parts.Hands && handlingCase === ScoringCase.ATK
      ) {
        return 6 * meta.highRollScores[stat1]
      }
      return 6 * meta.highRollScores[stat1] + meta.highRollScores[stat2]
    }

    case ScoringCase.SINGLE_STAT: {
      return 6 * meta.highRollScores[meta.sortedSubstats[0][0]]
    }

    case ScoringCase.NORMAL: {
      const mainStat = resolveOptimalMainstat(part, mainstat, meta)
      const top4 = meta.sortedSubstats.filter(([name]) => name !== mainStat).slice(0, 4)
      return 6 * meta.highRollScores[top4[0][0]]
        + meta.highRollScores[top4[1][0]]
        + meta.highRollScores[top4[2][0]]
        + meta.highRollScores[top4[3][0]]
    }
  }
}

/**
 * Resolves the optimal main stat for a given part/mainstat/meta combination.
 * This contains critical tiebreak logic:
 * - If the mainstat is already optimal, or has weight 1, or the part has no selectable mainstat: return mainstat as-is
 * - Otherwise: sort all stats by score, find highest-weight possible mainstat, then tiebreak among
 *   same-weight stats preferring ideal mainstats and mainstats that can't be substats
 */
export function resolveOptimalMainstat(part: Parts, mainstat: MainStats, meta: ScorerMetadata): MainStats {
  const optimalMainStats = meta.parts[part] || []

  // Fast paths: already optimal, weight == 1, or Head/Hands (no selectable mainstat)
  if (optimalMainStats.includes(mainstat) || meta.stats[mainstat] === 1 || !hasMainStat(part)) {
    return mainstat
  }

  // List of stats, sorted by weight as mainstat in decreasing order
  const scoreEntries = AllStats
    .map((stat) => {
      const value = meta.stats[stat] ?? 0
      if (optimalMainStats.includes(stat) || meta.stats[stat] === 1) {
        return [stat, 1] as [StatsValues, number]
      } else return [stat, value] as [StatsValues, number]
    })
    .sort((a, b) => {
      // We give the mainstat-only stats a score of 6.48 * weight simply to get them in the right area
      // The exact score does not matter as long as the final array is still sorted by weight
      // @ts-expect-error - POSSIBLE_SUBSTATS.has() expects SubStats but receives StatsValues
      const scoreA = !POSSIBLE_SUBSTATS.has(a[0]) ? a[1] * 6.48 : a[1] * STAT_NORMALIZATION[a[0] as SubStats] * SubStatValues[a[0] as SubStats][5].high
      // @ts-expect-error - POSSIBLE_SUBSTATS.has() expects SubStats but receives StatsValues
      const scoreB = !POSSIBLE_SUBSTATS.has(b[0]) ? b[1] * 6.48 : b[1] * STAT_NORMALIZATION[b[0] as SubStats] * SubStatValues[b[0] as SubStats][5].high
      return scoreB - scoreA
    })

  /*
   * Need the specific optimal mainstat to remove it from possible substats. Find it by
   * - finding the highest multiplier mainstat of those valid for this relic
   * - looking at all stats with this exact multiplier and biasing towards
   *   1 - mainstats that can't be substats (choosing them doesn't shrink the substat pool) and
   *   2 - ideal mainstats
   */
  // First candidate (i.e. has the highest weight)
  const possibleMainStats = PartsMainStats[part] as MainStats[]
  // @ts-expect-error - StatsValues vs MainStats union mismatch in .includes()
  const mainStatIndex = scoreEntries.findIndex(([name, _weight]) => possibleMainStats.includes(name))
  const mainStatWeight = scoreEntries[mainStatIndex][1]
  let mainStat = scoreEntries[mainStatIndex][0] as MainStats
  // Worst case, will be overwritten by true values on first loop iteration
  let isIdeal = false
  let isSubstat = true

  // Look at all stats of weight equal to the highest weight stat and find any 'better' mainstats
  for (let i = mainStatIndex; i < scoreEntries.length; i++) {
    const [name, weight] = scoreEntries[i]
    if (weight !== mainStatWeight) break // sorted by weight, weight no longer equal means all following will be lesser
    // @ts-expect-error - StatsValues vs MainStats union mismatch in .includes()
    if (!possibleMainStats.includes(name)) continue // check for possible mainstat
    const newIsIdeal = optimalMainStats.includes(name)
    // @ts-expect-error - StatsValues vs SubStats union mismatch in .has()
    const newIsSubstat = POSSIBLE_SUBSTATS.has(name)
    if (isIdeal && !newIsIdeal) continue // prefer ideal mainstats
    if (!isSubstat && newIsSubstat) continue // prefer mainstats that can't be substats
    if (isIdeal === newIsIdeal && isSubstat === newIsSubstat) continue
    mainStat = name as MainStats
    isIdeal = newIsIdeal
    isSubstat = newIsSubstat
  }

  return mainStat
}
