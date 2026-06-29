// @vitest-environment node
import { beforeAll, describe, expect, it } from 'vitest'
import type { ActionNodeOverride, BattleEntity, Intervention, UltInsertion } from 'lib/tabs/tabAvVisualizer/types'
import { setGameMetadata } from 'lib/state/gameMetadata'
import type { DBMetadata } from 'types/metadata'
import { simulateBattle } from './simulateBattle'
import { simulateTimeline } from './simulateTimeline'

// Convenience wrapper: returns only the events array so existing tests don't need to change.
function sim(...args: Parameters<typeof simulateBattle>) {
  return simulateBattle(...args).events
}

// ---- Helpers ----

function makeEntity(id: string, spd: number): BattleEntity {
  return { id, type: 'character', name: id, baseSpd: spd, spd, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 }
}

function makeOverride(
  characterId: string,
  actionIndex: number,
  choice: ActionNodeOverride['choice'],
  targets?: string[],
): ActionNodeOverride {
  return { characterId, actionIndex, choice, targets }
}

function makeUlt(
  id: string,
  casterId: string,
  timing: UltInsertion['timing'],
  targets?: string[],
): UltInsertion {
  return { id, casterId, timing, targets }
}

// Sparkle characterId as registered in battleConfigs/Sparkle.ts (post-rework version)
const SPARKLE_ID = '1306b1'

// ---- No overrides ----

describe('simulateBattle — no overrides', () => {
  it('returns empty for no entities', () => {
    expect(sim([], [], [], [], 300)).toEqual([])
  })

  it('returns empty for zero totalAv', () => {
    expect(sim([makeEntity('A', 100)], [], [], [], 0)).toEqual([])
  })

  it('matches simulateTimeline results (av, characterId, actionIndex, effectiveSpd)', () => {
    const A = makeEntity('A', 100)
    const B = makeEntity('B', 200)
    const result = sim([A, B], [], [], [], 300)
    const ref = simulateTimeline(
      [A, B].map((e) => ({ id: e.id, spd: e.spd, baseSpd: e.baseSpd })),
      [],
      300,
    )
    expect(result.map((e) => e.av)).toEqual(ref.map((e) => e.av))
    expect(result.map((e) => e.characterId)).toEqual(ref.map((e) => e.characterId))
    expect(result.map((e) => e.actionIndex)).toEqual(ref.map((e) => e.actionIndex))
    expect(result.map((e) => e.effectiveSpd)).toEqual(ref.map((e) => e.effectiveSpd))
  })

  it('actionChoice defaults to basic when no override', () => {
    const events = sim([makeEntity('A', 100)], [], [], [], 250)
    expect(events.every((e) => e.actionChoice === 'basic')).toBe(true)
  })

  it('manually-added av_advance intervention still works (regression)', () => {
    // A (SPD=200) acts first at AV=50; B (SPD=50) is queued at AV=200
    // After A's action at AV=50, advance B by 50% → delta = 50% × (10000/50) = 100
    // B.av = max(triggerAv=50, 200 - 100) = max(50, 100) = 100
    const A = makeEntity('A', 200)
    const B = makeEntity('B', 50)
    const iv = {
      id: 'iv1',
      triggerAv: 50,
      afterCharId: 'A',
      afterActionIndex: 0,
      type: 'av_advance' as const,
      targets: ['B'],
      value: 50,
      unit: 'percent' as const,
      durationTurns: 0,
    }
    const result = sim([A, B], [iv], [], [], 150)
    const bFirst = result.find((e) => e.characterId === 'B' && e.actionIndex === 0)!
    expect(bFirst.av).toBeCloseTo(100, 2)
  })
})

// ---- Override: actionChoice ----

describe('simulateBattle — actionChoice', () => {
  it('reflects override.choice for the matched action', () => {
    const events = sim([makeEntity(SPARKLE_ID, 120)], [], [
      makeOverride(SPARKLE_ID, 0, 'basic'),
      makeOverride(SPARKLE_ID, 1, 'skill'),
    ], [], 300)

    const action0 = events.find((e) => e.characterId === SPARKLE_ID && e.actionIndex === 0)!
    const action1 = events.find((e) => e.characterId === SPARKLE_ID && e.actionIndex === 1)!
    expect(action0.actionChoice).toBe('basic')
    expect(action1.actionChoice).toBe('skill')
  })

  it('uses basic when override exists for a different actionIndex', () => {
    const events = sim([makeEntity(SPARKLE_ID, 120)], [], [
      makeOverride(SPARKLE_ID, 2, 'skill'),
    ], [], 200)
    // actionIndex 0 and 1 have no override → should be 'basic'
    const matched = events.filter((e) => e.characterId === SPARKLE_ID && e.actionIndex < 2)
    expect(matched.every((e) => e.actionChoice === 'basic')).toBe(true)
  })
})

// ---- Override: av_advance expansion (Sparkle skill) ----

