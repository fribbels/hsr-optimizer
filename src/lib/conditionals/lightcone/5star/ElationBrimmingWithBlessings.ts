import i18next from 'i18next'
import { Conditionals, ContentDefinition, } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { TargetTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  // const { SOURCE_LC } = Source.lightCone(ELATION_BRIMMING_WITH_BLESSINGS)
  const SOURCE_LC = {} as any // TODO: uncomment when 24006 is added to game_data

  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const teammateDefaults = {
    elationBuff: true,
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    elationBuff: {
      lc: true,
      id: 'elationBuff',
      formItem: 'switch',
      text: 'Elation buff',
      content: betaContent,
    },
  }

  return {
    content: () => [],
    teammateContent: () => Object.values(teammateContent),
    defaults: () => ({}),
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const t = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.ELATION_DMG_BOOST, (t.elationBuff) ? sValues[s] : 0, x.targets(TargetTag.SingleTarget).source(SOURCE_LC))
    },
  }
}
