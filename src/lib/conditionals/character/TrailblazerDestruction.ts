import { SKILL_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, gpuStandardAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Key, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.TrailblazerDestruction')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_TALENT_3_ULT_BASIC_5

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
      formItem: 'switch',
      id: 'enhancedUlt',
      text: t('Content.enhancedUlt.text'),
      content: t('Content.enhancedUlt.content', {
        ultScaling: TsUtils.precisionRound(100 * ultScaling),
        ultEnhancedScaling: TsUtils.precisionRound(100 * ultEnhancedScaling),
        ultEnhancedScaling2: TsUtils.precisionRound(100 * ultEnhancedScaling2),
      }),
    },
    talentStacks: {
      formItem: 'slider',
      id: 'talentStacks',
      text: t('Content.talentStacks.text'),
      content: t('Content.talentStacks.content', { talentAtkScalingValue: TsUtils.precisionRound(100 * talentAtkScalingValue) }),
      min: 0,
      max: 2,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      // Stats
      x.ATK_P.buff(r.talentStacks * talentAtkScalingValue, Source.NONE)
      x.DEF_P.buff(r.talentStacks * 0.10, Source.NONE)
      x.CR.buff((x.a[Key.ENEMY_WEAKNESS_BROKEN]) ? 0.25 : 0, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff((r.enhancedUlt) ? ultEnhancedScaling : ultScaling, Source.NONE)

      // Boost
      buffAbilityDmg(x, SKILL_TYPE, 0.25, Source.NONE)
      buffAbilityDmg(x, ULT_TYPE, (r.enhancedUlt) ? 0.25 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff((r.enhancedUlt) ? 60 : 90, Source.NONE)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray) => standardAtkFinalizer(x),
    gpuFinalizeCalculations: () => gpuStandardAtkFinalizer(),
  }
}
