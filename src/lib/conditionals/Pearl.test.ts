// @vitest-environment jsdom
import { resolveShowcaseScoringOrder } from 'lib/characterPreview/scoring/showcaseScoringOrder'
import { Pearl } from 'lib/conditionals/character/1500/Pearl'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { DamageFunctionType } from 'lib/optimization/engine/damage/damageCalculator'
import { ComboType } from 'lib/optimization/rotation/comboType'
import {
  DEFAULT_BASIC,
  DEFAULT_SKILL_HEAL,
  NULL_TURN_ABILITY_NAME,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { ScoringType } from 'lib/scoring/scoringConfig'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { Metadata } from 'lib/state/metadataInitializer'
import type { Eidolon } from 'types/character'
import { ScoringConfigType } from 'types/metadata'
import {
  expect,
  test,
} from 'vitest'

Metadata.initialize()

test('Pearl resolves substats before heal and none', () => {
  const availableSimulationConfigs = {
    [ScoringConfigType.HEAL]: {},
  }

  expect(resolveShowcaseScoringOrder(
    Pearl.display.showcaseScoringOrder,
    availableSimulationConfigs,
  )).toEqual([
    ScoringType.SUBSTAT_SCORE,
    ScoringType.HEAL_SCORE,
    ScoringType.NONE,
  ])
})

test.each([0, 3] satisfies Eidolon[])('Pearl E%i adds the Ultimate rider only to enhanced Basics', (eidolon) => {
  const form = generateFullDefaultForm(Pearl.id, Pearl.defaultLightCone, eidolon, 1)
  form.comboType = ComboType.ADVANCED
  form.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC, DEFAULT_BASIC, DEFAULT_SKILL_HEAL]
  form.characterConditionals.certifiedBanger = false
  form.characterConditionals.punchlineStacks = 30

  for (const deepLearning of [true, false]) {
    form.characterConditionals.deepLearning = deepLearning
    const context = generateContext(form)
    for (const action of context.rotationActions.slice(0, 2)) {
      const elationHits = action.hits!.filter((hit) => hit.damageFunctionType === DamageFunctionType.Elation)
      expect(elationHits).toHaveLength(deepLearning ? 1 : 0)
      if (deepLearning) {
        expect(elationHits[0]).toMatchObject({
          elationScaling: eidolon >= 3 ? 0.66 : 0.60,
          damageElement: ElementTag.Ice,
          punchlineStacks: 30,
          toughnessDmg: 0,
          sourceEntityIndex: 0,
        })
      }
    }
    expect(context.rotationActions[2].hits!.every((hit) => hit.damageFunctionType === DamageFunctionType.Heal)).toBe(true)
  }
})

test('Pearl no longer adds her enhanced Basic rider to teammate attacks', () => {
  const form = generateFullDefaultForm('1102', '23000', 0, 1)
  form.teammate0 = generateFullDefaultForm(Pearl.id, Pearl.defaultLightCone, 0, 1, true)
  form.teammate0.characterConditionals = { ...form.teammate0.characterConditionals, elationSkillProc: false }
  form.comboType = ComboType.ADVANCED
  form.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC, DEFAULT_BASIC]

  const context = generateContext(form)
  for (const action of context.rotationActions) {
    expect(action.hits!.some((hit) => hit.damageFunctionType === DamageFunctionType.Elation)).toBe(false)
  }
})
