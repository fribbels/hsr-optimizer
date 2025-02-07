import { ASHBLAZING_ATK_STACK, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Qingque')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5
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
  } = Source.character('1201')

  const skillStackDmg = skill(e, 0.38, 0.408)
  const talentAtkBuff = talent(e, 0.72, 0.792)

  const basicScaling = basic(e, 1.00, 1.10)
  const basicEnhancedScaling = basic(e, 2.40, 2.64)
  const skillScaling = skill(e, 0, 0)
  const ultScaling = ult(e, 2.00, 2.16)

  const hitMultiByTargetsBlast: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // 0.12
  }

  const hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  function getHitMulti(action: OptimizerAction, context: OptimizerContext) {
    const r = action.characterConditionals as Conditionals<typeof content>
    return r.basicEnhanced
      ? hitMultiByTargetsBlast[context.enemyCount]
      : hitMultiSingle
  }

  const defaults = {
    basicEnhanced: true,
    basicEnhancedSpdBuff: false,
    skillDmgIncreaseStacks: 4,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicEnhanced: {
      id: 'basicEnhanced',
      formItem: 'switch',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content', { talentAtkBuff: TsUtils.precisionRound(100 * talentAtkBuff) }),
    },
    basicEnhancedSpdBuff: {
      id: 'basicEnhancedSpdBuff',
      formItem: 'switch',
      text: t('Content.basicEnhancedSpdBuff.text'),
      content: t('Content.basicEnhancedSpdBuff.content'),
    },
    skillDmgIncreaseStacks: {
      id: 'skillDmgIncreaseStacks',
      formItem: 'slider',
      text: t('Content.skillDmgIncreaseStacks.text'),
      content: t('Content.skillDmgIncreaseStacks.content', { skillStackDmg: TsUtils.precisionRound(100 * skillStackDmg) }),
      min: 0,
      max: 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((r.basicEnhanced) ? talentAtkBuff : 0, SOURCE_TALENT)
      x.SPD_P.buff((r.basicEnhancedSpdBuff) ? 0.10 : 0, SOURCE_TRACE)

      // Scaling
      x.BASIC_SCALING.buff((r.basicEnhanced) ? basicEnhancedScaling : basicScaling, SOURCE_BASIC)
      x.SKILL_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_SCALING.buff((e >= 4) ? x.a[Key.BASIC_SCALING] : 0, SOURCE_E4)

      // Boost
      x.ELEMENTAL_DMG.buff(r.skillDmgIncreaseStacks * skillStackDmg, SOURCE_SKILL)
      buffAbilityDmg(x, ULT_DMG_TYPE, (e >= 1) ? 0.10 : 0, SOURCE_E1)

      x.BASIC_TOUGHNESS_DMG.buff((r.basicEnhanced) ? 60 : 30, SOURCE_BASIC)
      x.ULT_TOUGHNESS_DMG.buff(60, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff((e >= 4 && r.basicEnhanced) ? 60 : 30, SOURCE_E4)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(action, context))
    },
  }
}
