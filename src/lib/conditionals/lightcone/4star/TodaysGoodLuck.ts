import i18next from 'i18next'
import { Conditionals, ContentDefinition, } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TODAYS_GOOD_LUCK } from 'lib/simulations/tests/testMetadataConstants'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const { SOURCE_LC } = Source.lightCone(TODAYS_GOOD_LUCK)

  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })

  const sValues = [0.12, 0.14, 0.16, 0.18, 0.20]

  const defaults = {
    elationStacks: 2,
  }

  const content: ContentDefinition<typeof defaults> = {
    elationStacks: {
      lc: true,
      id: 'elationStacks',
      formItem: 'slider',
      text: 'Elation DMG stacks',
      content: betaContent,
      min: 0,
      max: 2,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.ELATION, r.elationStacks * sValues[s], x.source(SOURCE_LC))
    },
  }
}