describe('simulateBattle — Sparkle skill av_advance', () => {
  // Sparkle SPD=120 → first action at 10000/120 ≈ 83.33
  // Target SPD=160  → first action at 62.5, re-enqueued at 125
  // Sparkle skill: av_advance single_ally 50%  → delta = 50% × (10000/160) = 31.25
  // Target second action: max(83.33, 125 − 31.25) = 93.75
  const SPARKLE_SPD = 120
  const TARGET_SPD = 160

  it('advances the target by 50% of their action interval after Sparkle skill', () => {
    const sparkle = makeEntity(SPARKLE_ID, SPARKLE_SPD)
    const target = makeEntity('T', TARGET_SPD)
    const overrides = [makeOverride(SPARKLE_ID, 0, 'skill', ['T'])]

    const result = sim([sparkle, target], [], overrides, [], 300)

    const sparkleFirst = result.find((e) => e.characterId === SPARKLE_ID && e.actionIndex === 0)!
    const targetFirst = result.find((e) => e.characterId === 'T' && e.actionIndex === 0)!
    const targetSecond = result.find((e) => e.characterId === 'T' && e.actionIndex === 1)!

    expect(sparkleFirst.av).toBeCloseTo(10000 / SPARKLE_SPD, 2)
    expect(targetFirst.av).toBeCloseTo(10000 / TARGET_SPD, 2)

    const interval = 10000 / TARGET_SPD
    const expectedSecond = Math.max(sparkleFirst.av, targetFirst.av + interval - interval * 0.5)
    expect(targetSecond.av).toBeCloseTo(expectedSecond, 2)
  })

  it('does not change AV when override choice is basic (no av_advance in basic)', () => {
    const sparkle = makeEntity(SPARKLE_ID, SPARKLE_SPD)
    const target = makeEntity('T', TARGET_SPD)
    const overrideWithSkill = [makeOverride(SPARKLE_ID, 0, 'skill', ['T'])]
    const overrideWithBasic = [makeOverride(SPARKLE_ID, 0, 'basic')]

    const withSkill = sim([sparkle, target], [], overrideWithSkill, [], 300)
    const withBasic = sim([sparkle, target], [], overrideWithBasic, [], 300)
    const noOverride = sim([sparkle, target], [], [], [], 300)

    // basic and no-override should produce the same AV sequence
    expect(withBasic.map((e) => e.av)).toEqual(noOverride.map((e) => e.av))
    // skill should differ
    expect(withSkill.map((e) => e.av)).not.toEqual(noOverride.map((e) => e.av))
  })

  it('does not advance when targets list is empty', () => {
    const sparkle = makeEntity(SPARKLE_ID, SPARKLE_SPD)
    const target = makeEntity('T', TARGET_SPD)
    // skill override but no targets specified → single_ally resolves to []
    const overrides = [makeOverride(SPARKLE_ID, 0, 'skill', [])]

    const result = sim([sparkle, target], [], overrides, [], 300)
    const noOverride = sim([sparkle, target], [], [], [], 300)

    expect(result.map((e) => e.av)).toEqual(noOverride.map((e) => e.av))
  })

  it('does not advance when targets is undefined', () => {
    const sparkle = makeEntity(SPARKLE_ID, SPARKLE_SPD)
    const target = makeEntity('T', TARGET_SPD)
    const overrides = [makeOverride(SPARKLE_ID, 0, 'skill')]   // no targets field

    const result = sim([sparkle, target], [], overrides, [], 300)
    const noOverride = sim([sparkle, target], [], [], [], 300)

    expect(result.map((e) => e.av)).toEqual(noOverride.map((e) => e.av))
  })

  it('non-av templates (stat_buff, sp_loss) in Sparkle skill do not affect the AV queue', () => {
    // Sparkle skill has stat_buff and sp_loss alongside av_advance; verify only av_advance fires
    const sparkle = makeEntity(SPARKLE_ID, SPARKLE_SPD)
    const target = makeEntity('T', TARGET_SPD)
    const overrides = [makeOverride(SPARKLE_ID, 0, 'skill', ['T'])]

    // Run twice — if stat_buff/sp_loss accidentally mutate queue state, results would diverge
    const run1 = sim([sparkle, target], [], overrides, [], 400)
    const run2 = sim([sparkle, target], [], overrides, [], 400)
    expect(run1.map((e) => e.av)).toEqual(run2.map((e) => e.av))

    // Target's second action should be advanced (av_advance did fire)
    const targetSecond1 = run1.find((e) => e.characterId === 'T' && e.actionIndex === 1)!
    const targetSecondNoOverride = sim([sparkle, target], [], [], [], 400)
      .find((e) => e.characterId === 'T' && e.actionIndex === 1)!
    expect(targetSecond1.av).toBeLessThan(targetSecondNoOverride.av)
  })

  it('applies effect only to the specified target, not all characters', () => {
    const sparkle = makeEntity(SPARKLE_ID, SPARKLE_SPD)
    const target = makeEntity('T', TARGET_SPD)
    const bystander = makeEntity('X', 110)
    const overrides = [makeOverride(SPARKLE_ID, 0, 'skill', ['T'])]

    const result = sim([sparkle, target, bystander], [], overrides, [], 400)
    const noOverride = sim([sparkle, target, bystander], [], [], [], 400)

    // X should have the same AV sequence regardless of the override
    const xResult = result.filter((e) => e.characterId === 'X').map((e) => e.av)
    const xRef = noOverride.filter((e) => e.characterId === 'X').map((e) => e.av)
    expect(xResult).toEqual(xRef)
  })
})

// ---- Summon entities are excluded from the queue ----

describe('simulateBattle — entity type filtering', () => {
  it('summon entities get their own timeline turns but never act (no energy, no ability templates)', () => {
    const char = makeEntity('A', 100)
    const summon: BattleEntity = { id: 'S', type: 'summon', ownerId: 'A', name: 'Summon', baseSpd: 60, spd: 60, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 }

    const withSummon = sim([char, summon], [], [], [], 250)
    const withoutSummon = sim([char], [], [], [], 250)

    // The character's own action AVs are unaffected by the summon's mere presence
    expect(withSummon.filter((e) => e.characterId === 'A').map((e) => e.av))
      .toEqual(withoutSummon.map((e) => e.av))
    // But the summon now occupies its own turns on the timeline, at its own speed
    const summonEvents = withSummon.filter((e) => e.characterId === 'S')
    expect(summonEvents.length).toBeGreaterThan(0)
    expect(summonEvents[0].stateBefore).toEqual({})
  })
})

// ---- Energy tracking (Step 5) ----

const HUOHUO_ID = '1217b1'
// Verified against game_data.json
const SPARKLE_MAX_SP = 110
const HUOHUO_MAX_SP = 140

