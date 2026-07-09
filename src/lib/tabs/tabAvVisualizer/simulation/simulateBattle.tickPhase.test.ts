import type {
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

// Covers InterventionTemplate.tickPhase — same nominal durationTurns=2, granted at battle start, compared
// side by side: 'start' (e.g. Huohuo's Rangming) vs the default 'end' (everything else). Both tick once
// per the holder's own turn, but at opposite ends of it, so 'start' runs out one turn earlier than 'end'.
describe('simulateBattle — InterventionTemplate.tickPhase (start vs end buff duration ticking)', () => {
  it("a 'start'-phase buff is already gone before the turn it would expire on even begins", () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      onBattleStart: [
        { type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 2, effectId: 'start_buff', tickPhase: 'start' },
      ],
      abilities: { basic: [], skill: [], ult: [] },
    })
    const result = simulateBattle([makeEntity('A', 100)], [], [], [], 350)
    const events = result.events.filter((e) => e.characterId === 'A')

    // Turn 0: ticked 2 -> 1 before this turn's own choice even resolves -> stateBefore already shows 1.
    expect(events[0].stateBefore['A'].activeInterventions[0]?.remainingTurns).toBe(1)
    // Turn 1: ticked 1 -> 0 before this turn does anything -> already gone, not "active for one more turn".
    expect(events[1].stateBefore['A'].activeInterventions).toHaveLength(0)
  })

  it("a default ('end'-phase) buff stays fully active through its last turn, gone only starting the next", () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      onBattleStart: [
        { type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 2, effectId: 'end_buff' },
      ],
      abilities: { basic: [], skill: [], ult: [] },
    })
    const result = simulateBattle([makeEntity('A', 100)], [], [], [], 350)
    const events = result.events.filter((e) => e.characterId === 'A')

    // Turn 0: still 2 entering the turn (no 'start' tick touches it), ticks to 1 only at this turn's end.
    expect(events[0].stateBefore['A'].activeInterventions[0]?.remainingTurns).toBe(2)
    expect(events[0].stateAfter['A'].activeInterventions[0]?.remainingTurns).toBe(1)
    // Turn 1: still active entering the turn (1, not gone) — this is the "one extra turn" vs 'start'.
    expect(events[1].stateBefore['A'].activeInterventions).toHaveLength(1)
    expect(events[1].stateBefore['A'].activeInterventions[0]?.remainingTurns).toBe(1)
    // Expires at this turn's own end.
    expect(events[1].stateAfter['A'].activeInterventions).toHaveLength(0)
  })
})
