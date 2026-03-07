// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { createDefaultTeammate } from 'lib/stores/optimizerForm/optimizerFormDefaults'
import { CharacterId } from 'types/character'
import { LightConeId } from 'types/lightCone'

beforeEach(() => {
  useOptimizerFormStore.setState(useOptimizerFormStore.getInitialState())
})

// ---- Initial state tests ----

describe('initial state', () => {
  it('has undefined characterId', () => {
    const state = useOptimizerFormStore.getState()
    expect(state.characterId).toBeUndefined()
  })

  it('has three default teammates', () => {
    const state = useOptimizerFormStore.getState()
    expect(state.teammates).toHaveLength(3)
    for (const teammate of state.teammates) {
      expect(teammate.characterId).toBeUndefined()
      expect(teammate.characterEidolon).toBe(0)
      expect(teammate.lightConeSuperimposition).toBe(1)
    }
  })

  it('has correct relic filter defaults', () => {
    const state = useOptimizerFormStore.getState()
    expect(state.enhance).toBe(9)
    expect(state.grade).toBe(5)
    expect(state.includeEquippedRelics).toBe(true)
  })
})

// ---- Simple setter tests (Task 8) ----

describe('simple setters', () => {
  it('setStatFilter updates a field', () => {
    useOptimizerFormStore.getState().setStatFilter('minAtk', 500)
    expect(useOptimizerFormStore.getState().statFilters.minAtk).toBe(500)
  })

  it('setStatFilter can set to undefined', () => {
    useOptimizerFormStore.getState().setStatFilter('minAtk', 500)
    useOptimizerFormStore.getState().setStatFilter('minAtk', undefined)
    expect(useOptimizerFormStore.getState().statFilters.minAtk).toBeUndefined()
  })

  it('setRatingFilter updates a field', () => {
    useOptimizerFormStore.getState().setRatingFilter('minBasic', 10000)
    expect(useOptimizerFormStore.getState().ratingFilters.minBasic).toBe(10000)
  })

  it('setCombatBuff updates a field', () => {
    useOptimizerFormStore.getState().setCombatBuff('ATK', 100)
    expect(useOptimizerFormStore.getState().combatBuffs['ATK']).toBe(100)
  })

  it('setEnemyField updates a field', () => {
    useOptimizerFormStore.getState().setEnemyField('enemyLevel', 80)
    expect(useOptimizerFormStore.getState().enemyLevel).toBe(80)
  })

  it('setStatDisplay updates', () => {
    useOptimizerFormStore.getState().setStatDisplay('base')
    expect(useOptimizerFormStore.getState().statDisplay).toBe('base')
  })

  it('setMemoDisplay updates', () => {
    useOptimizerFormStore.getState().setMemoDisplay('memo')
    expect(useOptimizerFormStore.getState().memoDisplay).toBe('memo')
  })

  it('setComboStateJson updates', () => {
    useOptimizerFormStore.getState().setComboStateJson('{"test":1}')
    expect(useOptimizerFormStore.getState().comboStateJson).toBe('{"test":1}')
  })

  it('setComboType updates', () => {
    useOptimizerFormStore.getState().setComboType('ADVANCED' as any)
    expect(useOptimizerFormStore.getState().comboType).toBe('ADVANCED')
  })

  it('setComboTurnAbilities updates', () => {
    useOptimizerFormStore.getState().setComboTurnAbilities(['BASIC' as any, 'SKILL' as any])
    expect(useOptimizerFormStore.getState().comboTurnAbilities).toEqual(['BASIC', 'SKILL'])
  })

  it('setComboDot updates', () => {
    useOptimizerFormStore.getState().setComboDot(3)
    expect(useOptimizerFormStore.getState().comboDot).toBe(3)
  })

  it('setComboPreprocessor updates', () => {
    useOptimizerFormStore.getState().setComboPreprocessor(false)
    expect(useOptimizerFormStore.getState().comboPreprocessor).toBe(false)
  })

  it('setDeprioritizeBuffs updates', () => {
    useOptimizerFormStore.getState().setDeprioritizeBuffs(true)
    expect(useOptimizerFormStore.getState().deprioritizeBuffs).toBe(true)
  })

  it('setResultSort updates', () => {
    useOptimizerFormStore.getState().setResultSort('BASIC' as any)
    expect(useOptimizerFormStore.getState().resultSort).toBe('BASIC')
  })

  it('setResultsLimit updates', () => {
    useOptimizerFormStore.getState().setResultsLimit(2048)
    expect(useOptimizerFormStore.getState().resultsLimit).toBe(2048)
  })

  it('setStatSim updates', () => {
    const sim = { key: 'test', benchmarks: {}, substatRolls: {}, simulations: [] } as any
    useOptimizerFormStore.getState().setStatSim(sim)
    expect(useOptimizerFormStore.getState().statSim).toBe(sim)
  })

  it('setTeammateField updates one teammate without affecting others', () => {
    useOptimizerFormStore.getState().setTeammateField(0, 'characterId', '1001' as CharacterId)
    const state = useOptimizerFormStore.getState()
    expect(state.teammates[0].characterId).toBe('1001')
    expect(state.teammates[1].characterId).toBeUndefined()
    expect(state.teammates[2].characterId).toBeUndefined()
  })
})

// ---- Complex action tests (Task 10) ----

