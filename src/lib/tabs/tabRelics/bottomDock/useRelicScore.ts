import { useScoringMetadata } from 'lib/hooks/useScoringMetadata'
import { RelicScorer } from 'lib/relics/scoring/relicScorer'
import type { RelicScoringResult } from 'lib/relics/scoring/relicScorer'
import { useMemo } from 'react'
import type { CharacterId } from 'types/character'
import type { Nullable } from 'types/common'
import type { Relic } from 'types/relic'

/**
 * Computes a memoized relic score with per-character granularity.
 * Uses useScoringMetadata(characterId) so changing character A's weights
 * won't trigger re-scoring for character B.
 */
export function useRelicScore(
  relic: Relic | null | undefined,
  characterId: Nullable<CharacterId>,
): RelicScoringResult | undefined {
  const metadata = useScoringMetadata(characterId)

  return useMemo(() => {
    if (!relic || !characterId) return undefined
    return RelicScorer.scoreCurrentRelic(relic, characterId)
  }, [relic, characterId, metadata])
}
