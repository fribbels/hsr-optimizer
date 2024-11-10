import { FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { buffAbilityDefPen, buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Key, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditionalsController } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.YetHopeIsPriceless')

  const sValuesFuaDmg = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesUltFuaDefShred = [0.20, 0.24, 0.28, 0.32, 0.36]

  const defaults = {
    fuaDmgBoost: true,
    ultFuaDefShred: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    fuaDmgBoost: {
      lc: true,
      id: 'fuaDmgBoost',
      formItem: 'switch',
      text: t('Content.fuaDmgBoost.text'),
      content: t('Content.fuaDmgBoost.content', { DmgBuff: TsUtils.precisionRound(sValuesFuaDmg[s] * 100) }),
      // `While the wearer is in battle, for every 20% CRIT DMG that exceeds 120%, the DMG dealt by follow-up attack increases by ${precisionRound(sValuesFuaDmg[s] * 100)}%. This effect can stack up to 4 time(s).`,
    },
    ultFuaDefShred: {
      lc: true,
      id: 'ultFuaDefShred',
      formItem: 'switch',
      text: t('Content.ultFuaDefShred.text'),
      content: t('Content.ultFuaDefShred.content', { DefShred: TsUtils.precisionRound(sValuesFuaDmg[s] * 100) }),
      // `When the battle starts or after the wearer uses their Basic ATK, enables Ultimate or the DMG dealt by follow-up attack to ignore ${sValuesUltFuaDefShred[s] * 100}% of the target's DEF, lasting for 2 turn(s).`,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      buffAbilityDefPen(x, ULT_TYPE | FUA_TYPE, (r.ultFuaDefShred) ? sValuesUltFuaDefShred[s] : 0, Source.NONE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      buffAbilityDmg(x, FUA_TYPE, (r.fuaDmgBoost) ? sValuesFuaDmg[s] * Math.min(4, Math.floor(x.a[Key.CD] - 1.20) / 0.20) : 0, Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      return `
if (${wgslTrue(r.fuaDmgBoost)}) {
  buffAbilityDmg(p_x, FUA_TYPE, ${sValuesFuaDmg[s]} * min(4, floor(x.CD - 1.20) / 0.20), 1);
}
    `
    },
  }
}
