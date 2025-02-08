import { SKILL_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardAdditionalDmgAtkFinalizer, gpuStandardAtkFinalizer, standardAdditionalDmgAtkFinalizer, standardAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'

import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

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
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_SCALING.buff((r.enhancedSkill) ? skillEnhancedScaling : skillScaling, SOURCE_SKILL)
      x.ULT_SCALING.buff(ultScaling, SOURCE_ULT)
      x.BASIC_ADDITIONAL_DMG_SCALING.buff((r.targetBurned) ? targetBurnedExtraScaling : 0, SOURCE_TALENT)
      x.SKILL_ADDITIONAL_DMG_SCALING.buff((r.targetBurned) ? targetBurnedExtraScaling : 0, SOURCE_TALENT)
      x.ULT_ADDITIONAL_DMG_SCALING.buff((r.targetBurned) ? targetBurnedExtraScaling : 0, SOURCE_TALENT)
      x.DOT_SCALING.buff(dotScaling, SOURCE_SKILL)

      // Boost
      buffAbilityDmg(x, SKILL_DMG_TYPE, (e >= 1 && r.enhancedSkill) ? 0.20 : 0, SOURCE_E1)
      x.ELEMENTAL_DMG.buff((e >= 6 && r.targetBurned) ? 0.20 : 0, SOURCE_E6)

      x.BASIC_TOUGHNESS_DMG.buff(30, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(60, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(90, SOURCE_ULT)

      x.DOT_CHANCE.set(1.00, SOURCE_SKILL)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardAtkFinalizer(x)
      standardAdditionalDmgAtkFinalizer(x)
    },
    gpuFinalizeCalculations: () => {
      return gpuStandardAtkFinalizer() + gpuStandardAdditionalDmgAtkFinalizer()
    },
  }
}
