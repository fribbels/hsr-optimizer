import {
  Constants,
  type SubStats,
  SubStatValues,
} from 'lib/constants/constants'
import {
  DMG_MAINSTATS,
  FLAT_STAT_SCALING,
  POSSIBLE_SUBSTATS,
  STAT_NORMALIZATION,
} from 'lib/relics/scoring/scoringConstants'
import type { ScorerMetadata } from 'lib/relics/scoring/types'
import { getScoreCategory } from 'lib/scoring/scoreComparison'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import { objectHash } from 'lib/utils/objectUtils'
import { clone } from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'

export function prepareScoringMetadata(id: CharacterId): ScorerMetadata {
  const scoringMetadata = clone(getScoringMetadata(id)) as unknown as ScorerMetadata

  const defaultScoringMetadata = getGameMetadata().characters[id]?.scoringMetadata
  scoringMetadata.category = getScoreCategory(defaultScoringMetadata, { stats: scoringMetadata.stats })

  scoringMetadata.stats[Constants.Stats.HP] = scoringMetadata.stats[Constants.Stats.HP_P] * FLAT_STAT_SCALING.HP
  scoringMetadata.stats[Constants.Stats.ATK] = scoringMetadata.stats[Constants.Stats.ATK_P] * FLAT_STAT_SCALING.ATK
  scoringMetadata.stats[Constants.Stats.DEF] = scoringMetadata.stats[Constants.Stats.DEF_P] * FLAT_STAT_SCALING.DEF

  scoringMetadata.sortedSubstats = (Object.entries(scoringMetadata.stats) as [SubStats, number][])
    .filter((x) => POSSIBLE_SUBSTATS.has(x[0]))
    .sort((a, b) => {
      return b[1] * STAT_NORMALIZATION[b[0]] * SubStatValues[b[0]][5].high - a[1] * STAT_NORMALIZATION[a[0]] * SubStatValues[a[0]][5].high
    })

  scoringMetadata.groupedSubstats = new Map()
  for (const [stat, weight] of scoringMetadata.sortedSubstats) {
    if (!scoringMetadata.groupedSubstats.has(weight)) {
      scoringMetadata.groupedSubstats.set(weight, [])
    }
    scoringMetadata.groupedSubstats.get(weight)!.push(stat)
  }
  for (const stats of scoringMetadata.groupedSubstats.values()) {
    stats.sort()
  }

  let weightedDmgTypes = 0
  Object.entries(scoringMetadata.stats).forEach(([stat, value]) => {
    if ((DMG_MAINSTATS as string[]).includes(stat) && value) weightedDmgTypes++
  })

  let validDmgMains = 0
  scoringMetadata.parts.PlanarSphere.forEach((mainstat) => {
    if ((DMG_MAINSTATS as string[]).includes(mainstat)) validDmgMains++
  })

  if (weightedDmgTypes < 2 && validDmgMains < 2) {
    const hashParts = [
      scoringMetadata.parts.Head,
      scoringMetadata.parts.Hands,
      scoringMetadata.parts.Body,
      scoringMetadata.parts.Feet,
      scoringMetadata.parts.PlanarSphere.filter((x) => !(DMG_MAINSTATS as string[]).includes(x)),
      scoringMetadata.parts.LinkRope,
    ]
    scoringMetadata.greedyHash = objectHash({ sortedSubstats: scoringMetadata.sortedSubstats, parts: hashParts })
    scoringMetadata.hash = objectHash({ ...scoringMetadata.stats, ...scoringMetadata.parts })
  } else {
    scoringMetadata.greedyHash = objectHash({ stats: scoringMetadata.stats, parts: scoringMetadata.parts })
    scoringMetadata.hash = scoringMetadata.greedyHash
  }

  // Pre-compute contributions: weight * normalization per stat (one lookup instead of two in hot loops)
  const contributions = {} as Record<SubStats, number>
  const highRollScores = {} as Record<SubStats, number>
  const midRollScores = {} as Record<SubStats, number>
  const lowRollScores = {} as Record<SubStats, number>
  for (const [stat] of scoringMetadata.sortedSubstats) {
    const c = (scoringMetadata.stats[stat] || 0) * STAT_NORMALIZATION[stat]
    contributions[stat] = c
    highRollScores[stat] = c * SubStatValues[stat][5].high
    midRollScores[stat] = c * SubStatValues[stat][5].mid
    lowRollScores[stat] = c * SubStatValues[stat][5].low
  }
  scoringMetadata.contributions = contributions
  scoringMetadata.highRollScores = highRollScores
  scoringMetadata.midRollScores = midRollScores
  scoringMetadata.lowRollScores = lowRollScores

  return scoringMetadata
}
