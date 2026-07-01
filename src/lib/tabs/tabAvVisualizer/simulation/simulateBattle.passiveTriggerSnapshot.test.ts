import type {
  ActionNodeOverride,
  BattleEntity,
  CharacterBattleConfig,
} from 'lib/tabs/tabAvVisualizer/types'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { simulateBattle } from './simulateBattle'

const mockConfigs = vi.hoisted(() => new Map<string, CharacterBattleConfig>())

vi.mock('lib/tabs/tabAvVisualizer/battleConfigs', () => ({
  getBattleConfig: (id: string) => mockConfigs.get(id) ?? {
    characterId: id,
    energyType: 'standard' as const,
    abilities: { basic: [], skill: [], ult: [] },
  },
}))

function makeEntity(id: string, spd: number): BattleEntity {
  return { id, type: 'character', name: id, baseSpd: spd, spd, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 }
}

// Mirrors Gilgamesh's real kit: a stack-based buff (Interest) permanently kept in sync with a separate
// SPD buff via passiveTrigger (stacks * 10% SPD, recomputed at every checkpoint). Skill clears Interest
// via clear_buff in its own templates.
describe('simulateBattle — passiveTrigger resync happens before this action\'s own snapshot', () => {
  it('clearing a stack buff in Skill also clears its synced SPD buff in the SAME stateAfter snapshot', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      onBattleStart: [
        { type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'interest', stackable: { maxStacks: 10 } },
        { type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'interest', stackable: { maxStacks: 10 } },
        { type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'interest', stackable: { maxStacks: 10 } },
      ],
      abilities: {
        basic: [],
        skill: [{ type: 'clear_buff', targets: 'self', effectId: 'interest' }],
        ult: [],
      },
      passiveTrigger: [{
        condition: () => true,
        effect: (ctx) => {
          const stacks = ctx.activeInterventions.find((b) => b.effectId === 'interest')?.stacks ?? 0
          return stacks > 0
            ? [{ type: 'spd_up' as const, targets: 'self' as const, value: stacks * 10, unit: 'flat' as const, durationTurns: Number.MAX_SAFE_INTEGER, effectId: 'interest_spd' }]
            : [{ type: 'clear_buff' as const, targets: 'self' as const, effectId: 'interest_spd' }]
        },
      }],
    })
    const override: ActionNodeOverride = { characterId: 'A', actionIndex: 0, choice: 'skill' }
    const result = simulateBattle([makeEntity('A', 100)], [], [override], [], 150)
    const event = result.events.find((e) => e.characterId === 'A')!
    const buffs = event.stateAfter['A'].activeInterventions ?? []
    expect(buffs.find((b) => b.effectId === 'interest')).toBeUndefined()
    expect(buffs.find((b) => b.effectId === 'interest_spd')).toBeUndefined()
  })
})
