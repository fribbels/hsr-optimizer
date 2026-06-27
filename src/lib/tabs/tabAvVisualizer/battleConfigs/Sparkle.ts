import { Stats } from 'lib/constants/constants'
import type { CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'

export const Sparkle: CharacterBattleConfig = {
  characterId: '1306b1',
  energyType: 'standard',
  // Permanent +3 SP cap while Sparkle is in team (raises default 5 → 8)
  spCapBonus: 3,
  abilities: {
    basic: [
      { type: 'energy_gain', targets: 'self', value: 20, unit: 'flat' }, // TODO: verify
      { type: 'sp_gain',     targets: 'team', value: 1,  unit: 'flat' },
    ],
    skill: [
      { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat' },
      { type: 'av_advance', targets: 'single_ally', value: 50, unit: 'percent' },
      {
        // CD buff = 6% × Sparkle panel CD + 12%; estimated at CD ≈ 250% → ~27%
        // TODO: verify formula and typical value; Phase 3 consider dynamic calculation
        type: 'stat_buff',
        targets: 'single_ally',
        stat: Stats.CD,
        value: 27,
        unit: 'percent',
        durationTurns: 1,
      },
      { type: 'sp_loss', targets: 'team', value: 1, unit: 'flat' },
    ],
    ult: [
      {
        type: 'stat_buff',
        targets: 'all_allies',
        stat: Stats.ATK_P,
        value: 15, // TODO: verify ult ATK% buff value
        unit: 'percent',
        durationTurns: 2,
      },
      { type: 'sp_gain',   targets: 'team', value: 6, unit: 'flat' },
      { type: 'sp_cap_up', targets: 'team', value: 2, unit: 'flat', durationTurns: 2 },
    ],
  },
}
