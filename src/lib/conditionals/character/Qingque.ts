import { ASHBLAZING_ATK_STACK, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, ContentDefinition, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Key, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { NumberToNumberMap } from 'types/Common'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Qingque')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

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
    const r: Conditionals<typeof content> = action.characterConditionals
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
      const r: Conditionals<typeof content> = action.characterConditionals

      // Stats
      x.ATK_P.buff((r.basicEnhanced) ? talentAtkBuff : 0, Source.NONE)
      x.SPD_P.buff((r.basicEnhancedSpdBuff) ? 0.10 : 0, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff((r.basicEnhanced) ? basicEnhancedScaling : basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.ULT_SCALING.buff(ultScaling, Source.NONE)
      x.FUA_SCALING.buff((e >= 4) ? x.a[Key.BASIC_SCALING] : 0, Source.NONE)

      // Boost
      x.ELEMENTAL_DMG.buff(r.skillDmgIncreaseStacks * skillStackDmg, Source.NONE)
      buffAbilityDmg(x, ULT_TYPE, (e >= 1) ? 0.10 : 0, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff((r.basicEnhanced) ? 60 : 30, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff((r.basicEnhanced) ? 60 : 30, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      standardFuaAtkFinalizer(x, action, context, getHitMulti(action, context))
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      return gpuStandardFuaAtkFinalizer(getHitMulti(action, context))
    },
  }
}
