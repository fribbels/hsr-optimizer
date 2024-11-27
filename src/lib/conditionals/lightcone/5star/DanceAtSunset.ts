import { FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
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
      const r = action.lightConeConditionals as Conditionals<typeof content>

      buffAbilityDmg(x, FUA_TYPE, r.fuaDmgStacks * sValuesFuaDmg[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
