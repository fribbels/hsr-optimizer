import { LightConeConditionalsController } from 'types/conditionals'
import { LightConeConfig } from 'types/lightConeConfig'

const conditionals = (): LightConeConditionalsController => {
  return {
    content: () => [],
    defaults: () => ({}),
  }
}

export const Multiplication: LightConeConfig = {
  id: '20015',
  conditionals,
}
