import { ASHBLAZING_ATK_STACK, FUA_DMG_TYPE, ULT_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { gpuStandardFuaAtkFinalizer, standardFuaAtkFinalizer } from 'lib/conditionals/conditionalFinalizers'
import { AbilityEidolon, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Xueyi')
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
  } = Source.character('1214')

  const ultBoostMax = ult(e, 0.60, 0.648)
  const basicScaling = basic(e, 1.00, 1.10)
  const skillScaling = skill(e, 1.40, 1.54)
  const ultScaling = ult(e, 2.50, 2.70)
  const fuaScaling = talent(e, 0.90, 0.99)

  const hitMultiByFuaHits: NumberToNumberMap = {
    0: 0,
    1: ASHBLAZING_ATK_STACK * (1 * 1 / 1), // 0.06
    2: ASHBLAZING_ATK_STACK * (1 * 1 / 2 + 2 * 1 / 2), // 0.09
    3: ASHBLAZING_ATK_STACK * (1 * 1 / 3 + 2 * 1 / 3 + 3 * 1 / 3), // 0.12
  }

  const defaults = {
    beToDmgBoost: true,
    enemyToughness50: true,
    toughnessReductionDmgBoost: ultBoostMax,
    fuaHits: 3,
    e4BeBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    beToDmgBoost: {
      id: 'beToDmgBoost',
      formItem: 'switch',
      text: t('Content.beToDmgBoost.text'),
      content: t('Content.beToDmgBoost.content'),
    },
    enemyToughness50: {
      id: 'enemyToughness50',
      formItem: 'switch',
      text: t('Content.enemyToughness50.text'),
      content: t('Content.enemyToughness50.content'),
    },
    toughnessReductionDmgBoost: {
      id: 'toughnessReductionDmgBoost',
      formItem: 'slider',
      text: t('Content.toughnessReductionDmgBoost.text'),
      content: t('Content.toughnessReductionDmgBoost.content', { ultBoostMax: TsUtils.precisionRound(100 * ultBoostMax) }),
      min: 0,
      max: ultBoostMax,
      percent: true,
    },
    fuaHits: {
      id: 'fuaHits',
      formItem: 'slider',
      text: t('Content.fuaHits.text'),
      content: t('Content.fuaHits.content', { fuaScaling: TsUtils.precisionRound(100 * fuaScaling) }),
      min: 0,
      max: 3,
    },
    e4BeBuff: {
      id: 'e4BeBuff',
      formItem: 'switch',
      text: t('Content.e4BeBuff.text'),
      content: t('Content.e4BeBuff.content'),
      disabled: (e < 4),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.BE.buff((e >= 4 && r.e4BeBuff) ? 0.40 : 0, SOURCE_E4)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, SOURCE_BASIC)
      x.SKILL_SCALING.buff(skillScaling, SOURCE_SKILL)
      x.ULT_SCALING.buff(ultScaling, SOURCE_ULT)
      x.FUA_SCALING.buff(fuaScaling * (r.fuaHits), SOURCE_TALENT)

      // Boost
      buffAbilityDmg(x, ULT_DMG_TYPE, r.toughnessReductionDmgBoost, SOURCE_ULT)
      buffAbilityDmg(x, ULT_DMG_TYPE, (r.enemyToughness50) ? 0.10 : 0, SOURCE_TRACE)
      buffAbilityDmg(x, FUA_DMG_TYPE, (e >= 1) ? 0.40 : 0, SOURCE_E1)

      x.BASIC_TOUGHNESS_DMG.buff(30, SOURCE_BASIC)
      x.SKILL_TOUGHNESS_DMG.buff(60, SOURCE_SKILL)
      x.ULT_TOUGHNESS_DMG.buff(120, SOURCE_ULT)
      x.FUA_TOUGHNESS_DMG.buff(15 * (r.fuaHits), SOURCE_TALENT)

      return x
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff((r.beToDmgBoost) ? Math.min(2.40, x.a[Key.BE]) : 0, SOURCE_TRACE)
      standardFuaAtkFinalizer(x, action, context, hitMultiByFuaHits[action.characterConditionals.fuaHits as number])
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.beToDmgBoost)}) {
  x.ELEMENTAL_DMG += min(2.40, x.BE);
}

${gpuStandardFuaAtkFinalizer(hitMultiByFuaHits[action.characterConditionals.fuaHits as number])}
`
    },
  }
}
