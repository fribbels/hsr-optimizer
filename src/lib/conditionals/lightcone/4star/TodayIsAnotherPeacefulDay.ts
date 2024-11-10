import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'

import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.TodayIsAnotherPeacefulDay')

  const sValues = [0.002, 0.0025, 0.003, 0.0035, 0.004]

  const defaults = {
    maxEnergyStacks: 160,
  }

  const content: ContentDefinition<typeof defaults> = {
    maxEnergyStacks: {
      lc: true,
      id: 'maxEnergyStacks',
      formItem: 'slider',
      text: t('Content.maxEnergyStacks.text'),
      content: t('Content.maxEnergyStacks.content', { DmgStep: TsUtils.precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 160,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r = action.lightConeConditionals as Conditionals<typeof content>

      x.ELEMENTAL_DMG.buff(r.maxEnergyStacks * sValues[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
