import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'

import { SuperImpositionLevel } from 'types/LightCone'
import { Form } from 'types/Form'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValuesAtk = [0.10, 0.125, 0.15, 0.175, 0.20]
  const sValuesCd = [0.12, 0.15, 0.18, 0.21, 0.24]
  const sValuesErr = [0.06, 0.075, 0.09, 0.105, 0.12]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.CarveTheMoonWeaveTheClouds.Content')
    return [{
      lc: true,
      id: 'atkBuffActive',
      name: 'atkBuffActive',
      formItem: 'switch',
      text: t('atkBuffActive.text'),
      title: t('atkBuffActive.title'),
      content: t('atkBuffActive.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]), CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]), RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]) }),
    }, {
      lc: true,
      id: 'cdBuffActive',
      name: 'cdBuffActive',
      formItem: 'switch',
      text: t('cdBuffActive.text'),
      title: t('cdBuffActive.title'),
      content: t('cdBuffActive.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]), CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]), RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]) }),
    }, {
      lc: true,
      id: 'errBuffActive',
      name: 'errBuffActive',
      formItem: 'switch',
      text: t('errBuffActive.text'),
      title: t('errBuffActive.title'),
      content: t('errBuffActive.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtk[s]), CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]), RegenBuff: TsUtils.precisionRound(100 * sValuesErr[s]) }),
    }]
  })()

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
