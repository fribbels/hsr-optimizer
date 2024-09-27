import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject, FUA_TYPE, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { TsUtils } from 'lib/TsUtils'
import { buffAbilityDefPen, buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import i18next from 'i18next'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.YetHopeIsPriceless')
  const sValuesFuaDmg = [0.12, 0.14, 0.16, 0.18, 0.20]
  const sValuesUltFuaDefShred = [0.20, 0.24, 0.28, 0.32, 0.36]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'fuaDmgBoost',
      name: 'fuaDmgBoost',
      formItem: 'switch',
      text: t('Content.0.text'),
      title: t('Content.0.title'),
      content: t('Content.0.content', { DmgBuff: TsUtils.precisionRound(sValuesFuaDmg[s] * 100) }),
      // `While the wearer is in battle, for every 20% CRIT DMG that exceeds 120%, the DMG dealt by follow-up attack increases by ${precisionRound(sValuesFuaDmg[s] * 100)}%. This effect can stack up to 4 time(s).`,
    },
    {
      lc: true,
      id: 'ultFuaDefShred',
      name: 'ultFuaDefShred',
      formItem: 'switch',
      text: t('Content.1.text'),
      title: t('Content.1.title'),
      content: t('Content.1.content', { DefShred: TsUtils.precisionRound(sValuesFuaDmg[s] * 100) }),
      // `When the battle starts or after the wearer uses their Basic ATK, enables Ultimate or the DMG dealt by follow-up attack to ignore ${sValuesUltFuaDefShred[s] * 100}% of the target's DEF, lasting for 2 turn(s).`,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      fuaDmgBoost: true,
      ultFuaDefShred: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDefPen(x, ULT_TYPE | FUA_TYPE, sValuesUltFuaDefShred[s], (r.ultFuaDefShred))
    },
    finalizeCalculations: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      buffAbilityDmg(x, FUA_TYPE, sValuesFuaDmg[s] * Math.min(4, Math.floor(x[Stats.CD] - 1.20) / 0.20), (r.fuaDmgBoost))
    },
    gpuFinalizeCalculations: (request: Form) => {
      const r = request.lightConeConditionals

      return `
if (${wgslTrue(r.fuaDmgBoost)}) {
  buffAbilityDmg(p_x, FUA_TYPE, ${sValuesFuaDmg[s]} * min(4, floor(x.CD - 1.20) / 0.20), 1);
}
    `
    },
  }
}
