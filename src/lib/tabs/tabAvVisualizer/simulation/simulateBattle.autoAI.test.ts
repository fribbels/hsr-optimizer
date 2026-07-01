import { setGameMetadata } from 'lib/state/gameMetadata'
import type {
  ActionNodeOverride,
  BattleEntity,
  CharacterBattleConfig,
} from 'lib/tabs/tabAvVisualizer/types'
import {
  beforeEach,
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

beforeEach(() => {
  mockConfigs.clear()
  setGameMetadata({ characters: { A: { max_sp: 100 } } } as unknown as DBMetadata)
})

describe('simulateBattle — CharacterBattleConfig.autoActsOnOwnEnergy', () => {
  it('auto-picks basic below max energy and skill at/above max, ignoring any user override', () => {
    mockConfigs.set('A_mimi', {
      characterId: 'A_mimi',
      energyType: 'standard',
      customMaxEnergy: 100,
      autoActsOnOwnEnergy: true,
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 20, unit: 'flat', scalesWithErr: false }],
        skill: [{ type: 'energy_loss', targets: 'self', value: 100, unit: 'flat', scalesWithErr: false }],
        ult: [],
      },
    })
    // Deliberately try to force 'skill' via override on the very first action, even though her energy
    // (starts at 50%) is below max — the auto logic should ignore this and use 'basic' anyway.
    const overrides: ActionNodeOverride[] = [
      { characterId: 'A_mimi', actionIndex: 0, choice: 'skill' },
    ]
    const entities = [makeEntity('A_mimi', 100)]
    const result = simulateBattle(entities, [], overrides, [], 600)
    const events = result.events.filter((e) => e.characterId === 'A_mimi')

    // Start: 50. basic (+20) -> 70 (still < 100, stays basic). basic (+20) -> 90. basic (+20) -> 100
    // (now at max, becomes skill next turn). skill (-100) -> 0 (back to basic after).
    expect(events[0].actionChoice).toBe('basic')
    expect(events[0].stateAfter['A_mimi'].energy).toBe(70)
    expect(events[1].actionChoice).toBe('basic')
    expect(events[1].stateAfter['A_mimi'].energy).toBe(90)
    expect(events[2].actionChoice).toBe('basic')
    expect(events[2].stateAfter['A_mimi'].energy).toBe(100)
    expect(events[3].actionChoice).toBe('skill')   // now at max -> auto-skill, despite no override at all
    expect(events[3].stateAfter['A_mimi'].energy).toBe(0)
    expect(events[4].actionChoice).toBe('basic')   // back below max -> basic again
  })

  it('reaching max energy mid-battle immediately pulls the character\'s next queued action to now', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{
          type: 'energy_gain', targets: 'self', fixedTargetId: 'A_mimi', value: 100, unit: 'percent', scalesWithErr: false,
        }],
        skill: [], ult: [],
      },
    })
    mockConfigs.set('A_mimi', {
      characterId: 'A_mimi',
      energyType: 'standard',
      customMaxEnergy: 100,
      autoActsOnOwnEnergy: true,
      abilities: { basic: [], skill: [], ult: [] },
    })
    // Mimi is very slow (spd 10) -> without the pull, her first natural action would land at av=1000.
    // A is fast (spd 200) and immediately maxes her out on A's very first action (av=50).
    const entities = [makeEntity('A', 200), { id: 'A_mimi', type: 'memosprite' as const, ownerId: 'A', name: 'Mimi', baseSpd: 10, spd: 10, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 }]
    const result = simulateBattle(entities, [], [], [], 200)

    const aFirstAv = result.events.find((e) => e.characterId === 'A')!.av
    const mimiEvents = result.events.filter((e) => e.characterId === 'A_mimi')
    expect(mimiEvents.length).toBeGreaterThan(0)
    // Pulled to exactly when A's action maxed her out, not her natural av=1000.
    expect(mimiEvents[0].av).toBe(aFirstAv)
    expect(mimiEvents[0].actionChoice).toBe('skill')   // already at max by the time her (pulled) turn comes up
  })
})
