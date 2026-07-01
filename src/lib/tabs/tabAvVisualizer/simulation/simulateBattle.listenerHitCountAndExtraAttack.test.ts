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

function override(characterId: string, actionIndex: number, choice: 'basic' | 'skill'): ActionNodeOverride {
  return { characterId, actionIndex, choice }
}

// Covers GlobalListenerContext.hitCount and GlobalListener.effect-as-a-function — e.g. Gilgamesh: "+1
// stack of 本王允许你进攻 per hit, from either his or Saber's own attacks" needs to know the actual hit
// count of the action that triggered the listener, and "restore 30% of the energy that character's own
// Ultimate costs" needs the effect itself (not just the condition) to read live per-actor state.
describe('simulateBattle — GlobalListenerContext.hitCount + function effect', () => {
  it('passes the acting character\'s real hitCount into the listener context and effect function', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      hitCounts: { basic: 3 },
      abilities: { basic: [], skill: [], ult: [] },
    })
    mockConfigs.set('B', {
      characterId: 'B',
      energyType: 'standard',
      abilities: { basic: [], skill: [], ult: [] },
      globalListeners: [{
        trigger: 'any_ally_action',
        condition: (ctx) => ctx.actingCharacterId !== ctx.selfId,
        effect: (ctx) => ({ type: 'energy_gain', targets: 'self', value: ctx.hitCount * 10, unit: 'flat', scalesWithErr: false }),
      }],
    })
    const result = simulateBattle(
      [makeEntity('A', 100), makeEntity('B', 100)], [],
      [override('A', 0, 'basic')],
      [], 150,
    )
    const bEvent = result.events.find((e) => e.characterId === 'B')!
    // B starts at 50, A's basic resolves as 3 hits -> +30 from the listener's function effect.
    expect(bEvent.stateAfter['B'].energy).toBe(80)
  })
})

// Covers CharacterBattleConfig.extraAttack — e.g. Gilgamesh: once his and Saber's combined hit count
// reaches 8 stacks of 本王允许你进攻, both get a one-off burst of effects with no turn of their own. It's
// checked the same way passiveTrigger is (every state-changing checkpoint), but also records a visible
// BattleEvent (turnKind: 'extra') and never touches the queue.
describe('simulateBattle — CharacterBattleConfig.extraAttack', () => {
  it('fires once the stack threshold is reached, records a turnKind:"extra" event, and resets via its own clear_buff', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'marker', stackable: { maxStacks: 3 } }],
        skill: [], ult: [],
      },
      extraAttack: {
        condition: (ctx) => (ctx.activeInterventions.find((b) => b.effectId === 'marker')?.stacks ?? 0) >= 3,
        effect: [
          { type: 'clear_buff', targets: 'self', effectId: 'marker' },
          { type: 'energy_gain', targets: 'self', value: 50, unit: 'flat', scalesWithErr: false },
        ],
        hitCount: 2,
      },
    })
    const result = simulateBattle(
      [makeEntity('A', 100)], [],
      [override('A', 0, 'basic'), override('A', 1, 'basic'), override('A', 2, 'basic')],
      [], 350,
    )
    const extraEvents = result.events.filter((e) => e.turnKind === 'extra')
    expect(extraEvents.length).toBe(1)
    expect(extraEvents[0].hitCount).toBe(2)
    expect(extraEvents[0].stateAfter['A'].activeInterventions.find((b) => b.effectId === 'marker')).toBeUndefined()

    // The bonus energy_gain landed: the 3rd basic's own stateAfter should already reflect it, since the
    // extra attack fires at the very next checkpoint after the 3rd basic resolves.
    const thirdBasic = result.events.filter((e) => e.characterId === 'A' && e.turnKind === 'normal')[2]
    expect(thirdBasic.stateAfter['A'].energy).toBeLessThan(extraEvents[0].stateAfter['A'].energy)
  })

  it('does not refire once the gating stacks are cleared', () => {
    mockConfigs.set('A', {
      characterId: 'A',
      energyType: 'standard',
      abilities: {
        basic: [{ type: 'stat_buff', targets: 'self', stat: 'MARKER', value: 0, unit: 'flat', durationTurns: 0, effectId: 'marker', stackable: { maxStacks: 3 } }],
        skill: [], ult: [],
      },
      extraAttack: {
        condition: (ctx) => (ctx.activeInterventions.find((b) => b.effectId === 'marker')?.stacks ?? 0) >= 3,
        effect: [{ type: 'clear_buff', targets: 'self', effectId: 'marker' }],
      },
    })
    const result = simulateBattle(
      [makeEntity('A', 100)], [],
      [override('A', 0, 'basic'), override('A', 1, 'basic'), override('A', 2, 'basic')],
      [], 350,
    )
    expect(result.events.filter((e) => e.turnKind === 'extra').length).toBe(1)
  })
})
