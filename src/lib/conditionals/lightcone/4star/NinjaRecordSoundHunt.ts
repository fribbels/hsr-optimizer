import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { CURRENT_DATA_VERSION, Stats } from 'lib/constants'
import i18next from 'i18next'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NinjaRecordSoundHunt')
  const sValuesCd = [0.18, 0.225, 0.27, 0.315, 0.36]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'cdBuff',
      name: 'cdBuff',
      formItem: 'switch',
      text: t('Content.cdBuff.text'),
      title: t('Content.cdBuff.title'),
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      cdBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.CD] += (r.cdBuff) ? sValuesCd[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
