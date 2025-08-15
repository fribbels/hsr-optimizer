import { RelicScorer } from 'lib/relics/relicScorerPotential'
import DB from 'lib/state/db'
import { CharacterId } from 'types/character'
import { Nullable } from 'types/common'
import { Relic } from 'types/relic'

export type ScoredRelic = Relic & { weights: RelicScoringWeights }

export type RelicScoringWeights = {
  average: number,
  current: number,
  best: number,
  potentialSelected: PotentialWeights & { rerollAvgPct: number },
  potentialAllAll: PotentialWeights,
  potentialAllCustom: PotentialWeights,
  rerollAllAll: number,
  rerollAllCustom: number,
  rerollAvgSelected: number,
  rerollAvgSelectedDelta: number,
  rerollAvgSelectedEquippedDelta: number,
}

type PotentialWeights = {
  bestPct: number,
  averagePct: number,
}

export function scoreRelics(
  relics: Array<Relic>,
  excludedRelicPotentialCharacters: Array<CharacterId>,
  focusCharacter: Nullable<CharacterId>,
): Array<ScoredRelic> {
  const characterIds = Object.values(DB.getMetadata().characters).map((x) => x.id)
  const relicScorer = new RelicScorer()
  return relics
    .map((relic) => {
      let weights: RelicScoringWeights = {
        current: 0,
        average: 0,
        best: 0,
        potentialSelected: {
          bestPct: 0,
          averagePct: 0,
          rerollAvgPct: 0,
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
      }
      if (focusCharacter) {
        const potentialSelected = relicScorer.scoreRelicPotential(relic, focusCharacter)
        const rerollAvgSelected = Math.max(0, potentialSelected.rerollAvgPct)
        const rerollAvgSelectedDelta = rerollAvgSelected == 0 ? 0 : (rerollAvgSelected - potentialSelected.averagePct)
        weights = {
          ...weights,
          ...relicScorer.getFutureRelicScore(relic, focusCharacter),
          potentialSelected,
          rerollAvgSelected,
          rerollAvgSelectedDelta,
        }
        const equippedRelic = DB.getRelicById(DB.getCharacterById(focusCharacter)?.equipped?.[relic.part])
        if (equippedRelic) {
          weights.rerollAvgSelectedEquippedDelta = weights.rerollAvgSelected - relicScorer.scoreRelicPotential(equippedRelic, focusCharacter).averagePct
        }
      }

      for (const id of characterIds) {
        const pct = relicScorer.scoreRelicPotential(relic, id)
        weights.potentialAllAll = {
          bestPct: Math.max(pct.bestPct, weights.potentialAllAll.bestPct),
          averagePct: Math.max(pct.averagePct, weights.potentialAllAll.averagePct),
        }
        weights.rerollAllAll = Math.max(pct.rerollAvgPct, weights.rerollAllAll)

        if (excludedRelicPotentialCharacters.includes(id)) continue

        weights.potentialAllCustom = {
          bestPct: Math.max(pct.bestPct, weights.potentialAllCustom.bestPct),
          averagePct: Math.max(pct.averagePct, weights.potentialAllCustom.averagePct),
        }
        weights.rerollAllCustom = Math.max(pct.rerollAvgPct, weights.rerollAllCustom)
      }

      weights.rerollAvgSelected = Math.max(0, weights.potentialSelected.rerollAvgPct)
      return { ...relic, weights }
    })
    .reverse()
}
