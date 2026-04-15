import type {
  Parts,
  Sets,
  StatsValues,
  SubStats,
} from 'lib/constants/constants'
import type { ScoreCategory } from 'lib/scoring/scoreComparison'

// Internal scorer metadata — enriched from the public ScoringMetadata in types/metadata.ts
// Contains computed fields: sortedSubstats, groupedSubstats, hash, greedyHash, category
export type ScorerMetadata = {
  parts: Record<Parts, StatsValues[]>,
  stats: Record<StatsValues, number>,
  sets: Partial<Record<Sets, number>>,
  sortedSubstats: [SubStats, number][],
  groupedSubstats: Map<number, SubStats[]>,
  greedyHash: string,
  hash: string,
  modified?: boolean,
  category: ScoreCategory,
  // Pre-computed: weight[stat] * normalization[stat] — eliminates repeated multiply in hot loop
  contributions: Record<SubStats, number>,
  // Pre-computed: contributions[stat] * SubStatValues[stat][5].high — score per grade-5 high roll
  highRollScores: Record<SubStats, number>,
  // Pre-computed: contributions[stat] * SubStatValues[stat][5].mid — score per grade-5 mid roll
  midRollScores: Record<SubStats, number>,
  lowRollScores: Record<SubStats, number>,
}

export type RelicScoringResult = {
  score: string,
  scoreNumber: number,
  rating: string,
  mainStatScore: number,
  part?: Parts,
  meta?: ScorerMetadata,
}

export type FutureScoringResult = {
  current: number,
  best: number,
  average: number,
  worst: number,
  rerollAvg: number,
  blockerAvg: number,
  meta: Partial<{
    bestAddedStats: string[],
    bestUpgradedStats: string[],
    blockedStat: SubStats,
  }>,
}

export type PotentialResult = {
  currentPct: number,
  bestPct: number,
  averagePct: number,
  worstPct: number,
  rerollAvgPct: number,
  blockedRerollAvgPct: number,
  meta: FutureScoringResult['meta'],
}

export type CharacterScoringResult = {
  relics: RelicScoringResult[],
  totalScore: number,
  totalRating: string,
}
