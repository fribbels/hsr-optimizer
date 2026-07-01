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

// Same mocking approach as simulateBattle.conditionAndListeners.test.ts.
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
  setGameMetadata({
    characters: {
      A: { max_sp: 100 },
      B: { max_sp: 100 },
      C: { max_sp: 100 },
    },
  } as unknown as DBMetadata)
})

describe('simulateBattle — stack-based buffs (InterventionTemplate.stackable)', () => {
  it('re-applying a stackable effectId increments stacks instead of duplicating entries, capped at maxStacks', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [],
        skill: [{
          type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0,
          effectId: 'epic', stackable: { maxStacks: 2 },
        }],
        ult: [],
      },
    })
    // 3 skill casts in a row — same speed for all, so 3 actions resolve within totalAv
    const overrides: ActionNodeOverride[] = [
      override('A', 0, 'skill'),
      override('A', 1, 'skill'),
      override('A', 2, 'skill'),
    ]
    const result = simulateBattle([makeEntity('A', 100)], [], overrides, [], 350)
    const aEvents = result.events.filter((e) => e.characterId === 'A')
    expect(aEvents.length).toBe(3)

    const epicBuffs = (idx: number) =>
      aEvents[idx].stateAfter['A'].activeInterventions.filter((b) => b.effectId === 'epic')

    expect(epicBuffs(0)).toHaveLength(1)
    expect(epicBuffs(0)[0].stacks).toBe(1)
    expect(epicBuffs(1)).toHaveLength(1)
    expect(epicBuffs(1)[0].stacks).toBe(2)
    // 3rd cast: still only 1 entry, capped at maxStacks (2), not 3
    expect(epicBuffs(2)).toHaveLength(1)
    expect(epicBuffs(2)[0].stacks).toBe(2)
  })
})

describe('simulateBattle — basicVariants (conditional ability switching + stack consumption)', () => {
  it('basic uses the matching variant while the required buff is stacked, and consumes 1 stack per use', () => {
    // max_sp set high so successive +30 gains never clip against the energy cap, which would otherwise
    // make a capped enhanced gain indistinguishable from an uncapped normal one.
    setGameMetadata({ characters: { A: { max_sp: 1000 } } } as unknown as DBMetadata)
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 20, unit: 'flat' }],
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
      }],
    })
    // skill, skill (2 stacks of 史诗) -> basic, basic (each consumes 1 stack, enhanced) -> basic (back to normal)
    const overrides: ActionNodeOverride[] = [
      override('A', 0, 'skill'),
      override('A', 1, 'skill'),
      override('A', 2, 'basic'),
      override('A', 3, 'basic'),
      override('A', 4, 'basic'),
    ]
    const result = simulateBattle([makeEntity('A', 100)], [], overrides, [], 600)
    const aEvents = result.events.filter((e) => e.characterId === 'A')
    expect(aEvents.length).toBe(5)

    const energyGainAt = (idx: number) => aEvents[idx].stateAfter['A'].energy - aEvents[idx].stateBefore['A'].energy
    // basic #1 (actionIndex 2): enhanced variant (+30), consumes 1 stack (2 -> 1)
    expect(energyGainAt(2)).toBe(30)
    expect(aEvents[2].stateAfter['A'].activeInterventions.find((b) => b.effectId === 'epic')?.stacks).toBe(1)
    // basic #2 (actionIndex 3): still enhanced (+30), consumes last stack (1 -> 0, buff removed)
    expect(energyGainAt(3)).toBe(30)
    expect(aEvents[3].stateAfter['A'].activeInterventions.find((b) => b.effectId === 'epic')).toBeUndefined()
    // basic #3 (actionIndex 4): no stacks left, falls back to normal basic (+20)
    expect(energyGainAt(4)).toBe(20)
  })
})

describe('simulateBattle — exclusiveEffectId (global single-holder buffs)', () => {
  it('re-applying an exclusive effectId to a new target strips it from whoever held it before, anywhere on the field', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [],
        skill: [{
          type: 'stat_buff', targets: 'single_ally', stat: 'TRUE_DMG', value: 30, unit: 'percent',
          durationTurns: 3, effectId: 'mimi_cheer', exclusiveEffectId: true,
        }],
        ult: [],
      },
    })
    const overrides: ActionNodeOverride[] = [
      override('A', 0, 'skill'),
      override('A', 1, 'skill'),
    ]
    // First skill targets B, second skill (re-cast) targets C — B should lose the buff, C should gain it
    const actionOverridesWithTargets: ActionNodeOverride[] = [
      { ...overrides[0], targets: ['B'] },
      { ...overrides[1], targets: ['C'] },
    ]
    const entities = [makeEntity('A', 100), makeEntity('B', 100), makeEntity('C', 100)]
    const result = simulateBattle(entities, [], actionOverridesWithTargets, [], 250)
    const aEvents = result.events.filter((e) => e.characterId === 'A')
    expect(aEvents.length).toBe(2)

    // After the 2nd cast (targeting C): B no longer holds it, C does.
    const afterSecond = aEvents[1].stateAfter
    expect(afterSecond['B'].activeInterventions.some((b) => b.effectId === 'mimi_cheer')).toBe(false)
    expect(afterSecond['C'].activeInterventions.some((b) => b.effectId === 'mimi_cheer')).toBe(true)
  })
})

