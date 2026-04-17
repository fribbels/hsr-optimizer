import type {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import type { LightConeConditionalsController } from 'types/conditionals'
import type { SuperImpositionLevel } from 'types/lightCone'
import type { LightConeConfig } from 'types/lightConeConfig'
import type {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.UntilTheFlowersBloomAgain.Content')
  const { SOURCE_LC } = Source.lightCone(UntilTheFlowersBloomAgain.id)

  const sValuesVulnerability = [0.15, 0.1875, 0.225, 0.2625, 0.30]
  const sValuesErr = [0.10, 0.115, 0.13, 0.145, 0.16]

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
      text: t('maxEnergyErrConversion.text'),
      content: t('maxEnergyErrConversion.content', { baseErr: precisionRound(100 * sValuesErr[s]) }),
    },
    vulnerability: {
      lc: true,
      id: 'vulnerability',
      formItem: 'switch',
      text: t('vulnerability.text'),
      content: t('vulnerability.content', { vuln: precisionRound(100 * sValuesVulnerability[s]) }),
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

      x.buff(StatKey.ERR, sValuesErr[s], x.source(SOURCE_LC))

      const conditionalErr = (r.maxEnergyErrConversion && context.baseEnergy > 120)
        ? Math.min(360, context.baseEnergy - 120) / 10 * 0.003
        : 0
      x.buff(StatKey.ERR, conditionalErr, x.source(SOURCE_LC))
      x.buff(StatKey.UNCONVERTIBLE_ERR_BUFF, conditionalErr, x.source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.vulnerability) ? sValuesVulnerability[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const UntilTheFlowersBloomAgain: LightConeConfig = {
  id: '23058',
  conditionals,
}
