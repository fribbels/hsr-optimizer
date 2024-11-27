import { DOT_TYPE } from 'lib/conditionals/conditionalConstants'
import { buffAbilityDmg } from 'lib/optimization/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimization/computedStatsArray'
import { LightConeConditionalsController } from 'types/conditionals'
import { SuperImpositionLevel } from 'types/lightCone'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditionalsController => {
  const sValues = [0.24, 0.30, 0.36, 0.42, 0.48]

  return {
    content: () => [],
    defaults: () => ({}),
    precomputeEffects: (x: ComputedStatsArray) => {
      buffAbilityDmg(x, DOT_TYPE, sValues[s], Source.NONE)
    },
    finalizeCalculations: () => {
    },
  }
}
