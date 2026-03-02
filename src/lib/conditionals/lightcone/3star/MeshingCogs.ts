import { LightConeConditionalsController } from 'types/conditionals'
import { LightConeConfig } from 'types/lightConeConfig'

const conditionals = (): LightConeConditionalsController => {
  return {
    content: () => [],
    defaults: () => ({}),
  }
}

export const MeshingCogs: LightConeConfig = {
  id: '20012',
  conditionals,
}
