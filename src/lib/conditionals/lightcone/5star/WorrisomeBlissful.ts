import { FUA_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Stats } from 'lib/constants'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WorrisomeBlissful')

  const sValuesFuaDmg = [0.30, 0.35, 0.40, 0.45, 0.50]
  const sValuesCd = [0.12, 0.14, 0.16, 0.18, 0.20]

  const content: ContentDefinition<typeof defaults> = [
    {
      lc: true,
      id: 'targetTameStacks',
      formItem: 'slider',
      text: t('Content.targetTameStacks.text'),
      content: t('Content.targetTameStacks.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }), // getContentFromLCRanks(s, lcRank2),
      min: 0,
      max: 2,
    },
  ]

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(content),
    defaults: () => ({
      targetTameStacks: 2,
    }),
    teammateDefaults: () => ({
      targetTameStacks: 2,
    }),
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      buffAbilityDmg(x, FUA_TYPE, sValuesFuaDmg[s])
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m: Conditionals<typeof teammateContent> = action.lightConeConditionals

      x[Stats.CD] += m.targetTameStacks * sValuesCd[s]
    },
    finalizeCalculations: () => {
    },
  }
}
