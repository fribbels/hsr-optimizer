import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ThoseManySprings')
  const { SOURCE_LC } = Source.lightCone(ThoseManySprings.id)

  const sValuesVulnerability = [0.10, 0.12, 0.14, 0.16, 0.18]
  const sValuesVulnerabilityEnhanced = [0.14, 0.16, 0.18, 0.20, 0.22]

  const defaults = {
    unarmoredVulnerability: true,
    corneredVulnerability: true,
  }

  const teammateDefaults = {
    unarmoredVulnerability: true,
    corneredVulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    unarmoredVulnerability: {
      lc: true,
      id: 'unarmoredVulnerability',
      formItem: 'switch',
      text: t('Content.unarmoredVulnerability.text'),
      content: t('Content.unarmoredVulnerability.content', {
        UnarmoredVulnerability: precisionRound(sValuesVulnerability[s] * 100),
        CorneredVulnerability: precisionRound(sValuesVulnerabilityEnhanced[s] * 100),
      }),
    },
    corneredVulnerability: {
      lc: true,
      id: 'corneredVulnerability',
      formItem: 'switch',
      text: t('Content.corneredVulnerability.text'),
      content: t('Content.corneredVulnerability.content', {
        UnarmoredVulnerability: precisionRound(sValuesVulnerability[s] * 100),
        CorneredVulnerability: precisionRound(sValuesVulnerabilityEnhanced[s] * 100),
      }),
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    unarmoredVulnerability: content.unarmoredVulnerability,
    corneredVulnerability: content.corneredVulnerability,
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
        (m.unarmoredVulnerability || m.corneredVulnerability) ? sValuesVulnerability[s] : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_LC),
      )
      x.buff(
        StatKey.VULNERABILITY,
        (m.corneredVulnerability) ? sValuesVulnerabilityEnhanced[s] : 0,
        x.targets(TargetTag.FullTeam).source(SOURCE_LC),
      )
    },
  }
}

export const ThoseManySprings: LightConeConfig = {
  id: '23029',
  conditionals,
}
