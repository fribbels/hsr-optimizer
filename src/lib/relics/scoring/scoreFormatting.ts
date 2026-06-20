import { Parts } from 'lib/constants/constants'

// Each grade = 5% of ideal substat perfection
const RATING_TIERS = [
  { pct: 0, rating: 'F' },
  { pct: 5, rating: 'F+' },
  { pct: 10, rating: 'D' },
  { pct: 15, rating: 'D+' },
  { pct: 20, rating: 'C' },
  { pct: 25, rating: 'C+' },
  { pct: 30, rating: 'B' },
  { pct: 35, rating: 'B+' },
  { pct: 40, rating: 'A' },
  { pct: 45, rating: 'A+' },
  { pct: 50, rating: 'S' },
  { pct: 55, rating: 'S+' },
  { pct: 60, rating: 'SS' },
  { pct: 65, rating: 'SS+' },
  { pct: 70, rating: 'SSS' },
  { pct: 75, rating: 'SSS+' },
  { pct: 80, rating: 'WTF' },
  { pct: 85, rating: 'WTF+' },
  { pct: 90, rating: 'AEON' },
] as const

export function pctToRating(
  pct: number,
  grade?: number,
  part?: Parts,
  hasCorrectMainStat?: boolean,
): string {
  if (grade != null && grade !== 5) return '?'
  if (pct <= 0) return '?'
  if (part !== Parts.Head && part !== Parts.Hands && hasCorrectMainStat === false) return '?'

  for (let i = RATING_TIERS.length - 1; i >= 0; i--) {
    if (pct >= RATING_TIERS[i].pct) return RATING_TIERS[i].rating
  }
  return '?'
}
