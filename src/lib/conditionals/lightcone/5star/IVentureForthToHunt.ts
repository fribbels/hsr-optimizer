import { ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDefPen } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.IVentureForthToHunt')

  const sValuesDefShred = [0.27, 0.30, 0.33, 0.36, 0.39]

  const defaults = {
    luminfluxUltStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    luminfluxUltStacks: {
      lc: true,
      id: 'luminfluxUltStacks',
      formItem: 'slider',
      text: t('Content.luminfluxUltStacks.text'),
      content: t('Content.luminfluxUltStacks.content', { DefIgnore: TsUtils.precisionRound(100 * sValuesDefShred[s]) }),
      min: 0,
      max: 2,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      buffAbilityDefPen(x, ULT_TYPE, r.luminfluxUltStacks * sValuesDefShred[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
