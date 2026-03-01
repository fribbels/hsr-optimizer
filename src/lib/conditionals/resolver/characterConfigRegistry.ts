import { CharacterId } from 'types/character'
import { CharacterConfig } from 'types/characterConfig'

const characterModules = import.meta.glob<Record<string, unknown>>(
  '../character/**/*.ts',
  { eager: true },
)

export const characterConfigRegistry = new Map<CharacterId, CharacterConfig>()

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
      characterConfigRegistry.set(config.id, config)
    }
  }
}

export function getCharacterConfig(id: CharacterId): CharacterConfig | undefined {
  return characterConfigRegistry.get(id)
}

export function getAllCharacterConfigs(): Map<CharacterId, CharacterConfig> {
  return characterConfigRegistry
}
