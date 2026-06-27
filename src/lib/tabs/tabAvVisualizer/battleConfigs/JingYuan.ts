import type { CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'

const characterId = '1204'

export const JingYuan: CharacterBattleConfig = {
  characterId,
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
    ult: [],
  },
  summon: {
    id: `${characterId}_lightning_lord`,
    baseSpd: 60,   // TODO: verify Lightning Lord base speed
    ownerId: characterId,
    // Each HPA stack adds speed; capped at 10 stacks; TODO: verify per-stack delta
    derivedSpd: (extras) => 60 + (extras['hpa'] ?? 0) * 10,
  },
  extrasOnAction: [
    {
      ability: 'skill',
      patch: (extras) => ({ ...extras, hpa: Math.min(10, (extras['hpa'] ?? 0) + 2) }),
    },
    {
      ability: 'ult',
      patch: (extras) => ({ ...extras, hpa: Math.min(10, (extras['hpa'] ?? 0) + 3) }),
    },
  ],
}
