import { ASHBLAZING_ATK_STACK, ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, Conditionals, gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'

import { Eidolon } from 'types/Character'
import { CharacterConditional } from 'types/CharacterConditional'
import { NumberToNumberMap } from 'types/Common'
import { ContentItem } from 'types/Conditionals'
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

  const content: ContentItem[] = [
    {
      formItem: 'switch',
      id: 'basicEnhanced',
      text: t('Content.basicEnhanced.text'),
      content: t('Content.basicEnhanced.content', { talentAtkBuff: TsUtils.precisionRound(100 * talentAtkBuff) }),
    },
    {
      formItem: 'switch',
      id: 'basicEnhancedSpdBuff',
      text: t('Content.basicEnhancedSpdBuff.text'),
      content: t('Content.basicEnhancedSpdBuff.content'),
    },
    {
      formItem: 'slider',
      id: 'skillDmgIncreaseStacks',
      text: t('Content.skillDmgIncreaseStacks.text'),
      content: t('Content.skillDmgIncreaseStacks.content', { skillStackDmg: TsUtils.precisionRound(100 * skillStackDmg) }),
      min: 0,
      max: 4,
    },
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => [],
    defaults: () => ({
      basicEnhanced: true,
      basicEnhancedSpdBuff: false,
      skillDmgIncreaseStacks: 4,
    }),
    teammateDefaults: () => ({}),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.characterConditionals

      // Stats
      x[Stats.ATK_P] += (r.basicEnhanced) ? talentAtkBuff : 0
      x[Stats.SPD_P] += (r.basicEnhancedSpdBuff) ? 0.10 : 0

      // Scaling
      x.BASIC_SCALING += (r.basicEnhanced) ? basicEnhancedScaling : basicScaling
      x.SKILL_SCALING += skillScaling
      x.ULT_SCALING += ultScaling
      x.FUA_SCALING += (e >= 4) ? x.BASIC_SCALING : 0

      // Boost
      x.ELEMENTAL_DMG += r.skillDmgIncreaseStacks * skillStackDmg
      buffAbilityDmg(x, ULT_TYPE, 0.10, (e >= 1))

      x.BASIC_TOUGHNESS_DMG += (r.basicEnhanced) ? 60 : 30
      x.ULT_TOUGHNESS_DMG += 60
      x.FUA_TOUGHNESS_DMG += (r.basicEnhanced) ? 60 : 30

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
