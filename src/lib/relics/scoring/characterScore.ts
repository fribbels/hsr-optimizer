import { hasMainStat } from 'lib/relics/scoring/substatScoring'
import { useRelicStore } from 'lib/stores/relic/relicStore'
import type {
  Character,
  CharacterId,
} from 'types/character'
import { type Nullable } from 'types/common'
import type { Relic } from 'types/relic'
import type {
  CharacterScoringResult,
  RelicScoringResult,
} from './types'

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
      correctMainStats: 0,
    }
  }

  const scoredRelics = relics.map((x) => getCurrentRelicScore(x, character.id))
  const avgPerfection = scoredRelics.reduce((acc, r) => acc + r.percentScore, 0) / 6

  let correctMainStats = 0
  for (let i = 0; i < scoredRelics.length; i++) {
    const r = scoredRelics[i]
    const relic = relics[i]
    if (relic && r.part && r.meta && hasMainStat(r.part) && r.meta.parts[r.part].includes(relic.main.stat)) {
      correctMainStats++
    }
  }

  return {
    relics: scoredRelics,
    totalScore: avgPerfection,
    totalRating: '',
    correctMainStats,
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
      correctMainStats: 0,
    }
  }
  const relicsById = useRelicStore.getState().relicsById
  const relics = Object.values(character.equipped).map((x) => relicsById[x])
  return scoreCharacterWithRelicsUsingScorer(character, relics, getCurrentRelicScore)
}
