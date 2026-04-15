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
import { precisionRound } from 'lib/utils/mathUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type Hit } from 'types/hitConditionalTypes'
import { type SuperImpositionLevel } from 'types/lightCone'
import { type LightConeConfig } from 'types/lightConeConfig'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'

const conditionals = (s: SuperImpositionLevel, withContent: boolean, wearerMeta: WearerMetadata): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WeWillMeetAgain')

  const sValues = [0.48, 0.60, 0.72, 0.84, 0.96]

  const defaults = {
    extraDmgProc: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    extraDmgProc: {
      lc: true,
      id: 'extraDmgProc',
      formItem: 'switch',
      text: t('Content.extraDmgProc.text'),
      content: t('Content.extraDmgProc.content', { Multiplier: precisionRound(100 * sValues[s]) }),
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
        if (!r.extraDmgProc) return

        // Only add to actions that have a direct BASIC or SKILL hit
        const hasDirectHit = action.hits?.some(
          (hit) => hit.directHit && (hit.damageType! & (DamageTag.BASIC | DamageTag.SKILL)),
        )
        if (!hasDirectHit) return

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

export const WeWillMeetAgain: LightConeConfig = {
  id: '21029',
  conditionals,
}