describe('simulateBattle — energy tracking', () => {
  beforeAll(() => {
    setGameMetadata({
      characters: {
        [SPARKLE_ID]: { max_sp: SPARKLE_MAX_SP },
        [HUOHUO_ID]:  { max_sp: HUOHUO_MAX_SP },
      },
    } as unknown as DBMetadata)
  })

  it('initial energy = max_sp × 50% for all characters', () => {
    const sparkle = makeEntity(SPARKLE_ID, 120)
    const events = sim([sparkle], [], [], [], 200)
    const first = events[0]!
    expect(first.stateBefore[SPARKLE_ID].energy).toBeCloseTo(SPARKLE_MAX_SP * 0.5, 5)
  })

  it('Sparkle basic gains 20 flat energy on self (stateBefore → stateAfter)', () => {
    // Sparkle basic: energy_gain self 20 flat
    const sparkle = makeEntity(SPARKLE_ID, 120)
    const events = sim([sparkle], [], [], [], 200)
    const first = events[0]!
    const before = first.stateBefore[SPARKLE_ID].energy
    const after  = first.stateAfter[SPARKLE_ID].energy
    expect(after).toBeCloseTo(before + 20, 5)
  })

  it('Huohuo basic gains 20 flat energy on self, plus 2 from her own Rangming talent listener', () => {
    // Huohuo basic: energy_gain self 20 flat. She also starts the battle with Rangming (onBattleStart),
    // so her own action also triggers her talent's "any ally action restores 2 energy" globalListener.
    const huohuo = makeEntity(HUOHUO_ID, 134)
    const events = sim([huohuo], [], [], [], 200)
    const first = events[0]!
    const before = first.stateBefore[HUOHUO_ID].energy
    const after  = first.stateAfter[HUOHUO_ID].energy
    expect(after).toBeCloseTo(before + 22, 5)
  })

  it('energy_gain percent: delta = maxEnergy × value / 100', () => {
    const sparkle = makeEntity(SPARKLE_ID, 120)
    // Manually-added 10% energy gain after Sparkle's first action
    const iv: Intervention = {
      id: 'pct-test',
      triggerAv: 10000 / 120,
      afterCharId: SPARKLE_ID,
      afterActionIndex: 0,
      type: 'energy_gain',
      targets: [SPARKLE_ID],
      value: 10,
      unit: 'percent',
      durationTurns: 0,
    }
    const withIv = sim([sparkle], [iv], [], [], 200)
    const withoutIv = sim([sparkle], [], [], [], 200)
    const first = withIv[0]!
    const firstRef = withoutIv[0]!
    const expectedDelta = SPARKLE_MAX_SP * 0.1
    expect(first.stateAfter[SPARKLE_ID].energy - firstRef.stateAfter[SPARKLE_ID].energy)
      .toBeCloseTo(expectedDelta, 5)
  })

  it('energy is clamped at maxEnergy (no overshoot)', () => {
    // Huohuo starts at 70 (140 × 50%); give 200 flat → should cap at 140
    const huohuo = makeEntity(HUOHUO_ID, 134)
    const iv: Intervention = {
      id: 'cap-test',
      triggerAv: 10000 / 134,
      afterCharId: HUOHUO_ID,
      afterActionIndex: 0,
      type: 'energy_gain',
      targets: [HUOHUO_ID],
      value: 200,
      unit: 'flat',
      durationTurns: 0,
    }
    const events = sim([huohuo], [iv], [], [], 200)
    expect(events[0]!.stateAfter[HUOHUO_ID].energy).toBe(HUOHUO_MAX_SP)
  })

  it('energy is clamped at 0 (no negative overshoot)', () => {
    const sparkle = makeEntity(SPARKLE_ID, 120)
    const iv: Intervention = {
      id: 'floor-test',
      triggerAv: 10000 / 120,
      afterCharId: SPARKLE_ID,
      afterActionIndex: 0,
      type: 'energy_loss',
      targets: [SPARKLE_ID],
      value: 9999,
      unit: 'flat',
      durationTurns: 0,
    }
    const events = sim([sparkle], [iv], [], [], 200)
    expect(events[0]!.stateAfter[SPARKLE_ID].energy).toBe(0)
  })

  it('manually-added energy_gain afterCharId intervention fires and raises energy', () => {
    const sparkle = makeEntity(SPARKLE_ID, 120)
    const iv: Intervention = {
      id: 'manual-energy',
      triggerAv: 10000 / 120,
      afterCharId: SPARKLE_ID,
      afterActionIndex: 0,
      type: 'energy_gain',
      targets: [SPARKLE_ID],
      value: 30,
      unit: 'flat',
      durationTurns: 0,
    }
    const withIv = sim([sparkle], [iv], [], [], 200)
    const withoutIv = sim([sparkle], [], [], [], 200)
    // The intervention adds 30 on top of the 20 from basic ability
    const energyWith = withIv[0]!.stateAfter[SPARKLE_ID].energy
    const energyWithout = withoutIv[0]!.stateAfter[SPARKLE_ID].energy
    expect(energyWith).toBeCloseTo(energyWithout + 30, 5)
  })

  it('stateBefore and stateAfter are non-empty and include all character ids', () => {
    const sparkle = makeEntity(SPARKLE_ID, 120)
    const huohuo = makeEntity(HUOHUO_ID, 134)
    const events = sim([sparkle, huohuo], [], [], [], 300)
    for (const ev of events) {
      expect(Object.keys(ev.stateBefore)).toContain(SPARKLE_ID)
      expect(Object.keys(ev.stateBefore)).toContain(HUOHUO_ID)
      expect(Object.keys(ev.stateAfter)).toContain(SPARKLE_ID)
      expect(Object.keys(ev.stateAfter)).toContain(HUOHUO_ID)
    }
  })

  it('character without BattleConfig does not crash; energy snapshot uses fallback max_sp=100', () => {
    // 'UNKNOWN' is not registered in battleConfigs — engine should skip template expansion safely
    const unknown = makeEntity('UNKNOWN', 150)
    expect(() => sim([unknown], [], [], [], 200)).not.toThrow()
    const events = sim([unknown], [], [], [], 200)
    expect(events.length).toBeGreaterThan(0)
    // Fallback max_sp=100 → initial energy = 50
    expect(events[0]!.stateBefore['UNKNOWN'].energy).toBeCloseTo(50, 5)
  })
})

// ---- Ult insertion (Step 6) ----

