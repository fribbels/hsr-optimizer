import type {
  BattleEntity,
  CharacterBattleConfig,
  WaveSeedState,
} from 'lib/tabs/tabAvVisualizer/types'
import {
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { simulateBattle } from './simulateBattle'

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

// Covers simulateBattle's seedState param — used when a Wave (混沌回忆换面) continues from a previous
// one's cut point: persistent resources (energy/buffs/team SP) carry over, but onBattleStart must NOT
// re-run (it's not a fresh battle start), and every character's queue position starts completely fresh
// from AV 0 (10000/currentSpd), not from wherever their action gauge happened to be at the cut point.
describe('simulateBattle — seedState (Wave continuation)', () => {
  it('uses the seeded energy/buffs/team SP instead of the normal onBattleStart baseline', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      customMaxEnergy: 100000,
      // If onBattleStart re-ran, this would add +9999 energy on top of the seed — used to prove it didn't.
      onBattleStart: [{ type: 'energy_gain', targets: 'self', value: 9999, unit: 'flat', scalesWithErr: false }],
      abilities: { basic: [], skill: [], ult: [] },
    })
    const seedState: WaveSeedState = {
      energyByChar: { A: 222 },
      activeInterventionsByChar: {
        A: [{
          id: 'seeded-buff', sourceCharacterId: 'A', sourceAbility: 'external', type: 'spd_up',
          value: 10, unit: 'percent', remainingTurns: 3, buffKind: 'direct',
        }],
      },
      teamSp: { sp: 4, spMax: 6 },
    }
    const result = simulateBattle([makeEntity('A', 100)], [], [], [], 150, seedState)
    expect(result.initialActiveInterventions['A']).toEqual(seedState.activeInterventionsByChar['A'])
    const firstEvent = result.events[0]
    expect(firstEvent.stateBefore['A'].energy).toBe(222)
    expect(firstEvent.teamStateBefore).toEqual({ sp: 4, spMax: 6 })
  })

  it('starts every character\'s next action fresh from AV 0 (10000/spd), not mid-gauge', () => {
    mockConfigs.set('A', {
      characterId: 'A', energyType: 'standard', abilities: { basic: [], skill: [], ult: [] },
    })
    const seedState: WaveSeedState = { energyByChar: {}, activeInterventionsByChar: {}, teamSp: { sp: 3, spMax: 5 } }
    const result = simulateBattle([makeEntity('A', 100)], [], [], [], 150, seedState)
    // spd 100 -> first action at AV 100, exactly as if this were a fresh battle start at AV 0.
    expect(result.events[0].av).toBe(100)
  })

  it('falls back to the normal onBattleStart baseline when no seedState is given', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      customMaxEnergy: 100000,
      onBattleStart: [{ type: 'energy_gain', targets: 'self', value: 50, unit: 'flat', scalesWithErr: false }],
      abilities: { basic: [], skill: [], ult: [] },
    })
    const result = simulateBattle([makeEntity('A', 100)], [], [], [], 150)
    // 50% of maxEnergy (no ultThreshold set) + the onBattleStart +50.
    expect(result.events[0].stateBefore['A'].energy).toBe(50000 + 50)
  })
})
