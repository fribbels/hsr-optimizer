import type { CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'

const modules = import.meta.glob<Record<string, unknown>>('./*.ts', { eager: true })

const registry = new Map<string, CharacterBattleConfig>()

for (const mod of Object.values(modules)) {
  for (const value of Object.values(mod)) {
    if (value != null && typeof value === 'object' && 'characterId' in value && 'abilities' in value) {
      const config = value as CharacterBattleConfig
      registry.set(config.characterId, config)
    }
  }
}

export function getBattleConfig(characterId: string): CharacterBattleConfig | undefined {
  return registry.get(characterId)
}
