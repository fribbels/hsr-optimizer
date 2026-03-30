import type { Relic } from 'types/relic'

export type ScoredRelic = Relic & { weights: RelicScoringWeights }

export type RelicScoringWeights = {
  average: number,
  current: number,
  best: number,
  potentialSelected: PotentialWeights & { rerollAvgPct: number, blockedRerollAvgPct: number },
  potentialAllAll: PotentialWeights,
  potentialAllCustom: PotentialWeights,
  rerollAllAll: number,
  rerollAllCustom: number,
  rerollAvgSelected: number,
  rerollAvgSelectedDelta: number,
  rerollAvgSelectedEquippedDelta: number,
  blockedRerollAllAll: number,
  blockedRerollAllCustom: number,
  blockedRerollAvgSelected: number,
  blockedRerollAvgSelectedDelta: number,
  blockedRerollAvgSelectedEquippedDelta: number,
}

type PotentialWeights = {
  bestPct: number,
  averagePct: number,
}

export const DEFAULT_WEIGHTS: RelicScoringWeights = {
  current: 0,
  average: 0,
  best: 0,
  potentialSelected: { bestPct: 0, averagePct: 0, rerollAvgPct: 0, blockedRerollAvgPct: 0 },
  potentialAllAll: { bestPct: 0, averagePct: 0 },
  potentialAllCustom: { bestPct: 0, averagePct: 0 },
  rerollAllAll: 0,
  rerollAllCustom: 0,
  rerollAvgSelected: 0,
  rerollAvgSelectedDelta: 0,
  rerollAvgSelectedEquippedDelta: 0,
  blockedRerollAllAll: 0,
  blockedRerollAllCustom: 0,
  blockedRerollAvgSelected: 0,
  blockedRerollAvgSelectedDelta: 0,
  blockedRerollAvgSelectedEquippedDelta: 0,
}
