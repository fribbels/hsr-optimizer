import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ForTomorrowsJourney')
  const sValuesDmgBoost = [0.18, 0.21, 0.24, 0.27, 0.30]

  const content: ContentItem[] = [
    {
      lc: true,
      id: 'ultDmgBuff',
      name: 'ultDmgBuff',
      formItem: 'switch',
      text: t('Content.ultDmgBuff.text'),
      title: t('Content.ultDmgBuff.title'),
      content: t('Content.ultDmgBuff.content', { DmgBuff: TsUtils.precisionRound(100 * sValuesDmgBoost[s]) }),
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      ultDmgBuff: true,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x.ELEMENTAL_DMG += (r.ultDmgBuff) ? sValuesDmgBoost[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
