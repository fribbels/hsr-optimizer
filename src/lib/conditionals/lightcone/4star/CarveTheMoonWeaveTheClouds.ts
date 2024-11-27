import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'

import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.CarveTheMoonWeaveTheClouds')

  const sValuesAtk = [0.10, 0.125, 0.15, 0.175, 0.20]
  const sValuesCd = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesErr = [0.06, 0.075, 0.09, 0.105, 0.12]

  const defaults = {
    atkBuffActive: true,
    cdBuffActive: false,
    errBuffActive: false,
  }

  const teammateDefaults = {
    atkBuffActive: true,
    cdBuffActive: false,
    errBuffActive: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    atkBuffActive: {
      lc: true,
      id: 'atkBuffActive',
      formItem: 'switch',
      text: t('Content.atkBuffActive.text'),
      content: t('Content.atkBuffActive.content', {
        AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]),
        CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]),
        RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]),
      }),
    },
    cdBuffActive: {
      lc: true,
      id: 'cdBuffActive',
      formItem: 'switch',
      text: t('Content.cdBuffActive.text'),
      content: t('Content.cdBuffActive.content', {
        AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]),
        CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]),
        RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]),
      }),
    },
    errBuffActive: {
      lc: true,
      id: 'errBuffActive',
      formItem: 'switch',
      text: t('Content.errBuffActive.text'),
      content: t('Content.errBuffActive.content', {
        AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]),
        CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]),
        RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]),
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    atkBuffActive: content.atkBuffActive,
    cdBuffActive: content.cdBuffActive,
    errBuffActive: content.errBuffActive,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.ATK_P.buff((m.atkBuffActive) ? sValuesAtk[s] : 0, Source.NONE)
      x.CD.buff((m.cdBuffActive) ? sValuesCd[s] : 0, Source.NONE)
      x.ERR.buff((m.errBuffActive) ? sValuesErr[s] : 0, Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