describe('simulateBattle — valueScaling (per-target continuous value computation)', () => {
  it('scales the buff value by how far the target exceeds the baseline metric, capped at maxBonus', () => {
    setGameMetadata({
      characters: {
        A: { max_sp: 100 },
        B: { max_sp: 160 },   // 60 over baseline 100 -> floor(60/10)*2 = 12% bonus
        C: { max_sp: 100 },   // exactly baseline -> no bonus
      },
    } as unknown as DBMetadata)
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [],
        skill: [{
          type: 'stat_buff', targets: 'all_allies_except_self', stat: 'TRUE_DMG', value: 30, unit: 'percent',
          durationTurns: 3,
          valueScaling: { metric: 'maxEnergy', baseline: 100, perUnit: 2, unitSize: 10, maxBonus: 20 },
        }],
        ult: [],
      },
    })
    const overrides: ActionNodeOverride[] = [override('A', 0, 'skill')]
    const entities = [makeEntity('A', 100), makeEntity('B', 100), makeEntity('C', 100)]
    const result = simulateBattle(entities, [], overrides, [], 150)
    const aEvent = result.events.find((e) => e.characterId === 'A')!

    const bBuff = aEvent.stateAfter['B'].activeInterventions.find((b) => b.stat === 'TRUE_DMG')
    const cBuff = aEvent.stateAfter['C'].activeInterventions.find((b) => b.stat === 'TRUE_DMG')
    expect(bBuff?.value).toBe(42)   // 30 base + 12 scaled
    expect(cBuff?.value).toBe(30)   // 30 base + 0 scaled
  })

  it('applies the extraCondition bonus on top of the base scaling when the target matches it', () => {
    setGameMetadata({
      characters: {
        A: { max_sp: 100 },
        D: { max_sp: 0 },   // matches extraCondition (maxEnergy === 0)
      },
    } as unknown as DBMetadata)
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [],
        skill: [{
          type: 'stat_buff', targets: 'all_allies_except_self', stat: 'TRUE_DMG', value: 30, unit: 'percent',
          durationTurns: 3,
          valueScaling: {
            metric: 'maxEnergy', baseline: 100, perUnit: 2, unitSize: 10, maxBonus: 20,
            extraCondition: { condition: { metric: 'maxEnergy', operator: 'eq', value: 0 }, bonus: 6 },
          },
        }],
        ult: [],
      },
    })
    const overrides: ActionNodeOverride[] = [override('A', 0, 'skill')]
    const entities = [makeEntity('A', 100), makeEntity('D', 100)]
    const result = simulateBattle(entities, [], overrides, [], 150)
    const aEvent = result.events.find((e) => e.characterId === 'A')!
    const dBuff = aEvent.stateAfter['D'].activeInterventions.find((b) => b.stat === 'TRUE_DMG')
    expect(dBuff?.value).toBe(36)   // 30 base + 0 scaled (0 doesn't exceed baseline) + 6 extraCondition
  })
})

describe('simulateBattle — GlobalListener.maxTriggersPerOwnTurn (rate-limited triggers)', () => {
  it('fires at most maxTriggersPerOwnTurn times, then resumes after the listener owner\'s own turn resets it', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: { basic: [{ type: 'energy_gain', targets: 'self', value: 1, unit: 'flat' }], skill: [], ult: [] },
      globalListeners: [{
        trigger: 'any_ally_action',
        condition: (ctx) => ctx.actingCharacterId !== ctx.selfId,
        effect: { type: 'energy_gain', targets: 'self', value: 8, unit: 'flat', scalesWithErr: false },
        maxTriggersPerOwnTurn: 1,
      }],
    })
    mockConfigs.set('B', {
      characterId: 'B',
      energyType: 'standard',
      abilities: { basic: [{ type: 'energy_gain', targets: 'self', value: 1, unit: 'flat' }], skill: [], ult: [] },
    })
    // B is much faster than A, so B acts many times between each of A's own turns.
    const entities = [makeEntity('A', 50), makeEntity('B', 200)]
    const result = simulateBattle(entities, [], [], [], 1000)

    const aGainsFromListener = result.events
      .filter((e) => e.characterId === 'B')
      .map((e, i, arr) => {
        // Read A's energy right after each of B's actions from the energyTimeline at that AV.
        const checkpoint = result.energyTimeline.find((c) => c.av === e.av)
        return checkpoint?.energyMap['A'] ?? 0
      })

    // Between A's own two consecutive turns, B acts multiple times (B is 4x A's speed) — but A's energy
    // should only jump by +8 (the listener firing) once per A turn-cycle, not once per B action.
    const aTurnAvs = result.events.filter((e) => e.characterId === 'A').map((e) => e.av)
    expect(aTurnAvs.length).toBeGreaterThan(1)

    const energyAtAv = (av: number) => result.energyTimeline.filter((c) => c.av <= av).at(-1)?.energyMap['A'] ?? 0
    const firstTurnEnergy = energyAtAv(aTurnAvs[0])
    const justBeforeSecondTurn = energyAtAv(aTurnAvs[1] - 0.001)
    // From right after A's 1st turn to right before A's 2nd turn, B acts 4 times — listener should have
    // fired at most once (+8), not 4 times (+32).
    expect(justBeforeSecondTurn - firstTurnEnergy).toBeLessThanOrEqual(8)
  })
})

