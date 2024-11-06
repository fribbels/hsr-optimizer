import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.FinalVictor')

  const sValues = [0.08, 0.09, 0.10, 0.11, 0.12]

  const defaults = {
    goodFortuneStacks: 4,
  }

  const content: ContentDefinition<typeof defaults> = {
    goodFortuneStacks: {
      lc: true,
      id: 'goodFortuneStacks',
      formItem: 'slider',
      text: t('Content.goodFortuneStacks.text'),
      content: t('Content.goodFortuneStacks.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 4,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.CD.buff(r.goodFortuneStacks * sValues[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
