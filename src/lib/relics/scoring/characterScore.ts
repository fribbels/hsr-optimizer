import { useRelicStore } from 'lib/stores/relic/relicStore'
import { ArrayFilters } from 'lib/utils/arrayUtils'
import type {
  Character,
  CharacterId,
} from 'types/character'
import { type Nullable } from 'types/common'
import type { Relic } from 'types/relic'
import { scoreToRating } from './scoreFormatting'
import { MIN_ROLL_VALUE } from './scoringConstants'
import type {
  CharacterScoringResult,
  RelicScoringResult,
} from './types'

function countPairs<T extends string | number | symbol>(arr: T[]): number {
  let pairs = 0
  const obj: Partial<Record<T, number>> = {}
  arr.forEach((i) => {
    if (obj[i]) {
      pairs += 1
      obj[i] = 0
    } else {
      obj[i] = 1
    }
  })
  return pairs
}

/**
 * Score a character by aggregating their equipped relic scores.
 * Uses getCurrentRelicScore callback to leverage the caller's cache.
 */
export function scoreCharacterWithRelicsUsingScorer(
  character: Character | undefined,
  relics: (Nullable<Relic>)[],
  getCurrentRelicScore: (relic: Nullable<Relic>, id: CharacterId) => RelicScoringResult,
): CharacterScoringResult {
  if (!character?.id) {
    return {
      relics: [],
      totalScore: 0,
      totalRating: '?',
    }
  }

  const scoredRelics = relics.map((x) => getCurrentRelicScore(x, character.id))
  let totalScore = scoredRelics.reduce((acc, relic) => acc + relic.scoreNumber + relic.mainStatScore, 0)
  const missingSets = 3 - countPairs(relics.filter(ArrayFilters.nonNullable).map((x) => x.set))
  totalScore = Math.max(0, totalScore - missingSets * 3 * MIN_ROLL_VALUE)
  const totalRating = scoredRelics.length < 6 ? '?' : scoreToRating((totalScore - 4 * 64.8) / 6)

  return {
    relics: scoredRelics,
    totalScore,
    totalRating,
  }
}

/**
 * Score a character using their currently equipped relics.
 * Uses getCurrentRelicScore callback to leverage the caller's cache.
 */
export function scoreCharacterUsingScorer(
  character: Character | undefined,
  getCurrentRelicScore: (relic: Nullable<Relic>, id: CharacterId) => RelicScoringResult,
): CharacterScoringResult {
  if (!character) {
    return {
      relics: [],
      totalScore: 0,
      totalRating: '',
    }
  }
  const relicsById = useRelicStore.getState().relicsById
  const relics = Object.values(character.equipped).map((x) => relicsById[x])
  return scoreCharacterWithRelicsUsingScorer(character, relics, getCurrentRelicScore)
}
