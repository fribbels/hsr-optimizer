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

// Characters without a hand-written config still need to be playable on the timeline — Basic/Skill toggling
// is driven entirely by `abilities` existing, so a generic standard-energy rotation lets any character work
// before someone fills in their real numbers.
function defaultBattleConfig(characterId: string): CharacterBattleConfig {
  return {
    characterId,
    energyType: 'standard',
    abilities: {
      basic: [
        { type: 'energy_gain', targets: 'self', value: 20, unit: 'flat' },
        { type: 'sp_gain', targets: 'team', value: 1, unit: 'flat' },
      ],
      skill: [
        { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat' },
        { type: 'sp_loss', targets: 'team', value: 1, unit: 'flat' },
      ],
      ult: [],
    },
  }
}

export function getBattleConfig(characterId: string, eidolonLevel = 0): CharacterBattleConfig {
  const base = registry.get(characterId) ?? defaultBattleConfig(characterId)
  if (!base.eidolonUpgrades) return base
  return base.eidolonUpgrades
    .filter((u) => eidolonLevel >= u.minEidolon)
    .sort((a, b) => a.minEidolon - b.minEidolon)
    .reduce((cfg, u) => u.patch(cfg), base)
}
