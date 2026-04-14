// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useBenchmarksTabStore, type SimpleCharacterSets } from './useBenchmarksTabStore'
import type { CharacterModalForm } from 'lib/overlays/modals/characterModalStore'
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { Jingliu } from 'lib/conditionals/character/1200/Jingliu'
import { Robin } from 'lib/conditionals/character/1300/Robin'
import { PatienceIsAllYouNeed } from 'lib/conditionals/lightcone/5star/PatienceIsAllYouNeed'
import { IShallBeMyOwnSword } from 'lib/conditionals/lightcone/5star/IShallBeMyOwnSword'
import { Sets } from 'lib/constants/constants'
import { defaultSetConditionals } from 'lib/optimization/defaultForm'
import { clone } from 'lib/utils/objectUtils'
import type { BenchmarkSimulationOrchestrator } from 'lib/simulations/orchestrator/benchmarkSimulationOrchestrator'

// ---- Constants ----

const KAFKA_LC = PatienceIsAllYouNeed.id
const JINGLIU_LC = IShallBeMyOwnSword.id

// ---- Helpers ----

function state() {
  return useBenchmarksTabStore.getState()
}

function makeTeammate(overrides: Partial<SimpleCharacterSets> = {}): SimpleCharacterSets {
  return {
    characterId: Kafka.id,
    lightCone: KAFKA_LC,
    characterEidolon: 0,
    lightConeSuperimposition: 1,
    ...overrides,
  }
}

function makeCharacterModalForm(overrides: Partial<CharacterModalForm> = {}): CharacterModalForm {
  return {
    characterId: Kafka.id,
    lightCone: KAFKA_LC,
    characterEidolon: 0,
    lightConeSuperimposition: 1,
    teamRelicSet: Sets.MusketeerOfWildWheat,
    teamOrnamentSet: Sets.SpaceSealingStation,
    ...overrides,
  }
}

function makeOrchestrator(): BenchmarkSimulationOrchestrator {
  return {} as BenchmarkSimulationOrchestrator
}

// ---- Reset ----

beforeEach(() => {
  useBenchmarksTabStore.setState(useBenchmarksTabStore.getInitialState())
})

// ---- Tests ----

