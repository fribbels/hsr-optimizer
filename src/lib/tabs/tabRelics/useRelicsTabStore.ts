import {
  type MainStats,
  type Parts,
  type Sets,
  type SubStats,
} from 'lib/constants/constants'
import { getRelicById } from 'lib/stores/relicStore'
import { type generateValueColumnOptions } from 'lib/tabs/tabRelics/columnDefs'
import { clone } from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'
import type { Relic } from 'types/relic'
import { createTabAwareStore } from 'lib/stores/createTabAwareStore'

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
  ESTBP,
}

export enum InsightCharacters {
  All,
  Custom,
  Owned,
}

const defaultState: RelicsTabStateValues = {
  focusCharacter: null,
  selectedRelic: null,
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
  selectedRelic: Relic | null
  selectedRelicId: Relic['id'] | null
  selectedRelicsIds: Array<Relic['id']>
  relicModalOpen: boolean
  valueColumns: ValueColumnField[]
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
  setExcludedRelicPotentialCharacters: (characters: RelicsTabStateValues['excludedRelicPotentialCharacters']) => void

  setFilters: (filters: RelicsTabStateValues['filters']) => void
  setFilter: <T extends keyof RelicsTabStateValues['filters']>(key: T) => (value: RelicsTabStateValues['filters'][T]) => void
  resetFilters: () => void

  setInsightsMode: (mode: RelicInsights) => void
  setInsightsCharacters: (mode: InsightCharacters) => void
}

type RelicsTabState = RelicsTabStateActions & RelicsTabStateValues

const useRelicsTabStore = createTabAwareStore<RelicsTabState>((set) => ({
  ...defaultState,
  setFocusCharacter: (focusCharacter) => set({ focusCharacter }),
  setSelectedRelicsIds: (ids) => {
    const selectedId = ids.at(-1)
    const relic = getRelicById(selectedId) ?? null
    return set({ selectedRelic: relic, selectedRelicId: selectedId ?? null, selectedRelicsIds: [...ids] })
  },
  setRelicModalOpen: (relicModalOpen) => set({ relicModalOpen }),
  setValueColumns: (cols) => set({ valueColumns: [...cols] }),
  setExcludedRelicPotentialCharacters: (excludedRelicPotentialCharacters) => set({ excludedRelicPotentialCharacters }),

  setFilters: (filters) => set({ filters }),
  setFilter: (key) => (value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: clone(defaultState.filters) }),

  setInsightsMode: (insightsMode) => set({ insightsMode }),
  setInsightsCharacters: (insightsCharacters) => set({ insightsCharacters }),
}))

export { useRelicsTabStore }
