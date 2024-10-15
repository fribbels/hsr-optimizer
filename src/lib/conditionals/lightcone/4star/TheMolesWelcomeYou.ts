import { ContentItem } from 'types/Conditionals'
import { Stats } from 'lib/constants'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { TsUtils } from 'lib/TsUtils'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TheMolesWelcomeYou')
  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]
  const content: ContentItem[] = [{
    lc: true,
    id: 'atkBuffStacks',
    name: 'atkBuffStacks',
    formItem: 'slider',
    text: t('Content.atkBuffStacks.text'),
    title: t('Content.atkBuffStacks.title'),
    content: t('Content.atkBuffStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    min: 0,
    max: 3,
  }]

  return {
    content: () => content,
    defaults: () => ({
      atkBuffStacks: 3,
    }),
    precomputeEffects: (x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      x[Stats.ATK_P] += (r.atkBuffStacks) * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
