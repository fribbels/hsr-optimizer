import { ComputedStatsObject, FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.DanceAtSunset')

  const sValuesFuaDmg = [0.36, 0.42, 0.48, 0.54, 0.60]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'fuaDmgStacks',
      formItem: 'slider',
      text: t('Content.fuaDmgStacks.text'),
      content: t('Content.fuaDmgStacks.content', { DmgBoost: TsUtils.precisionRound(100 * sValuesFuaDmg[s]) }),
      min: 0,
      max: 2,
    },
  ]

  return {
    content: () => Object.values(content),
    defaults: () => ({
      fuaDmgStacks: 2,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals

      buffAbilityDmg(x, FUA_TYPE, r.fuaDmgStacks * sValuesFuaDmg[s])
    },
    finalizeCalculations: () => {
    },
  }
}
