import {
  type Conditionals,
  type ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
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
  const t = wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TodayIsAnotherPeacefulDay')
  const { SOURCE_LC } = Source.lightCone(TodayIsAnotherPeacefulDay.id)

  const sValues = [0.002, 0.0025, 0.003, 0.0035, 0.004]

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

      if (r.maxEnergyDmgBoost) {
        x.buff(StatKey.DMG_BOOST, Math.min(160, context.baseEnergy) * sValues[s], x.source(SOURCE_LC))
      }
    },
  }
}

export const TodayIsAnotherPeacefulDay: LightConeConfig = {
  id: '21034',
  conditionals,
}
