import { ASHBLAZING_ATK_STACK, FUA_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Clara')
  const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5

  const ultDmgReductionValue = ult(e, 0.25, 0.27)
  const ultFuaExtraScaling = ult(e, 1.60, 1.728)

  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.20, 1.32)
  const fuaScaling = talent(e, 1.60, 1.76)

  const hitMultiByTargetsBlast: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1),
    3: ASHBLAZING_ATK_STACK * (2 * 1 / 1),
    5: ASHBLAZING_ATK_STACK * (2 * 1 / 1), // Clara is 1 hit blast when enhanced
  }

  const hitMultiSingle = ASHBLAZING_ATK_STACK * (1 * 1 / 1)

  const defaults = {
    ultBuff: true,
    talentEnemyMarked: true,
    e2UltAtkBuff: true,
    e4DmgReductionBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultBuff: {
      id: 'ultBuff',
      formItem: 'switch',
      text: t('Content.ultBuff.text'),
      content: t('Content.ultBuff.content', {
        ultFuaExtraScaling: TsUtils.precisionRound(100 * ultFuaExtraScaling),
        ultDmgReductionValue: TsUtils.precisionRound((100 * ultDmgReductionValue)),
      }),
    },
    talentEnemyMarked: {
      id: 'talentEnemyMarked',
      formItem: 'switch',
      text: t('Content.talentEnemyMarked.text'),
      content: t('Content.talentEnemyMarked.content', { skillScaling: TsUtils.precisionRound(100 * skillScaling) }),
    },
    e2UltAtkBuff: {
      id: 'e2UltAtkBuff',
      formItem: 'switch',
      text: t('Content.e2UltAtkBuff.text'),
      content: t('Content.e2UltAtkBuff.content'),
      disabled: e < 2,
    },
    e4DmgReductionBuff: {
      id: 'e4DmgReductionBuff',
      formItem: 'switch',
      text: t('Content.e4DmgReductionBuff.text'),
      content: t('Content.e4DmgReductionBuff.content'),
      disabled: e < 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.ATK_P.buff((e >= 2 && r.e2UltAtkBuff) ? 0.30 : 0, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)
      x.SKILL_SCALING.buff(skillScaling, Source.NONE)
      x.SKILL_SCALING.buff(r.talentEnemyMarked ? skillScaling : 0, Source.NONE)

      x.FUA_SCALING.buff(fuaScaling, Source.NONE)
      x.FUA_SCALING.buff(r.ultBuff ? ultFuaExtraScaling : 0, Source.NONE)

      // Boost
      x.DMG_RED_MULTI.multiply((1 - 0.10), Source.NONE)
      x.DMG_RED_MULTI.multiply((r.ultBuff) ? (1 - ultDmgReductionValue) : 1, Source.NONE)
      x.DMG_RED_MULTI.multiply((e >= 4 && r.e4DmgReductionBuff) ? (1 - 0.30) : 1, Source.NONE)
      buffAbilityDmg(x, FUA_DMG_TYPE, 0.30, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.SKILL_TOUGHNESS_DMG.buff(30, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff(30, Source.NONE)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const hitMulti = r.ultBuff ? hitMultiByTargetsBlast[context.enemyCount] : hitMultiSingle
      standardFuaAtkFinalizer(x, action, context, hitMulti)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const hitMulti = r.ultBuff ? hitMultiByTargetsBlast[context.enemyCount] : hitMultiSingle
      return gpuStandardFuaAtkFinalizer(hitMulti)
    },
  }
}
