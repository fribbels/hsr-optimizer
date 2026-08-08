// @vitest-environment jsdom
import {
  ABILITY_LIMIT,
  ConditionalDataType,
  Stats,
} from 'lib/constants/constants'
import { initializeComboState } from 'lib/optimization/combo/comboInitializers'
import type { ComboNumberConditional } from 'lib/optimization/combo/comboTypes'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { newTransformStateActions } from 'lib/optimization/rotation/actionTransform'
import { ComboType } from 'lib/optimization/rotation/comboType'
import { initializeContextConditionals } from 'lib/simulations/contextConditionals'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { Metadata } from 'lib/state/metadataInitializer'
import { clone } from 'lib/utils/objectUtils'
import type { CharacterId } from 'types/character'
import type { LightConeId } from 'types/lightCone'
import type { OptimizerAction } from 'types/optimizer'
import {
  describe,
  expect,
  test,
} from 'vitest'

Metadata.initialize()

const SUNDAY = {
  id: '1313',
  lightCone: '23000',
} satisfies { id: CharacterId, lightCone: LightConeId }
const SLOT_PROBE = 'slotProbe'
const SUNDAY_CONDITIONAL_IDS = [
  'SundayMemoCrConditional_Teammate0',
  'SundayCrConditional_Teammate0',
]

// Returns its rotation slot so any index mismatch is visible.
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

// Covers skipped abilities before and between survivors, plus an unfiltered control.
const CHARACTERS = [
  { name: 'Robin Summeretto', id: '1512', lightCone: '23063', hasIndexGap: true },
  { name: 'Topaz', id: '1112', lightCone: '23000', hasIndexGap: true },
  { name: 'Hyacine', id: '1409', lightCone: '23037', hasIndexGap: true },
  { name: 'Seele', id: '1102', lightCone: '23000', hasIndexGap: false },
] satisfies { name: string, id: CharacterId, lightCone: LightConeId, hasIndexGap: boolean }[]

function expectSundayConditionals(actions: OptimizerAction[]) {
  expect(actions.length).toBeGreaterThan(0)

  for (const action of actions) {
    const conditionals = action.teammateDynamicConditionals
    expect(conditionals.map((conditional) => conditional.id)).toEqual(SUNDAY_CONDITIONAL_IDS)

    for (const conditional of conditionals) {
      expect(conditional.teammateIndex).toBe(0)
      expect(conditional.condition).toBeTypeOf('function')
      expect(conditional.effect).toBeTypeOf('function')
      expect(conditional.gpu).toBeTypeOf('function')
    }

    const registered = action.conditionalRegistry[Stats.CR]
      .filter((conditional) => conditional.teammateIndex === 0)
    expect(registered).toEqual(conditionals)
  }
}

describe('teammate conditionals preserve source rotation slots', () => {
  test.each(CHARACTERS)('$name', ({ id, lightCone, hasIndexGap }) => {
    const form = generateFullDefaultForm(id, lightCone, 0, 1)
    form.teammate0 = generateFullDefaultForm(SUNDAY.id, SUNDAY.lightCone, 0, 1, true)
    form.comboType = ComboType.ADVANCED

    const context = generateContext(form)
    const comboState = initializeComboState(form, false)
    comboState.comboTeammate0!.characterConditionals[SLOT_PROBE] = slotProbeConditional()

    newTransformStateActions(comboState, form, context)

    expect(context.rotationActions.length).toBeGreaterThan(0)
    expect(context.rotationActions.some((action, index) => action.conditionalIndex !== index + 1)).toBe(hasIndexGap)
    for (const action of context.rotationActions) {
      expect(action.teammate0.characterConditionals[SLOT_PROBE]).toBe(action.conditionalIndex)
    }
  })
})

describe('teammate dynamic conditionals are registered exactly once', () => {
  test('rebuilds serialized actions without duplicates', () => {
    const form = generateFullDefaultForm('1112', '23000', 0, 6)
    form.teammate0 = generateFullDefaultForm(SUNDAY.id, SUNDAY.lightCone, 6, 5, true)

    // Worker transport strips functions from the serialized context.
    const context = clone(generateContext(form))
    initializeContextConditionals(context)
    expectSundayConditionals(context.rotationActions)
    expectSundayConditionals(context.defaultActions)

    initializeContextConditionals(context)
    expectSundayConditionals(context.rotationActions)
    expectSundayConditionals(context.defaultActions)
  })
})
