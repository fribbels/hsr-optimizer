import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel, withoutContent: boolean): LightConeConditional => {
  const sValues = [12, 14, 16, 18, 20]
  const sValuesEnergy = [3, 3.5, 4, 4.5, 5]

  const content: ContentItem[] = (() => {
    if (withoutContent) return []
    const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.EchoesOfTheCoffin.Content')
    return [{
      lc: true,
      id: 'postUltSpdBuff',
      name: 'postUltSpdBuff',
      formItem: 'switch',
      text: t('postUltSpdBuff.text'),
      title: t('postUltSpdBuff.title'),
      content: t('postUltSpdBuff.content', { EnergyRecovered: TsUtils.precisionRound(sValuesEnergy[s]), SpdBuff: TsUtils.precisionRound(sValues[s]) }),
    }]
  })()

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      postUltSpdBuff: false,
    }),
    teammateDefaults: () => ({
      postUltSpdBuff: false,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, request: Form) => {
      const m = request.lightConeConditionals

      x[Stats.SPD] += (m.postUltSpdBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
