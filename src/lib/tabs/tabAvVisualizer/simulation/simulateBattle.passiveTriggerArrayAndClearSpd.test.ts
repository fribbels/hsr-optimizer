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

// Same mocking approach as the other simulateBattle.*.test.ts files.
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

function override(actionIndex: number, choice: 'basic' | 'skill'): ActionNodeOverride {
  return { characterId: 'A', actionIndex, choice }
}

// Covers CharacterBattleConfig.passiveTrigger being an array of independent checks, with a function
// effect that reads the caster's own current stack count — e.g. Gilgamesh: continuously re-syncing a SPD
// buff to "current Interest stacks * 10%", which needs to read live state, not a fixed template.
describe('simulateBattle — passiveTrigger array + function effect', () => {
  it('runs every entry in the array independently, with a function effect reading live stack count', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        skill: [{ type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'marker', stackable: { maxStacks: 5 } }],
        basic: [], ult: [],
      },
      passiveTrigger: [
        {
          // Independent check #1: just energy_gain a flat amount once energy crosses some threshold.
          condition: (ctx) => ctx.energy >= 10000,   // never true here — proves both entries run without interfering
          effect: [{ type: 'energy_gain', targets: 'self', value: 999, unit: 'flat', scalesWithErr: false }],
        },
        {
          // Independent check #2: SPD-sync from current stack count (the actual case under test).
          condition: () => true,
          effect: (ctx) => {
            const stacks = ctx.activeInterventions.find((b) => b.effectId === 'marker')?.stacks ?? 0
            return [{ type: 'spd_up', targets: 'self', value: stacks * 10, unit: 'percent', durationTurns: Infinity, effectId: 'spd_sync' }]
          },
        },
      ],
    })
    const result = simulateBattle(
      [makeEntity('A', 100)], [],
      [override(0, 'skill'), override(1, 'skill'), override(2, 'skill')],
      [], 350,
    )
    const events = result.events.filter((e) => e.characterId === 'A')
    // passiveTriggers run at the checkpoint *after* each action's own stateAfter snapshot, so the synced
    // SPD shows up in the *next* action's stateBefore. After 1 stack: SPD = 100 + 10% = 110. After 2
    // stacks: SPD = 100 + 20% = 120 (replaced, not stacked).
    expect(events[1].stateBefore['A'].spd).toBe(110)
    expect(events[2].stateBefore['A'].spd).toBe(120)
    // Entry #1 never fired (energy never reached 10000).
    expect(events[2].stateBefore['A'].energy).toBeLessThan(999)
  })
})

// Covers clear_buff also purging the matching CharState.spdBuffs entries — e.g. Gilgamesh: clearing
// Interest must also remove the SPD bonus it grants, not just the stack counter living in activeBuffsMap.
describe('simulateBattle — clear_buff also clears the matching SPD buff', () => {
  it('reverts SPD back to baseline when the spd_up with the same effectId is cleared', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        skill: [{ type: 'spd_up', targets: 'self', value: 50, unit: 'percent', durationTurns: Infinity, effectId: 'spd_sync' }],
        basic: [{ type: 'clear_buff', targets: 'self', effectId: 'spd_sync' }],
        ult: [],
      },
    })
    const result = simulateBattle(
      [makeEntity('A', 100)], [],
      [override(0, 'skill'), override(1, 'basic')],
      [], 250,
    )
    const events = result.events.filter((e) => e.characterId === 'A')
    expect(events[0].stateAfter['A'].spd).toBe(150)
    expect(events[1].stateAfter['A'].spd).toBe(100)
  })
})
