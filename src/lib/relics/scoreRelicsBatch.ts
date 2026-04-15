import type {
  MainStats,
  Parts,
} from 'lib/constants/constants'
import { computeFutureScores } from 'lib/relics/scoring/futureScore'
import { computeOptimalScore } from 'lib/relics/scoring/optimalScore'
import { computePotentialScores } from 'lib/relics/scoring/potentialScore'
import type {
  FutureScoringResult,
  PotentialResult,
  ScorerMetadata,
} from 'lib/relics/scoring/types'
import type { CharacterId } from 'types/character'
import type { Nullable } from 'types/common'
import type { Relic } from 'types/relic'
import {
  DEFAULT_WEIGHTS,
  type ScoredRelic,
} from './scoreRelics'

/**
 * Pure scoring batch function — no store or singleton dependencies.
 * Accepts pre-computed ScorerMetadata per character, runs the O(relics × characters)
 * scoring loop, and returns scored relics. Designed to run in a web worker.
 */
export function scoreRelicsBatch(
  relics: Relic[],
  characterIds: CharacterId[],
  metadataByCharacter: Map<CharacterId, ScorerMetadata>,
  focusCharacter: Nullable<CharacterId>,
  excludedRelicPotentialCharacters: CharacterId[],
  equippedRelicByPart: Record<string, Relic | undefined>,
): ScoredRelic[] {
  const excludedSet = new Set(excludedRelicPotentialCharacters)
  const cache = new PureScoringCache()

  // Pre-compute equipped relic potentials for focus character — equipped relics may not
  // be in the relics input array, so this pass scores them before the main loop.
  const equippedPotentialByPart: Record<string, PotentialResult | undefined> = {}
  if (focusCharacter) {
    const focusMeta = metadataByCharacter.get(focusCharacter)
    if (focusMeta) {
      for (const [part, relic] of Object.entries(equippedRelicByPart)) {
        if (relic) equippedPotentialByPart[part] = cache.scoreRelicPotential(relic, focusMeta)
      }
    }
  }

  const scored = relics.map((relic) => {
    return scoreSingleRelic(relic, characterIds, excludedSet, focusCharacter, metadataByCharacter, equippedPotentialByPart, cache)
  })

  return scored.reverse()
}

// ---------------------------------------------------------------------------
// Pure caching layer — mirrors ScoringCache but without store dependencies
// ---------------------------------------------------------------------------

class PureScoringCache {
  // Keyed by `greedyHash|part|mainstat` — persists across characters so optimal
  // scores computed for character A are reused for character A on the next relic.
  private optimalScoreCache = new Map<string, number>()
  private futureCache = new Map<string, Map<string, FutureScoringResult>>()

  getOptimalScore(part: Parts, mainstat: MainStats, meta: ScorerMetadata): number {
    const key = `${meta.greedyHash}|${part}|${mainstat}`
    let score = this.optimalScoreCache.get(key)
    if (score == null) {
      score = computeOptimalScore(part, mainstat, meta)
      this.optimalScoreCache.set(key, score)
    }
    return score
  }

  getFutureScore(relic: Relic, meta: ScorerMetadata): FutureScoringResult {
    const metaHash = meta.hash
    let innerMap = this.futureCache.get(relic.id)
    let cached = innerMap?.get(metaHash)
    if (!cached) {
      if (!meta.sortedSubstats[0]?.[0]) {
        cached = {
          current: 0,
          best: 0,
          average: 0,
          worst: 0,
          rerollAvg: 0,
          blockerAvg: 0,
          meta: { bestAddedStats: [], bestUpgradedStats: [] },
        }
      } else {
        const idealScore = this.getOptimalScore(relic.part, relic.main.stat, meta)
        cached = computeFutureScores(relic, meta, idealScore, false)
      }
      if (!innerMap) {
        innerMap = new Map()
        this.futureCache.set(relic.id, innerMap)
      }
      innerMap.set(metaHash, cached)
    }
    return cached
  }

  scoreRelicPotential(relic: Relic, meta: ScorerMetadata) {
    const futureScore = this.getFutureScore(relic, meta)
    return computePotentialScores(relic, meta, futureScore)
  }
}

// ---------------------------------------------------------------------------
// Per-relic scoring — pure, no store access
// ---------------------------------------------------------------------------

function scoreSingleRelic(
  relic: Relic,
  characterIds: CharacterId[],
  excludedSet: Set<CharacterId>,
  focusCharacter: Nullable<CharacterId>,
  metadataByCharacter: Map<CharacterId, ScorerMetadata>,
  equippedPotentialByPart: Record<string, PotentialResult | undefined>,
  cache: PureScoringCache,
): ScoredRelic {
  let weights = { ...DEFAULT_WEIGHTS }

  if (focusCharacter) {
    const focusMeta = metadataByCharacter.get(focusCharacter)
    if (focusMeta) {
      const potentialSelected = cache.scoreRelicPotential(relic, focusMeta)
      const futureScore = cache.getFutureScore(relic, focusMeta)

      const rerollAvgSelected = Math.max(0, potentialSelected.rerollAvgPct)
      const rerollAvgSelectedDelta = rerollAvgSelected === 0 ? 0 : (rerollAvgSelected - potentialSelected.averagePct)

      const blockedRerollAvgSelected = Math.max(0, potentialSelected.blockedRerollAvgPct)
      const blockedRerollAvgSelectedDelta = blockedRerollAvgSelected === 0 ? 0 : (blockedRerollAvgSelected - potentialSelected.averagePct)

      weights = {
        ...weights,
        current: futureScore.current,
        best: futureScore.best,
        average: futureScore.average,
        potentialSelected,
        rerollAvgSelected,
        rerollAvgSelectedDelta,
        blockedRerollAvgSelected,
        blockedRerollAvgSelectedDelta,
      }

      const equippedPotential = equippedPotentialByPart[relic.part]
      if (equippedPotential) {
        weights.rerollAvgSelectedEquippedDelta = weights.rerollAvgSelected - equippedPotential.averagePct
        weights.blockedRerollAvgSelectedEquippedDelta = weights.blockedRerollAvgSelected - equippedPotential.averagePct
      }
    }
  }

  for (const id of characterIds) {
    const meta = metadataByCharacter.get(id)
    if (!meta) continue

    const pct = cache.scoreRelicPotential(relic, meta)
    weights.potentialAllAll = {
      bestPct: Math.max(pct.bestPct, weights.potentialAllAll.bestPct),
      averagePct: Math.max(pct.averagePct, weights.potentialAllAll.averagePct),
    }
    weights.rerollAllAll = Math.max(pct.rerollAvgPct, weights.rerollAllAll)
    weights.blockedRerollAllAll = Math.max(pct.blockedRerollAvgPct, weights.blockedRerollAllAll)

    if (excludedSet.has(id)) continue

    weights.potentialAllCustom = {
      bestPct: Math.max(pct.bestPct, weights.potentialAllCustom.bestPct),
      averagePct: Math.max(pct.averagePct, weights.potentialAllCustom.averagePct),
    }
    weights.rerollAllCustom = Math.max(pct.rerollAvgPct, weights.rerollAllCustom)
    weights.blockedRerollAllCustom = Math.max(pct.blockedRerollAvgPct, weights.blockedRerollAllCustom)
  }

  return { ...relic, weights }
}
