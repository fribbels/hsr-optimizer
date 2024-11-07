import { ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { TsUtils } from 'lib/TsUtils'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
  const t = TsUtils.wrappedFixedT(withContent).get(null, 'conditionals', 'Lightcones.AnInstantBeforeAGaze')

  const sValues = [0.0036, 0.0042, 0.0048, 0.0054, 0.006]

  const defaults = {
    maxEnergyUltDmgStacks: 180,
  }

  const content: ContentDefinition<typeof defaults> = {
    maxEnergyUltDmgStacks: {
      lc: true,
      id: 'maxEnergyUltDmgStacks',
      formItem: 'slider',
      text: t('Content.maxEnergyUltDmgStacks.text'),
      content: t('Content.maxEnergyUltDmgStacks.content', { DmgStep: TsUtils.precisionRound(100 * sValues[s]) }),
      min: 0,
      max: 180,
    },
  }

  return {
    content: () => Object.values(content),
    defaults: () => defaults,
    precomputeEffects: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => {
      const r: Conditionals<typeof content> = action.lightConeConditionals

      buffAbilityDmg(x, ULT_TYPE, r.maxEnergyUltDmgStacks * sValues[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
