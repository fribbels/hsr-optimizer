import { setGameMetadata } from 'lib/state/gameMetadata'
import type { BattleEntity, CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'
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

function makeEntity(id: string, spd: number, type: BattleEntity['type'] = 'character', ownerId?: string): BattleEntity {
  return { id, type, ownerId, name: id, baseSpd: spd, spd, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 }
}

beforeEach(() => {
  mockConfigs.clear()
  setGameMetadata({
    characters: { A: { max_sp: 100 }, B: { max_sp: 100 } },
  } as unknown as DBMetadata)
})

describe('simulateBattle — fixedTargetId', () => {
  it('bypasses normal TargetType resolution and lands directly on the specified id', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        // targets:'self' would normally resolve to A, but fixedTargetId redirects it to A_mimi
        basic: [{ type: 'energy_gain', targets: 'self', fixedTargetId: 'A_mimi', value: 10, unit: 'flat', scalesWithErr: false }],
        skill: [],
        ult: [],
      },
    })
    const entities = [makeEntity('A', 100), makeEntity('A_mimi', 130, 'memosprite', 'A')]
    const result = simulateBattle(entities, [], [], [], 150)

    const lastCheckpoint = result.energyTimeline.at(-1)!
    expect(lastCheckpoint.energyMap['A_mimi']).toBe(60)   // 50 (initial 50%) + 10 flat
    expect(lastCheckpoint.energyMap['A']).toBe(50)        // untouched — basic's own energy effect went to Mimi instead
  })
})

describe('simulateBattle — memosprite energy exclusion', () => {
  it('excludes memosprites from all_allies energy_gain (cast by someone else), but not self-targeting or fixedTargetId', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'all_allies', value: 10, unit: 'flat', scalesWithErr: false }],
        skill: [],
        ult: [],
      },
    })
    const entities = [makeEntity('A', 100), makeEntity('A_mimi', 130, 'memosprite', 'A')]
    const result = simulateBattle(entities, [], [], [], 150)

    const lastCheckpoint = result.energyTimeline.at(-1)!
    expect(lastCheckpoint.energyMap['A']).toBe(60)         // A is a normal all_allies target
    expect(lastCheckpoint.energyMap['A_mimi']).toBe(50)    // excluded — still at initial 50%, untouched
  })

  it('a memosprite can still restore its own energy via a self-targeted ability', () => {
    mockConfigs.set('A_mimi', {
      characterId: 'A_mimi',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 15, unit: 'flat', scalesWithErr: false }],
        skill: [],
        ult: [],
      },
    })
    const entities = [makeEntity('A', 100), makeEntity('A_mimi', 100, 'memosprite', 'A')]
    const result = simulateBattle(entities, [], [], [], 150)

    const mimiEvent = result.events.find((e) => e.characterId === 'A_mimi')!
    expect(mimiEvent.stateAfter['A_mimi'].energy).toBe(65)   // 50 + 15, self-cast is exempt from the exclusion
  })
})

describe('simulateBattle — CharacterBattleConfig.customMaxEnergy', () => {
  it('overrides the game_data max_sp lookup for initial energy and the energy cap', () => {
    mockConfigs.set('A_mimi', {
      characterId: 'A_mimi',
      energyType: 'standard',
      customMaxEnergy: 8000,
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 90, unit: 'percent', scalesWithErr: false }],
        skill: [],
        ult: [],
      },
    })
    // No game_data entry at all for 'A_mimi' — would default to 100 without customMaxEnergy.
    const entities = [makeEntity('A', 100), makeEntity('A_mimi', 100, 'memosprite', 'A')]
    const result = simulateBattle(entities, [], [], [], 150)

    const mimiEvent = result.events.find((e) => e.characterId === 'A_mimi')!
    expect(mimiEvent.stateBefore['A_mimi'].energy).toBe(4000)   // 8000 * 50% initial energy
    // +90% of 8000 = 7200; 4000 + 7200 = 11200, capped at customMaxEnergy (8000), not the default-100 cap
    expect(mimiEvent.stateAfter['A_mimi'].energy).toBe(8000)
  })
})
