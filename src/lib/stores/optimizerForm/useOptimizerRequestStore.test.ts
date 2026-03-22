// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { createDefaultTeammate } from 'lib/stores/optimizerForm/optimizerFormDefaults'
import { displayToInternal } from 'lib/stores/optimizerForm/optimizerFormConversions'
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { Jingliu } from 'lib/conditionals/character/1200/Jingliu'
import { Sets } from 'lib/constants/constants'
import { type CharacterId } from 'types/character'
import { type LightConeId } from 'types/lightCone'
import { type SetFilters } from 'lib/tabs/tabOptimizer/optimizerForm/components/RelicSetFilterModal/relicSetFilterModalTypes'

// ---- Constants ----

const LC_ALONG_THE_PASSING_SHORE = '23020' as LightConeId
const LC_PATIENCE_IS_ALL_YOU_NEED = '23007' as LightConeId

// ---- Helpers ----

function state() {
  return useOptimizerRequestStore.getState()
}

// ---- Reset ----

beforeEach(() => {
  useOptimizerRequestStore.setState(useOptimizerRequestStore.getInitialState())
})

// ---- Tests ----

describe('useOptimizerRequestStore', () => {
  describe('initial state', () => {
    it('store initializes with undefined characterId, three default teammates, and correct filter defaults', () => {
      expect(state().characterId).toBeUndefined()
      expect(state().teammates).toHaveLength(3)
      for (const teammate of state().teammates) {
        expect(teammate.characterId).toBeUndefined()
        expect(teammate.characterEidolon).toBe(0)
        expect(teammate.lightConeSuperimposition).toBe(1)
      }
      expect(state().enhance).toBe(9)
      expect(state().grade).toBe(5)
      expect(state().includeEquippedRelics).toBe(true)
    })
  })

  describe('simple setters update their respective fields', () => {
    it('filter setters update stat, rating, and combat buff fields', () => {
      state().setStatFilter('minAtk', 500)
      expect(state().statFilters.minAtk).toBe(500)

      state().setStatFilter('minAtk', undefined)
      expect(state().statFilters.minAtk).toBeUndefined()

      state().setRatingFilter('minBasic', 10000)
      expect(state().ratingFilters.minBasic).toBe(10000)

      state().setCombatBuff('ATK', 100)
      expect(state().combatBuffs['ATK']).toBe(100)
    })

    it('display and config setters update their fields', () => {
      state().setStatDisplay('base')
      state().setMemoDisplay('memo')
      state().setComboStateJson('{"test":1}')
      state().setComboType('ADVANCED' as any)
      state().setComboTurnAbilities(['BASIC' as any, 'SKILL' as any])
      state().setComboPreprocessor(false)
      state().setDeprioritizeBuffs(true)
      state().setResultSort('BASIC' as any)
      state().setResultsLimit(2048)
      state().setStatSim({ key: 'test', benchmarks: {}, substatRolls: {} } as any)
      state().setEnemyField('enemyLevel', 80)

      expect(state().statDisplay).toBe('base')
      expect(state().memoDisplay).toBe('memo')
      expect(state().comboStateJson).toBe('{"test":1}')
      expect(state().comboType).toBe('ADVANCED')
      expect(state().comboTurnAbilities).toEqual(['BASIC', 'SKILL'])
      expect(state().comboPreprocessor).toBe(false)
      expect(state().deprioritizeBuffs).toBe(true)
      expect(state().resultSort).toBe('BASIC')
      expect(state().resultsLimit).toBe(2048)
      expect(state().statSim).toBeDefined()
      expect(state().enemyLevel).toBe(80)
    })
  })

  describe('teammate management', () => {
    it('setTeammateField updates one teammate without affecting others', () => {
      state().setTeammateField(0, 'characterId', Kafka.id)
      expect(state().teammates[0].characterId).toBe(Kafka.id)
      expect(state().teammates[1].characterId).toBeUndefined()
      expect(state().teammates[2].characterId).toBeUndefined()
    })

    it('clearTeammate resets targeted teammate to defaults', () => {
      state().setTeammateField(1, 'characterId', Jingliu.id)
      state().setTeammateField(1, 'characterEidolon', 4)
      state().clearTeammate(1)
      expect(state().teammates[1]).toEqual(createDefaultTeammate())
    })

    it('clearTeammateLightCone clears light cone but preserves character', () => {
      state().setTeammateField(0, 'characterId', Kafka.id)
      state().setTeammateField(0, 'lightCone', LC_ALONG_THE_PASSING_SHORE)
      state().setTeammateField(0, 'lightConeSuperimposition', 5)
      state().setTeammateField(0, 'lightConeConditionals', { x: 1 })
      state().clearTeammateLightCone(0)

      const teammate = state().teammates[0]
      expect(teammate.characterId).toBe(Kafka.id)
      expect(teammate.lightCone).toBeUndefined()
      expect(teammate.lightConeSuperimposition).toBe(1)
      expect(teammate.lightConeConditionals).toEqual({})
    })
  })

  describe('complex actions', () => {
    it('setRelicFilterField updates a relic filter field', () => {
      state().setRelicFilterField('enhance', 15)
      expect(state().enhance).toBe(15)
    })

    it('setMainStats updates main stat filter for a part', () => {
      state().setMainStats('mainBody', ['HP%', 'ATK%'])
      expect(state().mainBody).toEqual(['HP%', 'ATK%'])
    })

    it('setSetFilters updates set filter configuration', () => {
      const display: SetFilters = {
        fourPiece: ['Musketeer of Wild Wheat' as any],
        twoPieceCombos: [],
        ornaments: ['Rutilant Arena' as any],
      }
      state().setSetFilters(display)
      expect(state().setFilters).toEqual(display)
    })

    it('setWeight updates a single scoring weight', () => {
      state().setWeight('HP%', 0.5)
      expect(state().weights['HP%']).toBe(0.5)
    })

    it('setEidolon updates character eidolon level', () => {
      state().setEidolon(6)
      expect(state().characterEidolon).toBe(6)
    })

    it('setLightCone and setLightConeSuperimposition update light cone fields', () => {
      state().setLightCone(LC_ALONG_THE_PASSING_SHORE)
      state().setLightConeSuperimposition(5)
      expect(state().lightCone).toBe(LC_ALONG_THE_PASSING_SHORE)
      expect(state().lightConeSuperimposition).toBe(5)
    })

    it('setCharacterConditionals and setLightConeConditionals update conditional maps', () => {
      state().setCharacterConditionals({ a: 1 })
      state().setLightConeConditionals({ b: true })
      expect(state().characterConditionals).toEqual({ a: 1 })
      expect(state().lightConeConditionals).toEqual({ b: true })
    })

    it('setSetConditionals replaces entire set conditionals map', () => {
      const conds = { SomeSet: [undefined, 1] } as any
      state().setSetConditionals(conds)
      expect(state().setConditionals).toEqual(conds)
    })
  })

  describe('filter reset', () => {
    it('resetFilters preserves character and light cone while resetting filter fields to defaults', () => {
      useOptimizerRequestStore.setState({
        characterId: Kafka.id,
        characterEidolon: 4,
        lightCone: LC_ALONG_THE_PASSING_SHORE,
        lightConeSuperimposition: 3,
      })

      state().setRelicFilterField('enhance', 15)
      state().setRelicFilterField('grade', 4 as any)
      state().setMainStats('mainBody', ['HP%'])
      state().setSetFilters({ fourPiece: ['set1' as any], twoPieceCombos: [], ornaments: [] })

      state().resetFilters()

      expect(state().characterId).toBe(Kafka.id)
      expect(state().characterEidolon).toBe(4)
      expect(state().lightCone).toBe(LC_ALONG_THE_PASSING_SHORE)
      expect(state().lightConeSuperimposition).toBe(3)

      expect(state().enhance).toBe(9)
      expect(state().grade).toBe(5)
      expect(state().mainBody).toEqual([])
      expect(state().setFilters).toEqual({ fourPiece: [], twoPieceCombos: [], ornaments: [] })
    })

    it('applySuggestionFixes applies only provided fix keys without affecting other fields', () => {
      state().applySuggestionFixes({
        setFilters: { fourPiece: [], twoPieceCombos: [], ornaments: [] },
        mainBody: ['DEF%'],
      })
      expect(state().setFilters).toEqual({ fourPiece: [], twoPieceCombos: [], ornaments: [] })
      expect(state().mainBody).toEqual(['DEF%'])
      expect(state().mainFeet).toEqual([])
    })
  })

  describe('conditional actions', () => {
    it('setMainCharacterConditional updates a character conditional key', () => {
      state().setMainCharacterConditional('characterConditionals', 'ability1', true)
      expect(state().characterConditionals['ability1']).toBe(true)
    })

    it('setMainCharacterConditional updates a light cone conditional key', () => {
      state().setMainCharacterConditional('lightConeConditionals', 'passive1', 3)
      expect(state().lightConeConditionals['passive1']).toBe(3)
    })

    it('setTeammateConditional updates the correct teammate conditional', () => {
      state().setTeammateField(0, 'characterId', Kafka.id)
      state().setTeammateConditional(0, 'characterConditionals', 'dot', true)
      expect(state().teammates[0].characterConditionals['dot']).toBe(true)
      // Other teammates unaffected
      expect(state().teammates[1].characterConditionals).toEqual({})
    })

    it('setSetConditional creates or updates a set conditional tuple', () => {
      state().setSetConditional(Sets.BrokenKeel, 2)
      expect(state().setConditionals[Sets.BrokenKeel]).toEqual([undefined, 2])

      state().setSetConditional(Sets.BrokenKeel, 5)
      expect(state().setConditionals[Sets.BrokenKeel]).toEqual([undefined, 5])
    })

    it('setSetConditional does not mutate the original tuple', () => {
      state().setSetConditional(Sets.BrokenKeel, 1)
      const before = state().setConditionals[Sets.BrokenKeel]
      state().setSetConditional(Sets.BrokenKeel, 2)
      // Before should still be [undefined, 1] — not mutated
      expect(before).toEqual([undefined, 1])
    })
  })

  describe('setConditionals immutability', () => {
    // FORM-1 (HIGH): displayToInternal returns state.setConditionals by reference.
    // Downstream code (applyTeamAwareSetConditionalPresetsToStore) mutates tuples in-place,
    // corrupting store state outside of set().
    // This test asserts CORRECT behavior: displayToInternal should return cloned setConditionals.
    it('displayToInternal returns a cloned setConditionals, not a reference to store state (FORM-1)', () => {
      // Set a conditional in the store
      state().setSetConditional(Sets.BrokenKeel, 1)
      const storeConditionals = state().setConditionals

      // Get the form via displayToInternal
      const form = displayToInternal(state())

      // Mutate the form's setConditionals (simulating what applyTeamAwareSetConditionalPresets does)
      form.setConditionals[Sets.BrokenKeel][1] = 999

      // The store's state should NOT be affected
      expect(state().setConditionals[Sets.BrokenKeel][1]).toBe(1)
      // Also verify against our earlier snapshot
      expect(storeConditionals[Sets.BrokenKeel][1]).toBe(1)
    })
  })
})
