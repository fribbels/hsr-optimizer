import {
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { nullUndefinedToZero } from 'lib/overlays/modals/ScoringModal'
import { ScoringMetadata } from 'types/metadata'

export enum ScoreCategory {
  DEFAULT,
  DEFAULT_NO_SPEED,
  MODIFIED,
}

type Metadata = Pick<ScoringMetadata, 'stats' | 'modified'>

export function getScoreCategory(defaultMeta: Metadata, customMeta: Metadata) {
  let difference = false
  let nonSpdMatches = true
  let spdDiff = false
  for (const stat of SubStats) {
    const c = customMeta.stats[stat]
    const d = defaultMeta.stats[stat]
    if (d != c) {
      difference = true
      if (stat == Stats.SPD && c == 0) {
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

export function setModifiedScoringMetadata(defaultMeta: Metadata, customMeta: Metadata) {
  customMeta.modified = false
  for (const stat of SubStats) {
    if (nullUndefinedToZero(customMeta.stats[stat]) != nullUndefinedToZero(defaultMeta.stats[stat])) {
      customMeta.modified = true
    }
  }
}
