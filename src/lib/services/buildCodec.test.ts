// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { resolveEidolon, resolveFlexibleLC, serializeFromCharacterTab, serializeFromOptimizer } from './buildCodec'
import { Metadata } from 'lib/state/metadataInitializer'
import { createDefaultFormState, createDefaultTeammate } from 'lib/stores/optimizerForm/optimizerFormDefaults'
import type { OptimizerRequestState, TeammateState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import { type Build, BuildSource } from 'types/savedBuild'
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
    form: {
      ...createDefaultFormState(),
      characterId: Kafka.id,
      lightCone: '21001' as LightConeId,
      characterEidolon: 2,
      lightConeSuperimposition: 3,
      resultMinFilter: 0,
      teammate0: {} as Teammate,
      teammate1: {} as Teammate,
      teammate2: {} as Teammate,
    } as Character['form'],
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
