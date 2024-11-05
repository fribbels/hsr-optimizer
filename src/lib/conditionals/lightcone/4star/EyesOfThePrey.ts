import { DOT_TYPE } from 'lib/conditionals/conditionalConstants'
import { buffAbilityDmg } from 'lib/optimizer/calculateBuffs'
import { ComputedStatsArray, Source } from 'lib/optimizer/computedStatsArray'
import { SuperImpositionLevel } from 'types/LightCone'
import { LightConeConditional } from 'types/LightConeConditionals'

export default (s: SuperImpositionLevel, withContent: boolean): LightConeConditional => {
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
