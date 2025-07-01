import { BREAK_DMG_TYPE } from 'lib/conditionals/conditionalConstants'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  buffAbilityDmg,
  Target,
} from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.InPursuitOfTheWind.Content')
  const { SOURCE_LC } = Source.lightCone('21056')

  const sValuesBreakDmg = [0.16, 0.18, 0.20, 0.22, 0.24]

  const defaults = {
    breakDmgBoost: true,
  }

  const teammateDefaults = {
    breakDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    breakDmgBoost: {
      lc: true,
      id: 'breakDmgBoost',
      formItem: 'switch',
      text: t('breakDmgBoost.text'),
      content: t('breakDmgBoost.content', { BreakDmgBuff: TsUtils.precisionRound(100 * sValuesBreakDmg[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    breakDmgBoost: content.breakDmgBoost,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      buffAbilityDmg(x, BREAK_DMG_TYPE, m.breakDmgBoost ? sValuesBreakDmg[s] : 0, SOURCE_LC, Target.TEAM)
    },
    finalizeCalculations: () => {
    },
  }
}
