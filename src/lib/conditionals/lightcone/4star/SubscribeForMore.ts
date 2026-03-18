import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { DamageTag } from 'lib/optimization/engine/config/tag'
import { type ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { wrappedFixedT } from 'lib/utils/i18nUtils'
import { type LightConeConditionalsController } from 'types/conditionals'
import { type LightConeConfig } from 'types/lightConeConfig'
import { type SuperImpositionLevel } from 'types/lightCone'
import {
  type OptimizerAction,
  type OptimizerContext,
} from 'types/optimizer'
import { precisionRound } from 'lib/utils/mathUtils'

const conditionals = (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.SubscribeForMore')
  const { SOURCE_LC } = Source.lightCone(SubscribeForMore.id)

  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  const defaults = {
    maxEnergyDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    maxEnergyDmgBoost: {
      lc: true,
      id: 'maxEnergyDmgBoost',
      formItem: 'switch',
      text: t('Content.maxEnergyDmgBoost.text'),
      content: t('Content.maxEnergyDmgBoost.content', { DmgBuff: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, sValues[s], x.damageType(DamageTag.BASIC | DamageTag.SKILL).source(SOURCE_LC))
      x.buff(StatKey.DMG_BOOST, (r.maxEnergyDmgBoost) ? sValues[s] : 0, x.damageType(DamageTag.BASIC | DamageTag.SKILL).source(SOURCE_LC))
    },
  }
}

export const SubscribeForMore: LightConeConfig = {
  id: '21017',
  conditionals,
}
