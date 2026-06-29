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

// Same mocking approach as simulateBattle.conditionAndListeners.test.ts — getBattleConfig reads from a
// module-load-time registry, so a fake test character's config has to go through a mocked module.
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
    characters: {
      A: { max_sp: 100 },
      B: { max_sp: 100 },
    },
  } as unknown as DBMetadata)
})

describe('simulateBattle — non-character entity types (memosprite/summon/marker)', () => {
  it('a marker entity gets its own turns on the timeline, advancing purely by its own speed', () => {
    const entities = [makeEntity('A', 100), makeEntity('A_marker', 50, 'marker', 'A')]
    const result = simulateBattle(entities, [], [], [], 300)

    const markerEvents = result.events.filter((e) => e.characterId === 'A_marker')
    // spd 50 -> first action at av = 10000/50 = 200, second at 400 (beyond totalAv=300, so just 1 event)
    expect(markerEvents.length).toBe(1)
    expect(markerEvents[0].av).toBeCloseTo(200, 5)
    // No energy/buff state of its own
    expect(markerEvents[0].stateBefore).toEqual({})
    expect(markerEvents[0].stateAfter).toEqual({})
  })

  it('a summon entity ticks on its own speed but never triggers ability templates or energy gain', () => {
    mockConfigs.set('A_summon', {
      characterId: 'A_summon',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 999, unit: 'flat' }],
        skill: [],
        ult: [],
      },
    })
    const entities = [makeEntity('A', 100), makeEntity('A_summon', 100, 'summon', 'A')]
    const result = simulateBattle(entities, [], [], [], 250)

    const summonEvents = result.events.filter((e) => e.characterId === 'A_summon')
    expect(summonEvents.length).toBeGreaterThan(0)
    // Even though A_summon's mocked config defines an energy_gain basic, summons never act —
    // confirm no energy state was ever created for it.
    for (const checkpoint of result.energyTimeline) {
      expect(checkpoint.energyMap['A_summon']).toBeUndefined()
    }
  })

  it('a memosprite acts like a full character: own energy, own abilities, valid ability target', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        // stat_buff (not energy_gain — memosprites are deliberately excluded from energy effects, see
        // simulateBattle.buffSystem.test.ts) targeting all_allies should still reach the memosprite,
        // confirming it's a normal, valid ability target unlike summons/markers.
        basic: [{
          type: 'stat_buff', targets: 'all_allies', stat: 'CD', value: 10, unit: 'percent', durationTurns: 2,
        }],
        skill: [],
        ult: [],
      },
    })
    const entities = [makeEntity('A', 100), makeEntity('A_mimi', 130, 'memosprite', 'A')]
    const result = simulateBattle(entities, [], [], [], 150)

    const aEvent = result.events.find((e) => e.characterId === 'A')!
    expect(aEvent.stateAfter['A_mimi'].activeInterventions.some((b) => b.stat === 'CD')).toBe(true)
  })

  it('summon/marker are excluded from all_allies target resolution', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'all_allies', value: 10, unit: 'flat' }],
        skill: [],
        ult: [],
      },
    })
    const entities = [
      makeEntity('A', 100),
      makeEntity('A_summon', 100, 'summon', 'A'),
      makeEntity('A_marker', 100, 'marker', 'A'),
    ]
    const result = simulateBattle(entities, [], [], [], 150)

    for (const checkpoint of result.energyTimeline) {
      expect(checkpoint.energyMap['A_summon']).toBeUndefined()
      expect(checkpoint.energyMap['A_marker']).toBeUndefined()
    }
  })

  it('speed buffs can still affect a summon/marker even though it cannot be an ability target', () => {
    // spd_up only resolves via 'self'/'single_ally'/'all_allies' targeting which already excludes
    // summon/marker — but a manually-added global Intervention can target any id directly, confirming
    // the underlying CharState/AV-gauge math still works for non-acting entities.
    const entities = [makeEntity('A', 100), makeEntity('A_marker', 100, 'marker', 'A')]
    const interventions = [{
      id: 'iv1',
      triggerAv: 0,
      type: 'spd_up' as const,
      targets: ['A_marker'],
      value: 50,
      unit: 'percent' as const,
      durationTurns: 5,
    }]
    const result = simulateBattle(entities, interventions, [], [], 250)

    const markerEvents = result.events.filter((e) => e.characterId === 'A_marker')
    // With +50% speed (150 effective), first action av = 10000/150 ≈ 66.67, well before the
    // un-buffed 100-speed value of 100 would have landed.
    expect(markerEvents[0].av).toBeCloseTo(10000 / 150, 2)
  })
})
