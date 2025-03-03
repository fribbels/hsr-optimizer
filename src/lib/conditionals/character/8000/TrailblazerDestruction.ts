import { AbilityType, SKILL_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

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
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff(r.talentStacks * talentAtkScalingValue, SOURCE_TALENT)
      x.DEF_P.buff(r.talentStacks * 0.10, SOURCE_TRACE)
      x.CR.buff((e >= 4 && x.a[Key.ENEMY_WEAKNESS_BROKEN]) ? 0.25 : 0, SOURCE_E4)

      // Scaling
      x.BASIC_ATK_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_ATK_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_ATK_SCALING.buff((r.enhancedUlt) ? ultEnhancedScaling : ultScaling, SOURCE_ULT)

      // Boost
      buffAbilityDmg(x, SKILL_DMG_TYPE, 0.25, SOURCE_TRACE)
      buffAbilityDmg(x, ULT_DMG_TYPE, (r.enhancedUlt) ? 0.25 : 0, SOURCE_TRACE)

      x.BASIC_TOUGHNESS_DMG.buff(10, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(20, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff((r.enhancedUlt) ? 20 : 30, SOURCE_ULT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => {},
    gpuFinalizeCalculations: () => '',
  }
}
