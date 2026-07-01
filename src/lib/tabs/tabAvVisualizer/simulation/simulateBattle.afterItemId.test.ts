import type {
  BattleEntity,
  CharacterBattleConfig,
  Intervention,
  UltInsertion,
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

function makeIv(id: string, patch: Partial<Intervention>): Intervention {
  return {
    id, triggerAv: 0, type: 'energy_gain', targets: ['A'], value: 0, unit: 'flat', durationTurns: 0, scalesWithErr: false,
    ...patch,
  }
}

function makeUlt(id: string, patch: Partial<UltInsertion>): UltInsertion {
  return { id, casterId: 'A', timing: { type: 'at_av', av: 0 }, ...patch }
}

// Covers Intervention.afterItemId / UltInsertion.afterItemId — lets an Intervention or Ult be spliced in
// at a precise point relative to a specific *other* item sharing the same anchor (instead of the old
// fixed two-step "all interventions, then all Ults" order), e.g. "A's turn, A's Ult, [intervention here],
// A's second Ult". Covers all three anchor types: after_action, during_action, at_av.
describe('simulateBattle — afterItemId precise interleaving', () => {
  it('after_action: splices an intervention between two stacked Ults via afterItemId', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 10, unit: 'flat', scalesWithErr: false }],
        skill: [],
        ult: [{ type: 'energy_gain', targets: 'self', value: 1000, unit: 'flat', scalesWithErr: false }],
      },
      ultThreshold: 0,
      ultEnergyCost: 0,
      customMaxEnergy: 100000,
    })
    const ult1 = makeUlt('ult1', { timing: { type: 'after_action', charId: 'A', actionIndex: 0 } })
    const ult2 = makeUlt('ult2', { timing: { type: 'after_action', charId: 'A', actionIndex: 0 } })
    // A's first action lands at AV 100 (spd=100) — triggerAv must match for this to actually be picked up
    // as "after this exact action" (see matchingAfterIvs' triggerAv === event.av check).
    const iv = makeIv('iv1', { value: 100, triggerAv: 100, afterCharId: 'A', afterActionIndex: 0, afterItemId: 'ult1' })

    const result = simulateBattle([makeEntity('A', 100)], [iv], [], [ult1, ult2], 150)
    const ultEvents = result.events.filter((e) => e.turnKind === 'ult')
    expect(ultEvents.map((e) => e.ultInsertionId)).toEqual(['ult1', 'ult2'])
    // basic (+10) -> ult1 (+1000) = 1010
    expect(ultEvents[0].stateAfter['A'].energy).toBe(1010)
    // intervention (+100) spliced right after ult1 -> ult2 sees 1110 before its own +1000
    expect(ultEvents[1].stateBefore['A'].energy).toBe(1110)
    expect(ultEvents[1].stateAfter['A'].energy).toBe(2110)
  })

  it('during_action: splices an intervention between two stacked Ults via afterItemId', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 10, unit: 'flat', scalesWithErr: false }],
        skill: [],
        ult: [{ type: 'energy_gain', targets: 'self', value: 1000, unit: 'flat', scalesWithErr: false }],
      },
      ultThreshold: 0,
      ultEnergyCost: 0,
      customMaxEnergy: 100000,
    })
    const ult1 = makeUlt('ult1', { timing: { type: 'during_action', charId: 'A', actionIndex: 0 } })
    const ult2 = makeUlt('ult2', { timing: { type: 'during_action', charId: 'A', actionIndex: 0 } })
    const iv = makeIv('iv1', { value: 100, triggerAv: 100, beforeCharId: 'A', beforeActionIndex: 0, afterItemId: 'ult1' })

    const result = simulateBattle([makeEntity('A', 100)], [iv], [], [ult1, ult2], 150)
    const ultEvents = result.events.filter((e) => e.turnKind === 'ult')
    expect(ultEvents.map((e) => e.ultInsertionId)).toEqual(['ult1', 'ult2'])
    // during_action ults fire before the normal action itself — A starts at 0 energy.
    expect(ultEvents[0].stateAfter['A'].energy).toBe(1000)
    // intervention (+100) spliced right after ult1 -> ult2 sees 1100 before its own +1000
    expect(ultEvents[1].stateBefore['A'].energy).toBe(1100)
    expect(ultEvents[1].stateAfter['A'].energy).toBe(2100)
  })

  it('at_av: splices a flat intervention between two stacked Ults via afterItemId', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [{ type: 'energy_gain', targets: 'self', value: 1000, unit: 'flat', scalesWithErr: false }] },
      ultThreshold: 0,
      ultEnergyCost: 0,
      customMaxEnergy: 100000,
    })
    const ult1 = makeUlt('ult1', { timing: { type: 'at_av', av: 10 } })
    const ult2 = makeUlt('ult2', { timing: { type: 'at_av', av: 10 } })
    const iv = makeIv('iv1', { value: 100, triggerAv: 10, afterItemId: 'ult1' })

    const result = simulateBattle([makeEntity('A', 100)], [iv], [], [ult1, ult2], 150)
    const ultEvents = result.events.filter((e) => e.turnKind === 'ult')
    expect(ultEvents.map((e) => e.ultInsertionId)).toEqual(['ult1', 'ult2'])
    expect(ultEvents[0].stateAfter['A'].energy).toBe(1000)
    expect(ultEvents[1].stateBefore['A'].energy).toBe(1100)
    expect(ultEvents[1].stateAfter['A'].energy).toBe(2100)
  })

  it('falls back to legacy order (all interventions before any Ult) when afterItemId is unset', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 10, unit: 'flat', scalesWithErr: false }],
        skill: [],
        ult: [{ type: 'energy_gain', targets: 'self', value: 1000, unit: 'flat', scalesWithErr: false }],
      },
      ultThreshold: 0,
      ultEnergyCost: 0,
      customMaxEnergy: 100000,
    })
    const ult1 = makeUlt('ult1', { timing: { type: 'after_action', charId: 'A', actionIndex: 0 } })
    const iv = makeIv('iv1', { value: 100, triggerAv: 100, afterCharId: 'A', afterActionIndex: 0 })

    const result = simulateBattle([makeEntity('A', 100)], [iv], [], [ult1], 150)
    const ultEvent = result.events.find((e) => e.turnKind === 'ult')!
    // legacy default: intervention (+100) resolves before the Ult, on top of the normal action's own
    // basic (+10) -> 110, then the Ult's own +1000 -> 1110.
    expect(ultEvent.stateBefore['A'].energy).toBe(110)
    expect(ultEvent.stateAfter['A'].energy).toBe(1110)
  })
})

