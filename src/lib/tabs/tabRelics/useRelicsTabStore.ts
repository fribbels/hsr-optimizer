import {
  type MainStats,
  type Parts,
  type Sets,
  type SubStats,
} from 'lib/constants/constants'
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'
import { type generateValueColumnOptions } from 'lib/tabs/tabRelics/columnDefs'
import { clone } from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'
import type { Relic } from 'types/relic'

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
  selectedRelicId: null,
  selectedRelicsIds: [],
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
  selectedRelicId: Relic['id'] | null
  selectedRelicsIds: Array<Relic['id']>
  valueColumns: ValueColumnField[]
  excludedRelicPotentialCharacters: Array<CharacterId>
  filters: RelicTabFilters
  insightsMode: RelicInsights
  insightsCharacters: InsightCharacters
}

interface RelicsTabStateActions {
  setFocusCharacter: (character: RelicsTabStateValues['focusCharacter']) => void
  setSelectedRelicsIds: (relic: RelicsTabStateValues['selectedRelicsIds']) => void
  setValueColumns: (cols: RelicsTabStateValues['valueColumns']) => void
  setExcludedRelicPotentialCharacters: (characters: RelicsTabStateValues['excludedRelicPotentialCharacters']) => void

  setFilters: (filters: RelicsTabStateValues['filters']) => void
  setFilter: <T extends keyof RelicsTabStateValues['filters']>(key: T) => (value: RelicsTabStateValues['filters'][T]) => void
  resetFilters: () => void

  setInsightsMode: (mode: RelicInsights) => void
  setInsightsCharacters: (mode: InsightCharacters) => void
}

type RelicsTabState = RelicsTabStateActions & RelicsTabStateValues

const useRelicsTabStore = createTabAwareStore<RelicsTabState>((set, get) => ({
  ...defaultState,
  setFocusCharacter: (focusCharacter) => set({ focusCharacter }),
  setSelectedRelicsIds: (ids) => {
    const newSelectedId = ids.at(-1) ?? null
    const currentIds = get().selectedRelicsIds
    // Skip no-op updates to avoid unnecessary re-renders from new array spreads
    if (
      newSelectedId === get().selectedRelicId
      && ids.length === currentIds.length
      && ids.every((id, i) => id === currentIds[i])
    ) return
    return set({ selectedRelicId: newSelectedId, selectedRelicsIds: [...ids] })
  },
  setValueColumns: (cols) => set({ valueColumns: [...cols] }),
  setExcludedRelicPotentialCharacters: (excludedRelicPotentialCharacters) => set({ excludedRelicPotentialCharacters: [...excludedRelicPotentialCharacters] }),

  setFilters: (filters) => set({ filters }),
  setFilter: (key) => (value) => set((s) => ({ filters: { ...s.filters, [key]: value } })),
  resetFilters: () => set({ filters: clone(defaultState.filters) }),

  setInsightsMode: (insightsMode) => set({ insightsMode }),
  setInsightsCharacters: (insightsCharacters) => set({ insightsCharacters }),
}))

export { useRelicsTabStore }
