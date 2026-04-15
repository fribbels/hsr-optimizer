import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.PostOpConversation')
  const { SOURCE_LC } = Source.lightCone(PostOpConversation.id)

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    postUltHealingBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    postUltHealingBoost: {
      lc: true,
      id: 'postUltHealingBoost',
      formItem: 'switch',
      text: t('Content.postUltHealingBoost.text'),
      content: t('Content.postUltHealingBoost.content', { HealingBoost: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.OHB, (r.postUltHealingBoost) ? sValues[s] : 0, x.damageType(DamageTag.ULT).source(SOURCE_LC))
    },
  }
}

export const PostOpConversation: LightConeConfig = {
  id: '21000',
  conditionals,
}
