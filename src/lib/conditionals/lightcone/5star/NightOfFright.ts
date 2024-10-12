import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { Stats } from 'lib/constants'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NightOfFright')
  const sValues = [0.024, 0.028, 0.032, 0.036, 0.04]

  const content: ContentItem[] = [{
    lc: true,
    id: 'atkBuffStacks',
    name: 'atkBuffStacks',
    formItem: 'slider',
    text: t('Content.atkBuffStacks.text'),
    title: t('Content.atkBuffStacks.title'),
    content: t('Content.atkBuffStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    min: 0,
    max: 5,
  }]

  return {
    content: () => content,
    teammateContent: () => content,
    defaults: () => ({
      atkBuffStacks: 5,
    }),
    teammateDefaults: () => ({
      atkBuffStacks: 5,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals

      x[Stats.ATK_P] += m.atkBuffStacks * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
