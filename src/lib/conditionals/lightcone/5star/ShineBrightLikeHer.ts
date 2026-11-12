import i18next from 'i18next'
import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { type WearerMetadata } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
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

const conditionals = (s: SuperImpositionLevel, withContent: boolean, { maxEnergy }: WearerMetadata): LightConeConditionalsController => {
  const betaContent = i18next.t('BetaMessage', { ns: 'conditionals', Version: CURRENT_DATA_VERSION })
  const { SOURCE_LC } = Source.lightCone(ShineBrightLikeHer.id)
  const sValuesCd = [0.48, 0.60, 0.72, 0.84, 0.96]

  const defaults = { ourMelody: true }
  const teammateDefaults = { ourMelody: true }
  const content: ContentDefinition<typeof defaults> = {
    ourMelody: {
      lc: true,
      id: 'ourMelody',
      formItem: 'switch',
      text: 'Team CD buff',
      content: betaContent,
    },
  }
  const teammateContent: ContentDefinition<typeof teammateDefaults> = { ourMelody: content.ourMelody }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    teammateContent: () => Object.values(teammateContent),
    teammateDefaults: () => teammateDefaults,
    precomputeMutualEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const m = action.lightConeConditionals as Conditionals<typeof teammateContent>
      x.buff(StatKey.CD, (m.ourMelody && maxEnergy >= 240) ? sValuesCd[s] : 0, x.targets(TargetTag.FullTeam).source(SOURCE_LC))
    },
  }
}

export const ShineBrightLikeHer: LightConeConfig = {
  id: '23067',
  conditionals,
}