describe('simulateBattle — ult insertion', () => {
  beforeAll(() => {
    setGameMetadata({
      characters: {
        [SPARKLE_ID]: { max_sp: SPARKLE_MAX_SP },
        [HUOHUO_ID]:  { max_sp: HUOHUO_MAX_SP },
      },
    } as unknown as DBMetadata)
  })

  // Bring Huohuo to full energy via a manual intervention, then insert an after_action ult.
  // Returns the [normalActionEvent, ultEvent] pair.
  function setupHuohuoUlt(timing: UltInsertion['timing'] = { type: 'after_action', charId: HUOHUO_ID, actionIndex: 0 }) {
    const huohuo = makeEntity(HUOHUO_ID, 134)
    // Huohuo starts at 70 energy; gain 70 more → full (140)
    const fillEnergy: Intervention = {
      id: 'fill',
      triggerAv: 10000 / 134,
      afterCharId: HUOHUO_ID,
      afterActionIndex: 0,
      type: 'energy_gain',
      targets: [HUOHUO_ID],
      value: 70,
      unit: 'flat',
      durationTurns: 0,
    }
    const ult = makeUlt('u1', HUOHUO_ID, timing)
    return sim([huohuo], [fillEnergy], [], [ult], 250)
  }

  it('after_action ult produces a BattleEvent with turnKind=ult', () => {
    const results = setupHuohuoUlt()
    const ultEvent = results.find((e) => e.turnKind === 'ult')
    expect(ultEvent).toBeDefined()
    expect(ultEvent!.characterId).toBe(HUOHUO_ID)
    expect(ultEvent!.actionChoice).toBe('ult')
    expect(ultEvent!.actionIndex).toBe(-1)
  })

  it('after_action ult BattleEvent appears AFTER the triggering normal action in results', () => {
    const results = setupHuohuoUlt()
    const normalIdx = results.findIndex((e) => e.characterId === HUOHUO_ID && e.turnKind === 'normal' && e.actionIndex === 0)
    const ultIdx    = results.findIndex((e) => e.characterId === HUOHUO_ID && e.turnKind === 'ult')
    expect(normalIdx).toBeGreaterThanOrEqual(0)
    expect(ultIdx).toBeGreaterThan(normalIdx)
  })

  it('during_action ult BattleEvent appears BEFORE the triggering normal action in results', () => {
    const huohuo = makeEntity(HUOHUO_ID, 134)
    // Start with full energy (multiply initial 50% by giving +70 in a global before intervention)
    const fillEnergy: Intervention = {
      id: 'fill-before',
      triggerAv: 0,
      type: 'energy_gain',
      targets: [HUOHUO_ID],
      value: 70,
      unit: 'flat',
      durationTurns: 0,
    }
    const ult = makeUlt('u-during', HUOHUO_ID, { type: 'during_action', charId: HUOHUO_ID, actionIndex: 0 })
    const results = sim([huohuo], [fillEnergy], [], [ult], 250)

    const normalIdx = results.findIndex((e) => e.characterId === HUOHUO_ID && e.turnKind === 'normal' && e.actionIndex === 0)
    const ultIdx    = results.findIndex((e) => e.characterId === HUOHUO_ID && e.turnKind === 'ult')
    expect(ultIdx).toBeGreaterThanOrEqual(0)
    expect(ultIdx).toBeLessThan(normalIdx)
  })

  it('ult deducts caster energy then applies ult templates: net energy reflects cost minus template gain', () => {
    const results = setupHuohuoUlt()
    const ultEvent = results.find((e) => e.turnKind === 'ult')!
    const before = ultEvent.stateBefore[HUOHUO_ID].energy
    const after  = ultEvent.stateAfter[HUOHUO_ID].energy
    // Huohuo ult: threshold=cost=140; the 20% max-energy restore targets all_allies_except_self (she
    // doesn't get it), and her talent's globalListener fires BEFORE the cost deduction — at that point
    // she's still capped at maxEnergy, so the self-triggered +2 is absorbed by the cap and never
    // survives into the post-cost total. Only her own template (+5 flat self) actually lands.
    // Flow: 140 - 140 (cost) + 5 = 5
    expect(before).toBeCloseTo(HUOHUO_MAX_SP, 5)   // energy was exactly full before ult
    expect(after).toBeCloseTo(5, 4)
  })

  it('ult with insufficient energy is silently skipped — no ult BattleEvent produced', () => {
    // Do NOT add a fill intervention; energy stays at 70 (< 140 threshold)
    const huohuo = makeEntity(HUOHUO_ID, 134)
    const ult = makeUlt('u-no-energy', HUOHUO_ID, { type: 'after_action', charId: HUOHUO_ID, actionIndex: 0 })
    const results = sim([huohuo], [], [], [ult], 250)
    expect(results.some((e) => e.turnKind === 'ult')).toBe(false)
  })

  it('ult casterId not in simulation is silently skipped', () => {
    const sparkle = makeEntity(SPARKLE_ID, 120)
    const ult = makeUlt('u-absent', 'ABSENT_ID', { type: 'after_action', charId: SPARKLE_ID, actionIndex: 0 })
    expect(() => sim([sparkle], [], [], [ult], 250)).not.toThrow()
    const results = sim([sparkle], [], [], [ult], 250)
    expect(results.some((e) => e.turnKind === 'ult')).toBe(false)
  })

  it('ult BattleEvent stateBefore and stateAfter include all character snapshots', () => {
    const sparkle = makeEntity(SPARKLE_ID, 120)
    const huohuo  = makeEntity(HUOHUO_ID, 134)
    const fillEnergy: Intervention = {
      id: 'fill2',
      triggerAv: 10000 / 134,
      afterCharId: HUOHUO_ID,
      afterActionIndex: 0,
      type: 'energy_gain',
      targets: [HUOHUO_ID],
      value: 70,
      unit: 'flat',
      durationTurns: 0,
    }
    const ult = makeUlt('u2', HUOHUO_ID, { type: 'after_action', charId: HUOHUO_ID, actionIndex: 0 })
    const results = sim([sparkle, huohuo], [fillEnergy], [], [ult], 300)
    const ultEvent = results.find((e) => e.turnKind === 'ult')!
    expect(Object.keys(ultEvent.stateBefore)).toContain(SPARKLE_ID)
    expect(Object.keys(ultEvent.stateBefore)).toContain(HUOHUO_ID)
    expect(Object.keys(ultEvent.stateAfter)).toContain(SPARKLE_ID)
    expect(Object.keys(ultEvent.stateAfter)).toContain(HUOHUO_ID)
  })

  it('Huohuo ult all_allies energy_gain applies to all characters in stateBefore→stateAfter', () => {
    // Huohuo ult config has energy_gain all_allies 20% — each ally gains 20% of their max_sp
    const sparkle = makeEntity(SPARKLE_ID, 120)
    const huohuo  = makeEntity(HUOHUO_ID, 134)
    const fillEnergy: Intervention = {
      id: 'fill3',
      triggerAv: 10000 / 134,
      afterCharId: HUOHUO_ID,
      afterActionIndex: 0,
      type: 'energy_gain',
      targets: [HUOHUO_ID],
      value: 70,
      unit: 'flat',
      durationTurns: 0,
    }
    const ult = makeUlt('u3', HUOHUO_ID, { type: 'after_action', charId: HUOHUO_ID, actionIndex: 0 })
    const results = sim([sparkle, huohuo], [fillEnergy], [], [ult], 300)
    const ultEvent = results.find((e) => e.turnKind === 'ult')!

    // Sparkle should gain 20% of SPARKLE_MAX_SP (capped)
    const sparkleBefore = ultEvent.stateBefore[SPARKLE_ID].energy
    const sparkleAfter  = ultEvent.stateAfter[SPARKLE_ID].energy
    const expectedSparkleGain = Math.min(SPARKLE_MAX_SP, sparkleBefore + SPARKLE_MAX_SP * 0.2) - sparkleBefore
    expect(sparkleAfter - sparkleBefore).toBeCloseTo(expectedSparkleGain, 4)
  })

  it('normal action results are unaffected when empty ultInsertions passed', () => {
    const sparkle = makeEntity(SPARKLE_ID, 120)
    const withUlts    = sim([sparkle], [], [], [], 300)
    const withoutUlts = sim([sparkle], [], [], [], 300)
    expect(withUlts.map((e) => e.av)).toEqual(withoutUlts.map((e) => e.av))
    expect(withUlts.filter((e) => e.turnKind === 'normal')).toEqual(
      withoutUlts.filter((e) => e.turnKind === 'normal'),
    )
  })
})

