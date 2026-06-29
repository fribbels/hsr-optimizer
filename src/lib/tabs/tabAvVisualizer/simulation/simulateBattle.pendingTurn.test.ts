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

// Covers the general "QueueEntry.pending" mechanism — a character's own already-queued next action is
// marked pending the moment their current turn begins, and stays pending until that whole turn (during-
// action ults, own templates, listeners, after-action ults) fully resolves. Nothing that happens during
// that window can advance/delay/pull that pending entry, since there's no meaningful "earlier" relative
// to a turn that's already underway.
describe('simulateBattle — pending queue entry (own turn cannot advance/pull itself)', () => {
  it('a self-targeting 100% av_advance fired during one\'s own turn is a no-op, not a same-AV double action', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        // Mirrors a Robin-style "advance everyone's action" effect landing on the caster herself.
        basic: [{ type: 'av_advance', targets: 'self', value: 100, unit: 'percent' }],
        skill: [], ult: [],
      },
    })
    const entities = [makeEntity('A', 100)]
    const result = simulateBattle(entities, [], [], [], 350)
    const events = result.events.filter((e) => e.characterId === 'A')

    // Without the pending guard, the 100% self-advance would snap A's own next action to literally the
    // same AV as the one currently resolving, producing a spurious immediate double action.
    const avs = events.map((e) => e.av)
    expect(new Set(avs).size).toBe(avs.length)   // every action lands at a distinct AV
    expect(avs).toEqual([100, 200, 300])         // normal SPD=100 cadence, untouched
  })

  it('a self-targeting av_advance from a listener reacting to one\'s own action is also a no-op', () => {
    // B reacts to "any ally acts" (including herself) by trying to advance her own next action — same
    // shape as Huohuo's "any ally acts" passive, just targeting the listener owner's own AV instead of
    // energy. Exercises runGlobalListeners' call path specifically, not just resolveAndApplyTemplates'.
    mockConfigs.set('B', {
      characterId: 'B',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [] },
      globalListeners: [{
        trigger: 'any_ally_action',
        condition: () => true,
        effect: { type: 'av_advance', targets: 'self', value: 100, unit: 'percent' },
      }],
    })
    const entities = [makeEntity('B', 100)]
    const result = simulateBattle(entities, [], [], [], 350)
    const events = result.events.filter((e) => e.characterId === 'B')

    const avs = events.map((e) => e.av)
    expect(new Set(avs).size).toBe(avs.length)
    expect(avs).toEqual([100, 200, 300])
  })
})
