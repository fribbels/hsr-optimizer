import { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'
import { Form } from 'types/form'
import { create } from 'zustand'

export type BenchmarkForm = {
  characterId: string
  lightCone: string
  characterEidolon: number
  lightConeSuperimposition: number
  basicSpd: number
  errRope: boolean
  simRelicSet1?: string
  simRelicSet2?: string
  simOrnamentSet?: string
  teammate0?: SimpleCharacter
  teammate1?: SimpleCharacter
  teammate2?: SimpleCharacter
}

export type SimpleCharacter = {
  characterId: string
  lightCone: string
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

  currentPartialHash: string | undefined
  benchmarkCache: Record<string, BenchmarkSimulationOrchestrator>
  storedRelics: RelicSetSelection[]
  storedOrnaments: OrnamentSetSelection[]

  orchestrator: BenchmarkSimulationOrchestrator | undefined
  orchestrators: BenchmarkSimulationOrchestrator[]

  updateTeammate: (index: number, data?: SimpleCharacter) => void
  onCharacterModalOk: (character: Form) => void

  setCharacterModalOpen: (isOpen: boolean) => void
  setCharacterModalInitialCharacter: (character: SimpleCharacter | undefined) => void
  setSelectedTeammateIndex: (index: number | undefined) => void
  setResults: (orchestrators: BenchmarkSimulationOrchestrator[], mergedStoredRelics: RelicSetSelection[], mergedStoredOrnaments: OrnamentSetSelection[]) => void
  resetCache: () => void
}

export const useBenchmarksTabStore = create<BenchmarksTabState>((set, get) => ({
  characterModalInitialCharacter: undefined,
  isCharacterModalOpen: false,
  selectedTeammateIndex: undefined,
  teammate0: undefined,
  teammate1: undefined,
  teammate2: undefined,

  currentPartialHash: undefined,
  benchmarkCache: {},
  storedRelics: [],
  storedOrnaments: [],

  benchmarkForm: undefined,
  orchestrator: undefined,
  orchestrators: [],

  // Update a specific teammate with new data
  updateTeammate: (index, data?: SimpleCharacter) => set((state) => {
    return {
      teammate0: index == 0 ? data : state.teammate0,
      teammate1: index == 1 ? data : state.teammate1,
      teammate2: index == 2 ? data : state.teammate2,
    }
  }),

  // Handler for when a character is selected in the modal
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
}))
