import { LightConeId } from 'types/lightCone'
import { LightConeConfig } from 'types/lightConeConfig'

const lightConeModules = import.meta.glob<Record<string, unknown>>(
  '../lightcone/**/*.ts',
  { eager: true },
)

export const lightConeConfigRegistry = new Map<LightConeId, LightConeConfig>()

for (const mod of Object.values(lightConeModules)) {
  for (const value of Object.values(mod)) {
    if (
      value != null
      && typeof value === 'object'
      && 'id' in value
      && 'conditionals' in value
    ) {
      const config = value as LightConeConfig
      lightConeConfigRegistry.set(config.id, config)
    }
  }
}

export function getLightConeConfig(id: LightConeId): LightConeConfig | undefined {
  return lightConeConfigRegistry.get(id)
}

export function getAllLightConeConfigs(): Map<LightConeId, LightConeConfig> {
  return lightConeConfigRegistry
}
