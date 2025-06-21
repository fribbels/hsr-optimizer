import {
  MainStats,
  Parts,
  Sets,
  SubStats,
} from 'lib/constants/constants'
import { TsUtils } from 'lib/utils/TsUtils'
import { CharacterId } from 'types/character'
import { Relic } from 'types/relic'
import { create } from 'zustand'

export interface RelicTabFilters {
  part: Array<Parts>
  enhance: Array<number>
  grade: Array<number>
  initialRolls: Array<number>
  verified: Array<boolean>
  equipped: Array<boolean>
  set: Array<Sets>
  mainStat: Array<MainStats>
  subStat: Array<SubStats>
}

const defaultState: RelicsTabStateValues = {
  focusCharacter: null,
  selectedRelic: null,
  excludedRelicPotentialCharacters: [],
  filters: {
    part: [],
    enhance: [],
    grade: [],
    initialRolls: [],
    verified: [],
    equipped: [],
    set: [],
    mainStat: [],
    subStat: [],
  },
}

interface RelicsTabStateValues {
  focusCharacter: CharacterId | null
  selectedRelic: Relic | null
  excludedRelicPotentialCharacters: Array<CharacterId>
  filters: RelicTabFilters
}

interface RelicsTabStateActions {
  setFocusCharacter: (character: RelicsTabStateValues['focusCharacter']) => void
  setSelectedRelic: (relic: RelicsTabStateValues['selectedRelic']) => void
  setExcludedRelicPotentialCharacters: (characters: RelicsTabStateValues['excludedRelicPotentialCharacters']) => void

  setFilters: (filters: RelicsTabStateValues['filters']) => void
  setFilter: <T extends keyof RelicsTabStateValues['filters']>(key: T) => (value: RelicsTabStateValues['filters'][T]) => void
  resetFilters: () => void
}

type RelicsTabState = RelicsTabStateActions & RelicsTabStateValues

const useRelicsTabStore = create<RelicsTabState>()((set) => ({
  ...defaultState,
  setFocusCharacter: (focusCharacter) => set({ focusCharacter }),
  setSelectedRelic: (selectedRelic) => set({ selectedRelic }),
  setExcludedRelicPotentialCharacters: (excludedRelicPotentialCharacters) => set({ excludedRelicPotentialCharacters }),

  setFilters: (filters) => set({ filters }),
  setFilter: (key) => (value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: TsUtils.clone(defaultState.filters) }),
}))

export default useRelicsTabStore
