import {
  Conditionals,
  ContentDefinition,
} from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'

import { SuperImpositionLevel } from 'types/lightCone'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TodayIsAnotherPeacefulDay')
  const { SOURCE_LC } = Source.lightCone('21034')

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
      content: t('Content.maxEnergyDmgBoost.content', { DmgStep: TsUtils.precisionRound(100 * sValues[s]) }),
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
