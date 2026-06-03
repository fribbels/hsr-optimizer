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
  // Pre-computed: weight[stat] * raw-value-to-potential scale
  contributions: Record<SubStats, number>,
  // Pre-computed weighted potential per grade-5 roll tier
  highRollPotential: Record<SubStats, number>,
  midRollPotential: Record<SubStats, number>,
  lowRollPotential: Record<SubStats, number>,
}

export type RelicScoringResult = {
  percentScore: number,
  rating: string,
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
  correctMainStats: number,
}
