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

// Covers TemplateCondition's new 'buffStacks' metric — reading own/target buff presence or stack count as
// a condition, e.g. Saber: "if Reactor Core is at least 3 stacks" or "if Mana Burst is held at all".
describe('simulateBattle — TemplateCondition.buffStacks', () => {
  it('reads a stack-based buff\'s real stack count, gating an effect on a stack threshold', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        // +1 stack of 'marker' per cast (maxStacks 5).
        skill: [{ type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'marker', stackable: { maxStacks: 5 } }],
        // Only restores energy if 'marker' is at/above 3 stacks.
        basic: [{
          type: 'energy_gain', targets: 'self', value: 50, unit: 'flat', scalesWithErr: false,
          condition: { metric: 'buffStacks', effectId: 'marker', operator: 'gte', value: 3 },
        }],
        ult: [],
      },
    })

    // Only 2 stacks (skill twice) — basic's condition should fail, no energy gained.
    const belowThreshold = simulateBattle(
      [makeEntity('A', 100)], [],
      [override(0, 'skill'), override(1, 'skill'), override(2, 'basic')],
      [], 350,
    )
    const belowEvents = belowThreshold.events.filter((e) => e.characterId === 'A')
    expect(belowEvents[2].stateAfter['A'].energy).toBe(belowEvents[1].stateAfter['A'].energy)

    // 3 stacks (skill three times) — condition should now pass, +50 energy on the next basic.
    const atThreshold = simulateBattle(
      [makeEntity('A', 100)], [],
      [override(0, 'skill'), override(1, 'skill'), override(2, 'skill'), override(3, 'basic')],
      [], 450,
    )
    const atEvents = atThreshold.events.filter((e) => e.characterId === 'A')
    expect(atEvents[3].stateAfter['A'].energy).toBe(atEvents[2].stateAfter['A'].energy + 50)
  })

  it('reads a non-stack-based buff as present (1) or absent (0) — no layered concept to count', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      onBattleStart: [
        { type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 2, effectId: 'has_marker' },
      ],
      abilities: {
        basic: [{
          type: 'energy_gain', targets: 'self', value: 50, unit: 'flat', scalesWithErr: false,
          condition: { metric: 'buffStacks', effectId: 'has_marker', operator: 'gte', value: 1 },
        }],
        skill: [], ult: [],
      },
    })
    const result = simulateBattle([makeEntity('A', 100)], [], [override(0, 'basic')], [], 150)
    const event = result.events.find((e) => e.characterId === 'A')!
    // Started at 50% of 100 = 50, +50 from the gated gain (the durational buff reads as "present" = 1).
    expect(event.stateAfter['A'].energy).toBe(100)
  })

  it('reads 0 when the buff isn\'t held at all', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{
          type: 'energy_gain', targets: 'self', value: 50, unit: 'flat', scalesWithErr: false,
          condition: { metric: 'buffStacks', effectId: 'never_granted', operator: 'gte', value: 1 },
        }],
        skill: [], ult: [],
      },
    })
    const result = simulateBattle([makeEntity('A', 100)], [], [override(0, 'basic')], [], 150)
    const event = result.events.find((e) => e.characterId === 'A')!
    // Started at 50% of 100 = 50, condition never satisfied -> no gain.
    expect(event.stateAfter['A'].energy).toBe(50)
  })
})
