import { LightConeConditionalsController } from 'types/conditionals'
import { LightConeConfig } from 'types/lightConeConfig'

const conditionals = (): LightConeConditionalsController => {
  return {
    content: () => [],
    defaults: () => ({}),
  }
}

export const DanceDanceDance: LightConeConfig = {
  id: '21018',
  conditionals,
}
