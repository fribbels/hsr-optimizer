import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NightOfFright')

  const sValues = [0.024, 0.028, 0.032, 0.036, 0.04]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'atkBuffStacks',
      formItem: 'slider',
      text: t('Content.atkBuffStacks.text'),
      content: t('Content.atkBuffStacks.content', { AtkBuff: TsUtils.precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 5,
    },
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({
      atkBuffStacks: 5,
    }),
    teammateDefaults: () => ({
      atkBuffStacks: 5,
    }),
    precomputeEffects: () => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x[Stats.ATK_P] += m.atkBuffStacks * sValues[s]
    },
    finalizeCalculations: () => {
    },
  }
}
