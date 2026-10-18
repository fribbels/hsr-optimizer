// @vitest-environment jsdom
import { resolveShowcaseScoringOrder } from 'lib/characterPreview/scoring/showcaseScoringOrder'
import { Pearl } from 'lib/conditionals/character/1500/Pearl'
import { Sparxie } from 'lib/conditionals/character/1500/Sparxie'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { DamageFunctionType } from 'lib/optimization/engine/damage/damageCalculator'
import { ComboType } from 'lib/optimization/rotation/comboType'
import {
  DEFAULT_BASIC,
  DEFAULT_ELATION_SKILL,
  NULL_TURN_ABILITY_NAME,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { ScoringType } from 'lib/scoring/scoringConfig'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { Metadata } from 'lib/state/metadataInitializer'
import { ScoringConfigType } from 'types/metadata'
import type { OptimizerAction } from 'types/optimizer'
import {
  expect,
  test,
} from 'vitest'

Metadata.initialize()

function elationHits(action: OptimizerAction) {
  return action.hits!.filter((hit) => hit.damageFunctionType === DamageFunctionType.Elation)
}

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

test('Pearl Elation Skill proc applies to the ally Elation Skill only', () => {
  const form = generateFullDefaultForm(Sparxie.id, Sparxie.defaultLightCone, 0, 1)
  form.teammate0 = generateFullDefaultForm(Pearl.id, Pearl.defaultLightCone, 0, 1, true)
  form.teammate0.characterConditionals!.elationSkillProc = true
  // Keep Sparxie's own Basic free of Talent Elation hits
  form.characterConditionals.enhancedBasic = false
  form.comboType = ComboType.ADVANCED
  form.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, DEFAULT_ELATION_SKILL, DEFAULT_BASIC]

  const [elationSkill, basic] = generateContext(form).rotationActions
  expect(elationHits(elationSkill)).toHaveLength(2)
  expect(elationHits(elationSkill)[1]).toMatchObject({ damageElement: ElementTag.Fire })
  expect(elationHits(basic)).toHaveLength(0)
})
