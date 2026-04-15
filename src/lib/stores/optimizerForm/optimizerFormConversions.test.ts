// @vitest-environment jsdom
import {
  ConditionalDataType,
  Constants,
} from 'lib/constants/constants'
import {
  buildOptimizerRequest,
  buildSaveForm,
  displayToInternal,
  internalFormToState,
  internalToDisplay,
  normalizeForm,
  patchComboConditionalDefault,
} from 'lib/stores/optimizerForm/optimizerFormConversions'
import {
  createDefaultFormState,
  createDefaultTeammate,
} from 'lib/stores/optimizerForm/optimizerFormDefaults'
import { type OptimizerRequestState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { type CharacterId } from 'types/character'
import { type LightConeId } from 'types/lightCone'
import {
  describe,
  expect,
  it,
} from 'vitest'

const MAX_INT = Constants.MAX_INT

function makeState(overrides: Partial<OptimizerRequestState> = {}): OptimizerRequestState {
  return { ...createDefaultFormState(), ...overrides }
}

// ─── Task 4: displayToInternal ───────────────────────────────────────

describe('displayToInternal', () => {
  it('should convert undefined stat min filters to 0', () => {
    const state = makeState()
    const form = displayToInternal(state)
    expect(form.minHp).toBe(0)
    expect(form.minAtk).toBe(0)
    expect(form.minDef).toBe(0)
    expect(form.minSpd).toBe(0)
    expect(form.minCr).toBe(0)
    expect(form.minCd).toBe(0)
    expect(form.minEhr).toBe(0)
    expect(form.minRes).toBe(0)
    expect(form.minBe).toBe(0)
    expect(form.minErr).toBe(0)
  })

  it('should convert undefined stat max filters to MAX_INT', () => {
    const state = makeState()
    const form = displayToInternal(state)
    expect(form.maxHp).toBe(MAX_INT)
    expect(form.maxAtk).toBe(MAX_INT)
    expect(form.maxDef).toBe(MAX_INT)
    expect(form.maxSpd).toBe(MAX_INT)
    expect(form.maxCr).toBe(MAX_INT)
    expect(form.maxCd).toBe(MAX_INT)
    expect(form.maxEhr).toBe(MAX_INT)
    expect(form.maxRes).toBe(MAX_INT)
    expect(form.maxBe).toBe(MAX_INT)
    expect(form.maxErr).toBe(MAX_INT)
  })

  it('should divide percentage stat filters by 100', () => {
    const state = makeState({
      statFilters: {
        ...createDefaultFormState().statFilters,
        minCr: 50,
        maxCr: 80,
        minCd: 100,
        maxCd: 200,
        minEhr: 25,
        maxEhr: 75,
        minRes: 30,
        maxRes: 60,
        minBe: 150,
        maxBe: 300,
        minErr: 10,
        maxErr: 20,
      },
    })
    const form = displayToInternal(state)
    expect(form.minCr).toBeCloseTo(0.5)
    expect(form.maxCr).toBeCloseTo(0.8)
    expect(form.minCd).toBeCloseTo(1.0)
    expect(form.maxCd).toBeCloseTo(2.0)
    expect(form.minEhr).toBeCloseTo(0.25)
    expect(form.maxEhr).toBeCloseTo(0.75)
    expect(form.minRes).toBeCloseTo(0.3)
    expect(form.maxRes).toBeCloseTo(0.6)
    expect(form.minBe).toBeCloseTo(1.5)
    expect(form.maxBe).toBeCloseTo(3.0)
    expect(form.minErr).toBeCloseTo(0.1)
    expect(form.maxErr).toBeCloseTo(0.2)
  })

  it('should pass through flat stat filters unchanged', () => {
    const state = makeState({
      statFilters: {
        ...createDefaultFormState().statFilters,
        minHp: 1000,
        maxHp: 5000,
        minAtk: 500,
        maxAtk: 3000,
        minDef: 200,
        maxDef: 2000,
        minSpd: 100,
        maxSpd: 180,
      },
    })
    const form = displayToInternal(state)
    expect(form.minHp).toBe(1000)
    expect(form.maxHp).toBe(5000)
    expect(form.minAtk).toBe(500)
    expect(form.maxAtk).toBe(3000)
    expect(form.minDef).toBe(200)
    expect(form.maxDef).toBe(2000)
    expect(form.minSpd).toBe(100)
    expect(form.maxSpd).toBe(180)
  })

  it('should convert undefined rating min filters to 0', () => {
    const state = makeState()
    const form = displayToInternal(state)
    expect(form.minBasic).toBe(0)
    expect(form.minSkill).toBe(0)
    expect(form.minUlt).toBe(0)
    expect(form.minFua).toBe(0)
    expect(form.minDot).toBe(0)
    expect(form.minBreak).toBe(0)
    expect(form.minEhp).toBe(0)
    expect(form.minMemoSkill).toBe(0)
    expect(form.minMemoTalent).toBe(0)
  })

  it('should convert undefined rating max filters to MAX_INT', () => {
    const state = makeState()
    const form = displayToInternal(state)
    expect(form.maxBasic).toBe(MAX_INT)
    expect(form.maxSkill).toBe(MAX_INT)
    expect(form.maxUlt).toBe(MAX_INT)
    expect(form.maxFua).toBe(MAX_INT)
    expect(form.maxDot).toBe(MAX_INT)
    expect(form.maxBreak).toBe(MAX_INT)
    expect(form.maxEhp).toBe(MAX_INT)
    expect(form.maxMemoSkill).toBe(MAX_INT)
    expect(form.maxMemoTalent).toBe(MAX_INT)
  })

  it('should pass through set rating filter values', () => {
    const state = makeState({
      ratingFilters: {
        ...createDefaultFormState().ratingFilters,
        minBasic: 5000,
        maxBasic: 50000,
        minEhp: 10000,
        maxEhp: 100000,
      },
    })
    const form = displayToInternal(state)
    expect(form.minBasic).toBe(5000)
    expect(form.maxBasic).toBe(50000)
    expect(form.minEhp).toBe(10000)
    expect(form.maxEhp).toBe(100000)
  })

  it('should map teammates tuple to flat teammate0/1/2', () => {
    const tm0 = {
      ...createDefaultTeammate(),
      characterId: '1001' as CharacterId,
      characterEidolon: 6,
      lightCone: '21001' as LightConeId,
      lightConeSuperimposition: 5,
    }
    const tm1 = {
      ...createDefaultTeammate(),
      characterId: '1002' as CharacterId,
    }
    const tm2 = createDefaultTeammate()

    const state = makeState({ teammates: [tm0, tm1, tm2] })
    const form = displayToInternal(state)

    expect(form.teammate0.characterId).toBe('1001')
    expect(form.teammate0.characterEidolon).toBe(6)
    expect(form.teammate0.lightCone).toBe('21001')
    expect(form.teammate0.lightConeSuperimposition).toBe(5)
    expect(form.teammate1.characterId).toBe('1002')
    expect(form.teammate2.characterId).toBeUndefined()
  })

  it('should pass through non-converted fields', () => {
    const state = makeState({
      characterId: '1001' as CharacterId,
      characterEidolon: 4,
      enemyLevel: 90,
      enemyCount: 3,
      combatBuffs: { ATK: 100 },
    })
    const form = displayToInternal(state)
    expect(form.characterId).toBe('1001')
    expect(form.characterEidolon).toBe(4)
    expect(form.enemyLevel).toBe(90)
    expect(form.enemyCount).toBe(3)
    // ATK is a flat combat buff, stays as-is
    expect(form.combatBuffs['ATK']).toBe(100)
  })

  it('converts percentage combat buffs to internal format', () => {
    const state = makeState({
      combatBuffs: { ATK: 100, ATK_P: 50, DEF_P: 25 },
    })

    const form = displayToInternal(state)

    // Flat buffs stay as-is
    expect(form.combatBuffs['ATK']).toBe(100)
    // Percentage buffs divided by 100
    expect(form.combatBuffs['ATK_P']).toBeCloseTo(0.5)
    expect(form.combatBuffs['DEF_P']).toBeCloseTo(0.25)
  })

  it('handles empty combat buffs', () => {
    const state = makeState({ combatBuffs: {} })
    const form = displayToInternal(state)
    expect(form.combatBuffs).toEqual({})
  })

  it('should not mutate the input state', () => {
    const state = makeState({
      statFilters: {
        ...createDefaultFormState().statFilters,
        minCr: 50,
      },
    })
    const originalMinCr = state.statFilters.minCr
    displayToInternal(state)
    expect(state.statFilters.minCr).toBe(originalMinCr)
    // Ensure teammates tuple still exists
    expect(state.teammates).toHaveLength(3)
  })
})

// ─── Task 5: buildOptimizerRequest and buildSaveForm ─────────────────

describe('buildOptimizerRequest', () => {
  it('should have resultMinFilter set to 0', () => {
    const state = makeState()
    const request = buildOptimizerRequest(state)
    expect(request.resultMinFilter).toBe(0)
  })

  it('should convert stats the same as displayToInternal', () => {
    const state = makeState({
      statFilters: {
        ...createDefaultFormState().statFilters,
        minCr: 50,
      },
    })
    const request = buildOptimizerRequest(state)
    expect(request.minCr).toBeCloseTo(0.5)
    expect(request.minHp).toBe(0)
    expect(request.maxHp).toBe(MAX_INT)
  })
})

describe('buildSaveForm', () => {
  it('should preserve identity fields', () => {
    const state = makeState({
      characterId: '1001' as CharacterId,
      characterEidolon: 6,
    })
    const form = buildSaveForm(state)
    expect(form.characterId).toBe('1001')
    expect(form.characterEidolon).toBe(6)
  })

  it('should convert display to internal format', () => {
    const state = makeState({
      statFilters: {
        ...createDefaultFormState().statFilters,
        minCr: 50,
      },
    })
    const form = buildSaveForm(state)
    expect(form.minCr).toBeCloseTo(0.5)
    expect(form.minHp).toBe(0)
  })
})

// ─── Task 6: internalToDisplay ───────────────────────────────────────

describe('internalToDisplay', () => {
  it('should convert 0 min to undefined', () => {
    const result = internalToDisplay({ minHp: 0, minAtk: 0, minCr: 0, minBasic: 0 })
    expect(result.statFilters.minHp).toBeUndefined()
    expect(result.statFilters.minAtk).toBeUndefined()
    expect(result.statFilters.minCr).toBeUndefined()
    expect(result.ratingFilters.minBasic).toBeUndefined()
  })

  it('should convert MAX_INT max to undefined', () => {
    const result = internalToDisplay({ maxHp: MAX_INT, maxCr: MAX_INT, maxBasic: MAX_INT })
    expect(result.statFilters.maxHp).toBeUndefined()
    expect(result.statFilters.maxCr).toBeUndefined()
    expect(result.ratingFilters.maxBasic).toBeUndefined()
  })

  it('should pass through non-zero flat stats', () => {
    const result = internalToDisplay({ minHp: 1000, maxHp: 5000, minSpd: 120 })
    expect(result.statFilters.minHp).toBe(1000)
    expect(result.statFilters.maxHp).toBe(5000)
    expect(result.statFilters.minSpd).toBe(120)
  })

  it('should multiply percentage stats by 100', () => {
    const result = internalToDisplay({ minCr: 0.5, maxCr: 0.8, minCd: 1.5, maxBe: 3.0 })
    expect(result.statFilters.minCr).toBe(50)
    expect(result.statFilters.maxCr).toBe(80)
    expect(result.statFilters.minCd).toBe(150)
    expect(result.statFilters.maxBe).toBe(300)
  })

  it('should map flat teammate0/1/2 to teammates tuple', () => {
    const result = internalToDisplay({
      teammate0: {
        characterId: '1001' as CharacterId,
        characterEidolon: 6,
        lightCone: '21001' as LightConeId,
        lightConeSuperimposition: 5,
      },
      teammate1: {
        characterId: '1002' as CharacterId,
        characterEidolon: 0,
        lightCone: '21002' as LightConeId,
        lightConeSuperimposition: 1,
      },
    })
    expect(result.teammates[0].characterId).toBe('1001')
    expect(result.teammates[0].characterEidolon).toBe(6)
    expect(result.teammates[1].characterId).toBe('1002')
    // teammate2 should be default since it was not provided
    expect(result.teammates[2].characterId).toBeUndefined()
  })

  it('should use createDefaultTeammate for missing teammates', () => {
    const result = internalToDisplay({})
    for (const tm of result.teammates) {
      expect(tm).toEqual(createDefaultTeammate())
    }
  })

  it('should pass through non-zero rating filters', () => {
    const result = internalToDisplay({ minBasic: 5000, maxBasic: 50000 })
    expect(result.ratingFilters.minBasic).toBe(5000)
    expect(result.ratingFilters.maxBasic).toBe(50000)
  })

  describe('round-trip', () => {
    it('displayToInternal → internalToDisplay preserves values', () => {
      const state = makeState({
        statFilters: {
          ...createDefaultFormState().statFilters,
          minHp: 1000,
          maxHp: 5000,
          minCr: 50,
          maxCr: 80,
          minCd: 150,
          minSpd: 120,
        },
        ratingFilters: {
          ...createDefaultFormState().ratingFilters,
          minBasic: 5000,
          maxBasic: 50000,
          minEhp: 10000,
        },
        teammates: [
          {
            ...createDefaultTeammate(),
            characterId: '1001' as CharacterId,
            characterEidolon: 6,
            lightCone: '21001' as LightConeId,
            lightConeSuperimposition: 5,
          },
          createDefaultTeammate(),
          createDefaultTeammate(),
        ],
      })

      const internal = displayToInternal(state)
      const display = internalToDisplay(internal)

      // Stat filters should round-trip
      expect(display.statFilters.minHp).toBe(1000)
      expect(display.statFilters.maxHp).toBe(5000)
      expect(display.statFilters.minCr).toBe(50)
      expect(display.statFilters.maxCr).toBe(80)
      expect(display.statFilters.minCd).toBe(150)
      expect(display.statFilters.minSpd).toBe(120)
      // Undefined values should remain undefined
      expect(display.statFilters.maxDef).toBeUndefined()
      expect(display.statFilters.minAtk).toBeUndefined()

      // Rating filters should round-trip
      expect(display.ratingFilters.minBasic).toBe(5000)
      expect(display.ratingFilters.maxBasic).toBe(50000)
      expect(display.ratingFilters.minEhp).toBe(10000)
      expect(display.ratingFilters.maxDot).toBeUndefined()

      // Teammates should round-trip
      expect(display.teammates[0].characterId).toBe('1001')
      expect(display.teammates[0].characterEidolon).toBe(6)
      expect(display.teammates[1].characterId).toBeUndefined()
    })

    it('internalToDisplay → displayToInternal preserves values', () => {
      const form = displayToInternal(makeState({
        statFilters: {
          ...createDefaultFormState().statFilters,
          minCr: 55.5,
          maxBe: 200,
          minHp: 3000,
        },
        ratingFilters: {
          ...createDefaultFormState().ratingFilters,
          minUlt: 8000,
        },
      }))

      const display = internalToDisplay(form)
      const stateForRoundTrip = makeState({
        statFilters: display.statFilters,
        ratingFilters: display.ratingFilters,
        teammates: display.teammates,
      })
      const roundTripped = displayToInternal(stateForRoundTrip)

      expect(roundTripped.minCr).toBeCloseTo(form.minCr)
      expect(roundTripped.maxBe).toBeCloseTo(form.maxBe)
      expect(roundTripped.minHp).toBe(form.minHp)
      expect(roundTripped.minUlt).toBe(form.minUlt)
      // Defaults should also round-trip
      expect(roundTripped.minAtk).toBe(0)
      expect(roundTripped.maxAtk).toBe(MAX_INT)
    })
  })
})

// ─── Task 7: patchComboConditionalDefault ─────────────────────────────

// Helper to build a minimal combo state JSON string
function makeComboStateJson(
  characterConditionals: Record<string, unknown> = {},
  lightConeConditionals: Record<string, unknown> = {},
  setConditionals: Record<string, unknown> = {},
): string {
  return JSON.stringify({
    comboCharacter: {
      characterConditionals,
      lightConeConditionals,
      setConditionals,
    },
  })
}

describe('patchComboConditionalDefault', () => {
  it('should return empty string unchanged', () => {
    expect(patchComboConditionalDefault('', 'character', { foo: true })).toBe('')
  })

  it('should return empty object JSON unchanged', () => {
    expect(patchComboConditionalDefault('{}', 'character', { foo: true })).toBe('{}')
  })

  it('should return invalid JSON unchanged', () => {
    const invalid = '{not valid json'
    expect(patchComboConditionalDefault(invalid, 'character', { foo: true })).toBe(invalid)
  })

  it('should patch boolean activations[0] and preserve activations[1..N]', () => {
    const json = makeComboStateJson({
      enhanced: {
        type: ConditionalDataType.BOOLEAN,
        activations: [false, true, false, true],
      },
    })

    const result = patchComboConditionalDefault(json, 'character', { enhanced: true })
    const parsed = JSON.parse(result)

    // activations[0] should be patched to true
    expect(parsed.comboCharacter.characterConditionals.enhanced.activations[0]).toBe(true)
    // activations[1..3] should be preserved
    expect(parsed.comboCharacter.characterConditionals.enhanced.activations[1]).toBe(true)
    expect(parsed.comboCharacter.characterConditionals.enhanced.activations[2]).toBe(false)
    expect(parsed.comboCharacter.characterConditionals.enhanced.activations[3]).toBe(true)
  })

  it('should patch number conditional partitions[0].value', () => {
    const json = makeComboStateJson({
      stacks: {
        type: ConditionalDataType.NUMBER,
        partitions: [
          { value: 3, activations: [true, false, true] },
          { value: 1, activations: [false, true, false] },
        ],
      },
    })

    const result = patchComboConditionalDefault(json, 'character', { stacks: 5 })
    const parsed = JSON.parse(result)

    // partitions[0].value should be patched
    expect(parsed.comboCharacter.characterConditionals.stacks.partitions[0].value).toBe(5)
    // partitions[0].activations should be preserved
    expect(parsed.comboCharacter.characterConditionals.stacks.partitions[0].activations).toEqual([true, false, true])
    // partitions[1] should be completely untouched
    expect(parsed.comboCharacter.characterConditionals.stacks.partitions[1]).toEqual({ value: 1, activations: [false, true, false] })
  })

  it('should patch select conditional partitions[0].value', () => {
    const json = makeComboStateJson({
      skillLevel: {
        type: ConditionalDataType.SELECT,
        partitions: [
          { value: 2, activations: [true, true] },
          { value: 0, activations: [false, false] },
        ],
      },
    })

    const result = patchComboConditionalDefault(json, 'character', { skillLevel: 4 })
    const parsed = JSON.parse(result)

    expect(parsed.comboCharacter.characterConditionals.skillLevel.partitions[0].value).toBe(4)
    // Activations preserved
    expect(parsed.comboCharacter.characterConditionals.skillLevel.partitions[0].activations).toEqual([true, true])
    // Other partitions untouched
    expect(parsed.comboCharacter.characterConditionals.skillLevel.partitions[1]).toEqual({ value: 0, activations: [false, false] })
  })

  it('should only patch keys in changedKeys, leaving others alone', () => {
    const json = makeComboStateJson({
      enhanced: {
        type: ConditionalDataType.BOOLEAN,
        activations: [false, true, false],
      },
      stacks: {
        type: ConditionalDataType.NUMBER,
        partitions: [{ value: 3, activations: [true] }],
      },
    })

    // Only patch 'enhanced', not 'stacks'
    const result = patchComboConditionalDefault(json, 'character', { enhanced: true })
    const parsed = JSON.parse(result)

    expect(parsed.comboCharacter.characterConditionals.enhanced.activations[0]).toBe(true)
    // stacks should be unchanged
    expect(parsed.comboCharacter.characterConditionals.stacks.partitions[0].value).toBe(3)
  })

  it('should work with lightCone conditional type', () => {
    const json = makeComboStateJson({}, {
      passive: {
        type: ConditionalDataType.BOOLEAN,
        activations: [false, false, true],
      },
    })

    const result = patchComboConditionalDefault(json, 'lightCone', { passive: true })
    const parsed = JSON.parse(result)

    expect(parsed.comboCharacter.lightConeConditionals.passive.activations[0]).toBe(true)
    expect(parsed.comboCharacter.lightConeConditionals.passive.activations[1]).toBe(false)
    expect(parsed.comboCharacter.lightConeConditionals.passive.activations[2]).toBe(true)
  })

  it('should work with set conditional type', () => {
    const json = makeComboStateJson({}, {}, {
      setBonus: {
        type: ConditionalDataType.BOOLEAN,
        activations: [true, false],
      },
    })

    const result = patchComboConditionalDefault(json, 'set', { setBonus: false })
    const parsed = JSON.parse(result)

    expect(parsed.comboCharacter.setConditionals.setBonus.activations[0]).toBe(false)
    expect(parsed.comboCharacter.setConditionals.setBonus.activations[1]).toBe(false)
  })

  it('should no-op when key is not found in combo state', () => {
    const json = makeComboStateJson({
      enhanced: {
        type: ConditionalDataType.BOOLEAN,
        activations: [false, true],
      },
    })

    const result = patchComboConditionalDefault(json, 'character', { nonExistent: true })
    const parsed = JSON.parse(result)

    // Original conditional should be unchanged
    expect(parsed.comboCharacter.characterConditionals.enhanced.activations).toEqual([false, true])
  })

  it('should patch teammate boolean activations[0]', () => {
    const json = JSON.stringify({
      comboTeammate0: {
        characterConditionals: {
          testBool: {
            type: ConditionalDataType.BOOLEAN,
            activations: [false, true, true],
          },
        },
      },
    })

    const result = patchComboConditionalDefault(json, 'character', { testBool: true }, 0)
    const parsed = JSON.parse(result)

    expect(parsed.comboTeammate0.characterConditionals.testBool.activations[0]).toBe(true)
    expect(parsed.comboTeammate0.characterConditionals.testBool.activations[1]).toBe(true)
    expect(parsed.comboTeammate0.characterConditionals.testBool.activations[2]).toBe(true)
  })

  it('should patch teammate lightCone conditionals', () => {
    const json = JSON.stringify({
      comboTeammate1: {
        lightConeConditionals: {
          passive: {
            type: ConditionalDataType.BOOLEAN,
            activations: [false, false, true],
          },
        },
      },
    })

    const result = patchComboConditionalDefault(json, 'lightCone', { passive: true }, 1)
    const parsed = JSON.parse(result)

    expect(parsed.comboTeammate1.lightConeConditionals.passive.activations[0]).toBe(true)
    expect(parsed.comboTeammate1.lightConeConditionals.passive.activations[1]).toBe(false)
    expect(parsed.comboTeammate1.lightConeConditionals.passive.activations[2]).toBe(true)
  })

  it('should no-op when teammate is null', () => {
    const json = JSON.stringify({
      comboTeammate2: null,
    })

    const result = patchComboConditionalDefault(json, 'character', { testBool: true }, 2)
    expect(result).toBe(json)
  })

  it('should preserve original comboCharacter behavior when no teammateIndex is provided', () => {
    const json = makeComboStateJson({
      enhanced: {
        type: ConditionalDataType.BOOLEAN,
        activations: [false, true],
      },
    })

    const result = patchComboConditionalDefault(json, 'character', { enhanced: true })
    const parsed = JSON.parse(result)

    expect(parsed.comboCharacter.characterConditionals.enhanced.activations[0]).toBe(true)
    expect(parsed.comboCharacter.characterConditionals.enhanced.activations[1]).toBe(true)
  })
})

// ─── Task 9: Persistence round-trip tests ─────────────────────────────

describe('buildSaveForm round-trip', () => {
  it('should round-trip a full store state through buildSaveForm → internalFormToState', () => {
    const state = makeState({
      characterId: '1001' as CharacterId,
      characterEidolon: 4,
      characterLevel: 80,
      lightCone: '21001' as LightConeId,
      lightConeLevel: 80,
      lightConeSuperimposition: 3,
      enemyLevel: 90,
      enemyCount: 3,
      enemyResistance: 0.2,
      enemyEffectResistance: 0.3,
      enemyMaxToughness: 360,
      enemyElementalWeak: true,
      enemyWeaknessBroken: false,
      statFilters: {
        ...createDefaultFormState().statFilters,
        minHp: 3000,
        maxHp: 8000,
        minCr: 50,
        maxCd: 200,
        minSpd: 134,
        minBe: 150,
      },
      ratingFilters: {
        ...createDefaultFormState().ratingFilters,
        minBasic: 5000,
        maxBasic: 50000,
        minEhp: 20000,
      },
      teammates: [
        {
          ...createDefaultTeammate(),
          characterId: '1002' as CharacterId,
          characterEidolon: 6,
          lightCone: '21002' as LightConeId,
          lightConeSuperimposition: 5,
          characterConditionals: { enhanced: true, stacks: 3 },
          lightConeConditionals: { passive: true },
        },
        {
          ...createDefaultTeammate(),
          characterId: '1003' as CharacterId,
          characterEidolon: 0,
          lightCone: '21003' as LightConeId,
          lightConeSuperimposition: 1,
          characterConditionals: { buffActive: false },
          lightConeConditionals: {},
        },
        {
          ...createDefaultTeammate(),
          characterId: '1004' as CharacterId,
          characterEidolon: 2,
          lightCone: '21004' as LightConeId,
          lightConeSuperimposition: 3,
          characterConditionals: {},
          lightConeConditionals: { dmgBoost: 2 },
        },
      ],
      characterConditionals: { skillActive: true, ultStacks: 5 },
      lightConeConditionals: { passiveActive: true },
      combatBuffs: { ATK: 100, ATK_P: 50, CR: 10, SPD: 20 },
      comboStateJson: '{"test": true}',
      resultsLimit: 512,
      deprioritizeBuffs: true,
    })

    const savedForm = buildSaveForm(state)
    const restored = internalFormToState(savedForm)

    // Character identity
    expect(restored.characterId).toBe('1001')
    expect(restored.characterEidolon).toBe(4)
    expect(restored.characterLevel).toBe(80)

    // Light cone
    expect(restored.lightCone).toBe('21001')
    expect(restored.lightConeSuperimposition).toBe(3)

    // Enemy config
    expect(restored.enemyLevel).toBe(90)
    expect(restored.enemyCount).toBe(3)
    expect(restored.enemyResistance).toBe(0.2)
    expect(restored.enemyElementalWeak).toBe(true)
    expect(restored.enemyWeaknessBroken).toBe(false)

    // Stat filters: flat stats round-trip exactly
    expect(restored.statFilters!.minHp).toBe(3000)
    expect(restored.statFilters!.maxHp).toBe(8000)
    expect(restored.statFilters!.minSpd).toBe(134)
    // Percentage stats: 50 → 0.5 → 50 (round-trip with toFixed(3) precision)
    expect(restored.statFilters!.minCr).toBe(50)
    expect(restored.statFilters!.maxCd).toBe(200)
    expect(restored.statFilters!.minBe).toBe(150)
    // Unset filters should be undefined
    expect(restored.statFilters!.minAtk).toBeUndefined()
    expect(restored.statFilters!.maxDef).toBeUndefined()

    // Rating filters
    expect(restored.ratingFilters!.minBasic).toBe(5000)
    expect(restored.ratingFilters!.maxBasic).toBe(50000)
    expect(restored.ratingFilters!.minEhp).toBe(20000)
    expect(restored.ratingFilters!.maxDot).toBeUndefined()

    // Conditionals
    expect(restored.characterConditionals).toEqual({ skillActive: true, ultStacks: 5 })
    expect(restored.lightConeConditionals).toEqual({ passiveActive: true })

    // Combat buffs: percentage buffs round-trip (50 → 0.5 → 50)
    expect(restored.combatBuffs!['ATK']).toBe(100)
    expect(restored.combatBuffs!['ATK_P']).toBeCloseTo(50)
    expect(restored.combatBuffs!['CR']).toBeCloseTo(10)
    expect(restored.combatBuffs!['SPD']).toBe(20)

    // Combo state
    expect(restored.comboStateJson).toBe('{"test": true}')

    // Options
    expect(restored.resultsLimit).toBe(512)
    expect(restored.deprioritizeBuffs).toBe(true)
  })

  it('should handle precision loss from toFixed(3) gracefully', () => {
    const state = makeState({
      statFilters: {
        ...createDefaultFormState().statFilters,
        // Use a value that could cause floating point issues: 33.333...
        minCr: 33.333,
        minCd: 166.667,
      },
    })

    const savedForm = buildSaveForm(state)
    const restored = internalFormToState(savedForm)

    // After: 33.333 → 0.33333 → toFixed(3) → 0.333 → *100 → 33.3
    expect(restored.statFilters!.minCr).toBeCloseTo(33.3, 1)
    expect(restored.statFilters!.minCd).toBeCloseTo(166.7, 1)
  })
})

describe('normalizeForm', () => {
  it('should preserve critical fields from an internal Form', () => {
    const state = makeState({
      characterId: '1001' as CharacterId,
      characterEidolon: 6,
      lightCone: '21001' as LightConeId,
      lightConeSuperimposition: 5,
      characterConditionals: { enhanced: true, stacks: 3 },
      lightConeConditionals: { passive: true },
    })
    const internalForm = displayToInternal(state)

    const normalized = normalizeForm(internalForm)

    expect(normalized.characterId).toBe('1001')
    expect(normalized.characterEidolon).toBe(6)
    expect(normalized.lightCone).toBe('21001')
    expect(normalized.lightConeSuperimposition).toBe(5)
    expect(normalized.characterConditionals).toEqual({ enhanced: true, stacks: 3 })
    expect(normalized.lightConeConditionals).toEqual({ passive: true })
    expect(normalized.setConditionals).toBeDefined()
  })

  it('should apply defaults for missing fields', () => {
    // A form with some fields set but others missing — internalFormToState applies
    // defaults for fields that have fallbacks (characterLevel, lightConeLevel, etc.)
    // but passes through undefined for fields without fallbacks (enemyLevel, etc.)
    const minimalForm = {
      characterId: '1001' as CharacterId,
      characterLevel: undefined,
      lightConeLevel: undefined,
      lightConeSuperimposition: undefined,
      resultsLimit: undefined,
    } as any

    const normalized = normalizeForm(minimalForm)

    // These have ?? defaults in internalFormToState
    expect(normalized.characterLevel).toBe(80)
    expect(normalized.lightConeLevel).toBe(80)
    expect(normalized.lightConeSuperimposition).toBe(1)
    expect(normalized.resultsLimit).toBe(1024)
    expect(normalized.includeEquippedRelics).toBe(true)
    expect(normalized.keepCurrentRelics).toBe(false)
    expect(normalized.deprioritizeBuffs).toBe(false)

    // Min stat filters should default to 0
    expect(normalized.minHp).toBe(0)
    expect(normalized.minAtk).toBe(0)
    expect(normalized.minCr).toBe(0)
    // Max stat filters should default to MAX_INT
    expect(normalized.maxHp).toBe(MAX_INT)
    expect(normalized.maxAtk).toBe(MAX_INT)
    expect(normalized.maxCr).toBe(MAX_INT)
  })

  it('should be idempotent: normalizeForm(normalizeForm(f)) === normalizeForm(f)', () => {
    const state = makeState({
      characterId: '1001' as CharacterId,
      characterEidolon: 4,
      lightCone: '21001' as LightConeId,
      statFilters: {
        ...createDefaultFormState().statFilters,
        minCr: 50,
        minHp: 3000,
        maxSpd: 180,
      },
      ratingFilters: {
        ...createDefaultFormState().ratingFilters,
        minBasic: 5000,
      },
      combatBuffs: { ATK: 100, ATK_P: 50 },
    })

    const internalForm = displayToInternal(state)
    const once = normalizeForm(internalForm)
    const twice = normalizeForm(once)

    // All fields should be identical after double normalization
    expect(twice.characterId).toBe(once.characterId)
    expect(twice.characterEidolon).toBe(once.characterEidolon)
    expect(twice.minCr).toBe(once.minCr)
    expect(twice.minHp).toBe(once.minHp)
    expect(twice.maxSpd).toBe(once.maxSpd)
    expect(twice.minBasic).toBe(once.minBasic)
    expect(twice.maxAtk).toBe(once.maxAtk)
    expect(twice.combatBuffs['ATK']).toBe(once.combatBuffs['ATK'])
    expect(twice.combatBuffs['ATK_P']).toBe(once.combatBuffs['ATK_P'])
    expect(twice.enemyLevel).toBe(once.enemyLevel)
    expect(twice.resultsLimit).toBe(once.resultsLimit)
  })
})

describe('stat filter conversion', () => {
  it('should convert display percentage stats to internal format (÷100)', () => {
    const state = makeState({
      statFilters: {
        ...createDefaultFormState().statFilters,
        minCr: 50,
        maxCr: 80,
        minCd: 100,
        minEhr: 25,
        minRes: 30,
        minBe: 150,
        minErr: 10,
      },
    })

    const form = displayToInternal(state)

    expect(form.minCr).toBeCloseTo(0.5)
    expect(form.maxCr).toBeCloseTo(0.8)
    expect(form.minCd).toBeCloseTo(1.0)
    expect(form.minEhr).toBeCloseTo(0.25)
    expect(form.minRes).toBeCloseTo(0.3)
    expect(form.minBe).toBeCloseTo(1.5)
    expect(form.minErr).toBeCloseTo(0.1)
  })

  it('should convert undefined min filters to 0 and undefined max filters to MAX_INT', () => {
    const state = makeState() // all filters are undefined by default

    const form = displayToInternal(state)

    // All min filters → 0
    expect(form.minCr).toBe(0)
    expect(form.minHp).toBe(0)
    expect(form.minAtk).toBe(0)

    // All max filters → MAX_INT
    expect(form.maxCr).toBe(MAX_INT)
    expect(form.maxHp).toBe(MAX_INT)
    expect(form.maxAtk).toBe(MAX_INT)
  })

  it('should round-trip percentage stat filters with toFixed(3) precision', () => {
    const state = makeState({
      statFilters: {
        ...createDefaultFormState().statFilters,
        minCr: 55.555,
      },
    })

    const form = displayToInternal(state) // 55.555 → 0.55555
    const restored = internalFormToState(form)

    // 0.55555 → toFixed(3) → 0.556 → *100 → 55.6
    expect(restored.statFilters!.minCr).toBeCloseTo(55.6, 1)
  })
})

describe('teammate round-trip', () => {
  it('should preserve all 3 teammates through displayToInternal → internalFormToState', () => {
    const teammates: [
      typeof createDefaultTeammate extends () => infer T ? T : never,
      typeof createDefaultTeammate extends () => infer T ? T : never,
      typeof createDefaultTeammate extends () => infer T ? T : never,
    ] = [
      {
        ...createDefaultTeammate(),
        characterId: '1101' as CharacterId,
        characterEidolon: 6,
        lightCone: '23001' as LightConeId,
        lightConeSuperimposition: 5,
        characterConditionals: { skillBuff: true, ultBuff: 3 },
        lightConeConditionals: { passive: true, stacks: 2 },
      },
      {
        ...createDefaultTeammate(),
        characterId: '1102' as CharacterId,
        characterEidolon: 0,
        lightCone: '23002' as LightConeId,
        lightConeSuperimposition: 1,
        characterConditionals: { enhanced: false },
        lightConeConditionals: {},
      },
      {
        ...createDefaultTeammate(),
        characterId: '1103' as CharacterId,
        characterEidolon: 2,
        lightCone: '23003' as LightConeId,
        lightConeSuperimposition: 3,
        characterConditionals: {},
        lightConeConditionals: { dmgBoost: 4 },
      },
    ]

    const state = makeState({ teammates })
    const internalForm = displayToInternal(state)
    const restored = internalFormToState(internalForm)

    // Teammate 0
    expect(restored.teammates![0].characterId).toBe('1101')
    expect(restored.teammates![0].characterEidolon).toBe(6)
    expect(restored.teammates![0].lightCone).toBe('23001')
    expect(restored.teammates![0].lightConeSuperimposition).toBe(5)
    expect(restored.teammates![0].characterConditionals).toEqual({ skillBuff: true, ultBuff: 3 })
    expect(restored.teammates![0].lightConeConditionals).toEqual({ passive: true, stacks: 2 })

    // Teammate 1
    expect(restored.teammates![1].characterId).toBe('1102')
    expect(restored.teammates![1].characterEidolon).toBe(0)
    expect(restored.teammates![1].lightCone).toBe('23002')
    expect(restored.teammates![1].lightConeSuperimposition).toBe(1)
    expect(restored.teammates![1].characterConditionals).toEqual({ enhanced: false })

    // Teammate 2
    expect(restored.teammates![2].characterId).toBe('1103')
    expect(restored.teammates![2].characterEidolon).toBe(2)
    expect(restored.teammates![2].lightCone).toBe('23003')
    expect(restored.teammates![2].lightConeSuperimposition).toBe(3)
    expect(restored.teammates![2].lightConeConditionals).toEqual({ dmgBoost: 4 })
  })

  it('should handle empty teammates (no characterId) by creating defaults', () => {
    const state = makeState({
      teammates: [createDefaultTeammate(), createDefaultTeammate(), createDefaultTeammate()],
    })

    const internalForm = displayToInternal(state)
    const restored = internalFormToState(internalForm)

    for (const tm of restored.teammates!) {
      expect(tm.characterId).toBeUndefined()
      expect(tm.characterEidolon).toBe(0)
      expect(tm.lightCone).toBeUndefined()
      expect(tm.lightConeSuperimposition).toBe(1)
      expect(tm.characterConditionals).toEqual({})
      expect(tm.lightConeConditionals).toEqual({})
    }
  })
})
