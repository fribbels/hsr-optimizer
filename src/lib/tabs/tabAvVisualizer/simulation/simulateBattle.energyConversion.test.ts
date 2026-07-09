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
  setGameMetadata({ characters: { A: { max_sp: 100 }, B: { max_sp: 100 } } } as unknown as DBMetadata)
})

describe('simulateBattle — CharacterBattleConfig.onAllyEnergyGain (talent-style energy conversion)', () => {
  it('converts a fraction of any ally\'s actual energy gain into a fixed charge for fixedTargetId', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      onAllyEnergyGain: { ratioPercent: 0.1, fixedTargetId: 'A_mimi' },   // every 10 energy -> 1% charge
      abilities: { basic: [{ type: 'energy_gain', targets: 'self', value: 10, unit: 'flat', scalesWithErr: false }], skill: [], ult: [] },
    })
    mockConfigs.set('A_mimi', {
      characterId: 'A_mimi',
      energyType: 'standard',
      customMaxEnergy: 1000,
      abilities: { basic: [], skill: [], ult: [] },
    })
    const entities: BattleEntity[] = [
      makeEntity('A', 100),
      { id: 'A_mimi', type: 'memosprite', ownerId: 'A', name: 'Mimi', baseSpd: 130, spd: 130, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
    ]
    const overrides: ActionNodeOverride[] = [{ characterId: 'A', actionIndex: 0, choice: 'basic' }]
    const result = simulateBattle(entities, [], overrides, [], 150)

    const aEvent = result.events.find((e) => e.characterId === 'A')!
    // A gains 10 flat energy -> Mimi gets 10 * 0.1 = 1% of her 1000 max = 10 flat charge, on top of her
    // initial 500 (50%).
    expect(aEvent.stateAfter['A_mimi'].energy).toBe(510)
    // A's own energy_gain is unaffected by the conversion.
    expect(aEvent.stateAfter['A'].energy).toBe(60)   // 50 initial + 10
  })

  it('also converts when a different ally (not the talent owner) gains energy', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      onAllyEnergyGain: { ratioPercent: 0.1, fixedTargetId: 'A_mimi' },
      abilities: { basic: [], skill: [], ult: [] },
    })
    mockConfigs.set('B', {
      characterId: 'B',
      energyType: 'standard',
      abilities: { basic: [{ type: 'energy_gain', targets: 'self', value: 35, unit: 'flat', scalesWithErr: false }], skill: [], ult: [] },
    })
    mockConfigs.set('A_mimi', {
      characterId: 'A_mimi',
      energyType: 'standard',
      customMaxEnergy: 1000,
      abilities: { basic: [], skill: [], ult: [] },
    })
    const entities: BattleEntity[] = [
      makeEntity('A', 100),
      makeEntity('B', 200),
      { id: 'A_mimi', type: 'memosprite', ownerId: 'A', name: 'Mimi', baseSpd: 130, spd: 130, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
    ]
    const overrides: ActionNodeOverride[] = [{ characterId: 'B', actionIndex: 0, choice: 'basic' }]
    const result = simulateBattle(entities, [], overrides, [], 100)

    const bEvent = result.events.find((e) => e.characterId === 'B')!
    // B gains 35 -> 35 * 0.1 = 3.5% of 1000 = 35 flat charge for Mimi (matches the spec's own example).
    expect(bEvent.stateAfter['A_mimi'].energy).toBe(535)
  })

  it('does not recurse — the conversion landing on fixedTargetId itself does not trigger further conversion', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      onAllyEnergyGain: { ratioPercent: 0.5, fixedTargetId: 'A_mimi' },
      abilities: { basic: [{ type: 'energy_gain', targets: 'self', value: 10, unit: 'flat', scalesWithErr: false }], skill: [], ult: [] },
    })
    mockConfigs.set('A_mimi', {
      characterId: 'A_mimi',
      energyType: 'standard',
      customMaxEnergy: 10000,   // large enough that nothing here is about hitting the cap
      abilities: { basic: [], skill: [], ult: [] },
    })
    const entities: BattleEntity[] = [
      makeEntity('A', 100),
      { id: 'A_mimi', type: 'memosprite', ownerId: 'A', name: 'Mimi', baseSpd: 130, spd: 130, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
    ]
    const overrides: ActionNodeOverride[] = [{ characterId: 'A', actionIndex: 0, choice: 'basic' }]
    const result = simulateBattle(entities, [], overrides, [], 150)

    const aEvent = result.events.find((e) => e.characterId === 'A')!
    // A gains 10 -> Mimi gets 10 * 0.5 = 5% of 10000 = 500 flat. If the conversion recursed on itself,
    // Mimi's own +500 gain would try to convert again (500 * 0.5% = 2.5% more), which this asserts didn't happen.
    expect(aEvent.stateAfter['A_mimi'].energy).toBe(5000 + 500)   // initial 50% (5000) + 500, nothing more
  })
})
