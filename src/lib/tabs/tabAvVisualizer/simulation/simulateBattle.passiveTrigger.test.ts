import type {
  ActionNodeOverride,
  BattleEntity,
  CharacterBattleConfig,
  Intervention,
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

// Covers CharacterBattleConfig.passiveTrigger — a condition checked after every state-changing
// checkpoint in the whole battle (not just when a specific ability is cast), e.g. Saber: "while holding
// Mana Burst, if energy + 8*Reactor Core stacks >= 360 for whatever reason, pull self immediately" — it
// has to fire even when something other than her own action caused the condition to become true.
describe('simulateBattle — CharacterBattleConfig.passiveTrigger', () => {
  it('fires from a manually-added intervention unrelated to any of A\'s own actions', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      onBattleStart: [
        { type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'marker', stackable: { maxStacks: 1 } },
      ],
      abilities: { basic: [], skill: [], ult: [] },
      passiveTrigger: [{
        condition: (ctx) => ctx.activeInterventions.some((b) => b.effectId === 'marker') && ctx.energy >= 100,
        effect: [
          { type: 'clear_buff', targets: 'self', effectId: 'marker' },
          { type: 'av_advance', targets: 'self', value: 100, unit: 'percent' },
        ],
      }],
    })
    // A flat/global manual intervention (no beforeCharId/afterCharId) — not tied to any of A's own
    // actions at all, just a raw +100 energy at AV=10.
    const manualGain: Intervention = {
      id: 'manual1', triggerAv: 10, type: 'energy_gain', targets: ['A'], value: 100, unit: 'flat',
      durationTurns: 0, scalesWithErr: false,
    }
    const result = simulateBattle([makeEntity('A', 50)], [manualGain], [override(0, 'basic'), override(1, 'basic')], [], 100)
    const events = result.events.filter((e) => e.characterId === 'A')
    // A's first scheduled action was at av=200 (10000/50) — pulled down to av=10 (when the manual gain
    // satisfied the condition), well before her second action's original av=400.
    expect(events[0].av).toBe(10)
  })

  it('does not refire after the gating buff is cleared (self-disabling, no dedup bookkeeping needed)', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      customMaxEnergy: 1000,
      onBattleStart: [
        { type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'marker', stackable: { maxStacks: 1 } },
      ],
      abilities: { basic: [], skill: [], ult: [] },
      passiveTrigger: [{
        condition: (ctx) => ctx.activeInterventions.some((b) => b.effectId === 'marker') && ctx.energy >= 100,
        effect: [
          { type: 'clear_buff', targets: 'self', effectId: 'marker' },
          { type: 'energy_gain', targets: 'self', value: 1, unit: 'flat', scalesWithErr: false },
        ],
      }],
    })
    const manualGain: Intervention = {
      id: 'manual1', triggerAv: 10, type: 'energy_gain', targets: ['A'], value: 200, unit: 'flat',
      durationTurns: 0, scalesWithErr: false,
    }
    const manualGain2: Intervention = {
      id: 'manual2', triggerAv: 20, type: 'energy_gain', targets: ['A'], value: 200, unit: 'flat',
      durationTurns: 0, scalesWithErr: false,
    }
    const result = simulateBattle([makeEntity('A', 50)], [manualGain, manualGain2], [], [], 30)
    // First checkpoint (av=10) satisfies the condition once -> +1 bonus energy, marker cleared.
    // Second checkpoint (av=20) would also satisfy "energy >= 100" but marker is already gone -> no refire.
    const at10 = result.energyTimeline.find((c) => c.av === 10)?.energyMap['A']
    const at20 = result.energyTimeline.find((c) => c.av === 20)?.energyMap['A']
    expect(at10).toBe(700 + 1)   // 1000*50% start + 200 manual + 1 bonus
    expect(at20).toBe(at10! + 200)   // only the manual +200 this time, no second bonus
  })
})
