import { setGameMetadata } from 'lib/state/gameMetadata'
import type {
  BattleEntity,
  CharacterBattleConfig,
  UltInsertion,
} from 'lib/tabs/tabAvVisualizer/types'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { DBMetadata } from 'types/metadata'
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

describe('simulateBattle — GlobalListener.everyNOccurrences (Saber E6: every 3rd ult by anyone)', () => {
  it('only fires every Nth time the condition is satisfied, counted across the whole battle (not per-turn)', () => {
    // B's ult threshold defaults to max_sp (100) — she only starts at 50% energy, so without this she'd
    // never actually be able to cast. max_sp: 0 means the threshold is met immediately.
    setGameMetadata({ characters: { B: { max_sp: 0 } } } as unknown as DBMetadata)
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [] },
      globalListeners: [{
        trigger: 'any_ally_action',
        condition: (ctx) => ctx.actingAbility === 'ult',
        everyNOccurrences: 3,
        effect: { type: 'energy_gain', targets: 'self', value: 10, unit: 'flat', scalesWithErr: false },
      }],
    })
    mockConfigs.set('B', {
      characterId: 'B',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [] },
    })

    const entities = [makeEntity('A', 100), makeEntity('B', 100)]
    const ults: UltInsertion[] = [
      { id: 'u1', casterId: 'B', timing: { type: 'at_av', av: 0 } },
      { id: 'u2', casterId: 'B', timing: { type: 'at_av', av: 10 } },
      { id: 'u3', casterId: 'B', timing: { type: 'at_av', av: 20 } },
      { id: 'u4', casterId: 'B', timing: { type: 'at_av', av: 30 } },
    ]
    const result = simulateBattle(entities, [], [], ults, 50)

    const energyAt = (av: number) => result.energyTimeline.filter((c) => c.av <= av).at(-1)?.energyMap['A']
    // A starts at 50% of 100 = 50. 1st and 2nd ult: no bonus (counts 1, 2). 3rd ult: +10 (count 3, fires).
    // 4th ult: no bonus again (count 4) until a 6th would fire it again.
    expect(energyAt(5)).toBe(50)
    expect(energyAt(15)).toBe(50)
    expect(energyAt(25)).toBe(60)
    expect(energyAt(35)).toBe(60)
  })
})

describe('simulateBattle — InterventionTemplate.energy_set_minimum (Saber: start at >=216 energy)', () => {
  it('raises energy to the floor when starting below it', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      customMaxEnergy: 300,
      onBattleStart: [
        { type: 'energy_set_minimum', targets: 'self', value: 216 },
      ],
      abilities: { basic: [], skill: [], ult: [] },
    })
    // Default start is 50% of customMaxEnergy = 150, below the 216 floor.
    const result = simulateBattle([makeEntity('A', 100)], [], [], [], 50)
    expect(result.energyTimeline[0].energyMap['A']).toBe(216)
  })

  it('is a no-op when already at or above the floor', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      customMaxEnergy: 500,
      onBattleStart: [
        { type: 'energy_set_minimum', targets: 'self', value: 216 },
      ],
      abilities: { basic: [], skill: [], ult: [] },
    })
    // Default start is 50% of customMaxEnergy = 250, already above the 216 floor.
    const result = simulateBattle([makeEntity('A', 100)], [], [], [], 50)
    expect(result.energyTimeline[0].energyMap['A']).toBe(250)
  })
})
