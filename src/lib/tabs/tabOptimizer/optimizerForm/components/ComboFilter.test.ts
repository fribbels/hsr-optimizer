// @vitest-environment jsdom
import { describe, expect, it } from 'vitest'
import { ABILITY_LIMIT } from 'lib/constants/constants'
import {
  DEFAULT_BASIC,
  NULL_TURN_ABILITY_NAME,
} from 'lib/optimization/rotation/turnAbilityConfig'
import type { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import { addAbility, removeAbility } from './ComboFilter'

function makeAbilities(count: number): TurnAbilityName[] {
  const abilities: TurnAbilityName[] = [NULL_TURN_ABILITY_NAME]
  for (let i = 1; i <= count; i++) {
    abilities[i] = DEFAULT_BASIC
  }
  return abilities
}

describe('addAbility', () => {
  it('adds to an empty rotation', () => {
    const result = addAbility([NULL_TURN_ABILITY_NAME])
    expect(result[1]).toBe(DEFAULT_BASIC)
    expect(result.length).toBe(2)
  })

  it('adds after existing abilities', () => {
    const result = addAbility(makeAbilities(3))
    expect(result[4]).toBe(DEFAULT_BASIC)
    expect(result.length).toBe(5)
  })

  it('fills a gap in the middle', () => {
    const abilities: TurnAbilityName[] = [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC]
    abilities[3] = DEFAULT_BASIC
    expect(addAbility(abilities)[2]).toBe(DEFAULT_BASIC)
  })

  it('does not exceed ABILITY_LIMIT', () => {
    const result = addAbility(makeAbilities(ABILITY_LIMIT))
    expect(result.length).toBe(ABILITY_LIMIT + 1)
    expect(result[ABILITY_LIMIT + 1]).toBeUndefined()
  })

  it('does not mutate the input', () => {
    const abilities = makeAbilities(2)
    const snapshot = [...abilities]
    addAbility(abilities)
    expect(abilities).toEqual(snapshot)
  })
})

describe('removeAbility', () => {
  it('removes the last ability', () => {
    const result = removeAbility(makeAbilities(3))
    expect(result.length).toBe(3)
    expect(result[3]).toBeUndefined()
  })

  it('keeps at least one ability', () => {
    const result = removeAbility(makeAbilities(1))
    expect(result[1]).toBe(DEFAULT_BASIC)
  })

  it('removes from the end when there are gaps', () => {
    const abilities: TurnAbilityName[] = [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC]
    abilities[5] = DEFAULT_BASIC
    const result = removeAbility(abilities)
    expect(result.length).toBe(5)
    expect(result[5]).toBeUndefined()
  })

  it('removes from a full rotation', () => {
    const result = removeAbility(makeAbilities(ABILITY_LIMIT))
    expect(result.length).toBe(ABILITY_LIMIT)
    expect(result[ABILITY_LIMIT]).toBeUndefined()
  })
})
