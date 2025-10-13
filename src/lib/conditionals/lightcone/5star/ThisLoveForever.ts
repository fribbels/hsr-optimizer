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
  THIS_LOVE_FOREVER,
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
  const { SOURCE_LC } = Source.lightCone(THIS_LOVE_FOREVER)

  const sValuesVulnerability = [0.10, 0.12, 0.14, 0.16, 0.18]
  const sValuesCd = [0.16, 0.19, 0.22, 0.25, 0.28]
  const sValuesMulti = [0.60, 0.65, 0.70, 0.75, 0.80]

  const defaults = {
    vulnerability: true,
    cdBoost: true,
  }

  const teammateDefaults = {
    vulnerability: true,
    cdBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    vulnerability: {
      lc: true,
      id: 'vulnerability',
      formItem: 'switch',
      text: 'Vulnerability',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    cdBoost: {
      lc: true,
      id: 'cdBoost',
      formItem: 'switch',
      text: 'CD buff',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    vulnerability: content.vulnerability,
    cdBoost: content.cdBoost,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.VULNERABILITY.buffTeam(
        (m.vulnerability)
          ? (m.cdBoost ? 1 + sValuesMulti[s] : 1) * sValuesVulnerability[s]
          : 0,
        SOURCE_LC,
      )
      x.CD.buffTeam(
        (m.cdBoost)
          ? (m.vulnerability ? 1 + sValuesMulti[s] : 1) * sValuesCd[s]
          : 0,
        SOURCE_LC,
      )
    },
    finalizeCalculations: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
    },
    gpuFinalizeCalculations: (action: OptimizerAction, context: OptimizerContext) => '',
  }
}
