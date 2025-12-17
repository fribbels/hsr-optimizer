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
import { NEVER_FORGET_HER_FLAME } from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.NeverForgetHerFlame.Content')
  const { SOURCE_LC } = Source.lightCone(NEVER_FORGET_HER_FLAME)

  const sValuesBreakDmg = [0.32, 0.42, 0.52, 0.62, 0.72]

  const defaults = {
    breakDmgBuff: true,
  }

  const teammateDefaults = {
    breakDmgBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    breakDmgBuff: {
      lc: true,
      id: 'breakDmgBuff',
      formItem: 'switch',
      text: t('breakDmgBuff.text'),
      content: t('breakDmgBuff.content', { BreakBoost: TsUtils.precisionRound(100 * sValuesBreakDmg[s]) }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    breakDmgBuff: content.breakDmgBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      buffAbilityDmg(x, BREAK_DMG_TYPE, (r.breakDmgBuff) ? sValuesBreakDmg[s] : 0, SOURCE_LC)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeTeammateEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      buffAbilityDmg(x, BREAK_DMG_TYPE, (t.breakDmgBuff) ? sValuesBreakDmg[s] : 0, SOURCE_LC, Target.SINGLE)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {},
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
