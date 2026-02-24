import i18next from 'i18next'
import { Conditionals, ContentDefinition, } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, TargetTag, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { MUSHY_SHROOMYS_ADVENTURES } from 'lib/simulations/tests/testMetadataConstants'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const { SOURCE_LC } = Source.lightCone(MUSHY_SHROOMYS_ADVENTURES)

  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })

  const sValues = [0.06, 0.07, 0.08, 0.09, 0.10]

  const defaults = {
    elationVulnerability: true,
  }

  const teammateDefaults = {
    elationVulnerability: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    elationVulnerability: {
      lc: true,
      id: 'elationVulnerability',
      formItem: 'switch',
      text: 'Elation vulnerability',
      content: betaContent,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    elationVulnerability: content.elationVulnerability,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.VULNERABILITY, (m.elationVulnerability) ? sValues[s] : 0, x.damageType(DamageTag.ELATION).targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}
