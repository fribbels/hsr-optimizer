import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ContentItem } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Mediation')
  const sValues = [12, 14, 16, 18, 20]
  const content: ContentItem[] = [{
    lc: true,
    id: 'initialSpdBuff',
    name: 'initialSpdBuff',
    formItem: 'switch',
    text: t('Content.initialSpdBuff.text'),
    title: t('Content.initialSpdBuff.title'),
    content: t('Content.initialSpdBuff.content', { SpdBuff: sValues[s] }),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      initialSpdBuff: true,
    }),
    teammateDefaults: () => ({
      initialSpdBuff: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x[Stats.SPD] += (m.initialSpdBuff) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
