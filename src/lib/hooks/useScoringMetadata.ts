import DB from 'lib/state/db'
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
  const [metadata, setMetadata] = useState<ScoringMetadata | null>(id ? DB.getScoringMetadata(id) : null)
  const scoringMetadataOverrides = window.store((s) => s.scoringMetadataOverrides)
  const focusCharacterOverride = id ? scoringMetadataOverrides[id] : null
  useEffect(() => {
    if (!id) return setMetadata(null)
    setMetadata(DB.getScoringMetadata(id))
  }, [id, focusCharacterOverride])
  return metadata
}
