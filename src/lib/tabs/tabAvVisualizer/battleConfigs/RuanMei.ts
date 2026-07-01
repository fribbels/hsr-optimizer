import type { CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'

// Stat key strings matching StatKey values used by the optimizer engine.
// Stats object in constants.ts does not include these extended keys.
const BOOST = 'BOOST'                           // General DMG dealt boost (StatKey.BOOST)
const BREAK_EFFICIENCY_BOOST = 'BREAK_EFFICIENCY_BOOST' // Break efficiency (StatKey.BREAK_EFFICIENCY_BOOST)
const RES_PEN = 'RES_PEN'                       // All-type resistance penetration (StatKey.RES_PEN)

export const RuanMei: CharacterBattleConfig = {
  characterId: '1303',
  energyType: 'standard',
  abilities: {
    basic: [
      { type: 'energy_gain', targets: 'self', value: 20, unit: 'flat' }, // TODO: verify
      { type: 'sp_gain',     targets: 'team', value: 1,  unit: 'flat' },
    ],
    skill: [
      { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat' },
      // Both buffs are aura: attached to Ruan Mei, tick on her turns (Step 7)
      {
        type: 'stat_buff', targets: 'all_allies', stat: BOOST,
        value: 32, unit: 'percent', durationTurns: 3, buffKind: 'aura',
      },
      {
        type: 'stat_buff', targets: 'all_allies', stat: BREAK_EFFICIENCY_BOOST,
        value: 50, unit: 'percent', durationTurns: 3, buffKind: 'aura',
      },
      { type: 'sp_loss', targets: 'team', value: 1, unit: 'flat' },
    ],
    ult: [
      // Direct buff (not aura): applied to each ally individually, ticks on their turns
      {
        type: 'stat_buff', targets: 'all_allies', stat: RES_PEN,
        value: 25, unit: 'percent', durationTurns: 2, // TODO: verify duration
      },
    ],
  },
}
