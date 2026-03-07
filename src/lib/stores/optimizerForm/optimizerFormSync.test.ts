// @vitest-environment jsdom

import { describe, expect, it, beforeEach, vi } from 'vitest'
import { syncFormToStore, verifySync } from 'lib/stores/optimizerForm/optimizerFormSync'
import { useOptimizerFormStore } from 'lib/stores/optimizerForm/useOptimizerFormStore'
import { Constants } from 'lib/constants/constants'
import { Form } from 'types/form'

const MAX_INT = Constants.MAX_INT

// Helper to create a minimal valid Form for testing
function createTestForm(overrides: Partial<Form> = {}): Form {
  return {
    characterId: '1001',
    characterEidolon: 0,
    characterLevel: 80,
    lightCone: '21001',
    lightConeLevel: 80,
    lightConeSuperimposition: 1,
    enemyLevel: 95,
    enemyCount: 1,
    enemyResistance: 0.2,
    enemyEffectResistance: 0.3,
    enemyMaxToughness: 360,
    enemyElementalWeak: true,
    enemyWeaknessBroken: false,
    characterConditionals: {},
    lightConeConditionals: {},
    setConditionals: {} as any,
    enhance: 9,
    grade: 5,
    rank: 0,
    exclude: [],
    includeEquippedRelics: true,
    keepCurrentRelics: false,
    mainBody: [],
    mainFeet: [],
    mainHands: [],
    mainHead: [],
    mainLinkRope: [],
    mainPlanarSphere: [],
    mainStatUpscaleLevel: 15,
    rankFilter: true,
    ornamentSets: [],
    relicSets: [],
    statDisplay: 'combat',
    memoDisplay: 'memo',
    weights: {} as any,
    combatBuffs: {},
    comboStateJson: '{}',
    comboTurnAbilities: [],
    comboPreprocessor: true,
    comboType: 'simple' as any,
    comboDot: 0,
    resultMinFilter: 0,
    teammate0: { characterId: undefined, characterEidolon: 0, lightCone: undefined, lightConeSuperimposition: 1 } as any,
    teammate1: { characterId: undefined, characterEidolon: 0, lightCone: undefined, lightConeSuperimposition: 1 } as any,
    teammate2: { characterId: undefined, characterEidolon: 0, lightCone: undefined, lightConeSuperimposition: 1 } as any,
    // Stat filters — internal format (0 = no min, MAX_INT = no max)
    minHp: 0, maxHp: MAX_INT,
    minAtk: 0, maxAtk: MAX_INT,
    minDef: 0, maxDef: MAX_INT,
    minSpd: 0, maxSpd: MAX_INT,
    minCr: 0, maxCr: MAX_INT,
    minCd: 0, maxCd: MAX_INT,
    minEhr: 0, maxEhr: MAX_INT,
    minRes: 0, maxRes: MAX_INT,
    minBe: 0, maxBe: MAX_INT,
    minErr: 0, maxErr: MAX_INT,
    // Rating filters
    minBasic: 0, maxBasic: MAX_INT,
    minSkill: 0, maxSkill: MAX_INT,
    minUlt: 0, maxUlt: MAX_INT,
    minFua: 0, maxFua: MAX_INT,
    minDot: 0, maxDot: MAX_INT,
    minBreak: 0, maxBreak: MAX_INT,
    minEhp: 0, maxEhp: MAX_INT,
    minMemoSkill: 0, maxMemoSkill: MAX_INT,
    minMemoTalent: 0, maxMemoTalent: MAX_INT,
    ...overrides,
  } as Form
}

