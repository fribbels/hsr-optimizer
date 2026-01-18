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
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.HiddenShadow')

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
      content: t('Content.basicAtkBuff.content', { MultiplierBonus: TsUtils.precisionRound(100 * sValues[s]) }),
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
