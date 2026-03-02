import { LightConeConditionalsController } from 'types/conditionals'
import { LightConeConfig } from 'types/lightConeConfig'

const conditionals = (): LightConeConditionalsController => {
  return {
    content: () => [],
    defaults: () => ({}),
  }
}

export const SharedFeeling: LightConeConfig = {
  id: '21007',
  conditionals,
}
