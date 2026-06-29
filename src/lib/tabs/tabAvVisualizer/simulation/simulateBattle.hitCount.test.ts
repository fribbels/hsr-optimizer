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

describe('simulateBattle — CharacterBattleConfig.hitCounts (display-only)', () => {
  it('reports the configured hit count per ability, defaulting to 0 when omitted', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      hitCounts: { basic: 1 },   // skill/ult omitted -> default 0
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 1, unit: 'flat' }],
        skill: [{ type: 'energy_gain', targets: 'self', value: 1, unit: 'flat' }],
        ult: [],
      },
    })
    const overrides: ActionNodeOverride[] = [
      { characterId: 'A', actionIndex: 0, choice: 'basic' },
      { characterId: 'A', actionIndex: 1, choice: 'skill' },
    ]
    const result = simulateBattle([makeEntity('A', 100)], [], overrides, [], 250)
    const events = result.events.filter((e) => e.characterId === 'A')
    expect(events[0].hitCount).toBe(1)   // basic
    expect(events[1].hitCount).toBe(0)   // skill, omitted from hitCounts -> default 0
  })

  it('a basicVariant\'s own hitCount overrides the base abilities.basic hit count while it applies', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      hitCounts: { basic: 1 },
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 1, unit: 'flat' }],
        skill: [{
          type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0,
          effectId: 'epic', stackable: { maxStacks: 2 },
        }],
        ult: [],
      },
      basicVariants: [{
        requiresEffectId: 'epic',
        templates: [{ type: 'energy_gain', targets: 'self', value: 30, unit: 'flat' }],
        consumesStack: true,
        hitCount: 2,
      }],
    })
    const overrides: ActionNodeOverride[] = [
      { characterId: 'A', actionIndex: 0, choice: 'skill' },   // stack 史诗
      { characterId: 'A', actionIndex: 1, choice: 'basic' },   // enhanced: 2 hits
      { characterId: 'A', actionIndex: 2, choice: 'basic' },   // back to normal: 1 hit
    ]
    const result = simulateBattle([makeEntity('A', 100)], [], overrides, [], 350)
    const events = result.events.filter((e) => e.characterId === 'A')
    expect(events[1].hitCount).toBe(2)
    expect(events[2].hitCount).toBe(1)
  })
})
