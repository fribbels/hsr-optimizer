import i18next from 'i18next'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { wgslTrue } from 'lib/gpu/injection/wgslUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import {
  CAELUS_REMEMBRANCE,
  STELLE_REMEMBRANCE,
  TAKE_FLIGHT_TOWARD_A_PINK_TOMORROW,
} from 'lib/simulations/tests/testMetadataConstants'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TakeFlightTowardAPinkTomorrow')
  const { SOURCE_LC } = Source.lightCone(TAKE_FLIGHT_TOWARD_A_PINK_TOMORROW)

  const sValuesDmg = [0.08, 0.10, 0.12, 0.14, 0.16]
  const sValuesEnhancedBasicDmg = [0.60, 0.70, 0.80, 0.90, 1.00]

  const defaults = {
    dmgBoost: true,
    enhancedBasicBoost: true,
  }

  const teammateDefaults = {
    dmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    dmgBoost: {
      lc: true,
      id: 'dmgBoost',
      formItem: 'switch',
      text: 'DMG boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    enhancedBasicBoost: {
      lc: true,
      id: 'enhancedBasicBoost',
      formItem: 'switch',
      text: 'Trailblazer Enhanced Basic',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    dmgBoost: content.dmgBoost,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      if (context.characterId == STELLE_REMEMBRANCE || context.characterId == CAELUS_REMEMBRANCE) {
        x.BASIC_DMG_BOOST.buff((r.enhancedBasicBoost) ? sValuesEnhancedBasicDmg[s] : 0, SOURCE_LC)
      }
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.ELEMENTAL_DMG.buffTeam((m.dmgBoost) ? sValuesDmg[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
