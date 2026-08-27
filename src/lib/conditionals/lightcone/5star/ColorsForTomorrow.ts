import i18next from 'i18next'
import {
  type Conditionals,
  type ContentDefinition,
  countTeamPath,
} from 'lib/conditionals/conditionalUtils'
import {
  CURRENT_DATA_VERSION,
  PathNames,
} from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  const { SOURCE_LC } = Source.lightCone(ColorsForTomorrow.id)

  const sValuesVulnerability = [0.10, 0.125, 0.15, 0.175, 0.20]
  const sValuesVulnerabilityPerElation = [0.04, 0.05, 0.06, 0.07, 0.08]

  const defaults = {
    inkSplashVulnerability: true,
  }

  const teammateDefaults = {
    inkSplashVulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    inkSplashVulnerability: {
      lc: true,
      id: 'inkSplashVulnerability',
      formItem: 'switch',
      text: 'Vulnerability',
      content: betaContent,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    inkSplashVulnerability: content.inkSplashVulnerability,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      // "Every other Elation character": the wearer is always Elation, so exclude them from the team count
      const otherElationCount = Math.max(0, countTeamPath(context, PathNames.Elation) - 1)
      const vulnerability = sValuesVulnerability[s] + sValuesVulnerabilityPerElation[s] * otherElationCount

      x.buff(StatKey.VULNERABILITY, (m.inkSplashVulnerability) ? vulnerability : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const ColorsForTomorrow: LightConeConfig = {
  id: '23055',
  conditionals,
}
