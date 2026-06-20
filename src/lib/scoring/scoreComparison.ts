import {
  Stats,
  SubStats,
} from 'lib/constants/constants'
import type { ScoringMetadata } from 'types/metadata'

export enum ScoreCategory {
  DEFAULT,
  DEFAULT_NO_SPEED,
  MODIFIED,
}

type Metadata = Pick<ScoringMetadata, 'stats' | 'modified'>

export function isAeonEligibleWeights(defaultMeta: Metadata, customMeta: Metadata): boolean {
  for (const stat of SubStats) {
    if (stat === Stats.SPD) continue
    if (defaultMeta.stats[stat] !== customMeta.stats[stat]) return false
  }
  return true
}

export function getScoreCategory(defaultMeta: Metadata, customMeta: Metadata) {
  let difference = false
  let nonSpdMatches = true
  let spdDiff = false
  for (const stat of SubStats) {
    const customWeight = customMeta.stats[stat]
    const defaultWeight = defaultMeta.stats[stat]
    if (defaultWeight != customWeight) {
      difference = true
      if (stat == Stats.SPD && customWeight == 0) {
        spdDiff = true
      } else {
        nonSpdMatches = false
      }
    }
  }

  if (nonSpdMatches && spdDiff) return ScoreCategory.DEFAULT_NO_SPEED
  if (!difference && defaultMeta.stats[Stats.SPD] == 0) return ScoreCategory.DEFAULT_NO_SPEED
  if (difference) return ScoreCategory.MODIFIED
  return ScoreCategory.DEFAULT
}
