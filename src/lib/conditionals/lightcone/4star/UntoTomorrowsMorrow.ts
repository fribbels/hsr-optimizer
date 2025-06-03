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
  const { SOURCE_LC } = Source.lightCone('21055')

  const sValuesDmgBoost = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    hp50DmgBoost: true,
  }

  const teammateDefaults = {
    hp50DmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    hp50DmgBoost: {
      lc: true,
      id: 'hp50DmgBoost',
      formItem: 'switch',
      text: 'HP ≥ 50% DMG boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    hp50DmgBoost: content.hp50DmgBoost,
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

      x.ELEMENTAL_DMG.buffTeam(m.hp50DmgBoost ? sValuesDmgBoost[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: () => {
    },
  }
}
