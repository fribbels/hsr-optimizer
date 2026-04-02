// @vitest-environment jsdom
import { getDefaultForm } from 'lib/optimization/defaultForm'
import { precomputeConditionalActivations } from 'lib/optimization/rotation/preprocessor/rotationPreprocessor'
import { setComboBooleanCategorySetActivation } from 'lib/optimization/rotation/preprocessor/utils/preprocessUtils'
import { Phainon } from 'lib/conditionals/character/1400/Phainon'
import { ThusBurnsTheDawn } from 'lib/conditionals/lightcone/5star/ThusBurnsTheDawn'
import { Metadata } from 'lib/state/metadataInitializer'
import { normalizeForm } from 'lib/stores/optimizerForm/optimizerFormConversions'
import {
  DEFAULT_ULT,
  NULL_TURN_ABILITY_NAME,
  WHOLE_BASIC,
} from 'lib/optimization/rotation/turnAbilityConfig'
import type {
  ComboBooleanConditional,
  ComboState,
} from 'lib/optimization/combo/comboTypes'
import { initializeComboState } from 'lib/optimization/combo/comboInitializers'
import {
  expect,
  test,
} from 'vitest'

Metadata.initialize()

/**
 * LC preprocessor singleton must be reset between runs.
 *
 * Without a reset, stale state from run 1 leaks into run 2. Here,
 * ThusBurnsTheDawn's `buffActive` stays `true` after a DEFAULT_ULT
 * (no END/WHOLE marker to trigger expiry), causing run 2's basic
 * to incorrectly inherit the buff.
 *
 * Both runs execute in a single test to preserve singleton state.
 */
test('LC preprocessor stale state — buffActive does not leak across runs', () => {
  // Disable comboPreprocessor so initializeComboState does NOT internally
  // call precomputeConditionalActivations — we need full control over when
  // it runs to observe singleton state leaking between calls.
  const form = getDefaultForm({ id: Phainon.id })
  form.lightCone = ThusBurnsTheDawn.id
  form.comboPreprocessor = false
  const request = normalizeForm(form)

  // --- Run 1: combo that ends with DEFAULT_ULT leaving buffActive = true ---
  const comboState1 = initializeComboState(request, false)
  // Override the combo to: [NULL, WHOLE_BASIC, DEFAULT_ULT]
  // WHOLE_BASIC starts/ends a turn, then DEFAULT_ULT triggers the buff
  // but has DEFAULT marker so the expiry check never runs, leaving
  // the singleton's buffActive = true.
  comboState1.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, WHOLE_BASIC, DEFAULT_ULT]
  precomputeConditionalActivations(comboState1, request)

  // After run 1, the singleton ThusBurnsTheDawnPreprocessor has buffActive = true.

  // --- Run 2: combo with only a basic (no ULT trigger) ---
  const comboState2 = initializeComboState(request, false)
  // Override the combo to: [NULL, WHOLE_BASIC]
  // No ULT in this combo, so dmgBuff should be false for all abilities.
  comboState2.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, WHOLE_BASIC]
  precomputeConditionalActivations(comboState2, request)

  const lcConditionals2 = comboState2.comboCharacter.lightConeConditionals
  const dmgBuff2 = lcConditionals2['dmgBuff'] as ComboBooleanConditional | undefined

  // The WHOLE_BASIC at index 1 should NOT have the dmgBuff active because
  // no ULT was triggered in this run. Without the fix, the stale
  // buffActive = true from run 1 causes this to be incorrectly true.
  expect(dmgBuff2).toBeDefined()
  expect(dmgBuff2!.activations[1]).toBe(false)
})

/**
 * setComboBooleanCategorySetActivation must handle missing set keys gracefully
 * instead of throwing when the category doesn't exist in setConditionals.
 */
test('setComboBooleanCategorySetActivation should not throw for a nonexistent set', () => {
  // Build a minimal ComboState with empty setConditionals
  const comboState = {
    comboCharacter: {
      setConditionals: {},
    },
  } as unknown as ComboState

  // Should not throw — the null guard on the looked-up category must
  // prevent a TypeError when the set key doesn't exist.
  expect(() => {
    setComboBooleanCategorySetActivation(comboState, 'nonExistentSet', 1, true)
  }).not.toThrow()
})