// Covers SimulationResult.chainSnapshots — the fix for "the '+' button right after an Intervention
// (itself chained right after a Ult) showed the wrong baseline state, falling back to this AV's very
// first state instead of 'after that Ult AND that Intervention'". A plain Intervention produces no
// BattleEvent of its own, so without chainSnapshots there was nothing to look up its post-resolution
// state from at all.
describe('simulateBattle — chainSnapshots', () => {
  it('records state after EVERY chained item, Ult or Intervention alike, not just Ults', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 10, unit: 'flat', scalesWithErr: false }],
        skill: [],
        ult: [{ type: 'energy_gain', targets: 'self', value: 1000, unit: 'flat', scalesWithErr: false }],
      },
      ultThreshold: 0,
      ultEnergyCost: 0,
      customMaxEnergy: 100000,
    })
    // Chain: A's turn (+10) -> ult1 (+1000) -> intervention (+100, chained after ult1) -> ult2 (+1000,
    // chained after the intervention) — the bug scenario: a "+" placed right after the intervention.
    const ult1 = makeUlt('ult1', { timing: { type: 'after_action', charId: 'A', actionIndex: 0 } })
    const ult2 = makeUlt('ult2', { timing: { type: 'after_action', charId: 'A', actionIndex: 0 }, afterItemId: 'iv1' })
    const iv = makeIv('iv1', { value: 100, triggerAv: 100, afterCharId: 'A', afterActionIndex: 0, afterItemId: 'ult1' })

    const result = simulateBattle([makeEntity('A', 100)], [iv], [], [ult1, ult2], 150)
    // ult1's own snapshot: basic (+10) + its own ult effect (+1000) = 1010.
    expect(result.chainSnapshots['ult1']['A'].energy).toBe(1010)
    // The intervention's snapshot must reflect ult1 AND its own +100 — this is the exact state a "+"
    // placed right after it should show as the baseline for whatever comes next.
    expect(result.chainSnapshots['iv1']['A'].energy).toBe(1110)
    // ult2 chains off the intervention, not ult1 directly — its own snapshot adds its +1000 on top.
    expect(result.chainSnapshots['ult2']['A'].energy).toBe(2110)
  })
})
