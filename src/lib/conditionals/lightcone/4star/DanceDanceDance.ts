import { LightConeConditional } from 'types/LightConeConditionals'

export default (): LightConeConditional => {
  return {
    content: () => [],
    teammateContent: () => [],
    defaults: () => ({}),
    precomputeEffects: () => {
    },
    finalizeCalculations: () => {
    },
  }
}
