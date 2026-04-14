
import type { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import type { SetConditionals } from 'lib/optimization/combo/comboTypes'
import type { CharacterModalForm } from 'lib/overlays/modals/characterModalStore'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import { defaultSetConditionals } from 'lib/optimization/defaultForm'
import { clone } from 'lib/utils/objectUtils'
import { computeSetSetConditional } from 'lib/stores/optimizerForm/optimizerFormStoreActions'
import type {
  SetsOrnaments,
  SetsRelics,
} from 'lib/sets/setConfigRegistry'

export type BenchmarkForm = {
  characterId: CharacterId,
  lightCone: LightConeId,
  characterEidolon: number,
  lightConeSuperimposition: number,
  basicSpd: number,
  errRope: boolean,
  subDps: boolean,
  simRelicSet1?: SetsRelics,
  simRelicSet2?: SetsRelics,
  simOrnamentSet?: SetsOrnaments,
  teammate0?: SimpleCharacter,
  teammate1?: SimpleCharacter,
  teammate2?: SimpleCharacter,
  setConditionals: SetConditionals,
}

export type SimpleCharacter = {
  characterId: CharacterId,
  lightCone: LightConeId,
  characterEidolon: number,
  lightConeSuperimposition: number,
}

export type SimpleCharacterSets = {
  characterId: CharacterId,
  lightCone: LightConeId,
  characterEidolon: number,
  lightConeSuperimposition: number,
  teamOrnamentSet?: string,
  teamRelicSet?: string,
}

type RelicSetSelection = {
  simRelicSet1?: SetsRelics,
  simRelicSet2?: SetsRelics,
}

type OrnamentSetSelection = {
  simOrnamentSet?: SetsOrnaments,
}

type BenchmarksTabState = {
  selectedTeammateIndex: number | undefined,
  teammate0: SimpleCharacterSets | undefined,
  teammate1: SimpleCharacterSets | undefined,
  teammate2: SimpleCharacterSets | undefined,

  storedRelics: RelicSetSelection[],
  storedOrnaments: OrnamentSetSelection[],
  loading: boolean,

  orchestrators: BenchmarkSimulationOrchestrator[],

  updateTeammate: (index: number, data?: SimpleCharacterSets) => void,
  onCharacterModalOk: (character: CharacterModalForm) => void,

  setSelectedTeammateIndex: (index: number | undefined) => void,
  setResults: (
    orchestrators: BenchmarkSimulationOrchestrator[],
    mergedStoredRelics: RelicSetSelection[],
    mergedStoredOrnaments: OrnamentSetSelection[],
  ) => void,
  resetCache: () => void,
  setLoading: (loading: boolean) => void,

  setConditionals: SetConditionals,
  setSetConditional: (key: string, value: boolean | number) => void,
  setSetConditionals: (conditionals: SetConditionals) => void,
}

export const useBenchmarksTabStore = createTabAwareStore<BenchmarksTabState>((set, get) => ({
  selectedTeammateIndex: undefined,
  teammate0: undefined,
  teammate1: undefined,
  teammate2: undefined,

  storedRelics: [],
  storedOrnaments: [],
  loading: false,

  orchestrators: [],
  setConditionals: clone(defaultSetConditionals),

  updateTeammate: (index, data?: SimpleCharacterSets) =>
    set((state) => ({
      teammate0: index === 0 ? data : state.teammate0,
      teammate1: index === 1 ? data : state.teammate1,
      teammate2: index === 2 ? data : state.teammate2,
    })),

  onCharacterModalOk: (form: CharacterModalForm) => {
    if (!form.characterId || !form.lightCone) return

    const character: SimpleCharacterSets = {
      characterId: form.characterId,
      characterEidolon: form.characterEidolon,
      lightCone: form.lightCone,
      lightConeSuperimposition: form.lightConeSuperimposition,
      teamRelicSet: form.teamRelicSet,
      teamOrnamentSet: form.teamOrnamentSet,
    }

    const { selectedTeammateIndex, updateTeammate } = get()

    if (selectedTeammateIndex != null) {
      updateTeammate(selectedTeammateIndex, character)
    }

    set({
      selectedTeammateIndex: undefined,
    })
  },

  setSelectedTeammateIndex: (index) => set({ selectedTeammateIndex: index }),
  setResults: (orchestrators, mergedStoredRelics, mergedStoredOrnaments) =>
    set({
      orchestrators,
      storedRelics: mergedStoredRelics,
      storedOrnaments: mergedStoredOrnaments,
    }),

  resetCache: () =>
    set({
      orchestrators: [],
      storedRelics: [],
      storedOrnaments: [],
    }),

  setLoading: (loading: boolean) =>
    set({
      loading,
    }),

  setSetConditional: (key, value) => set((state) =>
    computeSetSetConditional(state, key, value)
  ),

  setSetConditionals: (conditionals: SetConditionals) =>
    set({ setConditionals: conditionals }),
}))
