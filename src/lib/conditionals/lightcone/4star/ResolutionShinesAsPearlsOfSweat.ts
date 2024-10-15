import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ResolutionShinesAsPearlsOfSweat')
  const sValues = [0.12, 0.13, 0.14, 0.15, 0.16]
  const content: ContentItem[] = [{
    lc: true,
    id: 'targetEnsnared',
    name: 'targetEnsnared',
    formItem: 'switch',
    text: t('Content.targetEnsnared.text'),
    title: t('Content.targetEnsnared.title'),
    content: t('Content.targetEnsnared.content', { DefShred: TsUtils.precisionRound(100 * sValues[s]) }),
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      targetEnsnared: true,
    }),
    teammateDefaults: () => ({
      targetEnsnared: true,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x.DEF_PEN += (m.targetEnsnared) ? sValues[s] : 0
    },
    finalizeCalculations: () => {
    },
  }
}