// ---- Buff tracking (Step 7) ----

describe('simulateBattle — buff tracking', () => {
  // triggerAv must equal the exact AV of the afterCharId's action so the engine fires the intervention.
  function makeSpdIv(
    id: string,
    targetId: string,
    afterCharId: string,
    afterActionIndex: number,
    triggerAv: number,
    delta: number,
    durationTurns: number,
    buffKind: 'direct' | 'aura' = 'direct',
    effectId?: string,
  ): Intervention {
    return {
      id,
      triggerAv,
      afterCharId,
      afterActionIndex,
      type: 'spd_up',
      targets: [targetId],
      value: delta,
      unit: 'flat',
      durationTurns,
      buffKind,
      effectId,
    }
  }

  function makeStatIv(
    id: string,
    targetId: string,
    afterCharId: string,
    afterActionIndex: number,
    triggerAv: number,
    durationTurns: number,
    effectId?: string,
  ): Intervention {
    return {
      id,
      triggerAv,
      afterCharId,
      afterActionIndex,
      type: 'stat_buff',
      targets: [targetId],
      stat: 'CR',
      value: 10,
      unit: 'percent',
      durationTurns,
      buffKind: 'direct',
      effectId,
    }
  }

  // A: SPD=100 → action 0 at AV=100
  const A_AV0 = 10000 / 100  // = 100
  // C: SPD=50 → action 0 at AV=200
  const C_AV0 = 10000 / 50   // = 200

  it('direct spd_up buff appears in stateAfter.activeInterventions with correct remainingTurns', () => {
    const A = makeEntity('A', 100)
    // Applied after A's action 0; default tickPhase is 'end', and a buff granted by this very turn's own
    // after-action effect doesn't get docked a turn by this same turn's end tick — full durationTurns=2
    // shows in stateAfter, only starting to count down from the *next* turn's end.
    const iv = makeSpdIv('spd1', 'A', 'A', 0, A_AV0, 20, 2)
    const result = simulateBattle([A], [iv], [], [], 500)
    const action0 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 0)!

    // stateBefore: no buff yet
    expect(action0.stateBefore['A'].activeInterventions).toHaveLength(0)

    // stateAfter: buff registered at the full nominal duration (no same-turn immediate tick)
    const buffsAfter = action0.stateAfter['A'].activeInterventions
    expect(buffsAfter).toHaveLength(1)
    expect(buffsAfter[0].id).toBe('spd1')
    expect(buffsAfter[0].type).toBe('spd_up')
    expect(buffsAfter[0].buffKind).toBe('direct')
    expect(buffsAfter[0].remainingTurns).toBe(2)
  })

  it('direct spd_up buff remainingTurns decrements on target actions and disappears on expiry', () => {
    const A = makeEntity('A', 100)
    const iv = makeSpdIv('spd2', 'A', 'A', 0, A_AV0, 20, 2)
    const result = simulateBattle([A], [iv], [], [], 500)

    const action1 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 1)!
    const action2 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 2)!

    // action 1 stateBefore: still the full 2 (granting turn's own end-tick didn't touch it)
    expect(action1.stateBefore['A'].activeInterventions).toHaveLength(1)
    expect(action1.stateBefore['A'].activeInterventions[0].remainingTurns).toBe(2)

    // action 1 stateAfter: ticked once at the end of this (now pre-existing) turn -> 1, still active
    expect(action1.stateAfter['A'].activeInterventions).toHaveLength(1)
    expect(action1.stateAfter['A'].activeInterventions[0].remainingTurns).toBe(1)

    // action 2: still active entering the turn (1), gone once this turn's own end-tick runs
    expect(action2.stateBefore['A'].activeInterventions).toHaveLength(1)
    expect(action2.stateBefore['A'].activeInterventions[0].remainingTurns).toBe(1)
    expect(action2.stateAfter['A'].activeInterventions).toHaveLength(0)
  })

  it('direct spd_up buff boosts effective speed in stateAfter, reverts on expiry', () => {
    const A = makeEntity('A', 100)
    const iv = makeSpdIv('spd3', 'A', 'A', 0, A_AV0, 30, 2)
    const result = simulateBattle([A], [iv], [], [], 500)
    const action0 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 0)!
    const action1 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 1)!
    const action2 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 2)!

    // stateAfter of action 0 shows buffed speed
    expect(action0.stateAfter['A'].spd).toBeCloseTo(130, 2)
    // Still buffed through action 1 entirely (only ticks 2 -> 1 at its own end, not yet expired)
    expect(action1.stateBefore['A'].spd).toBeCloseTo(130, 2)
    expect(action1.stateAfter['A'].spd).toBeCloseTo(130, 2)
    // action 2: still buffed entering the turn, expires (1 -> 0) at this turn's own end -> speed reverts
    expect(action2.stateBefore['A'].spd).toBeCloseTo(130, 2)
    expect(action2.stateAfter['A'].spd).toBeCloseTo(100, 2)
  })

  it('snapshot isolation: captured stateAfter activeInterventions not mutated by later ticks', () => {
    const A = makeEntity('A', 100)
    const iv = makeSpdIv('spd4', 'A', 'A', 0, A_AV0, 20, 2)
    const result = simulateBattle([A], [iv], [], [], 500)
    const action0 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 0)!
    const action1 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 1)!

    // action 0 stateAfter captured remainingTurns=2; action 1's own end-tick (2 -> 1) must NOT
    // retroactively change it
    expect(action0.stateAfter['A'].activeInterventions[0].remainingTurns).toBe(2)
    // action 1 stateAfter is a separate array — reflects its own tick (1), not action 0's
    expect(action1.stateAfter['A'].activeInterventions[0].remainingTurns).toBe(1)
  })

  it('stat_buff direct appears in stateAfter, does not change AV sequence or spd', () => {
    const A = makeEntity('A', 100)
    const iv = makeStatIv('stat1', 'A', 'A', 0, A_AV0, 3)

    const withBuff   = simulateBattle([A], [iv], [], [], 500)
    const withoutBuff = simulateBattle([A], [], [], [], 500)

    const action0With = withBuff.events.find((e) => e.characterId === 'A' && e.actionIndex === 0)!
    expect(action0With.stateAfter['A'].activeInterventions.some(
      (b) => b.id === 'stat1' && b.type === 'stat_buff',
    )).toBe(true)

    // stat_buff must NOT change AV sequence
    expect(withBuff.events.map((e) => e.av)).toEqual(withoutBuff.events.map((e) => e.av))

    // spd is also unchanged
    const noBuffSpd = withoutBuff.events.find((e) => e.characterId === 'A' && e.actionIndex === 0)!
      .stateAfter['A'].spd
    expect(action0With.stateAfter['A'].spd).toBeCloseTo(noBuffSpd, 5)
  })

  it('stat_buff direct remainingTurns ticks down and buff disappears on expiry', () => {
    const A = makeEntity('A', 100)
    // stat_buff: no immedite tick because it has no AV/SPD effect on target's queue entry
    // So remainingTurns = durationTurns = 2 in stateAfter of action 0
    const iv = makeStatIv('stat2', 'A', 'A', 0, A_AV0, 2)
    const result = simulateBattle([A], [iv], [], [], 500)

    const action0 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 0)!
    const action1 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 1)!
    const action2 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 2)!

    expect(action0.stateAfter['A'].activeInterventions.find((b) => b.id === 'stat2')?.remainingTurns).toBe(2)
    expect(action1.stateBefore['A'].activeInterventions.find((b) => b.id === 'stat2')?.remainingTurns).toBe(2)
    expect(action1.stateAfter['A'].activeInterventions.find((b) => b.id === 'stat2')?.remainingTurns).toBe(1)
    expect(action2.stateAfter['A'].activeInterventions.find((b) => b.id === 'stat2')).toBeUndefined()
  })

  it('spd_up aura appears on caster activeInterventions, and is mirrored (display-only) onto the target', () => {
    // C (caster, SPD=50) emits aura on T (target, SPD=100) after C's action 0 at AV=200
    const C = makeEntity('C', 50)
    const T = makeEntity('T', 100)
    const auraIv = makeSpdIv('aura1', 'T', 'C', 0, C_AV0, 50, 2, 'aura')
    const result = simulateBattle([C, T], [auraIv], [], [], 600)
    const cAction0 = result.events.find((e) => e.characterId === 'C' && e.actionIndex === 0)!

    // Master entry is on caster C's activeInterventions, with the real countdown
    const cBuffs = cAction0.stateAfter['C'].activeInterventions
    expect(cBuffs.some((b) => b.id === 'aura1' && b.buffKind === 'aura')).toBe(true)

    // T gets a mirrored entry (same id, sourced from C) purely so T's own panel can show the buff —
    // its remainingTurns is a sentinel (not ticked independently of the master)
    const tBuffs = cAction0.stateAfter['T'].activeInterventions
    expect(tBuffs.some((b) => b.id === 'aura1' && b.buffKind === 'aura' && b.sourceCharacterId === 'C')).toBe(true)

    // But T's effective speed is boosted (+50)
    expect(cAction0.stateAfter['T'].spd).toBeCloseTo(150, 2)
  })

  it('spd_up aura remainingTurns ticks on caster actions only, not target actions', () => {
    // C: SPD=50 (slow caster), T: SPD=200 (fast target, acts 4× before C's action 1)
    // Aura tick should only happen when C acts
    const C = makeEntity('C', 50)
    const T = makeEntity('T', 200)
    // delta=0: no speed effect on T, so we only test tick semantics
    const auraIv = makeSpdIv('aura2', 'T', 'C', 0, C_AV0, 0, 2, 'aura')
    const result = simulateBattle([C, T], [auraIv], [], [], 600)

    const cAction0 = result.events.find((e) => e.characterId === 'C' && e.actionIndex === 0)!
    const cAction1 = result.events.find((e) => e.characterId === 'C' && e.actionIndex === 1)!

    expect(cAction0.stateAfter['C'].activeInterventions.find((b) => b.id === 'aura2')?.remainingTurns).toBe(2)
    // C action 1: stateBefore still 2 (tick hasn't happened yet), stateAfter ticked to 1
    expect(cAction1.stateBefore['C'].activeInterventions.find((b) => b.id === 'aura2')?.remainingTurns).toBe(2)
    expect(cAction1.stateAfter['C'].activeInterventions.find((b) => b.id === 'aura2')?.remainingTurns).toBe(1)
  })

  it('spd_up aura expiry: target speed reverts to base after caster ticks the aura out', () => {
    // C: SPD=50 → actions at AV=200, 400
    // T: SPD=100, aura durationTurns=1 applied after C action 0
    // Aura expires when C acts next (action 1 at AV=400)
    // After expiry, all T events at AV>400 should show unbuffed spd=100
    const C = makeEntity('C', 50)
    const T = makeEntity('T', 100)
    const auraIv = makeSpdIv('aura3', 'T', 'C', 0, C_AV0, 50, 1, 'aura')
    const withAura    = simulateBattle([C, T], [auraIv], [], [], 700)
    const withoutAura = simulateBattle([C, T], [], [], [], 700)

    // T events after AV=400: aura expired, spd should be 100, and the mirrored display entry is gone too
    const tAfterExpiry = withAura.events.filter((e) => e.characterId === 'T' && e.av > 400)
    expect(tAfterExpiry.length).toBeGreaterThan(0)
    for (const ev of tAfterExpiry) {
      expect(ev.stateAfter['T'].spd).toBeCloseTo(100, 2)
      expect(ev.stateAfter['T'].activeInterventions.some((b) => b.id === 'aura3')).toBe(false)
    }

    // Before expiry (AV 200–400): T should be faster due to the +50 aura → more actions
    const tWithAuraPreExpiry    = withAura.events.filter((e) => e.characterId === 'T' && e.av > 200 && e.av < 400)
    const tWithoutAuraPreExpiry = withoutAura.events.filter((e) => e.characterId === 'T' && e.av > 200 && e.av < 400)
    expect(tWithAuraPreExpiry.length).toBeGreaterThanOrEqual(tWithoutAuraPreExpiry.length)
  })

  it('stat_buff with the same effectId replaces the previous instance instead of stacking', () => {
    const A = makeEntity('A', 100)
    // Both fired after A's action 0, same effectId — second should replace, not stack alongside, the first
    const first  = makeStatIv('statA', 'A', 'A', 0, A_AV0, 3, 'shared_effect')
    const second = makeStatIv('statB', 'A', 'A', 0, A_AV0, 5, 'shared_effect')
    const result = simulateBattle([A], [first, second], [], [], 500)
    const action0 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 0)!

    const buffsAfter = action0.stateAfter['A'].activeInterventions
    expect(buffsAfter).toHaveLength(1)
    expect(buffsAfter[0].id).toBe('statB')
    expect(buffsAfter[0].remainingTurns).toBe(5)
  })

  it('spd_up with the same effectId replaces the previous instance instead of stacking the speed delta', () => {
    const A = makeEntity('A', 100)
    const first  = makeSpdIv('spdA', 'A', 'A', 0, A_AV0, 20, 3, 'direct', 'shared_spd')
    const second = makeSpdIv('spdB', 'A', 'A', 0, A_AV0, 50, 5, 'direct', 'shared_spd')
    const result = simulateBattle([A], [first, second], [], [], 500)
    const action0 = result.events.find((e) => e.characterId === 'A' && e.actionIndex === 0)!

    // Only the second buff instance should remain
    const buffsAfter = action0.stateAfter['A'].activeInterventions
    expect(buffsAfter).toHaveLength(1)
    expect(buffsAfter[0].id).toBe('spdB')

    // Speed reflects only the second buff's +50, not a stacked +20+50=+70
    expect(action0.stateAfter['A'].spd).toBeCloseTo(150, 2)
  })

  it('refreshing a spd_up aura with the same effectId and same delta causes no extra AV pull-in', () => {
    // A (caster, SPD=45 — deliberately not a clean divisor of T's post-buff tick, so the refresh point
    // doesn't coincidentally land exactly on one of T's action ticks) grants T (SPD=100) the same +50
    // aura twice via the same effectId: once after A's action 0, again after A's action 1 — a pure
    // "refresh", same delta both times. Since T's actual speed never changes across the refresh, it
    // must not get an extra gauge pull-in on top of the one already applied at the first grant.
    const A = makeEntity('A', 45)
    const T = makeEntity('T', 100)
    const av0 = 10000 / 45
    const av1 = 2 * 10000 / 45
    const firstGrant  = makeSpdIv('grant1', 'T', 'A', 0, av0, 50, 10, 'aura', 'persist_spd')
    const secondGrant = makeSpdIv('grant2', 'T', 'A', 1, av1, 50, 10, 'aura', 'persist_spd')

    const withRefresh    = simulateBattle([A, T], [firstGrant, secondGrant], [], [], 1000)
    const withoutRefresh = simulateBattle([A, T], [firstGrant], [], [], 1000)

    const tWith    = withRefresh.events.filter((e) => e.characterId === 'T' && e.av > av1).map((e) => e.av)
    const tWithout = withoutRefresh.events.filter((e) => e.characterId === 'T' && e.av > av1).map((e) => e.av)
    expect(tWith).toEqual(tWithout)
  })
})

