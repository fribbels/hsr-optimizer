import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  AbilityEidolon,
  Conditionals,
  ContentDefinition,
  createEnum,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export const TrailblazerDestructionEntities = createEnum('TrailblazerDestruction')
export const TrailblazerDestructionAbilities = createEnum('BASIC', 'SKILL', 'ULT', 'BREAK')

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerDestruction')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5
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
  } = Source.character('8002')

  const talentAtkScalingValue = talent(e, 0.20, 0.22)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.25, 1.375)
  const ultScaling = ult(e, 4.5, 4.80)
  const ultEnhancedScaling = ult(e, 2.70, 2.88)
  const ultEnhancedScaling2 = ult(e, 1.62, 1.728)

  const defaults = {
    enhancedUlt: true,
    talentStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedUlt: {
      id: 'enhancedUlt',
      formItem: 'switch',
      text: t('Content.enhancedUlt.text'),
      content: t('Content.enhancedUlt.content', {
        ultScaling: TsUtils.precisionRound(100 * ultScaling),
        ultEnhancedScaling: TsUtils.precisionRound(100 * ultEnhancedScaling),
        ultEnhancedScaling2: TsUtils.precisionRound(100 * ultEnhancedScaling2),
      }),
    },
    talentStacks: {
      id: 'talentStacks',
      formItem: 'slider',
      text: t('Content.talentStacks.text'),
      content: t('Content.talentStacks.content', { talentAtkScalingValue: TsUtils.precisionRound(100 * talentAtkScalingValue) }),
      min: 0,
      max: 2,
    },
  }

  return {
    activeAbilities: [AbilityType.BASIC, AbilityType.SKILL, AbilityType.ULT],
    entityDeclaration: () => Object.values(TrailblazerDestructionEntities),
    entityDefinition: (action: OptimizerAction, context: OptimizerContext) => ({
      [TrailblazerDestructionEntities.TrailblazerDestruction]: {
        primary: true,
        summon: false,
        memosprite: false,
      },
    }),
    actionDeclaration: () => Object.values(TrailblazerDestructionAbilities),
    actionDefinition: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return {
        [TrailblazerDestructionAbilities.BASIC]: {
          hits: [
            HitDefinitionBuilder.standardBasic()
              .damageElement(ElementTag.Physical)
              .atkScaling(basicScaling)
              .toughnessDmg(10)
              .build(),
          ],
        },
        [TrailblazerDestructionAbilities.SKILL]: {
          hits: [
            HitDefinitionBuilder.standardSkill()
              .damageElement(ElementTag.Physical)
              .atkScaling(skillScaling)
              .toughnessDmg(20)
              .build(),
          ],
        },
        [TrailblazerDestructionAbilities.ULT]: {
          hits: [
            HitDefinitionBuilder.standardUlt()
              .damageElement(ElementTag.Physical)
              .atkScaling((r.enhancedUlt) ? ultEnhancedScaling : ultScaling)
              .toughnessDmg((r.enhancedUlt) ? 20 : 30)
              .build(),
          ],
        },
        [TrailblazerDestructionAbilities.BREAK]: {
          hits: [
            HitDefinitionBuilder.standardBreak(ElementTag.Physical).build(),
          ],
        },
      }
    },
    actionModifiers: () => [],
    content: () => Object.values(content),
    defaults: () => defaults,
    finalizeCalculations: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
    },
    newGpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',

    // New container methods
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.buff(StatKey.ATK_P, r.talentStacks * talentAtkScalingValue, x.source(SOURCE_TALENT))
      x.buff(StatKey.DEF_P, r.talentStacks * 0.10, x.source(SOURCE_TRACE))
      x.buff(StatKey.CR, (e >= 4 && x.getActionValue(StatKey.ENEMY_WEAKNESS_BROKEN, TrailblazerDestructionEntities.TrailblazerDestruction)) ? 0.25 : 0, x.source(SOURCE_E4))

      // Boost
      x.buff(StatKey.DMG_BOOST, 0.25, x.damageType(DamageTag.SKILL).source(SOURCE_TRACE))
      x.buff(StatKey.DMG_BOOST, (r.enhancedUlt) ? 0.25 : 0, x.damageType(DamageTag.ULT).source(SOURCE_TRACE))
    },
  }
}
