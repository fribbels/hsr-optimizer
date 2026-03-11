import { getScoringMetadata, useScoringStore } from 'lib/stores/scoringStore'
import {
  useEffect,
  useState,
} from 'react'
import { CharacterId } from 'types/character'
import { Nullable } from 'types/common'
import { ScoringMetadata } from 'types/metadata'

export function useScoringMetadata(id: CharacterId): ScoringMetadata
export function useScoringMetadata(id: Nullable<CharacterId>): null | ScoringMetadata
export function useScoringMetadata(id: Nullable<CharacterId>) {
  const [metadata, setMetadata] = useState<ScoringMetadata | null>(id ? getScoringMetadata(id) : null)
  const scoringMetadataOverrides = useScoringStore((s) => s.scoringMetadataOverrides)
  const focusCharacterOverride = id ? scoringMetadataOverrides[id] : null
  useEffect(() => {
    if (!id) return setMetadata(null)
    setMetadata(getScoringMetadata(id))
  }, [id, focusCharacterOverride])
  return metadata
}
