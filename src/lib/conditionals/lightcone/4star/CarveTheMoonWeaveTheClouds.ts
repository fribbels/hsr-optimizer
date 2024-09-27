import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'

import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  /* @ts-expect-error ts can't resolve the type 'Type instantiation is excessively deep and possibly infinite' */
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.CarveTheMoonWeaveTheClouds')
  const sValuesAtk = [0.10, 0.125, 0.15, 0.175, 0.20]
  const sValuesCd = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesErr = [0.06, 0.075, 0.09, 0.105, 0.12]

  const content: ContentItem[] = [{
    lc: true,
    id: 'atkBuffActive',
    name: 'atkBuffActive',
    formItem: 'switch',
    text: t('Content.0.text'),
    title: t('Content.0.title'),
    content: t('Content.0.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]), CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]), RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]) }),
  }, {
    lc: true,
    id: 'cdBuffActive',
    name: 'cdBuffActive',
    formItem: 'switch',
    text: t('Content.1.text'),
    title: t('Content.1.title'),
    content: t('Content.1.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]), CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]), RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]) }),
  }, {
    lc: true,
    id: 'errBuffActive',
    name: 'errBuffActive',
    formItem: 'switch',
    text: t('Content.2.text'),
    title: t('Content.2.title'),
    content: t('Content.2.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]), CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]), RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]) }),
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
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x[Stats.ATK_P] += (m.atkBuffActive) ? sValuesAtk[s] : 0
      x[Stats.CD] += (m.cdBuffActive) ? sValuesCd[s] : 0
      x[Stats.ERR] += (m.errBuffActive) ? sValuesErr[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
