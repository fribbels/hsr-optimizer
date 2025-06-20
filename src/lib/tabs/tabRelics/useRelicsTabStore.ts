import { CharacterId } from 'types/character'
import { RelicTabFilters } from 'types/store'
import { create } from 'zustand'

const defaultState: RelicsTabStateValues = {
  focusCharacter: null,
  excludedRelicPotentialCharacters: [],
  filters: {
    part: [],
    enhance: [],
    grade: [],
    initialRolls: [],
    verified: [],
    equippedBy: [],
    set: [],
    mainStats: [],
    subStats: [],
  },
}

type RelicsTabStateValues = {
  focusCharacter: CharacterId | null,
  excludedRelicPotentialCharacters: Array<CharacterId>,
  filters: RelicTabFilters,
}

type RelicsTabStateActions = {}

type RelicsTabState = RelicsTabStateActions & RelicsTabStateValues

const useRelicsTabStore = create<RelicsTabState>()((set) => ({
  ...defaultState,
}))

export default useRelicsTabStore
