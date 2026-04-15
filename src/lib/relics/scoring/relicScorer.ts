import type {
  MainStats,
  Parts,
} from 'lib/constants/constants'
import type {
  Character,
  CharacterId,
} from 'types/character'
import type {
  Relic,
  RelicId,
} from 'types/relic'
import {
  scoreCharacterUsingScorer,
  scoreCharacterWithRelicsUsingScorer,
} from './characterScore'
import { scoreCurrentRelic } from './currentScore'
import { computeFutureScores } from './futureScore'
import { computeOptimalScore } from './optimalScore'
import { computePotentialScores } from './potentialScore'
import { prepareScoringMetadata } from './scoringMetadata'
import type {
  CharacterScoringResult,
  FutureScoringResult,
  PotentialResult,
  RelicScoringResult,
  ScorerMetadata,
} from './types'

export type { CharacterScoringResult, FutureScoringResult, PotentialResult, RelicScoringResult, ScorerMetadata }

/**
 * Caching layer for batch scoring operations.
 * Short-lived — instantiate per render cycle, not kept alive long-term.
 */
export class ScoringCache {
  private metaCache = new Map<CharacterId, ScorerMetadata>()
  private _optimalHash = ''
  private _optimalScores: Record<string, Record<string, number>> = {}
  private currentCache = new Map<RelicId, Map<string, RelicScoringResult>>()
  private futureCache = new Map<RelicId, Map<string, FutureScoringResult>>()

  getMeta(id: CharacterId): ScorerMetadata {
    let meta = this.metaCache.get(id)
    if (!meta) {
      meta = prepareScoringMetadata(id)
      this.metaCache.set(id, meta)
    }
    return meta
  }

  private _getOptimalWithMeta(part: Parts, mainstat: MainStats, meta: ScorerMetadata): number {
    if (meta.greedyHash !== this._optimalHash) {
      this._optimalScores = {}
      this._optimalHash = meta.greedyHash
    }
    let partScores = this._optimalScores[part]
    if (!partScores) {
      partScores = {}
      this._optimalScores[part] = partScores
    }
    let score = partScores[mainstat]
    if (score == null) {
      score = computeOptimalScore(part, mainstat, meta)
      partScores[mainstat] = score
    }
    return score
  }

  getCurrentRelicScore(relic: Relic | undefined, id: CharacterId): RelicScoringResult {
    if (!relic) {
      return {
        score: '0',
        scoreNumber: 0,
        rating: '',
        mainStatScore: 0,
      }
    }
    const meta = this.getMeta(id)
    const metaHash = meta.hash
    let cached = this.currentCache.get(relic.id)?.get(metaHash)
    if (!cached) {
      const idealScore = this._getOptimalWithMeta(relic.part, relic.main.stat, meta)
      cached = scoreCurrentRelic(relic, meta, idealScore)
      if (!this.currentCache.has(relic.id)) {
        this.currentCache.set(relic.id, new Map())
      }
      this.currentCache.get(relic.id)!.set(metaHash, cached)
    }
    return cached
  }

  getFutureRelicScore(relic: Relic, id: CharacterId, withMeta: boolean = false): FutureScoringResult {
    const meta = this.getMeta(id)
    const metaHash = meta.hash
    let cached = this.futureCache.get(relic.id)?.get(metaHash)
    if (!cached) {
      if (!meta.sortedSubstats[0][0]) {
        cached = {
          current: 0,
          best: 0,
          average: 0,
          worst: 0,
          rerollAvg: 0,
          blockerAvg: 0,
          meta: {
            bestAddedStats: [],
            bestUpgradedStats: [],
          },
        }
      } else {
        const idealScore = this._getOptimalWithMeta(relic.part, relic.main.stat, meta)
        cached = computeFutureScores(relic, meta, idealScore, withMeta)
      }
      if (!this.futureCache.has(relic.id)) {
        this.futureCache.set(relic.id, new Map())
      }
      this.futureCache.get(relic.id)!.set(metaHash, cached)
    }
    return cached
  }

  scoreRelicPotential(relic: Relic, id: CharacterId, withMeta: boolean = false): PotentialResult {
    const meta = this.getMeta(id)
    const futureScore = this.getFutureRelicScore(relic, id, withMeta)
    return computePotentialScores(relic, meta, futureScore)
  }

  scoreCharacterWithRelics(
    character: Character | undefined,
    relics: (Relic | undefined)[],
  ): CharacterScoringResult {
    return scoreCharacterWithRelicsUsingScorer(
      character,
      relics,
      (relic, id) => this.getCurrentRelicScore(relic, id),
    )
  }

  scoreCharacter(character: Character | undefined): CharacterScoringResult {
    if (!character) {
      return {
        relics: [],
        totalScore: 0,
        totalRating: '',
      }
    }
    return scoreCharacterUsingScorer(
      character,
      (relic, id) => this.getCurrentRelicScore(relic, id),
    )
  }
}

/**
 * Backward-compatible API — drop-in replacement for the old RelicScorer.
 * Supports both `RelicScorer.scoreCurrentRelic(...)` (static) and `new RelicScorer()` (instance).
 * Also supports `ReturnType<typeof RelicScorer.scoreRelicPotential>` type extraction.
 */
export class RelicScorer extends ScoringCache {
  static scoreCurrentRelic(relic: Relic, id: CharacterId) {
    return new RelicScorer().getCurrentRelicScore(relic, id)
  }

  static scoreCharacterWithRelics(character: Character, relics: (Relic | undefined)[]) {
    return new RelicScorer().scoreCharacterWithRelics(character, relics)
  }

  static scoreCharacter(character: Character) {
    return new RelicScorer().scoreCharacter(character)
  }

  static scoreRelicPotential(relic: Relic, characterId: CharacterId, withMeta: boolean = false) {
    return new RelicScorer().scoreRelicPotential(relic, characterId, withMeta)
  }
}
