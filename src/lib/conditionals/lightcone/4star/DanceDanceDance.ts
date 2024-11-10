import { LightConeConditionalsController } from 'types/Conditionals'

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
