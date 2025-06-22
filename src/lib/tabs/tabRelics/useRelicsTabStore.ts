import {
  MainStats,
  Parts,
  Sets,
  SubStats,
} from 'lib/constants/constants'
import { generateValueColumnOptions } from 'lib/tabs/tabRelics/columnDefs'
import { TsUtils } from 'lib/utils/TsUtils'
import { CharacterId } from 'types/character'
import { Relic } from 'types/relic'
import { create } from 'zustand'

export type ValueColumnField = ReturnType<typeof generateValueColumnOptions>[number]['options'][number]['value']

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
  selectedRelics: [],
  valueColumns: [],
  deleteConfirmOpen: false,
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
  selectedRelics: Array<Relic>
  valueColumns: ValueColumnField[]
  deleteConfirmOpen: boolean
  excludedRelicPotentialCharacters: Array<CharacterId>
  filters: RelicTabFilters
}

interface RelicsTabStateActions {
  setFocusCharacter: (character: RelicsTabStateValues['focusCharacter']) => void
  setSelectedRelics: (relic: RelicsTabStateValues['selectedRelics']) => void
  setValueColumns: (cols: RelicsTabStateValues['valueColumns']) => void
  setDeleteConfirmOpen: (open: RelicsTabStateValues['deleteConfirmOpen']) => void
  setExcludedRelicPotentialCharacters: (characters: RelicsTabStateValues['excludedRelicPotentialCharacters']) => void

  setFilters: (filters: RelicsTabStateValues['filters']) => void
  setFilter: <T extends keyof RelicsTabStateValues['filters']>(key: T) => (value: RelicsTabStateValues['filters'][T]) => void
  resetFilters: () => void
}

type RelicsTabState = RelicsTabStateActions & RelicsTabStateValues

const useRelicsTabStore = create<RelicsTabState>()((set) => ({
  ...defaultState,
  setFocusCharacter: (focusCharacter) => set({ focusCharacter }),
  setSelectedRelics: (relics) => set({ selectedRelic: relics[0], selectedRelics: [...relics] }),
  setValueColumns: (cols) => set({ valueColumns: [...cols] }),
  setDeleteConfirmOpen: (deleteConfirmOpen) => set({ deleteConfirmOpen }),
  setExcludedRelicPotentialCharacters: (excludedRelicPotentialCharacters) => set({ excludedRelicPotentialCharacters }),

  setFilters: (filters) => set({ filters }),
  setFilter: (key) => (value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: TsUtils.clone(defaultState.filters) }),
}))

export default useRelicsTabStore
