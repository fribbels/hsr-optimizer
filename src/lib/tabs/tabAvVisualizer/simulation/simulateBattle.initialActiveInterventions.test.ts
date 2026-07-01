import type { BattleEntity, CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'
import { describe, expect, it, vi } from 'vitest'
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

// Covers SimulationResult.initialActiveInterventions — buffs right after onBattleStart resolves, before
// any action ever happens. onBattleStart never produces a BattleEvent, so without this a character's
// battle-start-granted buffs (e.g. Saber's Reactor Core from her talent/technique) would be invisible to
// any "buffs as of the playhead" UI reading until that character's own first action creates a snapshot.
describe('simulateBattle — SimulationResult.initialActiveInterventions', () => {
  it('reflects onBattleStart buffs even though no action has happened yet', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      onBattleStart: [
        { type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'marker', stackable: { maxStacks: 5 } },
        { type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'marker', stackable: { maxStacks: 5 } },
        { type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'marker', stackable: { maxStacks: 5 } },
      ],
      abilities: { basic: [], skill: [], ult: [] },
    })
    const result = simulateBattle([makeEntity('A', 100)], [], [], [], 10)
    expect(result.events.length).toBe(0)   // no action has fired yet within this tiny totalAv
    expect(result.initialActiveInterventions['A']?.find((b) => b.effectId === 'marker')?.stacks).toBe(3)
  })

  it('is an empty array for a character with no onBattleStart', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [] },
    })
    const result = simulateBattle([makeEntity('A', 100)], [], [], [], 10)
    expect(result.initialActiveInterventions['A']).toEqual([])
  })
})
