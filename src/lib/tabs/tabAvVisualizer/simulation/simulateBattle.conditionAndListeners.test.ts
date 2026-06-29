import { setGameMetadata } from 'lib/state/gameMetadata'
import type { BattleEntity, CharacterBattleConfig, Intervention, InterventionTemplate } from 'lib/tabs/tabAvVisualizer/types'
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import type { DBMetadata } from 'types/metadata'
import { simulateBattle } from './simulateBattle'

// getBattleConfig reads from a registry built at module-load time via import.meta.glob, so there's no
// way to inject a synthetic config for a fake test character through the public API — mock the module
// instead. This isolates these engine-mechanism tests from real character data (Huohuo/Sparkle/etc.),
// unlike simulateBattle.test.ts which intentionally exercises the real battleConfigs files.
const mockConfigs = vi.hoisted(() => new Map<string, CharacterBattleConfig>())

vi.mock('lib/tabs/tabAvVisualizer/battleConfigs', () => ({
  // Mirrors the real getBattleConfig's eidolonUpgrades patching so tests can exercise it end-to-end
  // through the engine, not just via the registry lookup.
  getBattleConfig: (id: string, eidolonLevel = 0) => {
    const base = mockConfigs.get(id) ?? {
      characterId: id,
      energyType: 'standard' as const,
      abilities: { basic: [], skill: [], ult: [] },
    }
    if (!base.eidolonUpgrades) return base
    return base.eidolonUpgrades
      .filter((u) => eidolonLevel >= u.minEidolon)
      .sort((a, b) => a.minEidolon - b.minEidolon)
      .reduce((cfg, u) => u.patch(cfg), base)
  },
}))

function makeEntity(id: string, spd: number, eidolon = 0): BattleEntity {
  return { id, type: 'character', name: id, baseSpd: spd, spd, err: 0, eidolon, color: '#fff', slotIndex: 0 }
}

beforeEach(() => {
  mockConfigs.clear()
})

describe('simulateBattle — template condition filtering', () => {
  beforeEach(() => {
    setGameMetadata({
      characters: {
        A: { max_sp: 100 },   // below threshold
        B: { max_sp: 200 },   // meets threshold
      },
    } as unknown as DBMetadata)
  })

  it('energy_gain with a maxEnergy condition only applies to targets that satisfy it', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{
          type: 'energy_gain',
          targets: 'all_allies',
          value: 50,
          unit: 'flat',
          scalesWithErr: false,
          condition: { metric: 'maxEnergy', operator: 'gte', value: 160 },
        }],
        skill: [],
        ult: [],
      },
    })

    const A = makeEntity('A', 100)
    const B = makeEntity('B', 50)
    const result = simulateBattle([A, B], [], [], [], 150)

    const action0 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 0)!

    // A (max_sp=100) does not satisfy the condition — energy unchanged by this effect
    expect(action0.stateAfter['A'].energy).toBeCloseTo(action0.stateBefore['A'].energy, 5)
    // B (max_sp=200) does satisfy it — gains the flat 50
    expect(action0.stateAfter['B'].energy).toBeCloseTo(action0.stateBefore['B'].energy + 50, 5)
  })
})

describe('simulateBattle — onBattleStart', () => {
  beforeEach(() => {
    setGameMetadata({
      characters: { A: { max_sp: 100 } },
    } as unknown as DBMetadata)
  })

  it('battle-start effects apply before the first action, visible in its stateBefore', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [] },
      onBattleStart: [
        { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat', scalesWithErr: false },
        {
          type: 'stat_buff', targets: 'self', stat: 'Rangming', value: 0, unit: 'flat',
          durationTurns: 2, effectId: 'rangming',
        },
      ],
    })

    const A = makeEntity('A', 100)
    const result = simulateBattle([A], [], [], [], 150)
    const action0 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 0)!

    // Initial energy is max_sp × 50% = 50; the battle-start +30 flat must already be reflected
    // in action0's stateBefore, since it fires at AV=0, before any action happens.
    expect(action0.stateBefore['A'].energy).toBeCloseTo(80, 5)

    const buff = action0.stateBefore['A'].activeInterventions.find((b) => b.effectId === 'rangming')
    expect(buff).toBeDefined()
    expect(buff!.remainingTurns).toBe(2)
  })
})

describe('simulateBattle — eidolonUpgrades', () => {
  beforeEach(() => {
    setGameMetadata({
      characters: { A: { max_sp: 100 } },
    } as unknown as DBMetadata)
  })

  function configWithE1Upgrade(): CharacterBattleConfig {
    return {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'energy_gain', targets: 'self', value: 10, unit: 'flat', scalesWithErr: false }],
        skill: [],
        ult: [],
      },
      eidolonUpgrades: [{
        minEidolon: 1,
        patch: (config) => ({
          ...config,
          abilities: {
            ...config.abilities,
            basic: [
              ...(config.abilities.basic as InterventionTemplate[]),
              { type: 'energy_gain', targets: 'self', value: 5, unit: 'flat', scalesWithErr: false },
            ],
          },
        }),
      }],
    }
  }

  it('eidolonUpgrades patch is not applied below the required Eidolon level', () => {
    mockConfigs.set('A', configWithE1Upgrade())
    const A = makeEntity('A', 100, 0)   // E0
    const result = simulateBattle([A], [], [], [], 150)
    const action0 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 0)!
    expect(action0.stateAfter['A'].energy).toBeCloseTo(action0.stateBefore['A'].energy + 10, 5)
  })

  it('eidolonUpgrades patch applies once the required Eidolon level is met', () => {
    mockConfigs.set('A', configWithE1Upgrade())
    const A = makeEntity('A', 100, 1)   // E1
    const result = simulateBattle([A], [], [], [], 150)
    const action0 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 0)!
    expect(action0.stateAfter['A'].energy).toBeCloseTo(action0.stateBefore['A'].energy + 15, 5)
  })
})