describe('useBenchmarksTabStore', () => {
  describe('initial state', () => {
    it('store initializes with no teammates, empty results, loading false, and no selected index', () => {
      expect(state().selectedTeammateIndex).toBeUndefined()
      expect(state().teammate0).toBeUndefined()
      expect(state().teammate1).toBeUndefined()
      expect(state().teammate2).toBeUndefined()
      expect(state().storedRelics).toEqual([])
      expect(state().storedOrnaments).toEqual([])
      expect(state().loading).toBe(false)
      expect(state().orchestrators).toEqual([])
    })

    it('store initializes with default setConditionals', () => {
      // clone() converts undefined to null, so compare cloned values
      expect(state().setConditionals).toEqual(clone(defaultSetConditionals))
    })
  })

  describe('teammate management', () => {
    it('updateTeammate at index 0 sets teammate0 and preserves other teammates', () => {
      const tm1 = makeTeammate({ characterId: Jingliu.id })
      state().updateTeammate(1, tm1)

      const tm0 = makeTeammate()
      state().updateTeammate(0, tm0)

      expect(state().teammate0).toEqual(tm0)
      expect(state().teammate1).toEqual(tm1)
      expect(state().teammate2).toBeUndefined()
    })

    it('updateTeammate at index 1 sets teammate1 and preserves other teammates', () => {
      const tm0 = makeTeammate()
      state().updateTeammate(0, tm0)

      const tm1 = makeTeammate({ characterId: Jingliu.id })
      state().updateTeammate(1, tm1)

      expect(state().teammate0).toEqual(tm0)
      expect(state().teammate1).toEqual(tm1)
    })

    it('updateTeammate at index 2 sets teammate2 and preserves other teammates', () => {
      const tm2 = makeTeammate({ characterId: Robin.id })
      state().updateTeammate(2, tm2)

      expect(state().teammate0).toBeUndefined()
      expect(state().teammate1).toBeUndefined()
      expect(state().teammate2).toEqual(tm2)
    })

    it('updateTeammate with undefined clears the teammate at that index', () => {
      const tm0 = makeTeammate()
      state().updateTeammate(0, tm0)
      expect(state().teammate0).toEqual(tm0)

      state().updateTeammate(0, undefined)
      expect(state().teammate0).toBeUndefined()
    })

    it('updateTeammate with out-of-bounds index does not change any teammate', () => {
      const tm0 = makeTeammate()
      state().updateTeammate(0, tm0)

      state().updateTeammate(5, makeTeammate({ characterId: Robin.id }))

      expect(state().teammate0).toEqual(tm0)
      expect(state().teammate1).toBeUndefined()
      expect(state().teammate2).toBeUndefined()
    })
  })

  describe('character modal confirmation', () => {
    it('onCharacterModalOk updates the teammate at selectedTeammateIndex and resets the index', () => {
      state().setSelectedTeammateIndex(1)
      const form = makeCharacterModalForm({ characterId: Jingliu.id, lightCone: JINGLIU_LC })

      state().onCharacterModalOk(form)

      expect(state().teammate1).toEqual(expect.objectContaining({
        characterId: Jingliu.id,
        lightCone: JINGLIU_LC,
        teamRelicSet: form.teamRelicSet,
        teamOrnamentSet: form.teamOrnamentSet,
      }))
      expect(state().selectedTeammateIndex).toBeUndefined()
    })

    it('onCharacterModalOk does not update any teammate when selectedTeammateIndex is undefined', () => {
      const tm0 = makeTeammate()
      state().updateTeammate(0, tm0)
      // selectedTeammateIndex defaults to undefined

      state().onCharacterModalOk(makeCharacterModalForm({ characterId: Jingliu.id }))

      expect(state().teammate0).toEqual(tm0)
    })

    it('onCharacterModalOk is a no-op when form is missing characterId', () => {
      state().setSelectedTeammateIndex(0)
      state().updateTeammate(0, makeTeammate())

      state().onCharacterModalOk(makeCharacterModalForm({ characterId: null }))

      expect(state().teammate0).toEqual(makeTeammate())
      // selectedTeammateIndex stays set because we returned early
      expect(state().selectedTeammateIndex).toBe(0)
    })

    it('onCharacterModalOk is a no-op when form is missing lightCone', () => {
      state().setSelectedTeammateIndex(0)
      state().updateTeammate(0, makeTeammate())

      state().onCharacterModalOk(makeCharacterModalForm({ lightCone: null }))

      expect(state().teammate0).toEqual(makeTeammate())
      expect(state().selectedTeammateIndex).toBe(0)
    })

    it('onCharacterModalOk always resets selectedTeammateIndex even when teammate is updated', () => {
      state().setSelectedTeammateIndex(2)
      state().onCharacterModalOk(makeCharacterModalForm())
      expect(state().selectedTeammateIndex).toBeUndefined()
    })
  })

  describe('results and cache', () => {
    it('setResults stores orchestrators, storedRelics, and storedOrnaments', () => {
      const orchestrators = [makeOrchestrator(), makeOrchestrator()]
      const relics = [{ simRelicSet1: undefined, simRelicSet2: undefined }]
      const ornaments = [{ simOrnamentSet: undefined }]

      state().setResults(orchestrators, relics, ornaments)

      expect(state().orchestrators).toBe(orchestrators)
      expect(state().storedRelics).toBe(relics)
      expect(state().storedOrnaments).toBe(ornaments)
    })

    it('resetCache clears orchestrators, storedRelics, and storedOrnaments to empty arrays', () => {
      state().setResults([makeOrchestrator()], [{}], [{}])

      state().resetCache()

      expect(state().orchestrators).toEqual([])
      expect(state().storedRelics).toEqual([])
      expect(state().storedOrnaments).toEqual([])
    })

    it('resetCache preserves teammate data', () => {
      const tm0 = makeTeammate()
      state().updateTeammate(0, tm0)
      state().setResults([makeOrchestrator()], [{}], [{}])

      state().resetCache()

      expect(state().teammate0).toEqual(tm0)
    })

    // handleResetBenchmarks must clear both store results and module-level computation cache
    it('handleResetBenchmarks clears both store results and module-level computation cache', async () => {
      const { handleResetBenchmarks, clearBenchmarkCache } = await import('./benchmarksTabController')
      expect(typeof clearBenchmarkCache).toBe('function')
      expect(typeof handleResetBenchmarks).toBe('function')

      // Seed some store results
      state().setResults([makeOrchestrator()], [{}], [{}])
      expect(state().orchestrators).toHaveLength(1)

      // handleResetBenchmarks should clear both store and cache
      handleResetBenchmarks()
      expect(state().orchestrators).toEqual([])
      expect(state().storedRelics).toEqual([])
      expect(state().storedOrnaments).toEqual([])
    })
  })

  describe('loading lifecycle', () => {
    it('setLoading toggles the loading flag', () => {
      expect(state().loading).toBe(false)
      state().setLoading(true)
      expect(state().loading).toBe(true)
      state().setLoading(false)
      expect(state().loading).toBe(false)
    })
  })

  describe('setConditionals management', () => {
    it('setSetConditional updates a single set conditional value', () => {
      // Get current value (don't assume specific default)
      const initialValue = state().setConditionals[Sets.BandOfSizzlingThunder]?.[1]

      // Toggle to opposite of current value
      const newValue = !initialValue
      state().setSetConditional(Sets.BandOfSizzlingThunder, newValue)

      expect(state().setConditionals[Sets.BandOfSizzlingThunder][1]).toBe(newValue)
    })

    it('setSetConditionals replaces entire setConditionals object', () => {
      const newConditionals = clone(defaultSetConditionals)
      // clone converts undefined to null, so use type assertion
      newConditionals[Sets.BandOfSizzlingThunder] = [null as unknown as undefined, true]

      state().setSetConditionals(newConditionals)

      expect(state().setConditionals).toEqual(newConditionals)
    })
  })

  describe('simple setters', () => {
    it('setSelectedTeammateIndex sets the index and clears it with undefined', () => {
      state().setSelectedTeammateIndex(2)
      expect(state().selectedTeammateIndex).toBe(2)
      state().setSelectedTeammateIndex(undefined)
      expect(state().selectedTeammateIndex).toBeUndefined()
    })
  })
})
