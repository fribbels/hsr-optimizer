import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { ContentItem } from 'types/Conditionals'

import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
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
      const r: Conditionals<typeof content> = action.lightConeConditionals

      x.ELEMENTAL_DMG.buff(r.maxEnergyStacks * sValues[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
