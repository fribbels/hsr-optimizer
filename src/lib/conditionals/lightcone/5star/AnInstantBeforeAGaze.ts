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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AnInstantBeforeAGaze')
  const { SOURCE_LC } = Source.lightCone(AnInstantBeforeAGaze.id)

  const sValues = [0.0036, 0.0042, 0.0048, 0.0054, 0.006]

  const defaults = {
    maxEnergyDmgBoost: true,
  }

  const content: ContentDefinition<typeof defaults> = {
    maxEnergyDmgBoost: {
      lc: true,
      id: 'maxEnergyDmgBoost',
      formItem: 'switch',
      text: t('Content.maxEnergyDmgBoost.text'),
      content: t('Content.maxEnergyDmgBoost.content', { DmgStep: precisionRound(100 * sValues[s]) }),
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffectsContainer: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.buff(StatKey.DMG_BOOST, (r.maxEnergyDmgBoost) ? Math.min(180, context.baseEnergy) * sValues[s] : 0, x.damageType(DamageTag.ULT).source(SOURCE_LC))
    },
  }
}

export const AnInstantBeforeAGaze: LightConeConfig = {
  id: '23018',
  conditionals,
}
