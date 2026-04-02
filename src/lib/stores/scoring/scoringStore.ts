import { SubStats } from 'lib/constants/constants'
import { setModifiedScoringMetadata } from 'lib/scoring/scoreComparison'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import type { CharacterId } from 'types/character'
import type { ScoringMetadata, SimulationMetadata } from 'types/metadata'
import { clone, mergeUndefinedValues } from 'lib/utils/objectUtils'

type ScoringStoreState = {
  scoringMetadataOverrides: Partial<Record<CharacterId, ScoringMetadata>>
  scoringVersion: number
}

type ScoringStoreActions = {
  setScoringMetadataOverrides: (overrides: Partial<Record<CharacterId, ScoringMetadata>>) => void
  updateCharacterOverrides: (id: CharacterId, updated: Partial<ScoringMetadata>) => void
  updateSimulationOverrides: (id: CharacterId, simulation: Partial<SimulationMetadata>) => void
  clearSimulationOverrides: (id: CharacterId) => void
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
    const overrides = { ...prev, [id]: { stats: {}, ...prev[id], ...updated } }

    const characterMeta = getGameMetadata().characters[id]
    if (!characterMeta?.scoringMetadata) return
    const defaultScoringMetadata = characterMeta.scoringMetadata
    setModifiedScoringMetadata(defaultScoringMetadata, overrides[id]!)

    set({ scoringMetadataOverrides: overrides, scoringVersion: get().scoringVersion + 1 })
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
    const overrides = { ...prev, [id]: rest }
    set({ scoringMetadataOverrides: overrides, scoringVersion: get().scoringVersion + 1 })
  },
}))

/**
 * Gets scoring metadata for a character, merged with overrides.
 */
export function getScoringMetadata(id: CharacterId): ScoringMetadata {
  const characterMeta = getGameMetadata().characters[id]
  if (!characterMeta?.scoringMetadata) return { stats: {}, parts: {}, presets: [], sortOption: {}, hiddenColumns: [] } as unknown as ScoringMetadata
  const defaultScoringMetadata = characterMeta.scoringMetadata
  const override = useScoringStore.getState().scoringMetadataOverrides[id]
  const cloned = clone(override) ?? {}
  const returnScoringMetadata = mergeUndefinedValues(cloned, defaultScoringMetadata) as ScoringMetadata

  // Deep-merge simulation: partial overrides (e.g. deprioritizeBuffs) must inherit
  // default simulation properties (e.g. teammates) that weren't overridden
  if (override?.simulation && defaultScoringMetadata.simulation) {
    returnScoringMetadata.simulation = { ...clone(defaultScoringMetadata.simulation), ...returnScoringMetadata.simulation }
  }

  for (const stat of SubStats) {
    if (returnScoringMetadata.stats[stat] == null) {
      returnScoringMetadata.stats[stat] = 0
    }
  }

  setModifiedScoringMetadata(defaultScoringMetadata, returnScoringMetadata)

  // @ts-expect-error - presets are not needed for scoring
  delete returnScoringMetadata.presets

  return returnScoringMetadata
}
