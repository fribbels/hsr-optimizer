import { Sets } from 'lib/constants/constants'
import { getDefaultForm } from 'lib/optimization/defaultForm'
import {
  setComboBooleanCategorySetActivation,
  setComboNumberCategoryCharacterActivation,
} from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import { TurnTriggeredStackPreprocessor } from 'lib/optimization/rotation/preprocessor/utils/turnTriggeredStackPreprocessor'
import {
  AbilityKind,
  AbilityNameToTurnAbility,
  DEFAULT_DOT,
  DEFAULT_SKILL,
  DEFAULT_ULT,
  END_BASIC,
  END_SKILL,
  END_ULT,
  NULL_TURN_ABILITY_NAME,
  START_BASIC,
  START_FUA,
  START_ULT,
  TurnAbilityName,
  WHOLE_BASIC,
  WHOLE_SKILL,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { ANAXA } from 'lib/simulations/tests/testMetadataConstants'
import { Metadata } from 'lib/state/metadata'
import { ComboBooleanConditional, ComboNumberConditional, ComboState, initializeComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { OptimizerTabController } from 'lib/tabs/tabOptimizer/optimizerTabController'
import { expect, test } from 'vitest'

Metadata.initialize()

const processSequence = (
  preprocessor: TurnTriggeredStackPreprocessor,
  abilityNames: TurnAbilityName[],
): ComboState => {
  const form = getDefaultForm({ id: ANAXA })
  const displayFormValues = OptimizerTabController.formToDisplay(form)
  const request = OptimizerTabController.displayToForm(displayFormValues)
  const comboState = initializeComboState(request, true)

  comboState.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, ...abilityNames]

  abilityNames.forEach((abilityName, index) => {
    const ability = { ...AbilityNameToTurnAbility[abilityName] }
    preprocessor.processAbility(ability, index + 1, comboState)
  })

  return comboState
}

const getBooleanActivations = (
  comboState: ComboState,
  categoryId: string,
  isSetConditional: boolean = false,
): boolean[] => {
  const container = isSetConditional
    ? comboState.comboCharacter.setConditionals
    : comboState.comboCharacter.characterConditionals

  if (!container[categoryId]) return []
  return (container[categoryId] as ComboBooleanConditional).activations
}

const getNumericActivations = (
  comboState: ComboState,
  categoryId: string,
  value: number,
): boolean[] => {
  if (!comboState.comboCharacter.characterConditionals[categoryId]) return []

  const partition = (comboState.comboCharacter.characterConditionals[categoryId] as ComboNumberConditional).partitions.find((p) => p.value === value)
  if (!partition) return []

  return partition.activations
}

test('One turn duration buff', () => {
  const key = Sets.WavestriderCaptain
  const preprocessor = new TurnTriggeredStackPreprocessor(
    'test',
    {
      key: key,
      triggerKinds: [AbilityKind.ULT],
      activeTurns: 1,
      activationFn: setComboBooleanCategorySetActivation,
    },
  )

  const sequence = [
    WHOLE_BASIC, START_ULT, DEFAULT_SKILL, END_BASIC, START_BASIC, END_SKILL, WHOLE_BASIC,
  ]
  const expected = [
    false, true, true, true, true, true, false,
  ]

  const result = processSequence(preprocessor, sequence)
  const activations = getBooleanActivations(result, key, true)

  expect(activations.slice(1, expected.length + 1)).toEqual(expected)
})

test('Set activation for WavestriderCaptain', () => {
  const key = Sets.WavestriderCaptain
  const preprocessor = new TurnTriggeredStackPreprocessor(
    'test',
    {
      key: key,
      triggerKinds: [AbilityKind.ULT],
      activeTurns: 1,
      activationFn: setComboBooleanCategorySetActivation,
    },
  )

  const sequence = [
    START_ULT, END_BASIC, START_BASIC, END_BASIC, START_BASIC, END_ULT,
  ]
  const expected = [
    true, true, true, true, false, true,
  ]

  const result = processSequence(preprocessor, sequence)
  const activations = getBooleanActivations(result, key, true)

  expect(activations.slice(1, expected.length + 1)).toEqual(expected)
})

test('Two turn duration buff', () => {
  const key = Sets.WavestriderCaptain
  const preprocessor = new TurnTriggeredStackPreprocessor(
    'test',
    {
      key: key,
      triggerKinds: [AbilityKind.ULT],
      activeTurns: 2,
      activationFn: setComboBooleanCategorySetActivation,
    },
  )

  const sequence = [
    START_BASIC, DEFAULT_ULT, END_BASIC, START_BASIC, END_BASIC, WHOLE_BASIC, WHOLE_BASIC,
  ]
  const expected = [
    false, true, true, true, true, true, false,
  ]

  const result = processSequence(preprocessor, sequence)
  const activations = getBooleanActivations(result, key, true)

  expect(activations.slice(1, expected.length + 1)).toEqual(expected)
})

test('Numeric activation', () => {
  const key = 'enemyWeaknessTypes'
  const activationValue = 7
  const preprocessor = new TurnTriggeredStackPreprocessor(
    'test',
    {
      key: key,
      triggerKinds: [AbilityKind.ULT],
      isNumber: true,
      activationValue: activationValue,
      defaultActivationValue: 0,
      activeTurns: 1,
      activationFn: setComboNumberCategoryCharacterActivation,
    },
  )

  const sequence = [
    WHOLE_BASIC, START_ULT, END_BASIC, WHOLE_BASIC, WHOLE_SKILL,
  ]
  const expected = [
    false, true, true, true, false,
  ]

  const result = processSequence(preprocessor, sequence)
  const activations = getNumericActivations(result, key, activationValue)

  expect(activations.slice(1, expected.length + 1)).toEqual(expected)
})

test('Re-triggering resets duration, multiple trigger types', () => {
  const key = Sets.HunterOfGlacialForest
  const preprocessor = new TurnTriggeredStackPreprocessor(
    'test',
    {
      key: key,
      triggerKinds: [AbilityKind.ULT, AbilityKind.FUA],
      activeTurns: 1,
      activationFn: setComboBooleanCategorySetActivation,
    },
  )

  const sequence = [
    START_ULT, END_BASIC, START_FUA, END_BASIC, WHOLE_SKILL, WHOLE_SKILL,
  ]
  const expected = [
    true, true, true, true, true, false,
  ]

  const result = processSequence(preprocessor, sequence)
  const activations = getBooleanActivations(result, key, true)

  expect(activations.slice(1, expected.length + 1)).toEqual(expected)
})

test('Buff active for entire WHOLE marker before expiring', () => {
  const key = Sets.WavestriderCaptain
  const preprocessor = new TurnTriggeredStackPreprocessor(
    'test',
    {
      key: key,
      triggerKinds: [AbilityKind.ULT],
      activeTurns: 1,
      activationFn: setComboBooleanCategorySetActivation,
    },
  )

  const sequence = [
    START_ULT, END_SKILL, DEFAULT_DOT, WHOLE_BASIC, DEFAULT_DOT,
  ]
  const expected = [
    true, true, true, true, false,
  ]

  const result = processSequence(preprocessor, sequence)
  const activations = getBooleanActivations(result, key, true)

  expect(activations.slice(1, expected.length + 1)).toEqual(expected)
})

test('Trigger at the end of a turn', () => {
  const key = Sets.WavestriderCaptain
  const preprocessor = new TurnTriggeredStackPreprocessor(
    'test',
    {
      key: key,
      triggerKinds: [AbilityKind.ULT],
      activeTurns: 1,
      activationFn: setComboBooleanCategorySetActivation,
    },
  )

  const sequence = [
    START_BASIC, DEFAULT_SKILL, END_ULT, WHOLE_BASIC, WHOLE_BASIC,
  ]
  const expected = [
    false, false, true, true, false,
  ]

  const result = processSequence(preprocessor, sequence)
  const activations = getBooleanActivations(result, key, true)

  expect(activations.slice(1, expected.length + 1)).toEqual(expected)
})
