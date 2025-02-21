import { FUA_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WorrisomeBlissful')
  const { SOURCE_LC } = Source.lightCone('23016')

  const sValuesFuaDmg = [0.30, 0.35, 0.40, 0.45, 0.50]
  const sValuesCd = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    targetTameStacks: 2,
  }

  const teammateDefaults = {
    targetTameStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    targetTameStacks: {
      lc: true,
      id: 'targetTameStacks',
      formItem: 'slider',
      text: t('Content.targetTameStacks.text'),
      content: t('Content.targetTameStacks.content', { CritBuff: TsUtils.precisionRound(100 * sValuesCd[s]) }), // getContentFromLCRanks(s, lcRank2),
      min: 0,
      max: 2,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    targetTameStacks: content.targetTameStacks,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      buffAbilityDmg(x, FUA_DMG_TYPE, sValuesFuaDmg[s], SOURCE_LC)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.CD.buffTeam(m.targetTameStacks * sValuesCd[s], SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
