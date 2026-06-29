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

// Covers CharacterBattleConfig.actionLock actually driving the engine's resolved effectiveChoice (not
// just ActionConfigPanel's display) — e.g. Gilgamesh: locked to Skill once Interest Piqued is held, with
// no free-choice state at all. Before this fix, the lock was UI-only: the engine kept resolving to
// whatever the saved override said (defaulting to Basic), so the locked ability's own effects (and any
// clear_buff inside them) never actually ran.
describe('simulateBattle — CharacterBattleConfig.actionLock drives the actual resolved choice', () => {
  it('overrides a manually-saved choice that no longer matches the lock', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      onBattleStart: [
        { type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'locked_marker', stackable: { maxStacks: 1 } },
      ],
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 20, unit: 'flat', scalesWithErr: false }],
        skill: [
          { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat', scalesWithErr: false },
          { type: 'clear_buff', targets: 'self', effectId: 'locked_marker' },
        ],
        ult: [],
      },
      actionLock: (ctx) => ctx.activeInterventions.some((b) => b.effectId === 'locked_marker') ? 'skill' : 'basic',
    })
    // The saved override explicitly says 'basic' — the lock should win anyway.
    const result = simulateBattle([makeEntity('A', 100)], [], [override(0, 'basic')], [], 150)
    const event = result.events.find((e) => e.characterId === 'A')!
    expect(event.actionChoice).toBe('skill')
    // +30 from skill, not +20 from basic — and the marker is cleared since skill's own effect ran.
    expect(event.stateAfter['A'].energy).toBe(80)
    expect(event.stateAfter['A'].activeInterventions.find((b) => b.effectId === 'locked_marker')).toBeUndefined()
  })

  it('falls back to the override when actionLock returns undefined (no lock active)', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 20, unit: 'flat', scalesWithErr: false }],
        skill: [{ type: 'energy_gain', targets: 'self', value: 30, unit: 'flat', scalesWithErr: false }],
        ult: [],
      },
      actionLock: () => undefined,
    })
    const result = simulateBattle([makeEntity('A', 100)], [], [override(0, 'skill')], [], 150)
    const event = result.events.find((e) => e.characterId === 'A')!
    expect(event.actionChoice).toBe('skill')
    expect(event.stateAfter['A'].energy).toBe(80)
  })
})
