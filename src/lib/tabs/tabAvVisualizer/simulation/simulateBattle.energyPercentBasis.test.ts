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

// Covers an overflow-style character (e.g. Saber: 480/560 customMaxEnergy vs a 360 ultThreshold) on the
// RECEIVING end of another character's percent-based energy_gain (e.g. Huohuo's Ult: "restore 20%
// energy"). The 20% must be computed against the character's real "100%" reference (ultThreshold, same
// number their own starting-energy baseline already uses) — not their inflated overflow cap — while the
// cap itself still governs how high the resulting energy can actually go.
describe('simulateBattle — percent energy_gain uses percentBasis, not the overflow maxEnergy', () => {
  it('restores 20% of the real 360 threshold (72), not 20% of the 480 overflow cap (96)', () => {
    mockConfigs.set('Overflow', {
      characterId: 'Overflow',
      energyType: 'standard',
      customMaxEnergy: 480,
      ultThreshold: 360,
      ultEnergyCost: 360,
      abilities: { basic: [], skill: [], ult: [] },
    })
    mockConfigs.set('Healer', {
      characterId: 'Healer',
      energyType: 'standard',
      ultThreshold: 0,
      ultEnergyCost: 0,
      abilities: {
        basic: [], skill: [],
        ult: [{ type: 'energy_gain', targets: 'all_allies_except_self', value: 20, unit: 'percent', scalesWithErr: false }],
      },
    })
    const ult: UltInsertion = { id: 'ult1', casterId: 'Healer', timing: { type: 'at_av', av: 10 } }
    const result = simulateBattle([makeEntity('Overflow', 100), makeEntity('Healer', 100)], [], [], [ult], 150)
    const ultEvent = result.events.find((e) => e.turnKind === 'ult')!
    // Starting energy is 50% of the 360 threshold (180), +72 (20% of 360) = 252.
    expect(ultEvent.stateAfter['Overflow'].energy).toBe(252)
  })

  it('still clamps the result to the real overflow cap (480), not the 360 percent basis', () => {
    mockConfigs.set('Overflow', {
      characterId: 'Overflow',
      energyType: 'standard',
      customMaxEnergy: 480,
      ultThreshold: 360,
      ultEnergyCost: 360,
      abilities: { basic: [], skill: [], ult: [] },
    })
    mockConfigs.set('Healer', {
      characterId: 'Healer',
      energyType: 'standard',
      ultThreshold: 0,
      ultEnergyCost: 0,
      abilities: {
        basic: [], skill: [],
        // A large enough flat gain to push Overflow well past 360 — should cap at 480, not 360.
        ult: [{ type: 'energy_gain', targets: 'all_allies_except_self', value: 1000, unit: 'flat', scalesWithErr: false }],
      },
    })
    const ult: UltInsertion = { id: 'ult1', casterId: 'Healer', timing: { type: 'at_av', av: 10 } }
    const result = simulateBattle([makeEntity('Overflow', 100), makeEntity('Healer', 100)], [], [], [ult], 150)
    const ultEvent = result.events.find((e) => e.turnKind === 'ult')!
    expect(ultEvent.stateAfter['Overflow'].energy).toBe(480)
  })
})
