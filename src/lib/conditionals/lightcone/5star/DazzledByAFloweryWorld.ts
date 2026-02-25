import i18next from 'i18next'
import { Conditionals, ContentDefinition, } from 'lib/conditionals/conditionalUtils'
import { CURRENT_DATA_VERSION } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag, TargetTag, } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { DAZZLED_BY_A_FLOWERY_WORLD } from 'lib/simulations/tests/testMetadataConstants'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext, } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const { SOURCE_LC } = Source.lightCone(DAZZLED_BY_A_FLOWERY_WORLD)

  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })

  const sValuesDefPen = [0.05, 0.06, 0.07, 0.08, 0.09]
  const sValuesElation = [0.20, 0.24, 0.28, 0.32, 0.36]

  const defaults = {
    spConsumedStacks: 4,
    elationBuff: true,
  }

  const teammateDefaults = {
    elationBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    spConsumedStacks: {
      lc: true,
      id: 'spConsumedStacks',
      formItem: 'slider',
      text: 'DEF PEN stacks',
      content: betaContent,
      min: 0,
      max: 4,
    },
    elationBuff: {
      lc: true,
      id: 'elationBuff',
      formItem: 'switch',
      text: 'Elation buff',
      content: betaContent,
    },
  }

  const teammateContent: ContentDefinition<typeof teammateDefaults> = {
    elationBuff: content.elationBuff,
  }

  return {
    content: () => Object.values(content),
    teammateContent: () => Object.values(teammateContent),
    defaults: () => defaults,
    teammateDefaults: () => teammateDefaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DEF_PEN, r.spConsumedStacks * sValuesDefPen[s], x.damageType(DamageTag.ELATION).source(SOURCE_LC))
    },
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>

      x.buff(StatKey.ELATION, (m.elationBuff) ? sValuesElation[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}
