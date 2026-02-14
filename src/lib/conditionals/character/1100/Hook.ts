import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const HookEntities = createEnum('Hook')
export const HookAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'DOT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Hook')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
  const {
    SOURCE_BASIC,
    SOURCE_SKILL,
    SOURCE_ULT,
    SOURCE_TALENT,
    SOURCE_TECHNIQUE,
    SOURCE_TRACE,
    SOURCE_MEMO,
    SOURCE_E1,
    SOURCE_E2,
    SOURCE_E4,
    SOURCE_E6,
  } = Source.character('1109')

  const targetBurnedExtraScaling = talent(e, 1.00, 1.10)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 2.40, 2.64)
  const skillEnhancedScaling = skill(e, 2.80, 3.08)
  const ultScaling = ult(e, 4.00, 4.32)
  const dotScaling = skill(e, 0.65, 0.715)

  const defaults = {
    enhancedSkill: true,
    targetBurned: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedSkill: {
      id: 'enhancedSkill',
      formItem: 'switch',
      text: t('Content.enhancedSkill.text'),
      content: t('Content.enhancedSkill.content', { skillEnhancedScaling: TsUtils.precisionRound(100 * skillEnhancedScaling) }),
    },
    targetBurned: {
      id: 'targetBurned',
      formItem: 'switch',
      text: t('Content.targetBurned.text'),
      content: t('Content.targetBurned.content', { targetBurnedExtraScaling: TsUtils.precisionRound(100 * targetBurnedExtraScaling) }),
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT, AbilityType.DOT],
    content: () => Object.values(content),
    defaults: () => defaults,

    entityDeclaration: () => Object.values(HookEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [HookEntities.Hook]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),

    actionDeclaration: () => Object.values(HookAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [HookAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Fire)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
            ...(r.targetBurned
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Fire)
                  .atkScaling(targetBurnedExtraScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [HookAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Fire)
              .atkScaling((r.enhancedSkill) ? skillEnhancedScaling : skillScaling)
              .toughnessDmg(20)
              .build(),
            ...(r.targetBurned
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Fire)
                  .atkScaling(targetBurnedExtraScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [HookAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Fire)
              .atkScaling(ultScaling)
              .toughnessDmg(30)
              .build(),
            ...(r.targetBurned
              ? [
                HitDefinitionBuilder.standardAdditional()
                  .damageElement(ElementTag.Fire)
                  .atkScaling(targetBurnedExtraScaling)
                  .build(),
              ]
              : []),
          ],
        },
        [HookAbilities.DOT]: {
          hits: [
            HitDefinitionBuilder.standardDot()
              .damageElement(ElementTag.Fire)
              .atkScaling(dotScaling)
              .dotBaseChance(1.00)
              .build(),
          ],
        },
        [HookAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Fire).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],

    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (e >= 1 && r.enhancedSkill) ? 0.20 : 0, x.damageType(DamageTag.SKILL).source(SOURCE_E1))
      x.buff(StatKey.DMG_BOOST, (e >= 6 && r.targetBurned) ? 0.20 : 0, x.source(SOURCE_E6))
    },

    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
