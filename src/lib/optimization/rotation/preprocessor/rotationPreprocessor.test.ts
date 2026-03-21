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
} from 'lib/tabs/tabOptimizer/combo/comboDrawerTypes'
import { initializeComboState } from 'lib/tabs/tabOptimizer/combo/comboDrawerInitializers'
import {
  expect,
  test,
} from 'vitest'

Metadata.initialize()

/**
 * BUG-01: LC preprocessor reset is missing.
 *
 * `precomputeConditionalActivations` resets set and character preprocessors
 * before each run but does NOT reset light cone preprocessors. Because the
 * preprocessors are module-level singletons, stale state from run 1 leaks
 * into run 2, producing different (wrong) activations on the second call
 * even when the inputs are identical.
 *
 * Strategy:
 * Run 1 uses a combo that ends with DEFAULT_ULT (DEFAULT marker, not
 * END/WHOLE), which triggers the ThusBurnsTheDawn dmgBuff and leaves
 * `buffActive = true` in the singleton's state since there is no
 * END/WHOLE marker to run the expiry check.
 *
 * Run 2 uses a combo with only WHOLE_BASIC (no ULT at all). Without a
 * reset, the singleton still has `buffActive = true`, so the basic in
 * run 2 is incorrectly marked as active. With a proper reset,
 * `buffActive` starts as `false` and stays `false`.
 *
 * Both runs must execute in a SINGLE test block to preserve singleton state.
 */
test('BUG-01: LC preprocessor stale state — buffActive leaks across runs without reset', () => {
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
 * BUG-28: setComboBooleanCategorySetActivation has no null guard.
 *
 * Unlike the character and light cone variants, the set activation function
 * does not check whether the category exists before accessing `.activations`.
 * Calling it with a set key that doesn't exist in `setConditionals` causes a
 * TypeError: Cannot read properties of undefined (reading 'activations').
 */
test('BUG-28: setComboBooleanCategorySetActivation should not throw for a nonexistent set', () => {
  // Build a minimal ComboState with empty setConditionals
  const comboState = {
    comboCharacter: {
      setConditionals: {},
    },
  } as unknown as ComboState

  // Should not throw — currently fails with TypeError because there is no
  // null guard on the looked-up category.
  expect(() => {
    setComboBooleanCategorySetActivation(comboState, 'nonExistentSet', 1, true)
  }).not.toThrow()
})