describe('simulateBattle — global listeners (any_ally_action)', () => {
  it('listener fires off another character\'s action, gated by the listener\'s own active buff', () => {
    // X has a passive: while X holds a buff with effectId 'marker', any ally's action restores 2 energy
    mockConfigs.set('X', {
      characterId: 'X',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [] },
      globalListeners: [{
        trigger: 'any_ally_action',
        condition: (ctx) => ctx.activeInterventions.some((b) => b.effectId === 'marker'),
        effect: { type: 'energy_gain', targets: 'self', value: 2, unit: 'flat', scalesWithErr: false },
      }],
    })

    const X = makeEntity('X', 100)
    const Y = makeEntity('Y', 50)

    // Manually-added intervention granting X the 'marker' buff after X's own action 0
    const markerIv: Intervention = {
      id: 'marker-iv',
      triggerAv: 10000 / 100,
      afterCharId: 'X',
      afterActionIndex: 0,
      type: 'stat_buff',
      targets: ['X'],
      stat: 'CR',
      value: 0,
      unit: 'flat',
      durationTurns: 10,
      buffKind: 'direct',
      effectId: 'marker',
    }

    const result = simulateBattle([X, Y], [markerIv], [], [], 250)

    const xAction0 = result.events.find((e) => e.characterId === 'X' && e.actionIndex === 0)!
    const yAction0 = result.events.find((e) => e.characterId === 'Y' && e.actionIndex === 0)!

    // After X's own action 0, X has the marker buff but no energy_gain template fired yet for this check
    expect(xAction0.stateAfter['X'].activeInterventions.some((b) => b.effectId === 'marker')).toBe(true)

    // Y's action (a different character) should trigger X's listener, since X currently holds 'marker'
    expect(yAction0.stateAfter['X'].energy).toBeCloseTo(yAction0.stateBefore['X'].energy + 2, 5)
  })

  it('a self-triggered listener gain on the caster\'s own ult is absorbed by the energy cap, not preserved past the cost deduction', () => {
    setGameMetadata({ characters: { X: { max_sp: 100 } } } as unknown as DBMetadata)
    mockConfigs.set('X', {
      characterId: 'X',
      energyType: 'standard',
      abilities: {
        basic: [], skill: [],
        ult: [{ type: 'energy_gain', targets: 'self', value: 5, unit: 'flat', scalesWithErr: false }],
      },
      globalListeners: [{
        trigger: 'any_ally_action',
        condition: () => true,   // always fires, including for X's own action
        effect: { type: 'energy_gain', targets: 'self', value: 2, unit: 'flat', scalesWithErr: false },
      }],
    })

    const X = makeEntity('X', 100)
    // Fill X to exactly maxEnergy (100) before her first action at AV=100
    const fillEnergy: Intervention = {
      id: 'fill', triggerAv: 0, type: 'energy_gain', targets: ['X'], value: 50, unit: 'flat', durationTurns: 0,
    }
    const ultInsertion = { id: 'u1', casterId: 'X', timing: { type: 'during_action' as const, charId: 'X', actionIndex: 0 } }
    const result = simulateBattle([X], [fillEnergy], [], [ultInsertion], 200)

    const ultEvent = result.events.find((e) => e.turnKind === 'ult')!
    // X is capped at 100 when the listener fires (before the cost deduction), so the +2 is absorbed by
    // the cap. Cost (100) is then deducted to 0, and only the ult's own +5 template lands afterward.
    expect(ultEvent.stateAfter['X'].energy).toBeCloseTo(5, 5)
  })

  it('listener does not fire when the listener lacks the required buff', () => {
    mockConfigs.set('X', {
      characterId: 'X',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [] },
      globalListeners: [{
        trigger: 'any_ally_action',
        condition: (ctx) => ctx.activeInterventions.some((b) => b.effectId === 'marker'),
        effect: { type: 'energy_gain', targets: 'self', value: 2, unit: 'flat', scalesWithErr: false },
      }],
    })

    const X = makeEntity('X', 100)
    const Y = makeEntity('Y', 50)
    const result = simulateBattle([X, Y], [], [], [], 250)

    const yAction0 = result.events.find((e) => e.characterId === 'Y' && e.actionIndex === 0)!
    // X never received the marker buff, so the listener's condition is never satisfied
    expect(yAction0.stateAfter['X'].energy).toBeCloseTo(yAction0.stateBefore['X'].energy, 5)
  })
})
