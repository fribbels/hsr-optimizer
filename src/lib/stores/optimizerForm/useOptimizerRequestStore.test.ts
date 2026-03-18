// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { createDefaultTeammate } from 'lib/stores/optimizerForm/optimizerFormDefaults'
import { type CharacterId } from 'types/character'
import { type LightConeId } from 'types/lightCone'
import { type SetFilters } from 'lib/tabs/tabOptimizer/optimizerForm/components/RelicSetFilterModal/relicSetFilterModalTypes'

beforeEach(() => {
  useOptimizerRequestStore.setState(useOptimizerRequestStore.getInitialState())
})

// ---- Initial state tests ----

describe('initial state', () => {
  it('has undefined characterId', () => {
    const state = useOptimizerRequestStore.getState()
    expect(state.characterId).toBeUndefined()
  })

  it('has three default teammates', () => {
    const state = useOptimizerRequestStore.getState()
    expect(state.teammates).toHaveLength(3)
    for (const teammate of state.teammates) {
      expect(teammate.characterId).toBeUndefined()
      expect(teammate.characterEidolon).toBe(0)
      expect(teammate.lightConeSuperimposition).toBe(1)
    }
  })

  it('has correct relic filter defaults', () => {
    const state = useOptimizerRequestStore.getState()
    expect(state.enhance).toBe(9)
    expect(state.grade).toBe(5)
    expect(state.includeEquippedRelics).toBe(true)
  })
})

// ---- Simple setter tests (Task 8) ----

describe('simple setters', () => {
  it('setStatFilter updates a field', () => {
    useOptimizerRequestStore.getState().setStatFilter('minAtk', 500)
    expect(useOptimizerRequestStore.getState().statFilters.minAtk).toBe(500)
  })

  it('setStatFilter can set to undefined', () => {
    useOptimizerRequestStore.getState().setStatFilter('minAtk', 500)
    useOptimizerRequestStore.getState().setStatFilter('minAtk', undefined)
    expect(useOptimizerRequestStore.getState().statFilters.minAtk).toBeUndefined()
  })

  it('setRatingFilter updates a field', () => {
    useOptimizerRequestStore.getState().setRatingFilter('minBasic', 10000)
    expect(useOptimizerRequestStore.getState().ratingFilters.minBasic).toBe(10000)
  })

  it('setCombatBuff updates a field', () => {
    useOptimizerRequestStore.getState().setCombatBuff('ATK', 100)
    expect(useOptimizerRequestStore.getState().combatBuffs['ATK']).toBe(100)
  })

  it('setEnemyField updates a field', () => {
    useOptimizerRequestStore.getState().setEnemyField('enemyLevel', 80)
    expect(useOptimizerRequestStore.getState().enemyLevel).toBe(80)
  })

  it('setStatDisplay updates', () => {
    useOptimizerRequestStore.getState().setStatDisplay('base')
    expect(useOptimizerRequestStore.getState().statDisplay).toBe('base')
  })

  it('setMemoDisplay updates', () => {
    useOptimizerRequestStore.getState().setMemoDisplay('memo')
    expect(useOptimizerRequestStore.getState().memoDisplay).toBe('memo')
  })

  it('setComboStateJson updates', () => {
    useOptimizerRequestStore.getState().setComboStateJson('{"test":1}')
    expect(useOptimizerRequestStore.getState().comboStateJson).toBe('{"test":1}')
  })

  it('setComboType updates', () => {
    useOptimizerRequestStore.getState().setComboType('ADVANCED' as any)
    expect(useOptimizerRequestStore.getState().comboType).toBe('ADVANCED')
  })

  it('setComboTurnAbilities updates', () => {
    useOptimizerRequestStore.getState().setComboTurnAbilities(['BASIC' as any, 'SKILL' as any])
    expect(useOptimizerRequestStore.getState().comboTurnAbilities).toEqual(['BASIC', 'SKILL'])
  })

  it('setComboPreprocessor updates', () => {
    useOptimizerRequestStore.getState().setComboPreprocessor(false)
    expect(useOptimizerRequestStore.getState().comboPreprocessor).toBe(false)
  })

  it('setDeprioritizeBuffs updates', () => {
    useOptimizerRequestStore.getState().setDeprioritizeBuffs(true)
    expect(useOptimizerRequestStore.getState().deprioritizeBuffs).toBe(true)
  })

  it('setResultSort updates', () => {
    useOptimizerRequestStore.getState().setResultSort('BASIC' as any)
    expect(useOptimizerRequestStore.getState().resultSort).toBe('BASIC')
  })

  it('setResultsLimit updates', () => {
    useOptimizerRequestStore.getState().setResultsLimit(2048)
    expect(useOptimizerRequestStore.getState().resultsLimit).toBe(2048)
  })

  it('setStatSim updates', () => {
    const sim = { key: 'test', benchmarks: {}, substatRolls: {} } as any
    useOptimizerRequestStore.getState().setStatSim(sim)
    expect(useOptimizerRequestStore.getState().statSim).toBe(sim)
  })

  it('setTeammateField updates one teammate without affecting others', () => {
    useOptimizerRequestStore.getState().setTeammateField(0, 'characterId', '1001' as CharacterId)
    const state = useOptimizerRequestStore.getState()
    expect(state.teammates[0].characterId).toBe('1001')
    expect(state.teammates[1].characterId).toBeUndefined()
    expect(state.teammates[2].characterId).toBeUndefined()
  })
})

// ---- Complex action tests (Task 10) ----

