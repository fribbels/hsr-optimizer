import { getGameMetadata } from 'lib/state/gameMetadata'
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import { mergeAndPruneOverride, mergeDeltaWithDefaults } from 'lib/stores/scoring/scoringDelta'
import { omit, setOrOmit } from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'
import type { ScoringMetadata, ScoringMetadataOverride, SimulationMetadata } from 'types/metadata'

type ScoringStoreState = {
  scoringMetadataOverrides: Partial<Record<CharacterId, ScoringMetadataOverride>>
  scoringVersion: number
}

type ScoringStoreActions = {
  setScoringMetadataOverrides: (overrides: Partial<Record<CharacterId, ScoringMetadataOverride>>) => void
  updateCharacterOverrides: (id: CharacterId, updated: Partial<ScoringMetadataOverride>) => void
  updateSimulationOverrides: (id: CharacterId, simulation: Partial<SimulationMetadata>) => void
  clearSimulationOverrides: (id: CharacterId) => void
  clearCharacterOverrides: (id: CharacterId) => void
}

export type ScoringStore = ScoringStoreState & ScoringStoreActions

export const useScoringStore = createTabAwareStore<ScoringStore>((set, get) => ({
  scoringMetadataOverrides: {},
  scoringVersion: 0,

  setScoringMetadataOverrides: (overrides) => set({
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

  updateSimulationOverrides: (id, updatedSimulation) => {
    if (!updatedSimulation) return
    const prev = get().scoringMetadataOverrides
    const overrides = { ...prev, [id]: { ...prev[id], simulation: { ...prev[id]?.simulation, ...updatedSimulation } } }
    set({ scoringMetadataOverrides: overrides, scoringVersion: get().scoringVersion + 1 })
  },

  clearSimulationOverrides: (id) => {
    const prev = get().scoringMetadataOverrides
    const { simulation, ...rest } = prev[id] ?? {}
    const hasContent = rest.stats || rest.parts || rest.traces
    set({ scoringMetadataOverrides: setOrOmit(prev, id, hasContent ? rest : undefined), scoringVersion: get().scoringVersion + 1 })
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
