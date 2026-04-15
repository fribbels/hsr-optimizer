import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import {
  DamageTag,
  TargetTag,
} from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { precisionRound } from 'lib/utils/mathUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.LongRoadLeadsHome')
  const { SOURCE_LC } = Source.lightCone(LongRoadLeadsHome.id)

  const sValuesBreakVulnerability = [0.18, 0.21, 0.24, 0.27, 0.30]

  const defaults = {
    breakVulnerabilityStacks: 2,
  }

  const teammateDefaults = {
    breakVulnerabilityStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    breakVulnerabilityStacks: {
      lc: true,
      id: 'breakVulnerabilityStacks',
      formItem: 'slider',
      text: t('Content.breakVulnerabilityStacks.text'),
      content: t('Content.breakVulnerabilityStacks.content', { breakVulnerability: precisionRound(100 * sValuesBreakVulnerability[s]) }),
      min: 0,
      max: 2,
    },
  }

  const teammateContent = {
    breakVulnerabilityStacks: content.breakVulnerabilityStacks,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(
        StatKey.VULNERABILITY,
        m.breakVulnerabilityStacks * sValuesBreakVulnerability[s],
        x.damageType(DamageTag.BREAK).targets(TargetTag.FullTeam).source(SOURCE_LC),
      )
    },
  }
}

export const LongRoadLeadsHome: LightConeConfig = {
  id: '23035',
  conditionals,
}
