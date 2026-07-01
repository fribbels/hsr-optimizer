import {
  Constants,
  type StatsValues,
  type SubStats,
  SubStatValues,
} from 'lib/constants/constants'
import {
  DMG_MAINSTATS,
  FLAT_STAT_SCALING,
  POSSIBLE_SUBSTATS,
  substatPotentialScale,
  substatPotentialUnits,
} from 'lib/relics/scoring/scoringConstants'
import type { ScorerMetadata } from 'lib/relics/scoring/types'
import {
  getScoreCategory,
  isAeonEligibleWeights,
  ScoreCategory,
} from 'lib/scoring/scoreComparison'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import { objectHash } from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'
import type { ScoringMetadata } from 'types/metadata'

export type ScoringMetadataResolver = (id: CharacterId) => ScoringMetadata

type SourceScoringStats = Record<SubStats, number> & { minWeightedRolls?: number }
type PreparedScorerStats = Record<StatsValues, number> & { minWeightedRolls?: number }

function normalizeStatWeight(value: number | undefined): number {
  return Math.min(1, Math.max(0, value ?? 0))
}

function prepareScorerStats(stats: SourceScoringStats): PreparedScorerStats {
  const scorerStats = {} as PreparedScorerStats

  for (const stat of Constants.SubStats) {
    scorerStats[stat] = normalizeStatWeight(stats[stat])
  }

  if (typeof stats.minWeightedRolls === 'number') {
    scorerStats.minWeightedRolls = normalizeStatWeight(stats.minWeightedRolls)
  }

  scorerStats[Constants.Stats.HP] = scorerStats[Constants.Stats.HP_P] * FLAT_STAT_SCALING.HP
  scorerStats[Constants.Stats.ATK] = scorerStats[Constants.Stats.ATK_P] * FLAT_STAT_SCALING.ATK
  scorerStats[Constants.Stats.DEF] = scorerStats[Constants.Stats.DEF_P] * FLAT_STAT_SCALING.DEF

  return scorerStats
}

function toScorerMetadata(metadata: ScoringMetadata): ScorerMetadata {
  return {
    stats: prepareScorerStats(metadata.stats),
    parts: metadata.parts,
    modified: metadata.modified,
    flatMainstatBoost: metadata.flatMainstatBoost,
  } as ScorerMetadata
}

export function prepareScoringMetadata(
  id: CharacterId,
  metadataResolver: ScoringMetadataResolver = getScoringMetadata,
): ScorerMetadata {
  const rawMetadata = metadataResolver(id)
  const scoringMetadata = toScorerMetadata(rawMetadata)

  const defaultScoringMetadata = getGameMetadata().characters[id]?.scoringMetadata
  scoringMetadata.category = defaultScoringMetadata
    ? getScoreCategory(defaultScoringMetadata, rawMetadata)
    : ScoreCategory.DEFAULT
  scoringMetadata.aeonEligibleWeights = defaultScoringMetadata
    ? isAeonEligibleWeights(defaultScoringMetadata, rawMetadata)
    : false

  scoringMetadata.sortedSubstats = (Object.entries(scoringMetadata.stats) as [SubStats, number][])
    .filter((x) => POSSIBLE_SUBSTATS.has(x[0]))
    .sort((a, b) => {
      return b[1] - a[1]
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
    scoringMetadata.greedyHash = objectHash({ sortedSubstats: scoringMetadata.sortedSubstats, parts: hashParts, flatMainstatBoost: rawMetadata.flatMainstatBoost })
    scoringMetadata.hash = objectHash({ ...scoringMetadata.stats, ...scoringMetadata.parts, flatMainstatBoost: rawMetadata.flatMainstatBoost })
  } else {
    scoringMetadata.greedyHash = objectHash({ stats: scoringMetadata.stats, parts: scoringMetadata.parts, flatMainstatBoost: rawMetadata.flatMainstatBoost })
    scoringMetadata.hash = scoringMetadata.greedyHash
  }

  // Pre-compute raw-value potential scales and roll potential maps for hot loops.
  const contributions = {} as Record<SubStats, number>
  const highRollPotential = {} as Record<SubStats, number>
  const midRollPotential = {} as Record<SubStats, number>
  const lowRollPotential = {} as Record<SubStats, number>
  for (const [stat] of scoringMetadata.sortedSubstats) {
    const weight = scoringMetadata.stats[stat] || 0
    const c = weight * substatPotentialScale(stat)
    contributions[stat] = c
    highRollPotential[stat] = weight * substatPotentialUnits(stat, SubStatValues[stat][5].high)
    midRollPotential[stat] = weight * substatPotentialUnits(stat, SubStatValues[stat][5].mid)
    lowRollPotential[stat] = weight * substatPotentialUnits(stat, SubStatValues[stat][5].low)
  }
  scoringMetadata.contributions = contributions
  scoringMetadata.highRollPotential = highRollPotential
  scoringMetadata.midRollPotential = midRollPotential
  scoringMetadata.lowRollPotential = lowRollPotential

  return scoringMetadata
}
