import {
  Constants,
  PartsArray,
  type Parts,
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
import { getScoreCategory } from 'lib/scoring/scoreComparison'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getScoringMetadata } from 'lib/stores/scoring/scoringStore'
import { objectHash } from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'
import type { ScoringMetadata } from 'types/metadata'

export type ScoringMetadataResolver = (id: CharacterId) => ScoringMetadata

type ScorerPartsInput = Partial<Record<Parts, StatsValues[]>>

function cloneScorerParts(parts: ScoringMetadata['parts']): ScorerMetadata['parts'] {
  const sourceParts = parts as unknown as ScorerPartsInput
  const scorerParts: ScorerPartsInput = {}

  for (const part of PartsArray) {
    const mainStats = sourceParts[part]
    if (mainStats) {
      scorerParts[part] = [...mainStats]
    }
  }

  return scorerParts as ScorerMetadata['parts']
}

function toScorerMetadata(metadata: ScoringMetadata): ScorerMetadata {
  return {
    stats: { ...metadata.stats },
    parts: cloneScorerParts(metadata.parts),
    modified: metadata.modified,
  } as ScorerMetadata
}

export function prepareScoringMetadata(
  id: CharacterId,
  metadataResolver: ScoringMetadataResolver = getScoringMetadata,
): ScorerMetadata {
  const scoringMetadata = toScorerMetadata(metadataResolver(id))

  const defaultScoringMetadata = getGameMetadata().characters[id]?.scoringMetadata
  scoringMetadata.category = getScoreCategory(defaultScoringMetadata, { stats: scoringMetadata.stats })

  for (const stat of Object.keys(scoringMetadata.stats)) {
    scoringMetadata.stats[stat as SubStats] = Math.min(1, Math.max(0, scoringMetadata.stats[stat as SubStats]))
  }

  scoringMetadata.stats[Constants.Stats.HP] = scoringMetadata.stats[Constants.Stats.HP_P] * FLAT_STAT_SCALING.HP
  scoringMetadata.stats[Constants.Stats.ATK] = scoringMetadata.stats[Constants.Stats.ATK_P] * FLAT_STAT_SCALING.ATK
  scoringMetadata.stats[Constants.Stats.DEF] = scoringMetadata.stats[Constants.Stats.DEF_P] * FLAT_STAT_SCALING.DEF

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
    scoringMetadata.greedyHash = objectHash({ sortedSubstats: scoringMetadata.sortedSubstats, parts: hashParts })
    scoringMetadata.hash = objectHash({ ...scoringMetadata.stats, ...scoringMetadata.parts })
  } else {
    scoringMetadata.greedyHash = objectHash({ stats: scoringMetadata.stats, parts: scoringMetadata.parts })
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
