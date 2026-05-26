import { Parts } from 'lib/constants/constants'
import {
  RATINGS,
} from 'lib/relics/scoring/scoringConstants'

// Each step ≈ 4.4% (one high roll of a max-weight stat relative to ideal 6-piece score). Indices align with RATINGS.
const PCT_THRESHOLDS = [0, 0, 0, 4.4, 8.8, 13.1, 17.5, 21.9, 26.3, 30.7, 35.1, 39.4, 43.8, 48.2, 52.6, 56.9, 61.3, 65.7, 70.1, 74.5]

export function pctToRating(
  pct: number,
  grade?: number,
  part?: Parts,
  hasCorrectMainStat?: boolean,
): string {
  if (grade != null && grade !== 5) return '?'
  if (pct < 0) return '?'
  if (part !== Parts.Head && part !== Parts.Hands && hasCorrectMainStat === false) return '?'

  const index = Math.min(PCT_THRESHOLDS.findLastIndex((t) => pct >= t), RATINGS.length - 1)
  return index < 0 ? '?' : RATINGS[index]
}
