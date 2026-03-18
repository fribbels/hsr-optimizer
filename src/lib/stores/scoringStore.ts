import { SubStats } from 'lib/constants/constants'
import { setModifiedScoringMetadata } from 'lib/scoring/scoreComparison'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { createTabAwareStore } from 'lib/stores/createTabAwareStore'
import { Utils } from 'lib/utils/utils'
import { CharacterId } from 'types/character'
import { ScoringMetadata, SimulationMetadata } from 'types/metadata'

type ScoringStoreState = {
  scoringMetadataOverrides: Partial<Record<CharacterId, ScoringMetadata>>
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

  setScoringMetadataOverrides: (overrides) => set({ scoringMetadataOverrides: overrides }),

  updateCharacterOverrides: (id, updated) => {
    let overrides = get().scoringMetadataOverrides
    overrides = { ...overrides, [id]: { ...overrides[id], ...updated } }

    const defaultScoringMetadata = getGameMetadata().characters[id].scoringMetadata
    setModifiedScoringMetadata(defaultScoringMetadata, overrides[id]!)

    set({ scoringMetadataOverrides: overrides })
  },

  updateSimulationOverrides: (id, updatedSimulation) => {
    if (!updatedSimulation) return
    let overrides = get().scoringMetadataOverrides
    overrides = { ...overrides, [id]: { ...overrides[id], simulation: { ...overrides[id]?.simulation, ...updatedSimulation } } }
    set({ scoringMetadataOverrides: overrides })
  },

  clearSimulationOverrides: (id) => {
    let overrides = get().scoringMetadataOverrides
    const { simulation, ...rest } = overrides[id] ?? {}
    overrides = { ...overrides, [id]: rest }
    set({ scoringMetadataOverrides: overrides })
  },
}))

/**
 * Gets scoring metadata for a character, merged with overrides.
 */
export function getScoringMetadata(id: CharacterId): ScoringMetadata {
  const defaultScoringMetadata = getGameMetadata().characters[id].scoringMetadata
  const override = useScoringStore.getState().scoringMetadataOverrides[id]
  const returnScoringMetadata = Utils.mergeUndefinedValues(override || {}, defaultScoringMetadata) as ScoringMetadata

  for (const stat of SubStats) {
    if (returnScoringMetadata.stats[stat] === undefined) {
      returnScoringMetadata.stats[stat] = 0
    }
  }

  setModifiedScoringMetadata(defaultScoringMetadata, returnScoringMetadata)

  // @ts-expect-error - presets are not needed for scoring
  delete returnScoringMetadata.presets

  return returnScoringMetadata
}
