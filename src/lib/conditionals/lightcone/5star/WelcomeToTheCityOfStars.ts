import i18next from 'i18next'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import {
  CURRENT_DATA_VERSION,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { LightConeConfig } from 'types/lightConeConfig'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { SOURCE_LC } = Source.lightCone(WelcomeToTheCityOfStars.id)

  const sValuesDefPen = [0.18, 0.21, 0.24, 0.27, 0.30]

  const defaults = {
    elationDefPen: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    elationDefPen: {
      lc: true,
      id: 'elationDefPen',
      formItem: 'switch',
      text: 'Elation DEF PEN',
      content: betaContent,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      // Elation DMG ignores DEF
      x.buff(StatKey.DEF_PEN, (r.elationDefPen) ? sValuesDefPen[s] : 0, x.damageType(DamageTag.ELATION).source(SOURCE_LC))
    },
  }
}

export const WelcomeToTheCityOfStars: LightConeConfig = {
  id: '23057',
  conditionals,
}
