import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SleepLikeTheDead')
  const { SOURCE_LC } = Source.lightCone('23012')

  const sValues = [0.36, 0.42, 0.48, 0.54, 0.60]

  const defaults = {
    missedCritCrBuff: false,
  }

  const content: ContentDefinition<typeof defaults> = {
    missedCritCrBuff: {
      lc: true,
      id: 'missedCritCrBuff',
      formItem: 'switch',
      text: t('Content.missedCritCrBuff.text'),
      content: t('Content.missedCritCrBuff.content', { CritBuff: TsUtils.precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.CR.buff((r.missedCritCrBuff) ? sValues[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
