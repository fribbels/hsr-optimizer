import { setGameMetadata } from 'lib/state/gameMetadata'
import type { ActionNodeOverride, BattleEntity, Intervention, UltInsertion } from 'lib/tabs/tabAvVisualizer/types'
import { beforeEach, describe, expect, it } from 'vitest'
import type { DBMetadata } from 'types/metadata'
import { simulateBattle } from './simulateBattle'

// Exercises the real TrailblazerRemembrance.ts config end-to-end (no mocking, like
// simulateBattle.test.ts does for Huohuo/Sparkle) — confirms the actual character content wires up
// correctly on top of the generic engine mechanisms tested elsewhere.
const CAELUS_ID = '8007'
const MIMI_ID = 'trailblazer_remembrance_mimi'
const HUOHUO_ID = '1217b1'

function makeEntity(id: string, spd: number): BattleEntity {
  return { id, type: 'character', name: id, baseSpd: spd, spd, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 }
}

function override(actionIndex: number, choice: 'basic' | 'skill'): ActionNodeOverride {
  return { characterId: CAELUS_ID, actionIndex, choice }
}

beforeEach(() => {
  setGameMetadata({
    characters: { [CAELUS_ID]: { max_sp: 100 } },
  } as unknown as DBMetadata)
})

describe('simulateBattle — TrailblazerRemembrance (Caelus) + Mimi', () => {
  it('skill summons Mimi when absent, then charges her 10% on later casts once she\'s present', () => {
    const overrides: ActionNodeOverride[] = [
      override(0, 'skill'),
      override(1, 'skill'),
    ]
    const result = simulateBattle([makeEntity(CAELUS_ID, 100)], [], overrides, [], 250)
    const events = result.events.filter((e) => e.characterId === CAELUS_ID)
    expect(events).toHaveLength(2)

    // 1st skill: Mimi wasn't present -> summon_companion spawns her; her own onBattleStart (+50% self,
    // not scaling with ERR) and Caelus's onCompanionSummon (+40%, not scaling with ERR) both fire —
    // and the same cast's own +30 flat self energy_gain also runs through the talent's onAllyEnergyGain
    // conversion (it isn't limited to OTHER allies — Caelus's own gains count too): 30 * 0.1% = +3%.
    expect(events[0].stateAfter[MIMI_ID].energy).toBe(93)   // 0 + 50 + 40 + 3 (customMaxEnergy: 100)
    // 2nd skill: she's present now -> the entityPresent-gated +10% charge fires instead of summoning
    // again, plus another +3 from the same talent conversion off this skill's own +30 gain — both push
    // her past the cap, so she just lands exactly on it.
    expect(events[1].stateAfter[MIMI_ID].energy).toBe(100)
  })

  it('ultimate summons Mimi if absent, always charges her 40%, and grants a stack of 史诗 that enables the enhanced basic next turn', () => {
    // max_sp: 0 -> ult threshold (defaults to max_sp) is met immediately at AV=0, no setup needed.
    setGameMetadata({ characters: { [CAELUS_ID]: { max_sp: 0 } } } as unknown as DBMetadata)
    const ult: UltInsertion = { id: 'u1', casterId: CAELUS_ID, timing: { type: 'at_av', av: 0 } }
    const overrides: ActionNodeOverride[] = [override(0, 'basic')]
    const result = simulateBattle([makeEntity(CAELUS_ID, 100)], [], overrides, [ult], 250)

    const ultEvent = result.events.find((e) => e.turnKind === 'ult')!
    expect(ultEvent.stateAfter[MIMI_ID]).toBeDefined()   // summoned by the ult
    expect(ultEvent.stateAfter[CAELUS_ID].activeInterventions.some((b) => b.effectId === 'trailblazer_remembrance_epic')).toBe(true)

    const basicEvent = result.events.find((e) => e.characterId === CAELUS_ID && e.turnKind === 'normal')!
    expect(basicEvent.hitCount).toBe(2)   // enhanced variant, consumed the 史诗 stack granted by the ult
  })

  it('basic attack reverts to the normal 1-hit version once 史诗 is fully consumed', () => {
    setGameMetadata({ characters: { [CAELUS_ID]: { max_sp: 0 } } } as unknown as DBMetadata)
    const ult: UltInsertion = { id: 'u1', casterId: CAELUS_ID, timing: { type: 'at_av', av: 0 } }
    // Only 1 stack granted (single ult cast) -> only the first basic should be enhanced.
    const overrides: ActionNodeOverride[] = [override(0, 'basic'), override(1, 'basic')]
    const result = simulateBattle([makeEntity(CAELUS_ID, 100)], [], overrides, [ult], 350)
    const normalEvents = result.events.filter((e) => e.characterId === CAELUS_ID && e.turnKind === 'normal')
    expect(normalEvents[0].hitCount).toBe(2)
    expect(normalEvents[1].hitCount).toBe(1)
  })

  it('Mimi auto-acts: 普攻 while below her own max energy, restoring the owner and herself', () => {
    const entities: BattleEntity[] = [
      makeEntity(CAELUS_ID, 100),
      { id: MIMI_ID, type: 'memosprite', ownerId: CAELUS_ID, name: 'Mimi', baseSpd: 130, spd: 130, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
    ]
    // Statically present -> her own onBattleStart (initial 50% + her +50% self-charge) already puts her
    // exactly at 100% before her first turn, which would auto-pick skill instead of basic. Knock her
    // back down with a manual global Intervention so this test actually exercises the "below max" path.
    const interventions = [{
      id: 'iv1', triggerAv: 0, type: 'energy_loss' as const, targets: [MIMI_ID], value: 60, unit: 'flat' as const, durationTurns: 0,
    }]
    const result = simulateBattle(entities, interventions, [], [], 200)
    const mimiEvents = result.events.filter((e) => e.characterId === MIMI_ID)
    expect(mimiEvents.length).toBeGreaterThan(0)
    expect(mimiEvents[0].actionChoice).toBe('basic')
    // 坏人！麻烦！: 10 flat to Caelus (her owner, scales with his ERR — he has none, so +10 exactly).
    // Caelus starts at 50% of 100 = 50.
    expect(mimiEvents[0].stateAfter[CAELUS_ID].energy).toBe(60)
  })

  it('E2 (eidolon 2): fires for another memosprite\'s own action, but not a regular character\'s', () => {
    // Mimi deliberately left out — she instantly hits 100% from her own onBattleStart and would
    // auto-cast her skill at AV=0 (pulled forward), muddying these numbers; her exclusion from E2 is
    // covered separately below.
    const entities: BattleEntity[] = [
      { id: CAELUS_ID, type: 'character', name: CAELUS_ID, baseSpd: 100, spd: 100, err: 0, eidolon: 2, color: '#fff', slotIndex: 0 },
      { id: 'B', type: 'character', name: 'B', baseSpd: 200, spd: 200, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
      { id: 'other_memosprite', type: 'memosprite', ownerId: 'B', name: 'Other', baseSpd: 300, spd: 300, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
    ]
    // Action order by speed: other_memosprite (av≈33.3) -> B (av=50)
    const result = simulateBattle(entities, [], [], [], 90)

    const energyAt = (av: number) => result.energyTimeline.filter((c) => c.av <= av).at(-1)?.energyMap[CAELUS_ID]
    // Caelus starts at 50% of 100 = 50.
    expect(energyAt(40)).toBe(58)    // after other_memosprite's action: E2 fires (+8)
    expect(energyAt(60)).toBe(58)    // after B's (regular character) action: E2 does NOT fire — unchanged
  })

  it('E2 (eidolon 2): does not fire for Mimi\'s own action', () => {
    const entities: BattleEntity[] = [
      { id: CAELUS_ID, type: 'character', name: CAELUS_ID, baseSpd: 100, spd: 100, err: 0, eidolon: 2, color: '#fff', slotIndex: 0 },
      { id: MIMI_ID, type: 'memosprite', ownerId: CAELUS_ID, name: 'Mimi', baseSpd: 130, spd: 130, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
    ]
    // Knock Mimi below her own max (her onBattleStart alone would otherwise put her exactly at 100%,
    // auto-pulling her skill to AV=0) so her first action instead happens naturally via her own basic.
    const interventions = [{
      id: 'iv1', triggerAv: 0, type: 'energy_loss' as const, targets: [MIMI_ID], value: 60, unit: 'flat' as const, durationTurns: 0,
    }]
    const result = simulateBattle(entities, interventions, [], [], 90)

    const mimiEvent = result.events.find((e) => e.characterId === MIMI_ID)!
    expect(mimiEvent.actionChoice).toBe('basic')
    // Her own basic restores Caelus 10 via the 'owner' target — that's a separate mechanic, not E2.
    // Caelus starts at 50; if E2 had also (incorrectly) fired here, this would be 50 + 10 + 8 = 68.
    expect(mimiEvent.stateAfter[CAELUS_ID].energy).toBe(60)
  })

  it('casting 声援 spends her own energy down to (almost) 0, leaving only the same-cast owner-gain reflection', () => {
    const entities: BattleEntity[] = [
      makeEntity(CAELUS_ID, 100),
      { id: MIMI_ID, type: 'memosprite', ownerId: CAELUS_ID, name: 'Mimi', baseSpd: 130, spd: 130, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
    ]
    // Statically present -> her own onBattleStart puts her exactly at 100%, auto-pulling her skill to
    // AV=0. The choice field is ignored by autoActsOnOwnEnergy, but the target still needs picking, same
    // as any other single_ally ability.
    const overrides: ActionNodeOverride[] = [{ characterId: MIMI_ID, actionIndex: 0, choice: 'skill', targets: [CAELUS_ID] }]
    const result = simulateBattle(entities, [], overrides, [], 90)

    const mimiEvent = result.events.find((e) => e.characterId === MIMI_ID)!
    expect(mimiEvent.actionChoice).toBe('skill')
    // The self-reset runs first (100 -> 0), so by the time the skill's own owner energy_gain (+10 to
    // Caelus) reflects back via his talent (10 * 10% = +1), she's already well below max — leaving a
    // small +1 residual instead of re-triggering the "still maxed" pull-to-front bug.
    expect(mimiEvent.stateAfter[MIMI_ID].energy).toBe(1)
  })

  it('伙伴！一起！ scales off Caelus\'s real Crit DMG (copied onto Mimi at summon), not just the flat 26.4%', () => {
    // Mimi has no gear of her own — summonCompanion copies the owner's BattleEntity.cd onto her own
    // EnergyState at the moment she's actually spawned, which is what this test needs to exercise (a
    // statically-present Mimi literal wouldn't go through that copy at all).
    const entities: BattleEntity[] = [{ ...makeEntity(CAELUS_ID, 100), cd: 1.5 }]   // 150% Crit DMG
    const overrides: ActionNodeOverride[] = [override(0, 'skill')]
    const result = simulateBattle(entities, [], overrides, [], 250)

    const mimiEvent = result.events.find((e) => e.characterId === MIMI_ID)!
    const cheerBuff = mimiEvent.stateAfter[CAELUS_ID].activeInterventions.find((b) => b.effectId === 'mimi_partner_cheer')
    // 26.4 (flat) + 13.2% * 150 (Caelus's real CD, copied onto Mimi at summon time) = 46.2
    expect(cheerBuff?.value).toBeCloseTo(46.2, 5)
  })

  it('basic maxing herself mid-resolution chains into skill at the same AV, but not a spurious third action', () => {
    const entities: BattleEntity[] = [
      makeEntity(CAELUS_ID, 100),
      { id: MIMI_ID, type: 'memosprite', ownerId: CAELUS_ID, name: 'Mimi', baseSpd: 130, spd: 130, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
    ]
    // Her own onBattleStart already maxes her -> knock her down to 94 so this test exercises a natural
    // basic (not an immediate forced skill). Her basic's own effects (+1 reflected via Caelus's talent,
    // +5% self-charge) land her exactly on 100 mid-resolution, which legitimately chains straight into
    // skill at the same AV (she's now "maxed", same as if some other external source had done it).
    const interventions: Intervention[] = [
      { id: 'iv0', triggerAv: 0, type: 'energy_loss', targets: [MIMI_ID], value: 6, unit: 'flat', durationTurns: 0 },
    ]
    const result = simulateBattle(entities, interventions, [], [], 90)

    const mimiEvents = result.events.filter((e) => e.characterId === MIMI_ID && e.av < 1)
    expect(mimiEvents.map((e) => e.actionChoice)).toEqual(['basic', 'skill'])
    // The skill's self-reset now runs before its own owner energy_gain, so the same-cast reflection (+1)
    // lands while she's already below max — a small residual, not a third spurious action.
    expect(mimiEvents[1].stateAfter[MIMI_ID].energy).toBe(1)
  })

  it('basic chains into skill at the same AV even with Huohuo present, without a spurious third action', () => {
    // Reproduces the real bug report: Huohuo's "any ally acts" listener (her talent, active while she
    // holds Rangming — which her own onBattleStart grants automatically) fires before Mimi's own skill
    // templates run. The listener's self-gain reflects into Mimi via Caelus's talent the same way her
    // own owner-gain does — while she's still sitting at exactly 100 from the basic->skill chain, before
    // her self-reset has run. Without the energyBefore<max guard, this reflection reads as "still maxed"
    // and spuriously pulls her already-queued next action into a third turn.
    const entities: BattleEntity[] = [
      makeEntity(CAELUS_ID, 100),
      { id: MIMI_ID, type: 'memosprite', ownerId: CAELUS_ID, name: 'Mimi', baseSpd: 130, spd: 130, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
      makeEntity(HUOHUO_ID, 80),
    ]
    const interventions: Intervention[] = [
      { id: 'iv0', triggerAv: 0, type: 'energy_loss', targets: [MIMI_ID], value: 6, unit: 'flat', durationTurns: 0 },
    ]
    const result = simulateBattle(entities, interventions, [], [], 90)

    const mimiEvents = result.events.filter((e) => e.characterId === MIMI_ID && e.av < 1)
    expect(mimiEvents.map((e) => e.actionChoice)).toEqual(['basic', 'skill'])
    expect(mimiEvents[1].stateAfter[MIMI_ID].energy).toBe(1)
  })

  it('an indirect energy gain via 伙伴！一起！(talent conversion) also pulls Mimi to front if it maxes her', () => {
    // B needs a large max energy so a single intervention can produce a big enough *actual* gain (capped
    // by B's own max) for the 10%-conversion alone to fully re-max Mimi from 0 in one shot.
    setGameMetadata({
      characters: { [CAELUS_ID]: { max_sp: 100 }, B: { max_sp: 2000 } },
    } as unknown as DBMetadata)

    const entities: BattleEntity[] = [
      makeEntity(CAELUS_ID, 100),
      { id: MIMI_ID, type: 'memosprite', ownerId: CAELUS_ID, name: 'Mimi', baseSpd: 130, spd: 130, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
      { id: 'B', type: 'character', name: 'B', baseSpd: 200, spd: 200, err: 0, eidolon: 0, color: '#fff', slotIndex: 0 },
    ]
    const interventions: Intervention[] = [
      // Her own onBattleStart already maxes her -> immediately knock her all the way down at the same
      // AV=0 so her first action resolves as a natural 'basic' (no energy side effects on Caelus that
      // would otherwise recurse back into his own talent and contaminate this test). Her natural next
      // action then lands around AV≈76.9 (10000/130).
      { id: 'iv0', triggerAv: 0, type: 'energy_loss', targets: [MIMI_ID], value: 100, unit: 'flat', durationTurns: 0 },
      // A huge gain on B (capped by B's own max, starting at 50% of 2000 = 1000) — the real applied
      // amount (1000) converts into a full +100% for Mimi via Caelus's talent (ratioPercent 0.1), maxing
      // her out again even though the energy_gain itself never targeted her.
      { id: 'iv1', triggerAv: 30, type: 'energy_gain', targets: ['B'], value: 100000, unit: 'flat', durationTurns: 0, scalesWithErr: false },
    ]
    const result = simulateBattle(entities, interventions, [], [], 90)

    const mimiEvents = result.events.filter((e) => e.characterId === MIMI_ID)
    expect(mimiEvents[0].actionChoice).toBe('basic')
    expect(mimiEvents[0].av).toBeCloseTo(0, 5)
    // She's pulled and forced to skill right at the intervention's AV=30 — this is the bug: the pull
    // check only used to look at the energy_gain's direct target (B), never the conversion's target, so
    // she'd otherwise stay on her natural ~76.9 (10000/130) cadence.
    const pulledEvent = mimiEvents.find((e) => Math.abs(e.av - 30) < 0.01 && e.actionChoice === 'skill')
    expect(pulledEvent).toBeDefined()
    // Self-reset runs first (-> 0), then the skill's own owner energy_gain (+10 to Caelus) reflects back
    // +1 via his talent — a small residual, not a re-trigger of the pull (which the old effect order
    // would have caused, since she'd still have read as "maxed" when the reflection landed).
    expect(pulledEvent!.stateAfter[MIMI_ID].energy).toBe(1)
    expect(mimiEvents.some((e) => Math.abs(e.av - 76.9) < 1)).toBe(false)
  })
})
