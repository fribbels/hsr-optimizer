import { getScoringMetadata, useScoringStore } from 'lib/stores/scoring/scoringStore'
import { useMemo } from 'react'
import { type CharacterId } from 'types/character'
import { type Nullable } from 'types/common'
import { type ScoringMetadata } from 'types/metadata'

export function useScoringMetadata(id: CharacterId): ScoringMetadata
export function useScoringMetadata(id: Nullable<CharacterId>): null | ScoringMetadata
export function useScoringMetadata(id: Nullable<CharacterId>) {
  // override dep triggers memo recompute when store changes
  const override = useScoringStore((s) => id ? s.scoringMetadataOverrides[id] : undefined)
  return useMemo(() => {
    if (!id) return null
    return getScoringMetadata(id)
  }, [id, override])
}
