import {
  CONFIG_FIELD_MAP,
  hasOverrideContent,
} from 'lib/scoring/scoringConfig'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import {
  mergeAndPruneOverride,
  mergeDeltaWithDefaults,
} from 'lib/stores/scoring/scoringDelta'
import {
  omit,
  setOrOmit,
} from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'
import type {
  ScoringConfigType,
  ScoringMetadata,
  ScoringMetadataOverride,
  SimulationMetadata,
} from 'types/metadata'

type ScoringStoreState = {
  scoringMetadataOverrides: Partial<Record<CharacterId, ScoringMetadataOverride>>,
  scoringVersion: number,
}

type ScoringStoreActions = {
  setScoringMetadataOverrides: (overrides: Partial<Record<CharacterId, ScoringMetadataOverride>>) => void,
  updateCharacterOverrides: (id: CharacterId, updated: Partial<ScoringMetadataOverride>) => void,
  updateScoringConfigOverride: (id: CharacterId, configType: ScoringConfigType, simulation: Partial<SimulationMetadata>) => void,
  clearScoringConfigOverride: (id: CharacterId, configType: ScoringConfigType) => void,
  clearCharacterOverrides: (id: CharacterId) => void,
}

export type ScoringStore = ScoringStoreState & ScoringStoreActions

export const useScoringStore = createTabAwareStore<ScoringStore>((set, get) => ({
  scoringMetadataOverrides: {},
  scoringVersion: 0,

  setScoringMetadataOverrides: (overrides) =>
    set({
      scoringMetadataOverrides: overrides,
      scoringVersion: get().scoringVersion + 1,
    }),

  updateCharacterOverrides: (id, updated) => {
    const prev = get().scoringMetadataOverrides
    const defaults = getGameMetadata().characters[id]?.scoringMetadata
    if (!defaults) return

    const newOverride = mergeAndPruneOverride(prev[id], updated, defaults)
    set({ scoringMetadataOverrides: setOrOmit(prev, id, newOverride), scoringVersion: get().scoringVersion + 1 })
  },

  updateScoringConfigOverride: (id, configType, updatedSimulation) => {
    if (!updatedSimulation) return
    const field = CONFIG_FIELD_MAP[configType]
    const prev = get().scoringMetadataOverrides
    const overrides = {
      ...prev,
      [id]: {
        ...prev[id],
        [field]: { ...prev[id]?.[field], ...updatedSimulation },
      },
    }
    set({ scoringMetadataOverrides: overrides, scoringVersion: get().scoringVersion + 1 })
  },

  clearScoringConfigOverride: (id, configType) => {
    const field = CONFIG_FIELD_MAP[configType]
    const prev = get().scoringMetadataOverrides
    const existing = prev[id]
    if (!existing) return
    const { [field]: _, ...rest } = existing
    set({
      scoringMetadataOverrides: setOrOmit(prev, id, hasOverrideContent(rest as ScoringMetadataOverride) ? rest as ScoringMetadataOverride : undefined),
      scoringVersion: get().scoringVersion + 1,
    })
  },

  clearCharacterOverrides: (id) => {
    const prev = get().scoringMetadataOverrides
    set({ scoringMetadataOverrides: omit(prev, id), scoringVersion: get().scoringVersion + 1 })
  },
}))

const fallbackMetadata = { stats: {}, parts: {}, presets: [], sortOption: {}, hiddenColumns: [] } as unknown as ScoringMetadata

/**
 * Gets scoring metadata for a character, merged with overrides.
 */
export function getScoringMetadata(id: CharacterId): ScoringMetadata {
  const characterMeta = getGameMetadata().characters[id]
  if (!characterMeta?.scoringMetadata) return fallbackMetadata

  const defaults = characterMeta.scoringMetadata
  const override = useScoringStore.getState().scoringMetadataOverrides[id]

  const result = mergeDeltaWithDefaults(override, defaults)

  // @ts-expect-error - presets are not needed for scoring
  delete result.presets

  return result
}
