// @vitest-environment jsdom
import {
  ABILITY_LIMIT,
  ConditionalDataType,
} from 'lib/constants/constants'
import { initializeComboState } from 'lib/optimization/combo/comboInitializers'
import type { ComboNumberConditional } from 'lib/optimization/combo/comboTypes'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { newTransformStateActions } from 'lib/optimization/rotation/actionTransform'
import { ComboType } from 'lib/optimization/rotation/comboType'
import { initializeContextConditionals } from 'lib/simulations/contextConditionals'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { Metadata } from 'lib/state/metadataInitializer'
import {
  describe,
  expect,
  test,
} from 'vitest'

Metadata.initialize()

const SUNDAY = { id: '1313', lightCone: '23000' }
const SLOT_PROBE = 'slotProbe'

// A conditional whose value at slot N is exactly N, so a misread of any size is detectable.
function slotProbeConditional(): ComboNumberConditional {
  const length = ABILITY_LIMIT + 1
  return {
    type: ConditionalDataType.NUMBER,
    partitions: Array.from({ length }, (_, slot) => ({
      value: slot,
      activations: Array.from({ length }, (_, i) => i === slot),
    })),
  }
}

// Rotations that name an AbilityKind the character never declares. actionTransform drops those
// actions, which must not renumber the surviving ones for teammate conditional lookups.
const CHARACTERS = [
  { name: 'Robin Summeretto', id: '1512', lightCone: '23063' }, // drops START_ULT + END_SKILL
  { name: 'Topaz', id: '1112', lightCone: '23000' }, // drops START_ULT
  { name: 'Hyacine', id: '1409', lightCone: '23037' }, // drops START_ULT + 2x START_SKILL, interleaved
  { name: 'Seele', id: '1102', lightCone: '23000' }, // drops nothing - control
]

describe('teammate conditionals bind to the rotation slot their action owns', () => {
  test.each(CHARACTERS)('$name', ({ id, lightCone }) => {
    const form = generateFullDefaultForm(id as never, lightCone as never, 0, 1)
    form.teammate0 = generateFullDefaultForm(SUNDAY.id as never, SUNDAY.lightCone as never, 0, 1, true)
    form.comboType = ComboType.ADVANCED

    const context = generateContext(form)
    const comboState = initializeComboState(form, false)
    comboState.comboTeammate0!.characterConditionals[SLOT_PROBE] = slotProbeConditional()

    newTransformStateActions(comboState, form, context)

    expect(context.rotationActions.length).toBeGreaterThan(0)
    for (const action of context.rotationActions) {
      expect(action.teammate0.characterConditionals[SLOT_PROBE]).toBe(action.conditionalIndex)
    }
  })
})

// Registration runs on both the main thread and again after a context crosses a worker
// boundary, so it has to be idempotent rather than accumulate.
describe('teammate dynamic conditionals are registered exactly once', () => {
  test('no duplicates after repeated registration', () => {
    const form = generateFullDefaultForm('1112' as never, '23000' as never, 0, 6) // Topaz
    form.teammate0 = generateFullDefaultForm(SUNDAY.id as never, SUNDAY.lightCone as never, 6, 5, true)

    const context = generateContext(form)

    const actions = [...context.rotationActions, ...context.defaultActions]
    expect(actions.length).toBeGreaterThan(0)

    const counts = actions.map((a) => a.teammateDynamicConditionals.length)
    expect(Math.max(...counts)).toBeGreaterThan(0) // the teammate really does contribute some

    for (const action of actions) {
      const ids = action.teammateDynamicConditionals.map((c) => c.id)
      expect(ids).toEqual([...new Set(ids)])
    }

    // Re-running registration (as worker rehydration does) must not accumulate.
    const before = actions.map((a) => a.teammateDynamicConditionals.length)
    initializeContextConditionals(context)
    const after = actions.map((a) => a.teammateDynamicConditionals.length)
    expect(after).toEqual(before)
  })
})
