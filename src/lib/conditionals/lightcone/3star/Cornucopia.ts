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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.Cornucopia')
  const { SOURCE_LC } = Source.lightCone(Cornucopia.id)

  const sValues = [0.12, 0.15, 0.18, 0.21, 0.24]

  const defaults = {
    healingBuff: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    healingBuff: {
      lc: true,
      id: 'healingBuff',
      formItem: 'switch',
      text: t('Content.healingBuff.text'),
      content: t('Content.healingBuff.content', { HealingBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.OHB, (r.healingBuff) ? sValues[s] : 0, x.damageType(DamageTag.SKILL | DamageTag.ULT).source(SOURCE_LC))
    },
  }
}

export const Cornucopia: LightConeConfig = {
  id: '20001',
  conditionals,
}
