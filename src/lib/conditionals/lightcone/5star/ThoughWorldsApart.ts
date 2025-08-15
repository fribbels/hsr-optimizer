import i18next from 'i18next'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import { THOUGH_WORLDS_APART } from 'lib/simulations/tests/testMetadataConstants'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ThoughWorldsApart.Content')
  const { SOURCE_LC } = Source.lightCone(THOUGH_WORLDS_APART)

  const sValuesShield = [0.30, 0.35, 0.40, 0.45, 0.50]
  const sValuesDmgBoost = [0.24, 0.30, 0.36, 0.42, 0.48]
  const sValuesDmgBoostSummons = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    shieldBoost: true,
    dmgBoost: true,
  }

  const teammateDefaults = {
    dmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    shieldBoost: {
      lc: true,
      id: 'shieldBoost',
      formItem: 'switch',
      text: 'Shield boost',
      content: i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION }),
    },
    dmgBoost: {
      lc: true,
      id: 'dmgBoost',
      formItem: 'switch',
      text: 'DMG boost',
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

      x.SHIELD_BOOST.buff((r.shieldBoost) ? sValuesShield[s] : 0, SOURCE_LC)
    },
    precomputeMutualEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.ELEMENTAL_DMG.buffTeam((m.dmgBoost) ? sValuesDmgBoost[s] : 0, SOURCE_LC)
      x.ELEMENTAL_DMG.buffTeam((m.dmgBoost && x.a[Key.SUMMONS] > 0) ? sValuesDmgBoostSummons[s] : 0, SOURCE_LC)
    },
    finalizeCalculations: (x, action, context) => {},
    gpuFinalizeCalculations: (action, context) => '',
  }
}
