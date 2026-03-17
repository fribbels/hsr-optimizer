import i18next from 'i18next'
import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  const { SOURCE_LC } = Source.lightCone(EncounterAtFloweringsComing.id)

  const sValuesVulnerability = [0.15, 0.21, 0.28, 0.34, 0.40]

  const defaults = {
    maxEnergyErrConversion: true,
    vulnerability: true,
  }

  const teammateDefaults = {
    vulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    maxEnergyErrConversion: {
      lc: true,
      id: 'maxEnergyErrConversion',
      formItem: 'switch',
      text: 'Max Energy ERR buff',
      content: betaContent,
    },
    vulnerability: {
      lc: true,
      id: 'vulnerability',
      formItem: 'switch',
      text: 'Elation Skill vulnerability',
      content: betaContent,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    vulnerability: content.vulnerability,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      const errValue = (r.maxEnergyErrConversion && context.baseEnergy > 120)
        ? Math.min(360, context.baseEnergy - 120) / 10 * 0.003
        : 0
      x.buff(StatKey.ERR, errValue, x.source(SOURCE_LC))
      x.buff(StatKey.UNCONVERTIBLE_ERR_BUFF, errValue, x.source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.vulnerability) ? sValuesVulnerability[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const EncounterAtFloweringsComing: LightConeConfig = {
  id: '23058',
  conditionals,
}
