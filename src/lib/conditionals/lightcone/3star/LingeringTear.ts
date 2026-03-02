import i18next from 'i18next'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { LINGERING_TEAR } from 'lib/simulations/tests/testMetadataConstants'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { LightConeConfig } from 'types/lightConeConfig'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const { SOURCE_LC } = Source.lightCone(LINGERING_TEAR)

  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })

  const sValues = [0.20, 0.25, 0.30, 0.35, 0.40]

  const defaults = {
    cdBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    cdBuff: {
      lc: true,
      id: 'cdBuff',
      formItem: 'switch',
      text: 'Punchline CD buff',
      content: betaContent,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.CD, (r.cdBuff) ? sValues[s] : 0, x.source(SOURCE_LC))
    },
  }
}

export const LingeringTear: LightConeConfig = {
  id: '20024',
  conditionals,
}
