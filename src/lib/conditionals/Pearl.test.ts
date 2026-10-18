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
import type {
  CharacterId,
  Eidolon,
} from 'types/character'
import type { LightConeId } from 'types/lightCone'
import { ScoringConfigType } from 'types/metadata'
import type { OptimizerAction } from 'types/optimizer'
import {
  expect,
  test,
} from 'vitest'

Metadata.initialize()

const SEELE = {
  id: '1102',
  lightCone: '23000',
} satisfies { id: CharacterId, lightCone: LightConeId }

function elationHits(action: OptimizerAction) {
  return action.hits!.filter((hit) => hit.damageFunctionType === DamageFunctionType.Elation)
}

function pearlBasicThenHeal(eidolon: Eidolon, deepLearning: boolean) {
  const form = generateFullDefaultForm(Pearl.id, Pearl.defaultLightCone, eidolon, 1)
  form.comboType = ComboType.ADVANCED
  form.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC, DEFAULT_SKILL_HEAL]
  form.characterConditionals.certifiedBanger = false
  form.characterConditionals.deepLearning = deepLearning
  return generateContext(form).rotationActions
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

test.each(
  [
    { eidolon: 0, scaling: 0.60 },
    { eidolon: 3, scaling: 0.66 },
  ] satisfies { eidolon: Eidolon, scaling: number }[],
)('Pearl E$eidolon enhanced Basic adds one Ice Elation hit', ({ eidolon, scaling }) => {
  const [basic, heal] = pearlBasicThenHeal(eidolon, true)
  expect(elationHits(basic)).toMatchObject([{ elationScaling: scaling, damageElement: ElementTag.Ice }])
  expect(elationHits(heal)).toHaveLength(0)
})

test('Pearl Basic adds no Elation hit without Deep Learning', () => {
  const [basic] = pearlBasicThenHeal(0, false)
  expect(elationHits(basic)).toHaveLength(0)
})

test('Pearl as a teammate adds no Elation hit to the main character', () => {
  const form = generateFullDefaultForm(SEELE.id, SEELE.lightCone, 0, 1)
  form.teammate0 = generateFullDefaultForm(Pearl.id, Pearl.defaultLightCone, 0, 1, true)
  // The Elation Skill next-attack proc is a separate, intended teammate hit
  form.teammate0.characterConditionals!.elationSkillProc = false
  form.comboType = ComboType.ADVANCED
  form.comboTurnAbilities = [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC]

  const [basic] = generateContext(form).rotationActions
  expect(elationHits(basic)).toHaveLength(0)
})
