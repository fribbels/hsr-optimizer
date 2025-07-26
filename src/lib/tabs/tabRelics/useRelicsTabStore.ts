import { IRowNode } from 'ag-grid-community'
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

export type RelicTabFilters = {
  part: Array<Parts>,
  enhance: Array<number>,
  grade: Array<number>,
  initialRolls: Array<number>,
  verified: Array<boolean>,
  equipped: Array<boolean>,
  set: Array<Sets>,
  mainStat: Array<MainStats>,
  subStat: Array<SubStats>,
}

export enum RelicInsights {
  Buckets,
  Top10,
}

export enum InsightCharacters {
  All,
  Custom,
  Owned,
}

const defaultState: RelicsTabStateValues = {
  focusCharacter: null,
  selectedRelicId: null,
  selectedRelicsIds: [],
  relicModalOpen: false,
  valueColumns: [
    'weights.current',
    'weights.rerollAvgSelected',
    'weights.rerollAvgSelectedDelta',
    'weights.potentialSelected.averagePct',
    'weights.potentialSelected.bestPct',
    'weights.potentialAllCustom.averagePct',
    'weights.potentialAllCustom.bestPct',
  ],
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
  insightsMode: RelicInsights.Buckets,
  insightsCharacters: InsightCharacters.Custom,
}

interface RelicsTabStateValues {
  focusCharacter: CharacterId | null
  selectedRelicId: Relic['id'] | null
  selectedRelicsIds: Array<Relic['id']>
  relicModalOpen: boolean
  valueColumns: ValueColumnField[]
  deleteConfirmOpen: boolean
  excludedRelicPotentialCharacters: Array<CharacterId>
  filters: RelicTabFilters
  insightsMode: RelicInsights
  insightsCharacters: InsightCharacters
}

interface RelicsTabStateActions {
  setFocusCharacter: (character: RelicsTabStateValues['focusCharacter']) => void
  setSelectedRelicsIds: (relic: RelicsTabStateValues['selectedRelicsIds']) => void
  setRelicModalOpen: (relicModalOpen: RelicsTabStateValues['relicModalOpen']) => void
  setValueColumns: (cols: RelicsTabStateValues['valueColumns']) => void
  setDeleteConfirmOpen: (open: RelicsTabStateValues['deleteConfirmOpen']) => void
  setExcludedRelicPotentialCharacters: (characters: RelicsTabStateValues['excludedRelicPotentialCharacters']) => void

  setFilters: (filters: RelicsTabStateValues['filters']) => void
  setFilter: <T extends keyof RelicsTabStateValues['filters']>(key: T) => (value: RelicsTabStateValues['filters'][T]) => void
  resetFilters: () => void

  setInsightsMode: (mode: RelicInsights) => void
  setInsightsCharacters: (mode: InsightCharacters) => void
}

type RelicsTabState = RelicsTabStateActions & RelicsTabStateValues

const useRelicsTabStore = create<RelicsTabState>()((set) => ({
  ...defaultState,
  setFocusCharacter: (focusCharacter) => set({ focusCharacter }),
  setSelectedRelicsIds: (ids) => set({ selectedRelicId: ids.at(-1) ?? null, selectedRelicsIds: [...ids] }),
  setRelicModalOpen: (relicModalOpen) => set({ relicModalOpen }),
  setValueColumns: (cols) => set({ valueColumns: [...cols] }),
  setDeleteConfirmOpen: (deleteConfirmOpen) => set({ deleteConfirmOpen }),
  setExcludedRelicPotentialCharacters: (excludedRelicPotentialCharacters) => set({ excludedRelicPotentialCharacters }),

  setFilters: (filters) => set({ filters }),
  setFilter: (key) => (value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: TsUtils.clone(defaultState.filters) }),

  setInsightsMode: (insightsMode) => set({ insightsMode }),
  setInsightsCharacters: (insightsCharacters) => set({ insightsCharacters }),
}))

export default useRelicsTabStore