describe('simulateBattle — GlobalListenerContext.actingCharacterType', () => {
  it('lets a condition exclude memosprite actions from triggering the listener (e.g. Trailblazer-Remembrance E2)', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [] },
      globalListeners: [{
        trigger: 'any_ally_action',
        condition: (ctx) => ctx.actingCharacterId !== ctx.selfId && ctx.actingCharacterType !== 'memosprite',
        effect: { type: 'energy_gain', targets: 'self', value: 8, unit: 'flat', scalesWithErr: false },
      }],
    })
    const entities: BattleEntity[] = [
      makeEntity('A', 100),
      { id: 'A_mimi', type: 'memosprite', ownerId: 'A', name: 'Mimi', baseSpd: 100, spd: 100, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
      makeEntity('B', 100),
    ]
    const result = simulateBattle(entities, [], [], [], 150)

    const lastCheckpoint = result.energyTimeline.at(-1)!
    // B (a normal character) acting should trigger the listener once; A_mimi (a memosprite) acting
    // should not — only +8 total, not +16.
    expect(lastCheckpoint.energyMap['A']).toBe(58)
  })
})

describe('simulateBattle — GlobalListenerContext.actingAbility', () => {
  it('lets a condition require a specific ability type (e.g. Trailblazer-Remembrance E4: basic/skill/ult only)', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [] },
      globalListeners: [{
        trigger: 'any_ally_action',
        condition: (ctx) => ctx.actingCharacterId !== ctx.selfId
          && (ctx.actingAbility === 'basic' || ctx.actingAbility === 'skill' || ctx.actingAbility === 'ult'),
        effect: { type: 'energy_gain', targets: 'self', value: 8, unit: 'flat', scalesWithErr: false },
      }],
    })
    mockConfigs.set('B', {
      characterId: 'B',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [] },
    })
    const overrides: ActionNodeOverride[] = [override('B', 0, 'skill')]
    const entities = [makeEntity('A', 100), makeEntity('B', 100)]
    const result = simulateBattle(entities, [], overrides, [], 150)

    const lastCheckpoint = result.energyTimeline.at(-1)!
    expect(lastCheckpoint.energyMap['A']).toBe(58)   // B's skill counts -> +8
  })
})

describe('simulateBattle — alsoTargetRelated (companion/owner relationship targeting)', () => {
  it('extends a buff to the target\'s companion when the target owns one', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [],
        // Targets B directly; alsoTargetRelated should also reach B's companion (B_mimi)
        skill: [{
          type: 'stat_buff', targets: 'single_ally', stat: 'CR', value: 10, unit: 'percent', durationTurns: 3,
          fixedTargetId: 'B', alsoTargetRelated: 'companion_and_owner',
        }],
        ult: [],
      },
    })
    const entities: BattleEntity[] = [
      makeEntity('A', 100),
      makeEntity('B', 100),
      { id: 'B_mimi', type: 'memosprite', ownerId: 'B', name: 'Mimi', baseSpd: 100, spd: 100, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
    ]
    const overrides: ActionNodeOverride[] = [override('A', 0, 'skill')]
    const result = simulateBattle(entities, [], overrides, [], 150)

    const aEvent = result.events.find((e) => e.characterId === 'A')!
    expect(aEvent.stateAfter['B'].activeInterventions.some((b) => b.stat === 'CR')).toBe(true)
    expect(aEvent.stateAfter['B_mimi'].activeInterventions.some((b) => b.stat === 'CR')).toBe(true)
  })

  it('extends a buff to the owner when the target itself is a companion', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [],
        skill: [{
          type: 'stat_buff', targets: 'single_ally', stat: 'CR', value: 10, unit: 'percent', durationTurns: 3,
          fixedTargetId: 'B_mimi', alsoTargetRelated: 'companion_and_owner',
        }],
        ult: [],
      },
    })
    const entities: BattleEntity[] = [
      makeEntity('A', 100),
      makeEntity('B', 100),
      { id: 'B_mimi', type: 'memosprite', ownerId: 'B', name: 'Mimi', baseSpd: 100, spd: 100, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
    ]
    const overrides: ActionNodeOverride[] = [override('A', 0, 'skill')]
    const result = simulateBattle(entities, [], overrides, [], 150)

    const aEvent = result.events.find((e) => e.characterId === 'A')!
    expect(aEvent.stateAfter['B_mimi'].activeInterventions.some((b) => b.stat === 'CR')).toBe(true)
    expect(aEvent.stateAfter['B'].activeInterventions.some((b) => b.stat === 'CR')).toBe(true)
  })
})