describe('complex actions', () => {
  it('setRelicFilterField updates a field', () => {
    useOptimizerRequestStore.getState().setRelicFilterField('enhance', 15)
    expect(useOptimizerRequestStore.getState().enhance).toBe(15)
  })

  it('setMainStats updates main stats', () => {
    useOptimizerRequestStore.getState().setMainStats('mainBody', ['HP%', 'ATK%'])
    expect(useOptimizerRequestStore.getState().mainBody).toEqual(['HP%', 'ATK%'])
  })

  it('setSetFilters updates', () => {
    const display: SetFilters = {
      fourPiece: ['Musketeer of Wild Wheat' as any],
      twoPieceCombos: [],
      ornaments: ['Rutilant Arena' as any],
    }
    useOptimizerRequestStore.getState().setSetFilters(display)
    expect(useOptimizerRequestStore.getState().setFilters).toEqual(display)
  })

  it('setWeight updates a single weight', () => {
    useOptimizerRequestStore.getState().setWeight('HP%', 0.5)
    expect(useOptimizerRequestStore.getState().weights['HP%']).toBe(0.5)
  })

  it('setEidolon updates', () => {
    useOptimizerRequestStore.getState().setEidolon(6)
    expect(useOptimizerRequestStore.getState().characterEidolon).toBe(6)
  })

  it('setLightCone updates', () => {
    useOptimizerRequestStore.getState().setLightCone('21001' as LightConeId)
    expect(useOptimizerRequestStore.getState().lightCone).toBe('21001')
  })

  it('setLightConeSuperimposition updates', () => {
    useOptimizerRequestStore.getState().setLightConeSuperimposition(5)
    expect(useOptimizerRequestStore.getState().lightConeSuperimposition).toBe(5)
  })

  it('setCharacterConditionals updates', () => {
    const conds = { a: 1 }
    useOptimizerRequestStore.getState().setCharacterConditionals(conds)
    expect(useOptimizerRequestStore.getState().characterConditionals).toEqual(conds)
  })

  it('setLightConeConditionals updates', () => {
    const conds = { b: true }
    useOptimizerRequestStore.getState().setLightConeConditionals(conds)
    expect(useOptimizerRequestStore.getState().lightConeConditionals).toEqual(conds)
  })

  it('setSetConditionals updates', () => {
    const conds = { SomeSet: [undefined, 1] } as any
    useOptimizerRequestStore.getState().setSetConditionals(conds)
    expect(useOptimizerRequestStore.getState().setConditionals).toEqual(conds)
  })

  it('clearTeammate resets to defaults', () => {
    useOptimizerRequestStore.getState().setTeammateField(1, 'characterId', '1002' as CharacterId)
    useOptimizerRequestStore.getState().setTeammateField(1, 'characterEidolon', 4)
    useOptimizerRequestStore.getState().clearTeammate(1)
    const teammate = useOptimizerRequestStore.getState().teammates[1]
    expect(teammate).toEqual(createDefaultTeammate())
  })

  it('clearTeammateLightCone clears LC but keeps character', () => {
    useOptimizerRequestStore.getState().setTeammateField(0, 'characterId', '1001' as CharacterId)
    useOptimizerRequestStore.getState().setTeammateField(0, 'lightCone', '21001' as LightConeId)
    useOptimizerRequestStore.getState().setTeammateField(0, 'lightConeSuperimposition', 5)
    useOptimizerRequestStore.getState().setTeammateField(0, 'lightConeConditionals', { x: 1 })
    useOptimizerRequestStore.getState().clearTeammateLightCone(0)
    const teammate = useOptimizerRequestStore.getState().teammates[0]
    expect(teammate.characterId).toBe('1001')
    expect(teammate.lightCone).toBeUndefined()
    expect(teammate.lightConeSuperimposition).toBe(1)
    expect(teammate.lightConeConditionals).toEqual({})
  })

  it('resetFilters preserves character/LC, resets filter fields', () => {
    // Set character and LC fields
    useOptimizerRequestStore.setState({
      characterId: '1001' as CharacterId,
      characterEidolon: 4,
      lightCone: '21001' as LightConeId,
      lightConeSuperimposition: 3,
    })

    // Modify some filter fields
    useOptimizerRequestStore.getState().setRelicFilterField('enhance', 15)
    useOptimizerRequestStore.getState().setRelicFilterField('grade', 4 as any)
    useOptimizerRequestStore.getState().setMainStats('mainBody', ['HP%'])
    useOptimizerRequestStore.getState().setSetFilters({
      fourPiece: ['set1' as any],
      twoPieceCombos: [],
      ornaments: [],
    })

    // Reset
    useOptimizerRequestStore.getState().resetFilters()

    const state = useOptimizerRequestStore.getState()

    // Character/LC preserved
    expect(state.characterId).toBe('1001')
    expect(state.characterEidolon).toBe(4)
    expect(state.lightCone).toBe('21001')
    expect(state.lightConeSuperimposition).toBe(3)

    // Filters reset
    expect(state.enhance).toBe(9)
    expect(state.grade).toBe(5)
    expect(state.mainBody).toEqual([])
    expect(state.setFilters).toEqual({ fourPiece: [], twoPieceCombos: [], ornaments: [] })
  })

  it('applySuggestionFixes applies partial fixes', () => {
    useOptimizerRequestStore.getState().applySuggestionFixes({
      setFilters: {
        fourPiece: [],
        twoPieceCombos: [],
        ornaments: [],
      },
      mainBody: ['DEF%'],
    })
    const state = useOptimizerRequestStore.getState()
    expect(state.setFilters).toEqual({ fourPiece: [], twoPieceCombos: [], ornaments: [] })
    expect(state.mainBody).toEqual(['DEF%'])
    // Fields not provided should remain unchanged
    expect(state.mainFeet).toEqual([])
  })
})
