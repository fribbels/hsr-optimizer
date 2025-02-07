import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.FinalVictor')
  const { SOURCE_LC } = Source.lightCone('21037')

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
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.CD.buff(r.goodFortuneStacks * sValues[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