describe('syncFormToStore', () => {
  beforeEach(() => {
    useOptimizerFormStore.setState(useOptimizerFormStore.getInitialState())
  })

  it('syncs character identity fields', () => {
    syncFormToStore(createTestForm({
      characterId: '1205' as any,
      characterEidolon: 6,
      lightCone: '23001' as any,
      lightConeSuperimposition: 5,
    }))

    const state = useOptimizerFormStore.getState()
    expect(state.characterId).toBe('1205')
    expect(state.characterEidolon).toBe(6)
    expect(state.lightCone).toBe('23001')
    expect(state.lightConeSuperimposition).toBe(5)
  })

  it('converts stat filters from internal to display format', () => {
    syncFormToStore(createTestForm({
      minCr: 0.5,    // internal: 0.5 → display: 50
      maxCr: 0.8,    // internal: 0.8 → display: 80
      minHp: 4000,   // flat: stays 4000
      maxHp: MAX_INT, // MAX_INT → undefined
      minSpd: 0,     // 0 → undefined
    }))

    const state = useOptimizerFormStore.getState()
    expect(state.statFilters.minCr).toBeCloseTo(50)
    expect(state.statFilters.maxCr).toBeCloseTo(80)
    expect(state.statFilters.minHp).toBe(4000)
    expect(state.statFilters.maxHp).toBeUndefined()
    expect(state.statFilters.minSpd).toBeUndefined()
  })

  it('converts rating filters from internal to display format', () => {
    syncFormToStore(createTestForm({
      minBasic: 50000,
      maxBasic: MAX_INT,
    }))

    const state = useOptimizerFormStore.getState()
    expect(state.ratingFilters.minBasic).toBe(50000)
    expect(state.ratingFilters.maxBasic).toBeUndefined()
  })

  it('maps flat teammates to tuple', () => {
    syncFormToStore(createTestForm({
      teammate0: {
        characterId: '1001' as any,
        characterEidolon: 6,
        lightCone: '21001' as any,
        lightConeSuperimposition: 5,
      } as any,
    }))

    const state = useOptimizerFormStore.getState()
    expect(state.teammates[0].characterId).toBe('1001')
    expect(state.teammates[0].characterEidolon).toBe(6)
    expect(state.teammates[0].lightConeSuperimposition).toBe(5)
    // Other teammates stay default
    expect(state.teammates[1].characterId).toBeUndefined()
  })

  it('syncs enemy config', () => {
    syncFormToStore(createTestForm({
      enemyLevel: 80,
      enemyCount: 3,
      enemyWeaknessBroken: true,
    }))

    const state = useOptimizerFormStore.getState()
    expect(state.enemyLevel).toBe(80)
    expect(state.enemyCount).toBe(3)
    expect(state.enemyWeaknessBroken).toBe(true)
  })

  it('syncs combo fields', () => {
    syncFormToStore(createTestForm({
      comboStateJson: '{"test": true}',
      comboPreprocessor: false,
      comboDot: 3,
    }))

    const state = useOptimizerFormStore.getState()
    expect(state.comboStateJson).toBe('{"test": true}')
    expect(state.comboPreprocessor).toBe(false)
    expect(state.comboDot).toBe(3)
  })

  it('syncs conditionals', () => {
    const conds = { key1: true, key2: 3 }
    syncFormToStore(createTestForm({
      characterConditionals: conds,
    }))

    const state = useOptimizerFormStore.getState()
    expect(state.characterConditionals).toEqual(conds)
  })

  it('syncs relic filter fields', () => {
    syncFormToStore(createTestForm({
      enhance: 15,
      grade: 3,
      includeEquippedRelics: false,
      mainBody: ['HP_P', 'DEF_P'],
      relicSets: [['4', 'TestSet']] as any,
    }))

    const state = useOptimizerFormStore.getState()
    expect(state.enhance).toBe(15)
    expect(state.grade).toBe(3)
    expect(state.includeEquippedRelics).toBe(false)
    expect(state.mainBody).toEqual(['HP_P', 'DEF_P'])
    expect(state.relicSets).toEqual([['4', 'TestSet']])
  })

  it('handles undefined/missing form fields gracefully', () => {
    const sparseForm = createTestForm()
    delete (sparseForm as any).deprioritizeBuffs
    delete (sparseForm as any).resultsLimit

    // Should not throw
    expect(() => syncFormToStore(sparseForm)).not.toThrow()
  })
})

describe('verifySync', () => {
  beforeEach(() => {
    useOptimizerFormStore.setState(useOptimizerFormStore.getInitialState())
  })

  it('does not throw when in sync', () => {
    // Sync first, then verify
    const form = createTestForm({ characterId: '1205' as any })
    syncFormToStore(form)

    // Mock window.optimizerForm
    ;(window as any).optimizerForm = { getFieldsValue: () => form }

    expect(() => verifySync()).not.toThrow()
  })

  it('warns when out of sync (characterId differs)', () => {
    const form = createTestForm({ characterId: '1205' as any })
    syncFormToStore(form)

    // Change store but not form
    useOptimizerFormStore.setState({ characterId: '9999' as any })

    ;(window as any).optimizerForm = { getFieldsValue: () => form }

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    verifySync()
    expect(warnSpy).toHaveBeenCalled()
    warnSpy.mockRestore()
  })
})
