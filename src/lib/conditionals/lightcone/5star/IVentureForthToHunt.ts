import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IVentureForthToHunt')
  const sValuesDefShred = [0.27, 0.30, 0.33, 0.36, 0.39]

  const content: ContentItem[] = [
    {
      lc: true,
      formItem: 'slider',
      id: 'luminfluxUltStacks',
      name: 'luminfluxUltStacks',
      text: t('Content.luminfluxUltStacks.text'),
      title: t('Content.luminfluxUltStacks.title'),
      content: t('Content.luminfluxUltStacks.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefShred[s]) }),
      min: 0,
      max: 2,
    },
  ]

  return {
    content: () => content,
    defaults: () => ({
      luminfluxUltStacks: 2,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      buffAbilityDefPen(x, ULT_TYPE, r.luminfluxUltStacks * sValuesDefShred[s])
    },
    finalizeCalculations: () => {
    },
  }
}
