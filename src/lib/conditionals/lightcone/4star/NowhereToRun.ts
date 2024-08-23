import { LightConeConditional } from 'types/LightConeConditionals'

export default (): LightConeConditional => {
  return {
    content: () => [],
    defaults: () => ({}),
    precomputeEffects: () => {
    },
    finalizeCalculations: () => {
    },
  }
}
