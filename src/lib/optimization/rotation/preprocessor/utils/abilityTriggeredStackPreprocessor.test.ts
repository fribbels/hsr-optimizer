import { Sets } from 'lib/constants/constants'
import { AbilityTriggeredStackPreprocessor } from 'lib/optimization/rotation/preprocessor/utils/abilityTriggeredStackPreprocessor'
import {
  AbilityKind,
  AbilityNameToTurnAbility,
  DEFAULT_BASIC,
  DEFAULT_FUA,
  DEFAULT_SKILL,
  DEFAULT_ULT,
  WHOLE_ULT,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { ComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerController'
import { beforeEach, expect, test, vi } from 'vitest'

const TEST_CHARACTER_ID = 'test-character'
const TEST_SET_ID = 'test-set'

const mockBooleanCharacterActivation = vi.fn()
const mockBooleanSetActivation = vi.fn()
const mockNumberActivation = vi.fn()

const createMockComboState = (): ComboState => ({
  comboCharacter: {
    // @ts-ignore
    metadata: {},
  },
})

beforeEach(() => {
  mockBooleanCharacterActivation.mockReset()
  mockBooleanSetActivation.mockReset()
  mockNumberActivation.mockReset()
})

test('Boolean activation - trigger then consume', () => {
  const preprocessor = new AbilityTriggeredStackPreprocessor(
    TEST_CHARACTER_ID,
    {
      triggerKinds: [AbilityKind.ULT],
      consumeKinds: [AbilityKind.SKILL],
      activationFn: mockBooleanCharacterActivation,
      key: 'enhancedAbility',
    },
  )

  const comboState = createMockComboState()

  // Verify initial state
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_BASIC] }, 0, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 0, false)

  // Trigger ability
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 1, comboState)

  // Consume ability should be activated
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 2, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 2, true)

  // Next consume should be inactive (stacks used up)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 3, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 3, false)
})

test('Numeric activation with stacks', () => {
  const preprocessor = new AbilityTriggeredStackPreprocessor(
    TEST_CHARACTER_ID,
    {
      triggerKinds: [AbilityKind.ULT],
      consumeKinds: [AbilityKind.SKILL],
      stacksToAdd: 3,
      maxStacks: 5,
      activationFn: mockNumberActivation,
      key: 'stacks',
      isNumber: true,
      defaultActivationValue: 21,
    },
  )

  const comboState = createMockComboState()

  // Verify default state
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_BASIC] }, 0, comboState)
  expect(mockNumberActivation).toHaveBeenCalledWith(comboState, 'stacks', 0, 21)

  // Trigger ability adds 3 stacks
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 1, comboState)

  // Consume ability should pass stack count (3)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 2, comboState)
  expect(mockNumberActivation).toHaveBeenCalledWith(comboState, 'stacks', 2, 3)

  // Next consume should pass stack count (2)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 3, comboState)
  expect(mockNumberActivation).toHaveBeenCalledWith(comboState, 'stacks', 3, 2)

  // Next consume should pass stack count (1)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 4, comboState)
  expect(mockNumberActivation).toHaveBeenCalledWith(comboState, 'stacks', 4, 1)

  // Last consume should revert to default value
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 5, comboState)
  expect(mockNumberActivation).toHaveBeenCalledWith(comboState, 'stacks', 5, 21)
})

test('Stack limit enforcement', () => {
  const preprocessor = new AbilityTriggeredStackPreprocessor(
    TEST_CHARACTER_ID,
    {
      triggerKinds: [AbilityKind.ULT],
      consumeKinds: [AbilityKind.SKILL],
      maxStacks: 2,
      activationFn: mockBooleanCharacterActivation,
      key: 'enhancedAbility',
    },
  )

  const comboState = createMockComboState()

  // Trigger ability twice (should be limited to 2 stacks)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 0, comboState)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 1, comboState)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 2, comboState)

  // First consume
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 3, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 3, true)

  // Second consume
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 4, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 4, true)

  // Third consume (should be false, only had 2 stacks)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 5, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 5, false)
})

test('Reset functionality', () => {
  const preprocessor = new AbilityTriggeredStackPreprocessor(
    TEST_CHARACTER_ID,
    {
      triggerKinds: [AbilityKind.ULT],
      consumeKinds: [AbilityKind.SKILL],
      activationFn: mockBooleanCharacterActivation,
      key: 'enhancedAbility',
    },
  )

  const comboState = createMockComboState()

  // Trigger ability
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 0, comboState)

  // Reset processor
  preprocessor.reset()

  // Consume should be inactive after reset
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 1, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 1, false)
})

test('Set activation ScholarLostInErudition', () => {
  const preprocessor = new AbilityTriggeredStackPreprocessor(
    Sets.ScholarLostInErudition,
    {
      triggerKinds: [AbilityKind.ULT],
      consumeKinds: [AbilityKind.SKILL],
      activationFn: mockBooleanSetActivation,
      key: TEST_SET_ID,
    },
  )

  const comboState = createMockComboState()

  // Trigger ability
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 0, comboState)

  // Consume ability should activate set
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 1, comboState)
  expect(mockBooleanSetActivation).toHaveBeenCalledWith(comboState, TEST_SET_ID, 1, true)

  // Next skill should not activate set
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 2, comboState)
  expect(mockBooleanSetActivation).toHaveBeenCalledWith(comboState, TEST_SET_ID, 2, false)
})

