import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.ThoseManySprings')
  const { SOURCE_LC } = Source.lightCone('23029')

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
        UnarmoredVulnerability: TsUtils.precisionRound(sValuesVulnerability[s] * 100),
        CorneredVulnerability: TsUtils.precisionRound(sValuesVulnerabilityEnhanced[s] * 100),
      }),
    },
    corneredVulnerability: {
      lc: true,
      id: 'corneredVulnerability',
      formItem: 'switch',
      text: t('Content.corneredVulnerability.text'),
      content: t('Content.corneredVulnerability.content', {
        UnarmoredVulnerability: TsUtils.precisionRound(sValuesVulnerability[s] * 100),
        CorneredVulnerability: TsUtils.precisionRound(sValuesVulnerabilityEnhanced[s] * 100),
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
