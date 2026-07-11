import {
  getDefaultScoringMetadata,
  getScoringMetadata,
  useScoringStore,
} from 'lib/stores/scoring/scoringStore'
import {
  createContext,
  useContext,
  useMemo,
} from 'react'
import { type CharacterId } from 'types/character'
import { type Nullable } from 'types/common'
import { type ScoringMetadata } from 'types/metadata'

const DefaultScoringContext = createContext(false)
export const DefaultScoringProvider = DefaultScoringContext

export function useDefaultScoringEnabled() {
  return useContext(DefaultScoringContext)
}

export function useScoringMetadata(id: CharacterId): ScoringMetadata
export function useScoringMetadata(id: Nullable<CharacterId>): null | ScoringMetadata
export function useScoringMetadata(id: Nullable<CharacterId>) {
  const useDefaults = useDefaultScoringEnabled()
  // override dep triggers memo recompute when store changes
  const override = useScoringStore((s) => id && !useDefaults ? s.scoringMetadataOverrides[id] : undefined)
  return useMemo(() => {
    if (!id) return null
    return useDefaults ? getDefaultScoringMetadata(id) : getScoringMetadata(id)
  }, [id, override, useDefaults])
}
