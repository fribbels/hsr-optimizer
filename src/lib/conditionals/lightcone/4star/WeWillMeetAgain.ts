import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'

import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WeWillMeetAgain')
  const { SOURCE_LC } = Source.lightCone('21029')

  const sValues = [0.48, 0.60, 0.72, 0.84, 0.96]

  const defaults = {
    extraDmgProc: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    extraDmgProc: {
      lc: true,
      id: 'extraDmgProc',
      formItem: 'switch',
      text: t('Content.extraDmgProc.text'),
      content: t('Content.extraDmgProc.content', { Multiplier: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.BASIC_ADDITIONAL_DMG.buff(((r.extraDmgProc) ? sValues[s] : 0) * x.a[Key.ATK], Source.NONE)
      x.SKILL_ADDITIONAL_DMG.buff(((r.extraDmgProc) ? sValues[s] : 0) * x.a[Key.ATK], Source.NONE)
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      return `
if (${wgslTrue(r.extraDmgProc)}) {
  x.BASIC_ADDITIONAL_DMG += ${sValues[s]} * x.ATK;
  x.SKILL_ADDITIONAL_DMG += ${sValues[s]} * x.ATK;
}
      `
    },
  }
}
