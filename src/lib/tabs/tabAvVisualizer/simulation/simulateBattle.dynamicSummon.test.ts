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

function override(characterId: string, actionIndex: number, choice: 'basic' | 'skill'): ActionNodeOverride {
  return { characterId, actionIndex, choice }
}

beforeEach(() => {
  mockConfigs.clear()
  setGameMetadata({ characters: { A: { max_sp: 100 } } } as unknown as DBMetadata)
})

describe('simulateBattle — dynamic companion summoning (summon_companion / onCompanionSummon)', () => {
  it('spawns the companion mid-battle, firing its own onBattleStart and the owner\'s onCompanionSummon exactly once', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      companion: { type: 'memosprite', characterId: 'A_mimi', baseSpd: 130, presentFromStart: false },
      onCompanionSummon: [{
        type: 'energy_gain', targets: 'self', fixedTargetId: 'A_mimi', value: 40, unit: 'percent', scalesWithErr: false,
      }],
      abilities: {
        basic: [],
        // 如果已经在场就充能10%（放在前面，判断的是召唤之前的状态），否则召唤她
        skill: [
          {
            type: 'energy_gain', targets: 'self', fixedTargetId: 'A_mimi', value: 10, unit: 'percent', scalesWithErr: false,
            condition: { metric: 'entityPresent', operator: 'eq', value: 1 },
          },
          { type: 'summon_companion' },
        ],
        ult: [],
      },
    })
    mockConfigs.set('A_mimi', {
      characterId: 'A_mimi',
      energyType: 'standard',
      customMaxEnergy: 1000,
      abilities: { basic: [], skill: [], ult: [] },
      onBattleStart: [{ type: 'energy_gain', targets: 'self', value: 50, unit: 'percent', scalesWithErr: false }],
    })

    // A_mimi is deliberately NOT in `entities` — presentFromStart:false means she doesn't exist yet.
    const entities = [makeEntity('A', 100)]
    const overrides: ActionNodeOverride[] = [
      override('A', 0, 'skill'),   // not present yet -> charge skipped, summon fires
      override('A', 1, 'skill'),   // now present -> charge fires, summon is a no-op
    ]
    const result = simulateBattle(entities, [], overrides, [], 250)

    const aEvents = result.events.filter((e) => e.characterId === 'A')
    expect(aEvents).toHaveLength(2)

    // After the 1st skill: Mimi's own onBattleStart (+50%) and A's onCompanionSummon (+40%) both fired
    // exactly once -> 900, not double-counted.
    expect(aEvents[0].stateAfter['A_mimi'].energy).toBe(900)
    // After the 2nd skill: present already, so this time the charge-if-present branch fires (+10% of
    // 1000 = 100) and summon_companion is a no-op (no second onBattleStart/onCompanionSummon).
    expect(aEvents[1].stateAfter['A_mimi'].energy).toBe(1000)

    // She actually joined the AV queue and got her own turn.
    const mimiEvents = result.events.filter((e) => e.characterId === 'A_mimi')
    expect(mimiEvents.length).toBeGreaterThan(0)
    // Her first action lands at (the AV she was summoned at) + 10000/her speed.
    const summonAv = aEvents[0].av
    expect(mimiEvents[0].av).toBeCloseTo(summonAv + 10000 / 130, 5)
  })

  it('a presentFromStart companion is unaffected — summon_companion on her is a no-op from the very first action', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      companion: { type: 'memosprite', characterId: 'A_mimi', baseSpd: 130 },   // presentFromStart defaults true
      // Deliberately small (not the real spec's 40%) so it's distinguishable from the cap rather than
      // both landing on the same saturated value.
      onCompanionSummon: [{
        type: 'energy_gain', targets: 'self', fixedTargetId: 'A_mimi', value: 5, unit: 'percent', scalesWithErr: false,
      }],
      abilities: { basic: [], skill: [{ type: 'summon_companion' }], ult: [] },
    })
    mockConfigs.set('A_mimi', {
      characterId: 'A_mimi',
      energyType: 'standard',
      customMaxEnergy: 1000,
      abilities: { basic: [], skill: [], ult: [] },
      onBattleStart: [{ type: 'energy_gain', targets: 'self', value: 5, unit: 'percent', scalesWithErr: false }],
    })

    // This time she IS pre-declared in entities, simulating presentFromStart:true wiring from AvVisualizerTab.
    const entities: BattleEntity[] = [
      makeEntity('A', 100),
      { id: 'A_mimi', type: 'memosprite', ownerId: 'A', name: 'Mimi', baseSpd: 130, spd: 130, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
    ]
    const overrides: ActionNodeOverride[] = [override('A', 0, 'skill')]
    const result = simulateBattle(entities, [], overrides, [], 150)

    // Initial energy (50% of 1000 = 500) + AV=0 onBattleStart (+5% = 50) = 550. The skill's
    // summon_companion call should find her already present and do nothing further (no +5% onCompanionSummon
    // on top, which would otherwise push it to 600).
    const aEvent = result.events.find((e) => e.characterId === 'A')!
    expect(aEvent.stateAfter['A_mimi'].energy).toBe(550)
  })
})

describe('simulateBattle — global listeners fire before this action\'s own templates', () => {
  it('a companion summoned partway through this action does not retroactively receive an energy conversion from this same action\'s global-listener-triggered gain', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      companion: { type: 'memosprite', characterId: 'A_mimi', baseSpd: 130, presentFromStart: false },
      onAllyEnergyGain: { ratioPercent: 0.1, fixedTargetId: 'A_mimi' },
      abilities: {
        basic: [],
        skill: [
          { type: 'summon_companion' },
          { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat' },
        ],
        ult: [],
      },
    })
    mockConfigs.set('B', {
      characterId: 'B',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [] },
      // Huohuo-style: any ally action (including A's) restores B 2 energy.
      globalListeners: [{
        trigger: 'any_ally_action',
        condition: () => true,
        effect: { type: 'energy_gain', targets: 'self', value: 2, unit: 'flat' },
      }],
    })
    mockConfigs.set('A_mimi', {
      characterId: 'A_mimi',
      energyType: 'standard',
      customMaxEnergy: 100,
      abilities: { basic: [], skill: [], ult: [] },
      // No onBattleStart self-charge here — isolates the test to just the listener-ordering question.
    })

    const entities = [makeEntity('A', 100), makeEntity('B', 200)]
    const overrides: ActionNodeOverride[] = [override('A', 0, 'skill')]
    const result = simulateBattle(entities, [], overrides, [], 150)

    const aEvent = result.events.find((e) => e.characterId === 'A')!
    // B's listener-triggered +2 fires BEFORE A's own templates (including summon_companion) resolve, so
    // A_mimi doesn't exist yet at that point — that +2 contributes nothing to her. Only A's own +30
    // self-gain (which resolves after she's been summoned) converts: 30 * 0.1% = 3.
    expect(aEvent.stateAfter['A_mimi'].energy).toBe(3)
    // B is faster than A, so by the time A acts, B has already had her own turn — which (condition is
    // unconditionally true here) also triggered her own listener once. 50 initial + 2 (her own turn) +
    // 2 (A's turn) = 54.
    expect(aEvent.stateAfter['B'].energy).toBe(54)
  })
})
