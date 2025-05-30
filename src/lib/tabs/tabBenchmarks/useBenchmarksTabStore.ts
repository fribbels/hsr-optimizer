import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { SetConditionals } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { CharacterId } from 'types/character'
import { Form } from 'types/form'
import { LightCone } from 'types/lightCone'
import { create } from 'zustand'

export type BenchmarkForm = {
  characterId: CharacterId
  lightCone: LightCone['id']
  characterEidolon: number
  lightConeSuperimposition: number
  basicSpd: number
  errRope: boolean
  subDps: boolean
  simRelicSet1?: string
  simRelicSet2?: string
  simOrnamentSet?: string
  teammate0?: SimpleCharacter
  teammate1?: SimpleCharacter
  teammate2?: SimpleCharacter
  setConditionals: SetConditionals
}

export type SimpleCharacter = {
  characterId: CharacterId
  lightCone: LightCone['id']
  characterEidolon: number
  lightConeSuperimposition: number
}

type RelicSetSelection = {
  simRelicSet1?: string
  simRelicSet2?: string
}

type OrnamentSetSelection = {
  simOrnamentSet?: string
}

type BenchmarksTabState = {
  characterModalInitialCharacter: SimpleCharacter | undefined
  isCharacterModalOpen: boolean
  selectedTeammateIndex: number | undefined
  teammate0: SimpleCharacter | undefined
  teammate1: SimpleCharacter | undefined
  teammate2: SimpleCharacter | undefined

  storedRelics: RelicSetSelection[]
  storedOrnaments: OrnamentSetSelection[]
  loading: boolean

  orchestrators: BenchmarkSimulationOrchestrator[]

  updateTeammate: (index: number, data?: SimpleCharacter) => void
  onCharacterModalOk: (character: Form) => void

  setCharacterModalOpen: (isOpen: boolean) => void
  setCharacterModalInitialCharacter: (character: SimpleCharacter | undefined) => void
  setSelectedTeammateIndex: (index: number | undefined) => void
  setResults: (orchestrators: BenchmarkSimulationOrchestrator[], mergedStoredRelics: RelicSetSelection[], mergedStoredOrnaments: OrnamentSetSelection[]) => void
  resetCache: () => void
  setLoading: (loading: boolean) => void
}

export const useBenchmarksTabStore = create<BenchmarksTabState>((set, get) => ({
  characterModalInitialCharacter: undefined,
  isCharacterModalOpen: false,
  selectedTeammateIndex: undefined,
  teammate0: undefined,
  teammate1: undefined,
  teammate2: undefined,

  storedRelics: [],
  storedOrnaments: [],
  loading: false,

  benchmarkForm: undefined,
  orchestrators: [],

  updateTeammate: (index, data?: SimpleCharacter) => set((state) => {
    return {
      teammate0: index == 0 ? data : state.teammate0,
      teammate1: index == 1 ? data : state.teammate1,
      teammate2: index == 2 ? data : state.teammate2,
    }
  }),

  onCharacterModalOk: (form: Form) => {
    const character: SimpleCharacter = {
      characterId: form.characterId,
      characterEidolon: form.characterEidolon,
      lightCone: form.lightCone,
      lightConeSuperimposition: form.lightConeSuperimposition,
    }

    const { selectedTeammateIndex, updateTeammate } = get()

    if (selectedTeammateIndex != null && character) {
      updateTeammate(selectedTeammateIndex, character)
    }

    set({
      isCharacterModalOpen: false,
      selectedTeammateIndex: undefined,
    })
  },

  setCharacterModalOpen: (isOpen) => set({ isCharacterModalOpen: isOpen }),
  setCharacterModalInitialCharacter: (character?: SimpleCharacter) => set({ characterModalInitialCharacter: character }),
  setSelectedTeammateIndex: (index) => set({ selectedTeammateIndex: index }),
  setResults: (orchestrators, mergedStoredRelics, mergedStoredOrnaments) => set((state) => {
    return {
      orchestrators,
      storedRelics: mergedStoredRelics,
      storedOrnaments: mergedStoredOrnaments,
    }
  }),

  resetCache: () => set({
    orchestrators: [],
    storedRelics: [],
    storedOrnaments: [],
  }),

  setLoading: (loading: boolean) => set({
    loading,
  }),
}))
