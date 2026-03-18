import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { type WearerMetadata } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type Hit } from 'types/hitConditionalTypes'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean, wearerMeta: WearerMetadata): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.HiddenShadow')

  const sValues = [0.60, 0.75, 0.90, 1.05, 1.20]

  const defaults = {
    basicAtkBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    basicAtkBuff: {
      lc: true,
      id: 'basicAtkBuff',
      formItem: 'switch',
      text: t('Content.basicAtkBuff.text'),
      content: t('Content.basicAtkBuff.content', { MultiplierBonus: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    actionModifiers: () => [{
      modify: (action: OptimizerAction, context: OptimizerContext, self) => {
        // Only apply when wearer is the primary character
        if (self.isTeammate) return

        const r = self.ownLightConeConditionals as Conditionals<typeof content>
        if (!r.basicAtkBuff) return

        // Only add to actions that have a direct BASIC hit
        const hasDirectBasicHit = action.hits?.some(
          (hit) => hit.directHit && (hit.damageType! & DamageTag.BASIC),
        )
        if (!hasDirectBasicHit) return

        action.hits!.push(
          HitDefinitionBuilder.standardAdditional()
            .damageElement(ElementTag[wearerMeta.element as keyof typeof ElementTag])
            .atkScaling(sValues[s])
            .build() as Hit,
        )
      },
    }],
  }
}

export const HiddenShadow: LightConeConfig = {
  id: '20018',
  conditionals,
}
