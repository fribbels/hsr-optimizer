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

// Covers the initial-energy baseline: 50% of ultThreshold (what's actually needed to cast the Ultimate),
// not 50% of maxEnergy/customMaxEnergy itself — those differ for an overflow-style energy cap (e.g.
// Saber: 480/560 maxEnergy vs 360 ultThreshold) where the 50% starting point should still be relative to
// the 360, not the inflated cap.
describe('simulateBattle — initial energy is 50% of ultThreshold, not 50% of maxEnergy', () => {
  it('uses 50% of ultThreshold when it differs from customMaxEnergy', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      customMaxEnergy: 480,
      ultThreshold: 360,
      abilities: { basic: [], skill: [], ult: [] },
    })
    const result = simulateBattle([makeEntity('A', 100)], [], [], [], 50)
    expect(result.energyTimeline[0].energyMap['A']).toBe(180)   // 360 * 50%, not 480 * 50% (240)
  })

  it('falls back to 50% of maxEnergy when ultThreshold is unset (the common case)', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      customMaxEnergy: 200,
      abilities: { basic: [], skill: [], ult: [] },
    })
    const result = simulateBattle([makeEntity('A', 100)], [], [], [], 50)
    expect(result.energyTimeline[0].energyMap['A']).toBe(100)   // 200 * 50%, unchanged from before
  })
})
