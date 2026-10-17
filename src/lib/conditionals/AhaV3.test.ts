import { AeonAha } from 'lib/conditionals/character/1500/AeonAha'
import { Evanescia } from 'lib/conditionals/character/1500/Evanescia'
import { Sparxie } from 'lib/conditionals/character/1500/Sparxie'
import { Yaoguang } from 'lib/conditionals/character/1500/Yaoguang'
import { TrailblazerElationCaelus } from 'lib/conditionals/character/8000/TrailblazerElation'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import type { CritHitDefinition, ElationHitDefinition } from 'types/hitConditionalTypes'
import type { OptimizerAction, OptimizerContext } from 'types/optimizer'
import { expect, test } from 'vitest'

const context = { enemyCount: 1 } as OptimizerContext

function actionWithAha(
  actorId: string,
  conditionals: Record<string, number | boolean>,
  ahaEidolon: number,
  ahaConditionals: Record<string, number | boolean>,
): OptimizerAction {
  return {
    actorId,
    actorEidolon: 0,
    characterConditionals: conditionals,
    teammate0: {
      actorId: AeonAha.id,
      actorEidolon: ahaEidolon,
      characterConditionals: { facesOfElation: true, ...ahaConditionals },
    },
  } as unknown as OptimizerAction
}

test('Sparxie receives v3 Ode scaling and a selected shared E6 Punchline grant', () => {
  const controller = Sparxie.conditionals(0, false)
  const base = actionWithAha(Sparxie.id, controller.defaults(), 0, {})
  const enhanced = actionWithAha(Sparxie.id, controller.defaults(), 6, { e6FirstUltimatePunchline: true })

  const baseHit = controller.actionDefinition(base, context)[AbilityKind.ELATION_SKILL]!.hits[0] as ElationHitDefinition
  const enhancedHit = controller.actionDefinition(enhanced, context)[AbilityKind.ELATION_SKILL]!.hits[0] as ElationHitDefinition

  expect(baseHit.elationScaling).toBeCloseTo(5.5 * 1.5)
  expect(enhancedHit.elationScaling).toBeCloseTo(5.5 * 2.2)
  expect(enhancedHit.punchlineStacks).toBe(baseHit.punchlineStacks + 100)

  enhanced.teammate0.characterConditionals.e6FirstUltimatePunchline = false
  const nextHit = controller.actionDefinition(enhanced, context)[AbilityKind.ELATION_SKILL]!.hits[0] as ElationHitDefinition
  expect(nextHit.punchlineStacks).toBe(baseHit.punchlineStacks)

  enhanced.teammate0.characterConditionals.e6FirstUltimatePunchline = true
  enhanced.teammate1 = {
    actorId: Yaoguang.id,
    actorEidolon: 0,
    characterConditionals: { yaoguangAhaInstant: true },
    lightConeConditionals: {},
  }
  const yaoguangContext = {
    enemyCount: 1,
    teammate1Metadata: { characterId: Yaoguang.id, characterEidolon: 0 },
  } as OptimizerContext
  const fixedHit = controller.actionDefinition(enhanced, yaoguangContext)[AbilityKind.ELATION_SKILL]!.hits[0] as ElationHitDefinition
  expect(fixedHit.punchlineStacks).toBe(20)
})

test('Evanescia Ode bonus steps at accumulated Party Trick thresholds', () => {
  const controller = Evanescia.conditionals(0, false)
  const action = actionWithAha(Evanescia.id, controller.defaults(), 0, {})
  const ultScaling = (accumulatedPartyTrick: number) => {
    action.characterConditionals.accumulatedPartyTrick = accumulatedPartyTrick
    return (controller.actionDefinition(action, context)[AbilityKind.ULT]!.hits[0] as CritHitDefinition).atkScaling!
  }

  const belowThreshold = ultScaling(479)
  expect(ultScaling(480)).toBeCloseTo(belowThreshold * 1.75)
  expect(ultScaling(960)).toBeCloseTo(belowThreshold * 2.5)

  action.teammate0.actorEidolon = 2
  expect(ultScaling(480)).toBeCloseTo(belowThreshold * 2.5)
})

test('Trailblazer Plot Armor uses the highest ally Party Trick and Aha True DMG state', () => {
  const controller = TrailblazerElationCaelus.conditionals(0, false)
  const action = actionWithAha(TrailblazerElationCaelus.id, {
    ...controller.defaults(),
    highestAllyPartyTrick: 180,
  }, 0, { elationSkillTrueDmg: true })

  const plotArmorHit = () => controller.actionDefinition(action, context)[AbilityKind.UNIQUE]!.hits[0] as ElationHitDefinition
  expect(plotArmorHit().punchlineStacks).toBe(180)
  expect(plotArmorHit().trueDmgModifier).toBeCloseTo(0.20)

  action.teammate0.characterConditionals.elationSkillTrueDmg = false
  expect(plotArmorHit().trueDmgModifier).toBe(0)
})
