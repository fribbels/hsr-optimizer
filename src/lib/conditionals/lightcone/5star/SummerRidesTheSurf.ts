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

  const sValuesSpd = [0.24, 0.28, 0.32, 0.36, 0.40]
  const sValuesElation = [0.40, 0.55, 0.70, 0.85, 1.00]

  const defaults = {
    updraftSpdBuff: true,
    uptrendElationBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    updraftSpdBuff: {
      lc: true,
      id: 'updraftSpdBuff',
      formItem: 'switch',
      text: 'Updraft SPD buff',
      content: betaContent,
    },
    uptrendElationBuff: {
      lc: true,
      id: 'uptrendElationBuff',
      formItem: 'switch',
      text: 'Uptrend Elation buff',
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

      x.buff(StatKey.SPD_P, r.updraftSpdBuff ? sValuesSpd[s] : 0, x.source(SOURCE_LC))
      x.buff(StatKey.ELATION, r.uptrendElationBuff ? sValuesElation[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const SummerRidesTheSurf: LightConeConfig = {
  id: '23064',
  conditionals,
}
