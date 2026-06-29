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

// Covers InterventionTemplate.clear_buff — instantly removing a held buff entirely (all its stacks at
// once), as opposed to consumeStack's -1 decrement, e.g. Saber's skill: "consume all Reactor Core stacks"
// or "consume Mana Burst" — both need to vanish in one shot.
describe('simulateBattle — InterventionTemplate.clear_buff', () => {
  it('removes every stack of a stack-based buff at once', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        skill: [{ type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'marker', stackable: { maxStacks: 5 } }],
        basic: [
          { type: 'clear_buff', targets: 'self', effectId: 'marker' },
          {
            type: 'energy_gain', targets: 'self', value: 50, unit: 'flat', scalesWithErr: false,
            condition: { metric: 'buffStacks', effectId: 'marker', operator: 'gte', value: 1 },
          },
        ],
        ult: [],
      },
    })
    // 3 stacks via 3 skill casts, then basic clears all of them before checking the gated gain.
    const result = simulateBattle(
      [makeEntity('A', 100)], [],
      [override(0, 'skill'), override(1, 'skill'), override(2, 'skill'), override(3, 'basic')],
      [], 450,
    )
    const events = result.events.filter((e) => e.characterId === 'A')
    // basic's clear_buff already wiped the stacks before the gated gain is checked -> no bonus.
    expect(events[3].stateAfter['A'].energy).toBe(events[2].stateAfter['A'].energy)
  })

  it('is a no-op when the target does not hold the buff', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'clear_buff', targets: 'self', effectId: 'never_granted' }],
        skill: [], ult: [],
      },
    })
    const result = simulateBattle([makeEntity('A', 100)], [], [override(0, 'basic')], [], 150)
    const event = result.events.find((e) => e.characterId === 'A')!
    expect(event.stateAfter['A'].energy).toBe(50)
  })
})

// Covers GlobalListener.effect accepting an array — multiple effects fired together off one trigger/
// condition (e.g. Saber's talent: a damage buff plus several separate Reactor Core stack grants, all
// from one ult-cast reaction), instead of needing one listener entry per effect.
describe('simulateBattle — GlobalListener.effect as an array', () => {
  it('applies every template in the array when the listener fires', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [] },
      globalListeners: [{
        trigger: 'any_ally_action',
        condition: (ctx) => ctx.actingAbility === 'skill',
        effect: [
          { type: 'energy_gain', targets: 'self', value: 10, unit: 'flat', scalesWithErr: false },
          { type: 'energy_gain', targets: 'self', value: 5, unit: 'flat', scalesWithErr: false },
        ],
      }],
    })
    const result = simulateBattle(
      [makeEntity('A', 100)], [],
      [override(0, 'skill')],
      [], 150,
    )
    const event = result.events.find((e) => e.characterId === 'A')!
    // Started at 50, both array entries apply: +10 and +5 = +15.
    expect(event.stateAfter['A'].energy).toBe(65)
  })
})
