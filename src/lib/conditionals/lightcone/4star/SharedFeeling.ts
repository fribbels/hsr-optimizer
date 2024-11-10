import { LightConeConditionalsController } from 'types/LightConeConditionals'

export default (): LightConeConditionalsController => {
  return {
    content: () => [],
    defaults: () => ({}),
    precomputeEffects: () => {
    },
    finalizeCalculations: () => {
    },
  }
}
