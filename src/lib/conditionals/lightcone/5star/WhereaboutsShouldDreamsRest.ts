import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WhereaboutsShouldDreamsRest')
  const { SOURCE_LC } = Source.lightCone('23025')

  const sValuesVulnerability = [0.24, 0.28, 0.32, 0.36, 0.40]

  const defaults = {
    routedVulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    routedVulnerability: {
      lc: true,
      id: 'routedVulnerability',
      formItem: 'switch',
      text: t('Content.routedVulnerability.text'),
      content: t('Content.routedVulnerability.content', { Vulnerability: sValuesVulnerability[s] * 100 }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.VULNERABILITY, (r.routedVulnerability) ? sValuesVulnerability[s] : 0, x.source(SOURCE_LC))
    },
  }
}
