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

// Covers AbilityResolver — an ability computed live from the caster's own state (e.g. Saber's skill:
// a full branch between two different effect sets, not a single conditionally-scaled value), plus its
// afterEffects field, which resolves once this character's own queued next action is no longer pending
// (see QueueEntry.pending) so a self-targeting av_advance there can actually succeed.
describe('simulateBattle — AbilityResolver / afterEffects', () => {
  it('a self-pull in afterEffects succeeds, immediately chaining another action at the same AV', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      customMaxEnergy: 60,
      abilities: {
        basic: [],
        skill: (ctx) => ({
          templates: [{ type: 'energy_gain', targets: 'self', value: 30, unit: 'flat', scalesWithErr: false }],
          afterEffects: ctx.energy + 30 >= ctx.maxEnergy
            ? [{ type: 'av_advance', targets: 'self', value: 100, unit: 'percent' }]
            : [],
        }),
        ult: [],
      },
    })
    // Default start is 50% of customMaxEnergy = 30. 30 + 30 = 60 >= maxEnergy(60) -> afterEffects fires.
    const result = simulateBattle([makeEntity('A', 100)], [], [override(0, 'skill')], [], 500)
    const events = result.events.filter((e) => e.characterId === 'A')
    expect(events.length).toBeGreaterThanOrEqual(2)
    expect(events[1].av).toBe(events[0].av)
  })

  it('the same self-pull placed in templates (not afterEffects) is a no-op — still mid-resolution, pending', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      customMaxEnergy: 60,
      abilities: {
        basic: [],
        skill: () => ({
          templates: [
            { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat', scalesWithErr: false },
            { type: 'av_advance', targets: 'self', value: 100, unit: 'percent' },
          ],
        }),
        ult: [],
      },
    })
    const result = simulateBattle([makeEntity('A', 100)], [], [override(0, 'skill')], [], 500)
    const events = result.events.filter((e) => e.characterId === 'A')
    expect(events.length).toBeGreaterThanOrEqual(2)
    expect(events[1].av).not.toBe(events[0].av)
  })
})