// ---- SP tracking (Step 7.5) ----

// Manual SP Intervention helper: creates a global (no before/after char) sp_gain/sp_loss/sp_cap_up/sp_cap_down
function makeSpIv(
  id: string,
  type: 'sp_gain' | 'sp_loss' | 'sp_cap_up' | 'sp_cap_down',
  value: number,
  triggerAv: number,
  durationTurns = 0,
): Intervention {
  return { id, triggerAv, type, targets: [], value, unit: 'flat', durationTurns }
}

describe('simulateBattle — SP tracking', () => {
  beforeAll(() => {
    setGameMetadata({
      characters: {
        [SPARKLE_ID]: { max_sp: SPARKLE_MAX_SP },
        [HUOHUO_ID]:  { max_sp: HUOHUO_MAX_SP },
      },
    } as unknown as DBMetadata)
  })

  it('initial teamStateBefore.sp === 3 and spMax === 5 (no spCapBonus)', () => {
    const huohuo = makeEntity(HUOHUO_ID, 134)
    const result = simulateBattle([huohuo], [], [], [], 200)
    const first = result.events[0]!
    expect(first.teamStateBefore.sp).toBe(3)
    expect(first.teamStateBefore.spMax).toBe(5)
  })

  it('Sparkle in team raises spMax to 8 via spCapBonus', () => {
    const sparkle = makeEntity(SPARKLE_ID, 120)
    const huohuo  = makeEntity(HUOHUO_ID, 134)
    const result = simulateBattle([sparkle, huohuo], [], [], [], 200)
    const first = result.events[0]!
    expect(first.teamStateBefore.spMax).toBe(8)   // 5 + 3 (Sparkle spCapBonus)
  })

  it('Huohuo basic gives +1 SP (BattleConfig sp_gain)', () => {
    const huohuo = makeEntity(HUOHUO_ID, 134)
    const result = simulateBattle([huohuo], [], [], [], 200)
    const ev = result.events[0]!
    // basic default → sp_gain +1
    expect(ev.teamStateAfter.sp).toBe(ev.teamStateBefore.sp + 1)
  })

  it('Huohuo skill costs -1 SP (BattleConfig sp_loss)', () => {
    const huohuo = makeEntity(HUOHUO_ID, 134)
    const override = makeOverride(HUOHUO_ID, 0, 'skill')
    const result = simulateBattle([huohuo], [], [override], [], 200)
    const skillEv = result.events.find((e) => e.actionChoice === 'skill')!
    expect(skillEv.teamStateAfter.sp).toBe(skillEv.teamStateBefore.sp - 1)
  })

  it('SP is clamped to spMax on gain', () => {
    const huohuo = makeEntity(HUOHUO_ID, 134)
    // Fill SP to max before the first action
    const fill = makeSpIv('fill', 'sp_gain', 10, 0)
    const result = simulateBattle([huohuo], [fill], [], [], 200)
    result.events.forEach((ev) => {
      expect(ev.teamStateAfter.sp).toBeLessThanOrEqual(ev.teamStateAfter.spMax)
    })
  })

  it('SP is floored at 0 on loss', () => {
    const huohuo = makeEntity(HUOHUO_ID, 134)
    // Drain SP to 0 before the first action
    const drain = makeSpIv('drain', 'sp_loss', 10, 0)
    const result = simulateBattle([huohuo], [drain], [], [], 200)
    result.events.forEach((ev) => {
      expect(ev.teamStateAfter.sp).toBeGreaterThanOrEqual(0)
    })
  })

  it('sp_cap_up raises spMax', () => {
    const huohuo = makeEntity(HUOHUO_ID, 134)
    const capUp = makeSpIv('cap-up', 'sp_cap_up', 2, 0, 3)
    const result = simulateBattle([huohuo], [capUp], [], [], 200)
    // After cap_up fires, spMax should be 7
    const first = result.events[0]!
    expect(first.teamStateBefore.spMax).toBe(7)   // cap_up global fires before the action
  })

  it('sp_cap_up with durationTurns:1 reverts spMax after 1 action', () => {
    const huohuo = makeEntity(HUOHUO_ID, 134)
    const capUp = makeSpIv('cap-up-1', 'sp_cap_up', 2, 0, 1)
    const result = simulateBattle([huohuo], [capUp], [], [], 300)
    const ev0 = result.events[0]!
    const ev1 = result.events[1]!
    // After cap_up fires: spMax = 7
    expect(ev0.teamStateBefore.spMax).toBe(7)
    // After 1 action tick (Step C), cap expires: spMax reverts to 5
    expect(ev1.teamStateBefore.spMax).toBe(5)
  })

  it('sp_cap_down with durationTurns:0 is permanent and clamps SP', () => {
    const huohuo = makeEntity(HUOHUO_ID, 134)
    // First fill SP, then lower the cap so SP must be clamped
    const fill   = makeSpIv('fill2', 'sp_gain', 10, 0)
    const capDown = makeSpIv('cap-down', 'sp_cap_down', 3, 0, 0)
    const result = simulateBattle([huohuo], [fill, capDown], [], [], 200)
    // After both interventions: spMax = 2, sp clamped to 2
    const first = result.events[0]!
    expect(first.teamStateBefore.spMax).toBe(2)
    expect(first.teamStateBefore.sp).toBeLessThanOrEqual(2)
  })

  it('teamStateBefore / teamStateAfter are independent snapshots (no shared reference)', () => {
    const huohuo = makeEntity(HUOHUO_ID, 134)
    const result = simulateBattle([huohuo], [], [], [], 300)
    const ev0 = result.events[0]!
    const ev1 = result.events[1]!
    // Objects must not be the same reference
    expect(ev0.teamStateAfter).not.toBe(ev1.teamStateBefore)
    // Mutating one should not affect the other
    const origSp = ev1.teamStateBefore.sp
    ev0.teamStateAfter.sp = 999
    expect(ev1.teamStateBefore.sp).toBe(origSp)
  })

  it('Sparkle ult sp_gain +6 raises SP (capped at spMax)', () => {
    const sparkle = makeEntity(SPARKLE_ID, 120)
    const huohuo  = makeEntity(HUOHUO_ID, 134)
    // Sparkle starts at 55 energy; fill her to max so the ult at AV=10 can fire
    const fillEnergy: Intervention = {
      id: 'fill-energy', triggerAv: 0,
      type: 'energy_gain', targets: [SPARKLE_ID],
      value: SPARKLE_MAX_SP, unit: 'flat', durationTurns: 0,
    }
    const ult = makeUlt('ult1', SPARKLE_ID, { type: 'at_av', av: 10 })
    const result = simulateBattle([sparkle, huohuo], [fillEnergy], [], [ult], 200)
    const ultEv = result.events.find((e) => e.actionChoice === 'ult' && e.characterId === SPARKLE_ID)
    expect(ultEv).toBeDefined()
    // Sparkle ult: sp_gain +6, capped at spMax (= 8 due to spCapBonus)
    const expectedSp = Math.min(ultEv!.teamStateBefore.sp + 6, ultEv!.teamStateBefore.spMax)
    expect(ultEv!.teamStateAfter.sp).toBe(expectedSp)
  })
})
