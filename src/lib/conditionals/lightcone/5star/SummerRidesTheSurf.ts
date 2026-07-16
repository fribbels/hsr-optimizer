import i18next from 'i18next'
import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { SOURCE_LC } = Source.lightCone(SummerRidesTheSurf.id)

  const sValuesSpd = [0.20, 0.23, 0.26, 0.29, 0.32]
  const sValuesElation = [0.36, 0.495, 0.63, 0.765, 0.90]

  const defaults = {
    hypeSpdBuff: true,
    trendElationBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    hypeSpdBuff: {
      lc: true,
      id: 'hypeSpdBuff',
      formItem: 'switch',
      text: 'Hype SPD buff',
      content: betaContent,
    },
    trendElationBuff: {
      lc: true,
      id: 'trendElationBuff',
      formItem: 'switch',
      text: 'Trend Elation buff',
      content: betaContent,
    },
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => [],
    defaults: () => defaults,
    teammateDefaults: () => ({}),
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.SPD_P, r.hypeSpdBuff ? sValuesSpd[s] : 0, x.source(SOURCE_LC))
      x.buff(StatKey.ELATION, r.trendElationBuff ? sValuesElation[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const SummerRidesTheSurf: LightConeConfig = {
  id: '23064',
  conditionals,
}
