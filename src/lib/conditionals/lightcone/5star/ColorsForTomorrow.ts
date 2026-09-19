import i18next from 'i18next'
import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
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

  const sValuesVulnerability = [0.22, 0.275, 0.33, 0.385, 0.44]

  // Fixed Energy is not tracked; the triggered DEF heal needs a separate healing action
  // to avoid adding healing to the Elation Skill damage output.

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

      x.buff(StatKey.VULNERABILITY, (m.inkSplashVulnerability) ? sValuesVulnerability[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const ColorsForTomorrow: LightConeConfig = {
  id: '23055',
  conditionals,
}
