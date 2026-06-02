import i18next from 'i18next'
import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { type LightConeConditionalsController } from 'types/conditionals'
import {
  type LightConeId,
  type SuperImpositionLevel,
} from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const I_AM_AS_YOU_BEHOLD_ID = '23062' as unknown as LightConeId

const conditionals = (s: SuperImpositionLevel, _withContent: boolean): LightConeConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { SOURCE_LC } = Source.lightCone(I_AM_AS_YOU_BEHOLD_ID)

  const sValuesErr = [0.10, 0.125, 0.15, 0.175, 0.20]
  const sValuesUltDmgPerEnergy = [0.10, 0.125, 0.15, 0.175, 0.20]
  const sValuesUltDmgCap = [0.60, 0.75, 0.90, 1.05, 1.20]
  const sValuesTeamCd = [0.25, 0.3125, 0.375, 0.4375, 0.50]

  const defaults = {
    ultimateEnergyDmgBoost: true,
    kingsEntertainment: true,
  }

  const teammateDefaults = {
    kingsEntertainment: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    ultimateEnergyDmgBoost: {
      lc: true,
      id: 'ultimateEnergyDmgBoost',
      formItem: 'switch',
      text: 'Ult Energy DMG boost',
      content: betaContent,
    },
    kingsEntertainment: {
      lc: true,
      id: 'kingsEntertainment',
      formItem: 'switch',
      text: 'King\'s Entertainment',
      content: betaContent,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    kingsEntertainment: content.kingsEntertainment,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>
      const ultDmgBoost = Math.min(sValuesUltDmgCap[s], context.baseEnergy * sValuesUltDmgPerEnergy[s] / 100)

      x.buff(StatKey.ERR, sValuesErr[s], x.source(SOURCE_LC))
      x.buff(StatKey.BOOST, r.ultimateEnergyDmgBoost ? ultDmgBoost : 0, x.damageType(DamageTag.ULT).source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.CD, m.kingsEntertainment ? sValuesTeamCd[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const IAmAsYouBehold: LightConeConfig = {
  id: I_AM_AS_YOU_BEHOLD_ID,
  conditionals,
}
