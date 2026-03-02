import { Sets } from 'lib/constants/constants'
import { SetConfig } from 'types/setConfig'

const setModules = import.meta.glob<Record<string, unknown>>(
  ['./**/*.ts', '!./setConfigRegistry.ts'],
  { eager: true },
)

export const setConfigRegistry = new Map<keyof typeof Sets, SetConfig>()

for (const mod of Object.values(setModules)) {
  for (const value of Object.values(mod)) {
    if (
      value != null
      && typeof value === 'object'
      && 'id' in value
      && 'info' in value
      && 'conditionals' in value
      && 'display' in value
    ) {
      const config = value as SetConfig
      setConfigRegistry.set(config.id, config)
    }
  }
}

export function getSetConfig(id: keyof typeof Sets): SetConfig | undefined {
  return setConfigRegistry.get(id)
}

export function getAllSetConfigs(): Map<keyof typeof Sets, SetConfig> {
  return setConfigRegistry
}
