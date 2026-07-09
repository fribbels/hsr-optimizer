import type { CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'

export const Seele: CharacterBattleConfig = {
  characterId: '1102b1',
  energyType: 'standard',
  abilities: {
    basic: [
      { type: 'energy_gain', targets: 'self', value: 20, unit: 'flat' }, // TODO: verify
      { type: 'sp_gain',     targets: 'team', value: 1,  unit: 'flat' },
    ],
    skill: [
      { type: 'energy_gain', targets: 'self', value: 30,  unit: 'flat' },    // TODO: verify
      { type: 'spd_up',      targets: 'self', value: 25,  unit: 'percent', durationTurns: 2 }, // TODO: verify value and duration
      { type: 'sp_loss',     targets: 'team', value: 1,   unit: 'flat' },
    ],
    ult: [
      // SPD buff during Resurgence state; exact value and duration TODO: verify
      { type: 'spd_up', targets: 'self', value: 25, unit: 'percent', durationTurns: 2 }, // TODO: verify
    ],
  },
  extrasOnAction: [
    {
      // Sets resurgenceActive flag on ult; full resurgence logic (extra turn, stat buffs) in Step 9
      ability: 'ult',
      patch: (extras) => ({ ...extras, resurgenceActive: 1 }),
    },
  ],
}