describe('complex actions', () => {
  it('setRelicFilterField updates a field', () => {
    useOptimizerFormStore.getState().setRelicFilterField('enhance', 15)
    expect(useOptimizerFormStore.getState().enhance).toBe(15)
  })

  it('setMainStats updates main stats', () => {
    useOptimizerFormStore.getState().setMainStats('mainBody', ['HP%', 'ATK%'])
    expect(useOptimizerFormStore.getState().mainBody).toEqual(['HP%', 'ATK%'])
  })

  it('setRelicSets updates', () => {
    const sets = [['set1', 'set2']] as any
    useOptimizerFormStore.getState().setRelicSets(sets)
    expect(useOptimizerFormStore.getState().relicSets).toEqual(sets)
  })

  it('setOrnamentSets updates', () => {
    const sets = ['orn1'] as any
    useOptimizerFormStore.getState().setOrnamentSets(sets)
    expect(useOptimizerFormStore.getState().ornamentSets).toEqual(sets)
  })

  it('setWeight updates a single weight', () => {
    useOptimizerFormStore.getState().setWeight('HP%', 0.5)
    expect(useOptimizerFormStore.getState().weights['HP%']).toBe(0.5)
  })

  it('setEidolon updates', () => {
    useOptimizerFormStore.getState().setEidolon(6)
    expect(useOptimizerFormStore.getState().characterEidolon).toBe(6)
  })

  it('setLightCone updates', () => {
    useOptimizerFormStore.getState().setLightCone('21001' as LightConeId)
    expect(useOptimizerFormStore.getState().lightCone).toBe('21001')
  })

  it('setLightConeSuperimposition updates', () => {
    useOptimizerFormStore.getState().setLightConeSuperimposition(5)
    expect(useOptimizerFormStore.getState().lightConeSuperimposition).toBe(5)
  })

  it('setCharacterConditionals updates', () => {
    const conds = { a: 1 }
    useOptimizerFormStore.getState().setCharacterConditionals(conds)
    expect(useOptimizerFormStore.getState().characterConditionals).toEqual(conds)
  })

  it('setLightConeConditionals updates', () => {
    const conds = { b: true }
    useOptimizerFormStore.getState().setLightConeConditionals(conds)
    expect(useOptimizerFormStore.getState().lightConeConditionals).toEqual(conds)
  })

  it('setSetConditionals updates', () => {
    const conds = { SomeSet: [undefined, 1] } as any
    useOptimizerFormStore.getState().setSetConditionals(conds)
    expect(useOptimizerFormStore.getState().setConditionals).toEqual(conds)
  })

  it('clearTeammate resets to defaults', () => {
    useOptimizerFormStore.getState().setTeammateField(1, 'characterId', '1002' as CharacterId)
    useOptimizerFormStore.getState().setTeammateField(1, 'characterEidolon', 4)
    useOptimizerFormStore.getState().clearTeammate(1)
    const teammate = useOptimizerFormStore.getState().teammates[1]
    expect(teammate).toEqual(createDefaultTeammate())
  })

  it('clearTeammateLightCone clears LC but keeps character', () => {
    useOptimizerFormStore.getState().setTeammateField(0, 'characterId', '1001' as CharacterId)
    useOptimizerFormStore.getState().setTeammateField(0, 'lightCone', '21001' as LightConeId)
    useOptimizerFormStore.getState().setTeammateField(0, 'lightConeSuperimposition', 5)
    useOptimizerFormStore.getState().setTeammateField(0, 'lightConeConditionals', { x: 1 })
    useOptimizerFormStore.getState().clearTeammateLightCone(0)
    const teammate = useOptimizerFormStore.getState().teammates[0]
    expect(teammate.characterId).toBe('1001')
    expect(teammate.lightCone).toBeUndefined()
    expect(teammate.lightConeSuperimposition).toBe(1)
    expect(teammate.lightConeConditionals).toEqual({})
  })

  it('resetFilters preserves character/LC, resets filter fields', () => {
    // Set character and LC fields
    useOptimizerFormStore.setState({
      characterId: '1001' as CharacterId,
      characterEidolon: 4,
      lightCone: '21001' as LightConeId,
      lightConeSuperimposition: 3,
    })

    // Modify some filter fields
    useOptimizerFormStore.getState().setRelicFilterField('enhance', 15)
    useOptimizerFormStore.getState().setRelicFilterField('grade', 4 as any)
    useOptimizerFormStore.getState().setMainStats('mainBody', ['HP%'])
    useOptimizerFormStore.getState().setRelicSets([['set1', 'set2']] as any)

    // Reset
    useOptimizerFormStore.getState().resetFilters()

    const state = useOptimizerFormStore.getState()

    // Character/LC preserved
    expect(state.characterId).toBe('1001')
    expect(state.characterEidolon).toBe(4)
    expect(state.lightCone).toBe('21001')
    expect(state.lightConeSuperimposition).toBe(3)

    // Filters reset
    expect(state.enhance).toBe(9)
    expect(state.grade).toBe(5)
    expect(state.mainBody).toEqual([])
    expect(state.relicSets).toEqual([])
  })

  it('applySuggestionFixes applies partial fixes', () => {
    useOptimizerFormStore.getState().applySuggestionFixes({
      relicSets: [['setA', 'setB']] as any,
      mainBody: ['DEF%'],
    })
    const state = useOptimizerFormStore.getState()
    expect(state.relicSets).toEqual([['setA', 'setB']])
    expect(state.mainBody).toEqual(['DEF%'])
    // Fields not provided should remain unchanged
    expect(state.mainFeet).toEqual([])
    expect(state.ornamentSets).toEqual([])
  })
})
