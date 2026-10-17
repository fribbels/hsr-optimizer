import { AeonAha } from 'lib/conditionals/character/1500/AeonAha'
import { Evanescia } from 'lib/conditionals/character/1500/Evanescia'
import { TrailblazerElationCaelus } from 'lib/conditionals/character/8000/TrailblazerElation'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import type { CritHitDefinition, ElationHitDefinition } from 'types/hitConditionalTypes'
import type { OptimizerAction, OptimizerContext } from 'types/optimizer'
import { expect, test } from 'vitest'

const context = { enemyCount: 1 } as OptimizerContext

test('Aha Elation Skill includes its own non-True damage in the True DMG estimate', () => {
  for (const [eidolon, expectedModifier] of [[0, 0.20], [4, 0.25]]) {
    const controller = AeonAha.conditionals(eidolon, false)
    const action = {
      actorId: AeonAha.id,
      actorEidolon: eidolon,
      characterConditionals: controller.defaults(),
    } as OptimizerAction
    const hit = controller.actionDefinition(action, context)[AbilityKind.ELATION_SKILL]!.hits[0] as ElationHitDefinition

    expect(hit.trueDmgModifier).toBeCloseTo(expectedModifier)
  }
})

test('Aha Skill follow-up deals Elation damage without the FUA damage tag', () => {
  const controller = AeonAha.conditionals(0, false)
  const action = {
    actorId: AeonAha.id,
    actorEidolon: 0,
    characterConditionals: controller.defaults(),
  } as OptimizerAction
  const hit = controller.actionDefinition(action, context)[AbilityKind.SKILL]!.hits[0] as ElationHitDefinition

  expect(hit.damageType).toBe(DamageTag.ELATION)
  expect(hit.elationScaling).toBeCloseTo(0.70)
})

function actionWithAha(
  actorId: string,
  conditionals: Record<string, number | boolean>,
): OptimizerAction {
  return {
    actorId,
    actorEidolon: 0,
    characterConditionals: conditionals,
    teammate0: {
      actorId: AeonAha.id,
      actorEidolon: 0,
      characterConditionals: { facesOfElation: true },
    },
  } as unknown as OptimizerAction
}

test('Evanescia Ode Ultimate bonus applies to both Ultimate hits', () => {
  const controller = Evanescia.conditionals(0, false)
  const action = actionWithAha(Evanescia.id, controller.defaults())
  const ultScaling = (active: boolean) => {
    action.characterConditionals.ascensionUltActive = active
    const hits = controller.actionDefinition(action, context)[AbilityKind.ULT]!.hits
    return {
      atk: (hits[0] as CritHitDefinition).atkScaling!,
      elation: (hits[1] as ElationHitDefinition).elationScaling!,
    }
  }

  const normal = ultScaling(false)
  const active = ultScaling(true)
  expect(active.atk).toBeCloseTo(normal.atk * 1.75)
  expect(active.elation).toBeCloseTo(normal.elation * 1.75)
})

test('Trailblazer Plot Armor True DMG is independent of Aha Instant estimate', () => {
  const controller = TrailblazerElationCaelus.conditionals(0, false)
  const action = actionWithAha(TrailblazerElationCaelus.id, controller.defaults())

  const plotArmorHit = () => controller.actionDefinition(action, context)[AbilityKind.UNIQUE]!.hits[0] as ElationHitDefinition
  action.teammate0.characterConditionals.elationSkillTrueDmg = false
  expect(plotArmorHit().trueDmgModifier).toBeCloseTo(0.20)

  action.teammate0.characterConditionals.facesOfElation = false
  expect(plotArmorHit().trueDmgModifier).toBe(0)
})
