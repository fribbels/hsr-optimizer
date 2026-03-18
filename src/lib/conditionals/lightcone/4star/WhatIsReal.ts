import { type LightConeConditionalsController } from 'types/conditionals'
import { type LightConeConfig } from 'types/lightConeConfig'

const conditionals = (): LightConeConditionalsController => {
  return {
    content: () => [],
    defaults: () => ({}),
  }
}

export const WhatIsReal: LightConeConfig = {
  id: '21035',
  conditionals,
}
