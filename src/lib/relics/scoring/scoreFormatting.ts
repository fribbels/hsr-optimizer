import { Parts } from 'lib/constants/constants'
import { MIN_ROLL_VALUE, RATINGS } from 'lib/relics/scoring/scoringConstants'
import { precisionRound } from 'lib/utils/mathUtils'

export function scoreToRating(
  score: number,
  grade?: number,
  part?: Parts,
  mainStatScore?: number,
): string {
  if (grade != null && grade !== 5) return '?'

  const index = Math.min(Math.floor(score / (MIN_ROLL_VALUE / 2)), RATINGS.length - 1)
  if (index < 0) return '?'

  if (part !== Parts.Head && part !== Parts.Hands && mainStatScore != null && precisionRound(mainStatScore) <= 0) {
    return '?'
  }

  return RATINGS[index]
}
