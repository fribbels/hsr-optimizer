// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { deserializeBuild, resolveEidolon, resolveFlexibleLC, serializeFromCharacterTab, serializeFromOptimizer } from './buildConverter'
import { Metadata } from 'lib/state/metadataInitializer'
import { createDefaultFormState, createDefaultTeammate } from 'lib/stores/optimizerForm/optimizerFormDefaults'
import type { OptimizerRequestState, TeammateState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { type Build, BuildSource, type CharacterSavedBuild, type OptimizerSavedBuild } from 'types/savedBuild'
import { ComboType } from 'lib/optimization/rotation/comboType'
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { Jingliu } from 'lib/conditionals/character/1200/Jingliu'
import type { LightConeId } from 'types/lightCone'
import type { Character } from 'types/character'
import type { Teammate } from 'types/form'
import { DEFAULT_TEAM } from 'lib/constants/constants'

Metadata.initialize()

// ── Factories ──

function makeOptimizerState(
  overrides: Partial<OptimizerRequestState> = {},
): OptimizerRequestState & { lightCone: LightConeId } {
  return {
    ...createDefaultFormState(),
    characterId: Kafka.id,
    lightCone: '21001' as LightConeId,
    ...overrides,
  } as OptimizerRequestState & { lightCone: LightConeId }
}

function makeTeammate(overrides: Partial<TeammateState> = {}): TeammateState {
  return { ...createDefaultTeammate(), characterId: Jingliu.id, lightCone: '21002' as LightConeId, ...overrides }
}

const TEST_EQUIPPED: Build = { Head: 'relic-1', Body: 'relic-2' }

// ── Tests ──

describe('resolveFlexibleLC', () => {
  const LC_A = '21001' as LightConeId
  const LC_B = '21002' as LightConeId

  it('same LC, saved SI lower than current → keeps current SI', () => {
    const result = resolveFlexibleLC(LC_A, 2, LC_A, 5)
    expect(result).toEqual({ lightCone: LC_A, lightConeSuperimposition: 5 })
  })

  it('same LC, saved SI higher than current → uses saved SI', () => {
    const result = resolveFlexibleLC(LC_A, 5, LC_A, 2)
    expect(result).toEqual({ lightCone: LC_A, lightConeSuperimposition: 5 })
  })

  it('same LC, equal SI → returns unchanged', () => {
    const result = resolveFlexibleLC(LC_A, 3, LC_A, 3)
    expect(result).toEqual({ lightCone: LC_A, lightConeSuperimposition: 3 })
  })

  it('different LC → uses saved LC and saved SI', () => {
    const result = resolveFlexibleLC(LC_A, 2, LC_B, 5)
    expect(result).toEqual({ lightCone: LC_A, lightConeSuperimposition: 2 })
  })

  it('different LC, saved SI lower → still uses saved LC and saved SI', () => {
    const result = resolveFlexibleLC(LC_A, 2, LC_B, 1)
    expect(result).toEqual({ lightCone: LC_A, lightConeSuperimposition: 2 })
  })
})

describe('resolveEidolon', () => {
  it('returns max of saved and current eidolon', () => {
    expect(resolveEidolon(2, 4)).toBe(4)
    expect(resolveEidolon(6, 0)).toBe(6)
    expect(resolveEidolon(3, 3)).toBe(3)
  })
})

describe('serializeFromOptimizer', () => {
  it('captures all damage-affecting fields with correct names', () => {
    const state = makeOptimizerState({
      characterEidolon: 2,
      lightConeSuperimposition: 3,
      characterConditionals: { enhancedState: true },
      lightConeConditionals: { passive: 1 },
      comboType: ComboType.ADVANCED,
      comboStateJson: '{"turns":1}',
      comboPreprocessor: false,
      comboTurnAbilities: ['NULL' as any, 'NULL' as any],
      deprioritizeBuffs: true,
    })

    const result = serializeFromOptimizer('My Build', Kafka.id, state, TEST_EQUIPPED)

    expect(result.source).toBe(BuildSource.Optimizer)
    expect(result.characterEidolon).toBe(2)
    expect(result.lightConeSuperimposition).toBe(3)
    expect(result.characterConditionals).toEqual({ enhancedState: true })
    expect(result.comboType).toBe(ComboType.ADVANCED)
    expect(result.deprioritizeBuffs).toBe(true)
    expect(result.equipped).toEqual(TEST_EQUIPPED)
  })

  it('preserves null in middle position when teammate slot 1 is empty', () => {
    const state = makeOptimizerState({
      teammates: [makeTeammate(), createDefaultTeammate(), makeTeammate({ characterId: Kafka.id })],
    })
    const result = serializeFromOptimizer('x', Kafka.id, state, {})
    expect(result.team[0]).not.toBeNull()
    expect(result.team[1]).toBeNull()
    expect(result.team[2]).not.toBeNull()
  })

  it('shallow-copies conditionals (not shared references)', () => {
    const conditionals = { enhancedState: true }
    const state = makeOptimizerState({ characterConditionals: conditionals })
    const result = serializeFromOptimizer('x', Kafka.id, state, {})
    expect(result.characterConditionals).toEqual(conditionals)
    expect(result.characterConditionals).not.toBe(conditionals)
  })

  it('shallow-copies equipped (not shared reference)', () => {
    const equipped: Build = { Head: 'r1' }
    const result = serializeFromOptimizer('x', Kafka.id, makeOptimizerState(), equipped)
    expect(result.equipped).toEqual(equipped)
    expect(result.equipped).not.toBe(equipped)
  })
})

// ── Character Tab Serialization ──

function makeCharacter(overrides: Partial<Character> = {}): Character {
  return {
    id: Kafka.id,
    equipped: { Head: 'r1', Body: 'r2' },
    form: makeForm({
      characterEidolon: 2,
      lightConeSuperimposition: 3,
    }),
    ...overrides,
  }
}

function makeSimTeammate(overrides: Partial<Teammate> = {}): Teammate {
  return {
    characterId: Jingliu.id,
    characterEidolon: 0,
    lightCone: '21002' as LightConeId,
    lightConeSuperimposition: 1,
    teamRelicSet: 'SetA',
    teamOrnamentSet: 'SetB',
    ...overrides,
  }
}

describe('serializeFromCharacterTab', () => {
  it('source is BuildSource.Character', () => {
    const result = serializeFromCharacterTab('Test', makeCharacter(), undefined, undefined)
    expect(result.source).toBe(BuildSource.Character)
  })

  it('has no conditionals, rotation, or deprioritizeBuffs on output', () => {
    const result = serializeFromCharacterTab('Test', makeCharacter(), undefined, undefined)
    expect('characterConditionals' in result).toBe(false)
    expect('lightConeConditionals' in result).toBe(false)
    expect('comboType' in result).toBe(false)
    expect('deprioritizeBuffs' in result).toBe(false)
  })

  it('default team stores [null, null, null]', () => {
    const result = serializeFromCharacterTab('Test', makeCharacter(), undefined, undefined)
    expect(result.team).toEqual([null, null, null])
  })

  it('default team selection string stores [null, null, null]', () => {
    const result = serializeFromCharacterTab('Test', makeCharacter(), [makeSimTeammate()], DEFAULT_TEAM)
    expect(result.team).toEqual([null, null, null])
  })

  it('custom team stores teammate identity + sets, no conditionals', () => {
    const teammates = [makeSimTeammate(), makeSimTeammate({ characterId: Kafka.id })]
    const result = serializeFromCharacterTab('Test', makeCharacter(), teammates, 'CustomTeam')
    expect(result.team[0]).not.toBeNull()
    expect(result.team[0]!.characterId).toBe(Jingliu.id)
    expect(result.team[0]!.teamRelicSet).toBe('SetA')
    expect('characterConditionals' in (result.team[0] as any)).toBe(false)
    expect(result.team[1]).not.toBeNull()
    expect(result.team[2]).toBeNull()
  })

  it('captures characterEidolon, lightCone, lightConeSuperimposition from form', () => {
    const result = serializeFromCharacterTab('Test', makeCharacter(), undefined, undefined)
    expect(result.characterEidolon).toBe(2)
    expect(result.lightCone).toBe('21001')
    expect(result.lightConeSuperimposition).toBe(3)
  })

  it('captures equipped from character', () => {
    const result = serializeFromCharacterTab('Test', makeCharacter(), undefined, undefined)
    expect(result.equipped).toEqual({ Head: 'r1', Body: 'r2' })
  })
})

// ── Deserialization Factories ──

import type { Form } from 'types/form'

function makeForm(overrides: Partial<Form> = {}): Form {
  const defaults = createDefaultFormState()
  return {
    ...defaults,
    characterId: Kafka.id,
    lightCone: '21001' as LightConeId,
    resultMinFilter: 0,
    ornamentSets: [],
    relicSets: [],
    teammate0: {} as Teammate,
    teammate1: {} as Teammate,
    teammate2: {} as Teammate,
    ...overrides,
  } as unknown as Form
}

function makeOptimizerSavedBuild(overrides: Partial<OptimizerSavedBuild> = {}): OptimizerSavedBuild {
  return {
    source: BuildSource.Optimizer,
    name: 'Test Build',
    characterId: Kafka.id,
    equipped: {},
    characterEidolon: 0,
    lightCone: '21001' as LightConeId,
    lightConeSuperimposition: 1,
    team: [null, null, null],
    characterConditionals: {},
    lightConeConditionals: {},
    setConditionals: createDefaultFormState().setConditionals,
    comboType: ComboType.SIMPLE,
    comboStateJson: '{}',
    comboPreprocessor: true,
    comboTurnAbilities: [],
    deprioritizeBuffs: false,
    ...overrides,
  }
}

function makeCharacterSavedBuild(overrides: Partial<CharacterSavedBuild> = {}): CharacterSavedBuild {
  return {
    source: BuildSource.Character,
    name: 'Test Build',
    characterId: Kafka.id,
    equipped: {},
    characterEidolon: 0,
    lightCone: '21001' as LightConeId,
    lightConeSuperimposition: 1,
    team: [null, null, null],
    ...overrides,
  }
}

// ── Deserialization Tests ──

describe('deserializeBuild', () => {
  describe('optimizer builds', () => {
    it('all damage-affecting fields override the DB form', () => {
      const build = makeOptimizerSavedBuild({
        characterConditionals: { enhanced: true },
        lightConeConditionals: { passive: 1 },
        comboType: ComboType.ADVANCED,
        comboStateJson: '{"data":true}',
        comboPreprocessor: false,
        comboTurnAbilities: ['NULL' as any],
        deprioritizeBuffs: true,
      })
      const patch = deserializeBuild(build, makeForm())
      expect(patch.characterConditionals).toEqual({ enhanced: true })
      expect(patch.lightConeConditionals).toEqual({ passive: 1 })
      expect(patch.comboType).toBe(ComboType.ADVANCED)
      expect(patch.comboStateJson).toBe('{"data":true}')
      expect(patch.comboPreprocessor).toBe(false)
      expect(patch.comboTurnAbilities).toEqual(['NULL'])
      expect(patch.deprioritizeBuffs).toBe(true)
    })

    it('LC flexibility: same LC → max SI', () => {
      const build = makeOptimizerSavedBuild({ lightCone: '21001' as LightConeId, lightConeSuperimposition: 2 })
      const form = makeForm({ lightCone: '21001' as LightConeId, lightConeSuperimposition: 5 })
      const patch = deserializeBuild(build, form)
      expect(patch.lightCone).toBe('21001')
      expect(patch.lightConeSuperimposition).toBe(5)
    })

    it('LC flexibility: different LC → saved', () => {
      const build = makeOptimizerSavedBuild({ lightCone: '21002' as LightConeId, lightConeSuperimposition: 2 })
      const form = makeForm({ lightCone: '21001' as LightConeId, lightConeSuperimposition: 5 })
      const patch = deserializeBuild(build, form)
      expect(patch.lightCone).toBe('21002')
      expect(patch.lightConeSuperimposition).toBe(2)
    })

    it('eidolon max rule', () => {
      const build = makeOptimizerSavedBuild({ characterEidolon: 2 })
      const form = makeForm({ characterEidolon: 4 })
      const patch = deserializeBuild(build, form)
      expect(patch.characterEidolon).toBe(4)
    })

    it('teammates replace form teammates (3-slot tuple)', () => {
      const build = makeOptimizerSavedBuild({
        team: [
          {
            characterId: Jingliu.id, characterEidolon: 1, lightCone: '21002' as LightConeId,
            lightConeSuperimposition: 3, teamRelicSet: 'SetA', teamOrnamentSet: 'SetB',
            characterConditionals: { x: 1 }, lightConeConditionals: { y: 2 },
          },
          null,
          null,
        ],
      })
      const patch = deserializeBuild(build, makeForm())
      expect(patch.teammates![0].characterId).toBe(Jingliu.id)
      expect(patch.teammates![1].characterId).toBeUndefined() // default teammate
      expect(patch.teammates![2].characterId).toBeUndefined()
    })
  })

  describe('character tab builds', () => {
    it('only LC and eidolon are applied', () => {
      const build = makeCharacterSavedBuild({
        characterEidolon: 3,
        lightCone: '21002' as LightConeId,
        lightConeSuperimposition: 4,
      })
      const form = makeForm({ characterEidolon: 1, lightCone: '21001' as LightConeId, lightConeSuperimposition: 2 })
      const patch = deserializeBuild(build, form)
      expect(patch.characterEidolon).toBe(3) // max(3, 1) = 3
      expect(patch.lightCone).toBe('21002') // different LC → saved
      expect(patch.lightConeSuperimposition).toBe(4)
    })

    it('returned patch has no conditionals, rotation, or teammates', () => {
      const build = makeCharacterSavedBuild()
      const patch = deserializeBuild(build, makeForm())
      expect(patch).not.toHaveProperty('characterConditionals')
      expect(patch).not.toHaveProperty('lightConeConditionals')
      expect(patch).not.toHaveProperty('setConditionals')
      expect(patch).not.toHaveProperty('comboType')
      expect(patch).not.toHaveProperty('comboStateJson')
      expect(patch).not.toHaveProperty('teammates')
      expect(patch).not.toHaveProperty('deprioritizeBuffs')
    })
  })

  describe('round-trip tests', () => {
    it('optimizer: serialize then deserialize preserves damage fields', () => {
      const state = makeOptimizerState({
        characterEidolon: 2,
        lightConeSuperimposition: 3,
        characterConditionals: { enhancedState: true },
        comboType: ComboType.ADVANCED,
        comboStateJson: '{"turns":1}',
        deprioritizeBuffs: true,
      })
      const serialized = serializeFromOptimizer('Test', Kafka.id, state, { Head: 'r1' })
      const patch = deserializeBuild(serialized, makeForm({
        characterEidolon: 2,
        lightCone: '21001' as LightConeId,
        lightConeSuperimposition: 3,
      }))
      expect(patch.comboType).toBe(ComboType.ADVANCED)
      expect(patch.characterConditionals).toEqual({ enhancedState: true })
      expect(patch.deprioritizeBuffs).toBe(true)
    })

    it('character tab: serialize then deserialize returns only LC + eidolon overrides', () => {
      const character = makeCharacter()
      const serialized = serializeFromCharacterTab('Test', character, undefined, undefined)
      const patch = deserializeBuild(serialized, makeForm({
        characterEidolon: 0,
        lightCone: '21001' as LightConeId,
        lightConeSuperimposition: 1,
      }))
      // LC flexibility: same LC → max SI (3 vs 1 = 3)
      expect(patch.lightConeSuperimposition).toBe(3)
      // eidolon max: max(2, 0) = 2
      expect(patch.characterEidolon).toBe(2)
      // No conditionals
      expect(patch).not.toHaveProperty('comboType')
    })
  })

  describe('edge cases', () => {
    it('empty equipped passes through', () => {
      const build = makeOptimizerSavedBuild({ equipped: {} })
      const patch = deserializeBuild(build, makeForm())
      expect(patch).toBeDefined()
    })

    it('LC flexibility identity: same LC, same SI → unchanged', () => {
      const build = makeOptimizerSavedBuild({ lightCone: '21001' as LightConeId, lightConeSuperimposition: 3 })
      const form = makeForm({ lightCone: '21001' as LightConeId, lightConeSuperimposition: 3 })
      const patch = deserializeBuild(build, form)
      expect(patch.lightCone).toBe('21001')
      expect(patch.lightConeSuperimposition).toBe(3)
    })
  })
})
