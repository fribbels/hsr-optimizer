import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { HitDefinitionBuilder } from 'lib/conditionals/hitDefinitionBuilder'
import { WearerMetadata } from 'lib/conditionals/resolver/lightConeConditionalsResolver'
import {
  DamageTag,
  ElementTag,
} from 'lib/optimization/engine/config/tag'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { Hit } from 'types/hitConditionalTypes'
import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean, wearerMeta: WearerMetadata): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.WeWillMeetAgain')

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
      content: t('Content.extraDmgProc.content', { Multiplier: TsUtils.precisionRound(100 * sValues[s]) }),
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
