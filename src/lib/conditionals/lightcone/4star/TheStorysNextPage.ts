import i18next from 'i18next'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.JourneyForeverPeaceful')
  const { SOURCE_LC } = Source.lightCone('21054')

  const sValuesOhb = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    ohbBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ohbBuff: {
      lc: true,
      id: 'ohbBuff',
      formItem: 'switch',
      text: 'OHB buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.OHB.buffDual(r.ohbBuff ? sValuesOhb[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
