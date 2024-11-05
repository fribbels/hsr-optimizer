import { ComputedStatsObject, ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IVentureForthToHunt')

  const sValuesDefShred = [0.27, 0.30, 0.33, 0.36, 0.39]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      formItem: 'slider',
      id: 'luminfluxUltStacks',
      text: t('Content.luminfluxUltStacks.text'),
      content: t('Content.luminfluxUltStacks.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefShred[s]) }),
      min: 0,
      max: 2,
    },
  ]

  return {
    content: () => Object.values(content),
    defaults: () => ({
      luminfluxUltStacks: 2,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      buffAbilityDefPen(x, ULT_TYPE, r.luminfluxUltStacks * sValuesDefShred[s])
    },
    finalizeCalculations: () => {
    },
  }
}