test('Different Turn Markers should trigger the same behavior', () => {
  const preprocessor = new AbilityTriggeredStackPreprocessor(
    TEST_CHARACTER_ID,
    {
      triggerKinds: [AbilityKind.ULT],
      consumeKinds: [AbilityKind.SKILL],
      activationFn: mockBooleanCharacterActivation,
      key: 'enhancedAbility',
    },
  )

  const comboState = createMockComboState()

  // Test that DEFAULT_ULT, WHOLE_ULT all trigger the stack
  preprocessor.reset()
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 0, comboState)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 1, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 1, true)

  mockBooleanCharacterActivation.mockReset()
  preprocessor.reset()
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[WHOLE_ULT] }, 0, comboState)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 1, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 1, true)
})

test('Different ability types should be properly handled', () => {
  // Create preprocessor testing FUA consumption
  const preprocessor = new AbilityTriggeredStackPreprocessor(
    TEST_CHARACTER_ID,
    {
      triggerKinds: [AbilityKind.ULT],
      consumeKinds: [AbilityKind.FUA],
      activationFn: mockBooleanCharacterActivation,
      key: 'enhancedAbility',
    },
  )

  const comboState = createMockComboState()

  // Trigger with ULT
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 0, comboState)

  // Skill should not consume (wrong kind)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 1, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 1, false)

  // FUA should consume
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_FUA] }, 2, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 2, true)
})

test('Multiple stack triggers', () => {
  const preprocessor = new AbilityTriggeredStackPreprocessor(
    TEST_CHARACTER_ID,
    {
      triggerKinds: [AbilityKind.ULT],
      consumeKinds: [AbilityKind.SKILL],
      stacksToAdd: 2,
      maxStacks: 6,
      activationFn: mockNumberActivation,
      key: 'stacks',
      isNumber: true,
      defaultActivationValue: 10,
    },
  )

  const comboState = createMockComboState()

  // Multiple trigger activations
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 0, comboState) // +2 stacks
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 1, comboState) // +2 stacks

  // First consume (4 stacks)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 2, comboState)
  expect(mockNumberActivation).toHaveBeenCalledWith(comboState, 'stacks', 2, 4)

  // Second consume (3 stacks)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 3, comboState)
  expect(mockNumberActivation).toHaveBeenCalledWith(comboState, 'stacks', 3, 3)

  // Add one more trigger
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 4, comboState) // +2 stacks

  // Next consume (4 stacks again)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 5, comboState)
  expect(mockNumberActivation).toHaveBeenCalledWith(comboState, 'stacks', 5, 4)
})

test('Self-trigger and consume order - ULT affects next ability, not itself', () => {
  // Create preprocessor where ULT both triggers and consumes
  const preprocessor = new AbilityTriggeredStackPreprocessor(
    TEST_CHARACTER_ID,
    {
      triggerKinds: [AbilityKind.ULT],
      consumeKinds: [AbilityKind.ULT, AbilityKind.SKILL], // ULT is both trigger and consumer
      activationFn: mockBooleanCharacterActivation,
      key: 'enhancedAbility',
    },
  )

  const comboState = createMockComboState()

  // First ULT - should NOT be buffed (no stacks yet)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 0, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 0, false)

  // Second ULT - SHOULD be buffed (consumes stack from first ULT)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 1, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 1, true)

  // SKILL - SHOULD be buffed (consumes stack from second ULT)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 2, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 2, true)

  // Another SKILL - should NOT be buffed (no stacks left)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 3, comboState)
  expect(mockBooleanCharacterActivation).toHaveBeenCalledWith(comboState, 'enhancedAbility', 3, false)
})

test('FiresmithOfLavaForging behavior - ULT affects all subsequent abilities', () => {
  // Similar to the FiresmithOfLavaForging example where ULT triggers and all abilities consume
  const preprocessor = new AbilityTriggeredStackPreprocessor(
    'FiresmithTest',
    {
      triggerKinds: [AbilityKind.ULT],
      consumeKinds: [AbilityKind.BASIC, AbilityKind.SKILL, AbilityKind.ULT, AbilityKind.FUA],
      activationFn: mockBooleanSetActivation,
      key: 'FiresmithTest',
    },
  )

  const comboState = createMockComboState()

  // First ULT - should NOT be buffed (no stacks yet)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 0, comboState)
  expect(mockBooleanSetActivation).toHaveBeenCalledWith(comboState, 'FiresmithTest', 0, false)

  // BASIC - SHOULD be buffed (consumes stack from ULT)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_BASIC] }, 1, comboState)
  expect(mockBooleanSetActivation).toHaveBeenCalledWith(comboState, 'FiresmithTest', 1, true)

  // SKILL - should NOT be buffed (previous stack was consumed)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_SKILL] }, 2, comboState)
  expect(mockBooleanSetActivation).toHaveBeenCalledWith(comboState, 'FiresmithTest', 2, false)

  // Second ULT - should NOT be buffed initially, but adds a new stack
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_ULT] }, 3, comboState)
  expect(mockBooleanSetActivation).toHaveBeenCalledWith(comboState, 'FiresmithTest', 3, false)

  // FUA - SHOULD be buffed (consumes stack from second ULT)
  preprocessor.processAbility({ ...AbilityNameToTurnAbility[DEFAULT_FUA] }, 4, comboState)
  expect(mockBooleanSetActivation).toHaveBeenCalledWith(comboState, 'FiresmithTest', 4, true)
})
