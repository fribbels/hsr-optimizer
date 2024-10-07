import { ContentItem } from 'types/Conditionals'
import { Form } from 'types/Form'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'

export default (s: SuperImpositionLevel): LightConeConditional => {
  const t = i18next.getFixedT(null, 'conditionals', 'Lightcones.EternalCalculus')
  const sValuesAtkBuff = [0.04, 0.05, 0.06, 0.07, 0.08]
  const sValuesSpdBuff = [0.08, 0.10, 0.12, 0.14, 0.16]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'atkBuffStacks',
      name: 'atkBuffStacks',
      formItem: 'slider',
      text: t('Content.atkBuffStacks.text'),
      title: t('Content.atkBuffStacks.title'),
      content: t('Content.atkBuffStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValuesAtkBuff[s]) }),
      min: 0,
      max: 5,
    },
    {
      lc: true,
      id: 'spdBuff',
      name: 'spdBuff',
      formItem: 'switch',
      text: t('Content.spdBuff.text'),
      title: t('Content.spdBuff.title'),
      content: t('Content.spdBuff.content', { SpdBuff: TsUtils.precisionRound(100 * sValuesSpdBuff[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      atkBuffStacks: 5,
      spdBuff: false,
    }),
    precomputeEffects: (x: ComputedStatsObject, request: Form) => {
      const r = request.lightConeConditionals

      x[Stats.ATK_P] += r.atkBuffStacks * sValuesAtkBuff[s]
      x[Stats.SPD_P] += (r.spdBuff) ? sValuesSpdBuff[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
