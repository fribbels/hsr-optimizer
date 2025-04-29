import {
  BASIC,
  END_BASIC,
  END_FUA,
  END_SKILL,
  END_ULT,
  FUA,
  MEMO_SKILL,
  MEMO_TALENT,
  SKILL,
  START_BASIC,
  START_FUA,
  START_SKILL,
  START_ULT,
  ULT,
  WHOLE_BASIC,
  WHOLE_FUA,
  WHOLE_MEMO_SKILL,
  WHOLE_MEMO_TALENT,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/abilityConfig'
import { preprocessAbilityTurnDefinitionCorrectness } from 'lib/optimization/rotation/abilityTurnTransform'
import { expect, test } from 'vitest'

test('Anaxa annotated', () => {
  expect(preprocessAbilityTurnDefinitionCorrectness(
    [START_ULT, SKILL, END_SKILL, START_SKILL, END_SKILL],
  ).toString()).toEqual(
    [START_ULT, SKILL, END_SKILL, START_SKILL, END_SKILL].toString(),
  )
})

test('Anaxa unannotated', () => {
  expect(preprocessAbilityTurnDefinitionCorrectness(
    [ULT, SKILL, SKILL, SKILL, SKILL],
  ).toString()).toEqual(
    [START_ULT, END_SKILL, WHOLE_SKILL, WHOLE_SKILL, WHOLE_SKILL].toString(),
  )
})

test('Complex invalid rotation', () => {
  expect(preprocessAbilityTurnDefinitionCorrectness(
    [
      FUA, END_SKILL, MEMO_SKILL, START_ULT, FUA, START_SKILL, MEMO_TALENT, ULT,
      END_BASIC, FUA, START_BASIC, SKILL, END_ULT, START_ULT, END_SKILL, WHOLE_MEMO_SKILL,
      WHOLE_FUA, END_BASIC, BASIC, START_SKILL, ULT, MEMO_SKILL, START_BASIC, FUA, END_FUA,
      SKILL, SKILL, START_BASIC, SKILL, END_BASIC, END_ULT, START_SKILL,
    ],
  ).toString()).toEqual(
    [
      START_FUA, END_SKILL, MEMO_SKILL, START_ULT, FUA, SKILL, MEMO_TALENT, ULT,
      END_BASIC, FUA, START_BASIC, SKILL, END_ULT, START_ULT, END_SKILL, MEMO_SKILL,
      FUA, WHOLE_BASIC, WHOLE_BASIC, WHOLE_SKILL, START_ULT, MEMO_SKILL, BASIC, FUA, END_FUA,
      WHOLE_SKILL, WHOLE_SKILL, START_BASIC, SKILL, END_BASIC, START_ULT, END_SKILL,
    ].toString(),
  )
})

test('Complex invalid rotation 2', () => {
  expect(preprocessAbilityTurnDefinitionCorrectness(
    [
      END_ULT, START_ULT, START_SKILL, ULT, END_BASIC, START_SKILL, MEMO_SKILL, END_ULT, WHOLE_FUA,
      WHOLE_MEMO_TALENT, ULT, ULT, BASIC, ULT, START_BASIC, END_SKILL, SKILL, START_ULT,
      MEMO_TALENT, MEMO_SKILL, END_BASIC, ULT, START_SKILL, END_ULT, SKILL, ULT, FUA,
      BASIC, START_ULT, START_SKILL, SKILL, END_ULT, END_BASIC, START_FUA,
    ],
  ).toString()).toEqual(
    [
      START_ULT, ULT, SKILL, ULT, END_BASIC, START_SKILL, MEMO_SKILL, END_ULT, FUA, MEMO_TALENT,
      START_ULT, ULT, END_BASIC, START_ULT, BASIC, END_SKILL, WHOLE_SKILL, START_ULT, MEMO_TALENT,
      MEMO_SKILL, END_BASIC, START_ULT, SKILL, END_ULT, WHOLE_SKILL, START_ULT, FUA, END_BASIC,
      START_ULT, SKILL, SKILL, END_ULT, WHOLE_BASIC, FUA,
    ].toString(),
  )
})
