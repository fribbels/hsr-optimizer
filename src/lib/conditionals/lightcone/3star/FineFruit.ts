import { type LightConeConditionalsController } from 'types/conditionals'
import { type LightConeConfig } from 'types/lightConeConfig'

const conditionals = (): LightConeConditionalsController => {
  return {
    content: () => [],
    defaults: () => ({}),
  }
}

export const FineFruit: LightConeConfig = {
  id: '20008',
  conditionals,
}
