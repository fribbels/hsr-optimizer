import type {
  CharacterId,
  ExFlags,
} from 'types/character'
import type { CharacterConfig } from 'types/characterConfig'

const characterModules = import.meta.glob<Record<string, unknown>>(
  '../character/**/*.ts',
  { eager: true },
)

type RegisteredCharacterConfig = CharacterConfig & { supportedExFlags: ExFlags }

export const characterConfigRegistry = new Map<CharacterId, RegisteredCharacterConfig>()

for (const mod of Object.values(characterModules)) {
  for (const value of Object.values(mod)) {
    if (
      value != null
      && typeof value === 'object'
      && 'id' in value
      && 'scoring' in value
      && 'conditionals' in value
      && 'display' in value
    ) {
      const config = value as CharacterConfig
      config.supportedExFlags = config.supportedExFlags ?? 0
      characterConfigRegistry.set(config.id, config as RegisteredCharacterConfig)
    }
  }
}

export function getCharacterConfig(id: CharacterId): RegisteredCharacterConfig | undefined {
  return characterConfigRegistry.get(id)
}

export function getAllCharacterConfigs(): Map<CharacterId, RegisteredCharacterConfig> {
  return characterConfigRegistry
}
