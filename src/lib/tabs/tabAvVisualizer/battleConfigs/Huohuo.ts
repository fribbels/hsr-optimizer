import type { CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'

export const Huohuo: CharacterBattleConfig = {
  characterId: '1217b1',
  energyType: 'standard',
  abilities: {
    basic: [
      { type: 'energy_gain', targets: 'self', value: 20, unit: 'flat' }, // TODO: verify
      { type: 'sp_gain',     targets: 'team', value: 1,  unit: 'flat' },
    ],
    skill: [
      { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat' }, // TODO: verify
      { type: 'sp_loss',     targets: 'team', value: 1,  unit: 'flat' },
    ],
    ult: [
      // Restores 20% of each ally's max energy; engine reads individual max_sp at Step 5
      { type: 'energy_gain', targets: 'all_allies', value: 20, unit: 'percent' },
    ],
  },
}
