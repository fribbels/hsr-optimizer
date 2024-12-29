import { ASHBLAZING_ATK_STACK, FUA_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { AbilityEidolon, calculateAshblazingSet, Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Key, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'

import { Eidolon } from 'types/character'
import { NumberToNumberMap } from 'types/common'
import { CharacterConditionalsController } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (e: Eidolon, withContent: boolean): CharacterConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Characters.Blade')
  const { basic, skill, ult, talent } = AbilityEidolon.ULT_TALENT_3_SKILL_BASIC_5

  const enhancedStateDmgBoost = skill(e, 0.40, 0.456)
  const hpPercentLostTotalMax = 0.90

  const basicScaling = basic(e, 1.0, 1.1)
  const basicEnhancedAtkScaling = skill(e, 0.40, 0.44)
  const basicEnhancedHpScaling = skill(e, 1.00, 1.10)
  const ultAtkScaling = ult(e, 0.40, 0.432)
  const ultHpScaling = ult(e, 1.00, 1.08)
  const ultLostHpScaling = ult(e, 1.00, 1.08)
  const fuaAtkScaling = talent(e, 0.44, 0.484)
  const fuaHpScaling = talent(e, 1.10, 1.21)

  const hitMultiByTargets: NumberToNumberMap = {
    1: ASHBLAZING_ATK_STACK * (1 * 0.33 + 2 * 0.33 + 3 * 0.34),
    3: ASHBLAZING_ATK_STACK * (2 * 0.33 + 5 * 0.33 + 8 * 0.34),
    5: ASHBLAZING_ATK_STACK * (3 * 0.33 + 8 * 0.33 + 8 * 0.34),
  }

  const defaults = {
    enhancedStateActive: true,
    hpPercentLostTotal: hpPercentLostTotalMax,
    e4MaxHpIncreaseStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    enhancedStateActive: {
      id: 'enhancedStateActive',
      formItem: 'switch',
      text: t('Content.enhancedStateActive.text'),
      content: t('Content.enhancedStateActive.content', { enhancedStateDmgBoost: TsUtils.precisionRound(100 * enhancedStateDmgBoost) }),
    },
    hpPercentLostTotal: {
      id: 'hpPercentLostTotal',
      formItem: 'slider',
      text: t('Content.hpPercentLostTotal.text'),
      content: t('Content.hpPercentLostTotal.content', { hpPercentLostTotalMax: TsUtils.precisionRound(100 * hpPercentLostTotalMax) }),
      min: 0,
      max: hpPercentLostTotalMax,
      percent: true,
    },
    e4MaxHpIncreaseStacks: {
      id: 'e4MaxHpIncreaseStacks',
      formItem: 'slider',
      text: t('Content.e4MaxHpIncreaseStacks.text'),
      content: t('Content.e4MaxHpIncreaseStacks.content'),
      min: 0,
      max: 2,
      disabled: e < 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      // Stats
      x.CR.buff((e >= 2 && r.enhancedStateActive) ? 0.15 : 0, Source.NONE)
      x.HP_P.buff((e >= 4) ? r.e4MaxHpIncreaseStacks * 0.20 : 0, Source.NONE)

      // Scaling
      x.BASIC_SCALING.buff(basicScaling, Source.NONE)

      // Boost
      x.ELEMENTAL_DMG.buff(r.enhancedStateActive ? enhancedStateDmgBoost : 0, Source.NONE)
      buffAbilityDmg(x, FUA_DMG_TYPE, 0.20, Source.NONE)

      x.BASIC_TOUGHNESS_DMG.buff((r.enhancedStateActive) ? 60 : 30, Source.NONE)
      x.ULT_TOUGHNESS_DMG.buff(60, Source.NONE)
      x.FUA_TOUGHNESS_DMG.buff(30, Source.NONE)

      return x
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>
      const a = x.a

      if (r.enhancedStateActive) {
        x.BASIC_DMG.buff(basicEnhancedAtkScaling * a[Key.ATK], Source.NONE)
        x.BASIC_DMG.buff(basicEnhancedHpScaling * a[Key.HP], Source.NONE)
      } else {
        x.BASIC_DMG.buff(a[Key.BASIC_SCALING] * a[Key.ATK], Source.NONE)
      }

      x.ULT_DMG.buff(ultAtkScaling * a[Key.ATK], Source.NONE)
      x.ULT_DMG.buff(ultHpScaling * a[Key.HP], Source.NONE)
      x.ULT_DMG.buff(ultLostHpScaling * r.hpPercentLostTotal * a[Key.HP], Source.NONE)
      x.ULT_DMG.buff((e >= 1 && context.enemyCount == 1) ? 1.50 * r.hpPercentLostTotal * a[Key.HP] : 0, Source.NONE)

      const hitMulti = hitMultiByTargets[context.enemyCount]
      const ashblazingAtk = calculateAshblazingSet(x, action, context, hitMulti)
      x.FUA_DMG.buff(fuaAtkScaling * (a[Key.ATK] + ashblazingAtk), Source.NONE)

      x.FUA_DMG.buff(fuaHpScaling * a[Key.HP], Source.NONE)
      x.FUA_DMG.buff((e >= 6) ? 0.50 * a[Key.HP] : 0, Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.characterConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.enhancedStateActive)}) {
  x.BASIC_DMG += ${basicEnhancedAtkScaling} * x.ATK;
  x.BASIC_DMG += ${basicEnhancedHpScaling} * x.HP;
} else {
  x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
}

x.ULT_DMG += ${ultAtkScaling} * x.ATK;
x.ULT_DMG += ${ultHpScaling} * x.HP;
x.ULT_DMG += ${ultLostHpScaling * r.hpPercentLostTotal} * x.HP;

if (${wgslTrue(e >= 1 && context.enemyCount == 1)}) {
  x.ULT_DMG += 1.50 * ${r.hpPercentLostTotal} * x.HP;
}

x.FUA_DMG += ${fuaAtkScaling} * (x.ATK + calculateAshblazingSet(p_x, p_state, ${hitMultiByTargets[context.enemyCount]}));
x.FUA_DMG += ${fuaHpScaling} * x.HP;

if (e >= 6) {
  x.FUA_DMG += 0.50 * x.HP;
}
    `
    },
  }
}
