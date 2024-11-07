import { FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.DanceAtSunset')

  const sValuesFuaDmg = [0.36, 0.42, 0.48, 0.54, 0.60]

  const defaults = {
    fuaDmgStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    fuaDmgStacks: {
      lc: true,
      formItem: 'slider',
      id: 'fuaDmgStacks',
      text: t('Content.fuaDmgStacks.text'),
      content: t('Content.fuaDmgStacks.content', { DmgBoost: TsUtils.precisionRound(100 * sValuesFuaDmg[s]) }),
      min: 0,
      max: 2,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      buffAbilityDmg(x, FUA_TYPE, r.fuaDmgStacks * sValuesFuaDmg[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
