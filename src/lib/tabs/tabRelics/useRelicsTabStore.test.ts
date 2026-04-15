// @vitest-environment jsdom
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { Jingliu } from 'lib/conditionals/character/1200/Jingliu'
import {
  Parts,
  Sets,
} from 'lib/constants/constants'
import {
  beforeEach,
  describe,
  expect,
  it,
} from 'vitest'
import {
  InsightCharacters,
  RelicInsights,
  useRelicsTabStore,
} from './useRelicsTabStore'
import type {
  RelicTabFilters,
  ValueColumnField,
} from './useRelicsTabStore'

// ---- Constants ----

const RELIC_1 = 'cd85c14c-a662-4413-a149-a379e6d538d3'
const RELIC_2 = '0bd7404f-3420-4bf5-9e45-f79343728685'
const RELIC_3 = '77ac4c85-21a7-4526-999a-6e54646dda6d'

const emptyFilters: RelicTabFilters = {
  part: [],
  enhance: [],
  grade: [],
  initialRolls: [],
  verified: [],
  equipped: [],
  set: [],
  mainStat: [],
  subStat: [],
}

// ---- Helpers ----

function state() {
  return useRelicsTabStore.getState()
}

// ---- Reset ----

beforeEach(() => {
  useRelicsTabStore.setState(useRelicsTabStore.getInitialState())
})

// ---- Tests ----

describe('useRelicsTabStore', () => {
  describe('initial state', () => {
    it('store initializes with no focused relic, no selection, empty filters, and Buckets insight mode', () => {
      expect(state().focusCharacter).toBeNull()
      expect(state().selectedRelicId).toBeNull()
      expect(state().selectedRelicsIds).toEqual([])
      expect(state().excludedRelicPotentialCharacters).toEqual([])
      expect(state().insightsMode).toBe(RelicInsights.Buckets)
      expect(state().insightsCharacters).toBe(InsightCharacters.Custom)
      expect(state().valueColumns).toHaveLength(7)
      expect(state().filters).toEqual(emptyFilters)
    })
  })

  describe('relic selection', () => {
    it('selecting a single relic sets both selectedRelicId and selectedRelicsIds to that relic', () => {
      state().setSelectedRelicsIds([RELIC_1])
      expect(state().selectedRelicId).toBe(RELIC_1)
      expect(state().selectedRelicsIds).toEqual([RELIC_1])
    })

    it('selecting multiple relics sets selectedRelicId to the last relic in the list', () => {
      state().setSelectedRelicsIds([RELIC_1, RELIC_2, RELIC_3])
      expect(state().selectedRelicId).toBe(RELIC_3)
      expect(state().selectedRelicsIds).toEqual([RELIC_1, RELIC_2, RELIC_3])
    })

    it('passing an empty selection clears both selectedRelicId and selectedRelicsIds', () => {
      state().setSelectedRelicsIds([RELIC_1])
      state().setSelectedRelicsIds([])
      expect(state().selectedRelicId).toBeNull()
      expect(state().selectedRelicsIds).toEqual([])
    })

    it('re-selecting the same relic IDs preserves the existing selectedRelicsIds reference', () => {
      state().setSelectedRelicsIds([RELIC_1, RELIC_2])
      const before = state().selectedRelicsIds
      state().setSelectedRelicsIds([RELIC_1, RELIC_2])
      expect(state().selectedRelicsIds).toBe(before)
    })

    // Equality check must compare element-wise, not just length + last element
    it('selecting different relic IDs with matching length and last element still updates selectedRelicsIds', () => {
      state().setSelectedRelicsIds([RELIC_1, RELIC_2])
      const before = state().selectedRelicsIds
      state().setSelectedRelicsIds([RELIC_3, RELIC_2])
      expect(state().selectedRelicsIds).not.toBe(before)
    })
  })

  describe('filter management', () => {
    it('setting a grade filter preserves an existing part filter', () => {
      state().setFilter('grade')([4, 5])
      state().setFilter('part')([Parts.Head, Parts.Body])
      expect(state().filters.grade).toEqual([4, 5])
      expect(state().filters.part).toEqual([Parts.Head, Parts.Body])
      expect(state().filters.set).toEqual([])
    })

    it('resetFilters restores all filter keys to empty arrays', () => {
      state().setFilter('grade')([4, 5])
      state().setFilter('set')([Sets.BrokenKeel])
      state().resetFilters()
      expect(state().filters).toEqual(emptyFilters)
    })

    it('consecutive resetFilters calls produce separate filter objects', () => {
      state().resetFilters()
      const first = state().filters
      state().resetFilters()
      expect(state().filters).not.toBe(first)
    })

    // setFilters is currently dead code (no consumer calls it), but tested to guard the public API
    it('setFilters replaces the entire filters object', () => {
      const custom = { ...emptyFilters, grade: [5], equipped: [true] }
      state().setFilters(custom)
      expect(state().filters).toEqual(custom)
    })
  })

  describe('simple setters', () => {
    it('setFocusCharacter assigns a scoring character and clears it with null', () => {
      state().setFocusCharacter(Kafka.id)
      expect(state().focusCharacter).toBe(Kafka.id)
      state().setFocusCharacter(null)
      expect(state().focusCharacter).toBeNull()
    })

    it('setValueColumns replaces the displayed value column list', () => {
      const cols: ValueColumnField[] = ['weights.current', 'weights.rerollAvgSelected']
      state().setValueColumns(cols)
      expect(state().valueColumns).toEqual(['weights.current', 'weights.rerollAvgSelected'])
    })

    it('setExcludedRelicPotentialCharacters replaces the exclusion list for relic scoring', () => {
      state().setExcludedRelicPotentialCharacters([Kafka.id, Jingliu.id])
      expect(state().excludedRelicPotentialCharacters).toEqual([Kafka.id, Jingliu.id])
    })

    it('setInsightsMode and setInsightsCharacters update the insight panel configuration', () => {
      state().setInsightsMode(RelicInsights.Top10)
      state().setInsightsCharacters(InsightCharacters.All)
      expect(state().insightsMode).toBe(RelicInsights.Top10)
      expect(state().insightsCharacters).toBe(InsightCharacters.All)
    })
  })
})
