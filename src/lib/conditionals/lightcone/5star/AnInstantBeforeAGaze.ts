import { ULT_TYPE } from 'lib/conditionals/conditionalConstants'
import { Conditionals, ContentDefinition } from 'lib/conditionals/conditionalUtils'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { TsUtils } from 'lib/utils/TsUtils'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
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
      const r = action.lightConeConditionals as Conditionals<typeof content>

      buffAbilityDmg(x, ULT_TYPE, r.maxEnergyUltDmgStacks * sValues[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
