import { LightConeConditionalsController } from 'types/conditionals'
import { LightConeConfig } from 'types/lightConeConfig'

const conditionals = (): LightConeConditionalsController => {
  return {
    content: () => [],
    defaults: () => ({}),
  }
}

export const Shadowburn: LightConeConfig = {
  id: '20021',
  conditionals,
}
