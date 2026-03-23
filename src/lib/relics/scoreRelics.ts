import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { getCharacterById } from 'lib/stores/character/characterStore'
import { getRelicById } from 'lib/stores/relic/relicStore'
import type { CharacterId } from 'types/character'
import type { Nullable } from 'types/common'
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

// Keyed by relic reference, autoclears when cache params change
let scoreCache: WeakMap<Relic, ScoredRelic> = new WeakMap()
let cacheParams: { focusCharacter: Nullable<CharacterId>, excludedIds: string, scoringVersion: number } | null = null

export function scoreRelics(
  relics: Array<Relic>,
  excludedRelicPotentialCharacters: Array<CharacterId>,
  focusCharacter: Nullable<CharacterId>,
  scoringVersion: number,
): Array<ScoredRelic> {
  const characterIds = Object.values(getGameMetadata().characters).map((x) => x.id)
  const relicScorer = new RelicScorer()

  // Clear cache when scoring params actually change — uses stable primitive comparison
  const excludedIds = excludedRelicPotentialCharacters.join(',')
  if (
    !cacheParams
    || cacheParams.focusCharacter !== focusCharacter
    || cacheParams.excludedIds !== excludedIds
    || cacheParams.scoringVersion !== scoringVersion
  ) {
    scoreCache = new WeakMap()
    cacheParams = { focusCharacter, excludedIds, scoringVersion }
  }

  const excludedSet = new Set(excludedRelicPotentialCharacters)

  const scored = relics.map((relic) => {
    const cached = scoreCache.get(relic)
    if (cached) return cached

    const result = scoreSingleRelic(relic, characterIds, excludedSet, focusCharacter, relicScorer)
    scoreCache.set(relic, result)
    return result
  })

  return scored.reverse()
}

function scoreSingleRelic(
  relic: Relic,
  characterIds: Array<CharacterId>,
  excludedSet: Set<CharacterId>,
  focusCharacter: Nullable<CharacterId>,
  relicScorer: RelicScorer,
): ScoredRelic {
  let weights: RelicScoringWeights = {
    current: 0,
    average: 0,
    best: 0,
    potentialSelected: {
      bestPct: 0,
      averagePct: 0,
      rerollAvgPct: 0,
      blockedRerollAvgPct: 0,
    },
    potentialAllAll: {
      bestPct: 0,
      averagePct: 0,
    },
    potentialAllCustom: {
      bestPct: 0,
      averagePct: 0,
    },
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

  if (focusCharacter) {
    const potentialSelected = relicScorer.scoreRelicPotential(relic, focusCharacter)

    const rerollAvgSelected = Math.max(0, potentialSelected.rerollAvgPct)
    const rerollAvgSelectedDelta = rerollAvgSelected == 0 ? 0 : (rerollAvgSelected - potentialSelected.averagePct)

    const blockedRerollAvgSelected = Math.max(0, potentialSelected.blockedRerollAvgPct)
    const blockedRerollAvgSelectedDelta = blockedRerollAvgSelected == 0 ? 0 : (blockedRerollAvgSelected - potentialSelected.averagePct)

    weights = {
      ...weights,
      ...relicScorer.getFutureRelicScore(relic, focusCharacter),
      potentialSelected,
      rerollAvgSelected,
      rerollAvgSelectedDelta,
      blockedRerollAvgSelected,
      blockedRerollAvgSelectedDelta,
    }
    const equippedRelic = getRelicById(getCharacterById(focusCharacter)?.equipped?.[relic.part])
    if (equippedRelic) {
      const equippedPotential = relicScorer.scoreRelicPotential(equippedRelic, focusCharacter)
      weights.rerollAvgSelectedEquippedDelta = weights.rerollAvgSelected - equippedPotential.averagePct
      weights.blockedRerollAvgSelectedEquippedDelta = weights.blockedRerollAvgSelected - equippedPotential.averagePct
    }
  }

  for (const id of characterIds) {
    const pct = relicScorer.scoreRelicPotential(relic, id)
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
