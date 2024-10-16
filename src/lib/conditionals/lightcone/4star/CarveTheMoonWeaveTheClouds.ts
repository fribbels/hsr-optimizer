import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'

import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.CarveTheMoonWeaveTheClouds')
  const sValuesAtk = [0.10, 0.125, 0.15, 0.175, 0.20]
  const sValuesCd = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesErr = [0.06, 0.075, 0.09, 0.105, 0.12]

  const content: ContentItem[] = [{
    lc: true,
    id: 'atkBuffActive',
    name: 'atkBuffActive',
    formItem: 'switch',
    text: t('Content.atkBuffActive.text'),
    title: t('Content.atkBuffActive.title'),
    content: t('Content.atkBuffActive.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]), CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]), RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]) }),
  }, {
    lc: true,
    id: 'cdBuffActive',
    name: 'cdBuffActive',
    formItem: 'switch',
    text: t('Content.cdBuffActive.text'),
    title: t('Content.cdBuffActive.title'),
    content: t('Content.cdBuffActive.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]), CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]), RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]) }),
  }, {
    lc: true,
    id: 'errBuffActive',
    name: 'errBuffActive',
    formItem: 'switch',
    text: t('Content.errBuffActive.text'),
    title: t('Content.errBuffActive.title'),
    content: t('Content.errBuffActive.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]), CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]), RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]) }),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      atkBuffActive: true,
      cdBuffActive: false,
      errBuffActive: false,
    }),
    teammateDefaults: () => ({
      atkBuffActive: true,
      cdBuffActive: false,
      errBuffActive: false,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x[Stats.ATK_P] += (m.atkBuffActive) ? sValuesAtk[s] : 0
      x[Stats.CD] += (m.cdBuffActive) ? sValuesCd[s] : 0
      x[Stats.ERR] += (m.errBuffActive) ? sValuesErr[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
