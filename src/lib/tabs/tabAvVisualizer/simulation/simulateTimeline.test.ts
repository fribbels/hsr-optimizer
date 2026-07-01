// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { Intervention } from 'lib/tabs/tabAvVisualizer/types'
import { simulateTimeline } from './simulateTimeline'

// charA: panel speed=100, white value=100 (no relics)
const charA = { id: 'A', spd: 100, baseSpd: 100 }
// charB: panel speed=200, white value=170 (relics +30)
const charB = { id: 'B', spd: 200, baseSpd: 170 }

// ---- No interventions (static gauge, should match Phase 1) ----

describe('simulateTimeline — no interventions', () => {
  it('single character: actions at multiples of interval, exclusive of totalAv', () => {
    const events = simulateTimeline([charA], [], 300)
    expect(events.map((e) => e.av)).toEqual([100, 200])
  })

  it('excludes action whose AV equals totalAv exactly', () => {
    const events = simulateTimeline([charA], [], 200)
    expect(events.map((e) => e.av)).toEqual([100])
  })

  it('two characters interleaved by speed', () => {
    const events = simulateTimeline([charA, charB], [], 200)
    expect(events.map((e) => ({ id: e.characterId, av: e.av }))).toEqual([
      { id: 'B', av: 50 },
      { id: 'A', av: 100 },
      { id: 'B', av: 100 },
      { id: 'B', av: 150 },
    ])
  })

  it('returns empty for no characters', () => {
    expect(simulateTimeline([], [], 300)).toEqual([])
  })

  it('returns empty for zero totalAv', () => {
    expect(simulateTimeline([charA], [], 0)).toEqual([])
  })

  it('actionIndex increments independently per character', () => {
    const events = simulateTimeline([charA], [], 350)
    expect(events.map((e) => e.actionIndex)).toEqual([0, 1, 2])
  })

  it('effectiveSpd equals base spd when no buffs', () => {
    const events = simulateTimeline([charA], [], 200)
    expect(events.every((e) => e.effectiveSpd === 100)).toBe(true)
  })
})

// ---- SPD buff / debuff ----

describe('simulateTimeline — spd_up / spd_down', () => {
  it('spd_up flat: shortens the next N action intervals', () => {
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', afterCharId: 'A',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 1,
    }
    // afterCharId='A' (after action): charA@100 acts at SPD=100, the buff fires after the action (gauge conservation)
    // remainingAv=100; gaugeDistance=10000; newSpd=200; newRemainingAv=50; new AV=150; buff exhausted
    const events = simulateTimeline([charA], [iv], 300)
    expect(events.map((e) => e.av)).toEqual([100, 150, 250])
  })

  it('spd_up lasts exactly durationTurns then reverts', () => {
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', afterCharId: 'A',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 2,
    }
    // afterCharId='A' (after action): the buff fires after charA@100 acts, via gauge conservation
    // remainingAv=100; newRemainingAv=50; new AV=150; buff has 1 turn left
    // charA@150: SPD=200 → AV=200; buff expires; charA@200: SPD=100 → AV=300
    const events = simulateTimeline([charA], [iv], 310)
    expect(events.map((e) => e.av)).toEqual([100, 150, 200, 300])
  })

  it('spd_up percent: uses white value (base speed without relic) as basis', () => {
    // charA white value=100, panel speed=100; 50% buff = +50 flat → panel 150 → interval≈66.67
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', afterCharId: 'A',
      targets: ['A'], value: 50, unit: 'percent', durationTurns: 1,
    }
    const events = simulateTimeline([charA], [iv], 200)
    // afterCharId='A' (after action): white value 100 × 50% = +50 flat; gauge conservation → AV = 100 + 10000/150
    expect(events[1].av).toBeCloseTo(100 + 10000 / 150, 5)
  })

  it('spd_up percent with relic speed: percent uses white value, not panel speed', () => {
    // charB white value=170, panel speed=200 (relics +30); 50% buff = 170×0.5 = +85 flat → SPD=285
    const charBWithRelic = { id: 'B', spd: 200, baseSpd: 170 }
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'spd_up', afterCharId: 'B',
      targets: ['B'], value: 50, unit: 'percent', durationTurns: 1,
    }
    const events = simulateTimeline([charBWithRelic], [iv], 200)
    // afterCharId='B' (after action): white value 170 × 50% = +85 flat; gauge conservation → AV = 50 + 10000/285
    expect(events[1].av).toBeCloseTo(50 + 10000 / 285, 5)
  })

  it('spd_down flat: lengthens subsequent intervals', () => {
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'spd_down', afterCharId: 'B',
      targets: ['B'], value: 100, unit: 'flat', durationTurns: 1,
    }
    // afterCharId='B' (after action): the debuff fires after charB@50 acts; gauge conservation → new AV=150; debuff exhausted
    const events = simulateTimeline([charB], [iv], 200)
    expect(events.map((e) => e.av)).toEqual([50, 150])
  })

  it('spd buff does not affect characters not in targets', () => {
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'spd_up',
      targets: ['B'], value: 100, unit: 'flat', durationTurns: 2,
    }
    const events = simulateTimeline([charA, charB], [iv], 150)
    const aEvents = events.filter((e) => e.characterId === 'A')
    expect(aEvents[0].av).toBe(100)
    expect(aEvents[0].effectiveSpd).toBe(100)
  })

  it('effectiveSpd in result reflects active buff at time of action, before timing durationTurns=2', () => {
    // triggerAv=100 coincides with A's first action (during action / before), immediately decremented 2→1, buff still active
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 2,
    }
    const events = simulateTimeline([charA], [iv], 300)
    // AV=100: buff still has 1 turn left → effectiveSpd=200 (used to compute the next interval)
    expect(events[0].effectiveSpd).toBe(200)
    // AV=150: the buff was decremented to 0 and expired after the AV=100 action → effectiveSpd back to 100
    expect(events[1].effectiveSpd).toBe(100)
    // AV=250: no buff
    expect(events[2].effectiveSpd).toBe(100)
  })

  it('gauge distance recalculation: mid-interval speed buff recalculates target next-action AV', () => {
    // HSR gauge conservation: gaugeDistance = remainingAV × oldSpd, newRemainingAV = gaugeDistance / newSpd
    // charA: spd=100 (white value 100), first action AV=100
    // charB: spd=200, fires spd_up on A at AV=50: +100 flat
    // The buff takes effect at AV=50; A's next action was originally 100
    // remaining = 100 - 50 = 50; oldSpd=100; gaugeDistance = 50 × 100 = 5000
    // newSpd = 100 + 100 = 200; newRemainingAV = 5000 / 200 = 25
    // A's new AV = 50 + 25 = 75
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'spd_up',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 2,
    }
    const events = simulateTimeline([charA, charB], [iv], 150)
    const aAction0 = events.find((e) => e.characterId === 'A' && e.actionIndex === 0)
    expect(aAction0?.av).toBeCloseTo(75, 5)
  })

  it('gauge distance: percent buff uses white value; acts at correct position', () => {
    // charD: panel 200 (white value 100, relics +100); first action AV=10000/200=50
    // charC: panel 400, fires spd_up on D at AV=25: 50% of white value → 100×0.5=50 flat
    // remaining = 50 - 25 = 25; oldSpd=200; gaugeDistance = 25 × 200 = 5000
    // newSpd = 200 + 50 = 250; newRemainingAV = 5000 / 250 = 20
    // D's new AV = 25 + 20 = 45
    const charC = { id: 'C', spd: 400, baseSpd: 400 }
    const charD = { id: 'D', spd: 200, baseSpd: 100 }
    const iv: Intervention = {
      id: '1', triggerAv: 25, type: 'spd_up',
      targets: ['D'], value: 50, unit: 'percent', durationTurns: 2,
    }
    const events = simulateTimeline([charC, charD], [iv], 100)
    const dAction0 = events.find((e) => e.characterId === 'D' && e.actionIndex === 0)
    // remaining=25; gaugeDistance=25×200=5000; newSpd=200+50=250; newRemainingAV=5000/250=20; D@45
    expect(dAction0?.av).toBeCloseTo(45, 5)
  })

  it('mid-cycle buff provides exactly durationTurns buffed intervals, matching own-turn application', () => {
    // Verifies: when a buff takes effect mid-cycle on another character, the total number of buffed intervals it
    // provides should match what happens when it takes effect exactly on the character's own turn (always
    // durationTurns intervals) — the partial interval from gauge recalculation must not grant an extra turn.
    // charA: spd=100 (white value 100), first action AV=100
    // charB: spd=200, fires spd_up on A at AV=50: +100 flat, durationTurns=2
    // The recalculated interval (AV 50→75) counts as turn 1; A@75→A@125 counts as turn 2 (exhausted); A@125→A@225 is back to normal
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'spd_up',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 2,
    }
    const events = simulateTimeline([charA, charB], [iv], 250)
    const aEvents = events.filter((e) => e.characterId === 'A')
    // A@75 (the recalculated 1st action, buff active, effectiveSpd=200 used to compute the next interval)
    expect(aEvents[0].av).toBeCloseTo(75, 5)
    expect(aEvents[0].effectiveSpd).toBe(200)
    // A@125 (75+10000/200=125, arrives while still within the buffed span, but the buff is already exhausted by
    // this point, so effectiveSpd is back to 100)
    expect(aEvents[1].av).toBeCloseTo(125, 5)
    expect(aEvents[1].effectiveSpd).toBe(100)
    // A@225 (125+10000/100=225, back to the normal interval)
    expect(aEvents[2].av).toBeCloseTo(225, 5)
  })
})

// ---- AV advance / delay (cross-character: A triggers and modifies B, or vice versa) ----
// Note: AV interventions modify the target's next-action AV in the queue. Under the unified event-queue
// architecture, this also works correctly when the triggering character targets itself (see the regression
// tests in the "unified event queue" describe block below) — cross-character scenarios are used here purely
// to keep the basic test cases simple and intuitive.

describe('simulateTimeline — av_advance / av_delay', () => {
  it('av_advance flat: reduces target next action AV by flat amount', () => {
    // charB (spd=200) acts at AV=50, the intervention advances charA by 30
    // charA's next AV=100, remaining=50, delta=30 (flat) → new AV=70
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'av_advance',
      targets: ['A'], value: 30, unit: 'flat', durationTurns: 0,
    }
    const events = simulateTimeline([charA, charB], [iv], 150)
    const aAction0 = events.find((e) => e.characterId === 'A' && e.actionIndex === 0)
    expect(aAction0?.av).toBeCloseTo(70, 5)
  })

  it('av_advance percent: reduces target AV by X% of target max action interval', () => {
    // charB acts at AV=50, the intervention advances charA (spd=100) by 25%
    // charA's max interval=100, delta=100*25%=25 → new AV=max(50, 100-25)=75
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'av_advance',
      targets: ['A'], value: 25, unit: 'percent', durationTurns: 0,
    }
    const events = simulateTimeline([charA, charB], [iv], 150)
    const aAction0 = events.find((e) => e.characterId === 'A' && e.actionIndex === 0)
    expect(aAction0?.av).toBeCloseTo(75, 5)
  })

  it('av_delay flat: increases target next action AV by flat amount', () => {
    // charB acts at AV=50, the intervention delays charA by 60
    // charA's next AV=100, delta=60 (flat) → new AV=160
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'av_delay',
      targets: ['A'], value: 60, unit: 'flat', durationTurns: 0,
    }
    const events = simulateTimeline([charA, charB], [iv], 200)
    const aAction0 = events.find((e) => e.characterId === 'A' && e.actionIndex === 0)
    expect(aAction0?.av).toBeCloseTo(160, 5)
  })

  it('av_delay percent: increases target AV by X% of target max action interval', () => {
    // charB acts at AV=50, the intervention delays charA (spd=100) by 50%
    // charA's max interval=100, delta=100*50%=50 → new AV=100+50=150
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'av_delay',
      targets: ['A'], value: 50, unit: 'percent', durationTurns: 0,
    }
    const events = simulateTimeline([charA, charB], [iv], 200)
    const aAction0 = events.find((e) => e.characterId === 'A' && e.actionIndex === 0)
    expect(aAction0?.av).toBeCloseTo(150, 5)
  })

  it('av_advance clamps target to no earlier than triggerAv', () => {
    // charB acts at AV=50, the intervention advances charA (spd=100) by 100%
    // delta=100*100%=100 → new AV=max(50, 100-100)=max(50,0)=50 (clamped to the trigger AV)
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'av_advance',
      targets: ['A'], value: 100, unit: 'percent', durationTurns: 0,
    }
    const events = simulateTimeline([charA, charB], [iv], 200)
    const aAction0 = events.find((e) => e.characterId === 'A' && e.actionIndex === 0)
    expect(aAction0?.av).toBeCloseTo(50, 5)
  })

  it('av_advance only affects the next action; subsequent interval reverts to normal', () => {
    // charB acts at AV=50, advances charA (spd=100) by 25%
    // charA's max interval=100, delta=25 → new AV=max(50, 100-25)=75
    // charA's second action=75+100=175 (back to the normal interval)
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'av_advance',
      targets: ['A'], value: 25, unit: 'percent', durationTurns: 0,
    }
    const events = simulateTimeline([charA, charB], [iv], 200)
    const aEvents = events.filter((e) => e.characterId === 'A')
    expect(aEvents[0].av).toBeCloseTo(75, 5)
    expect(aEvents[1].av - aEvents[0].av).toBeCloseTo(100, 5)
  })
})

// ---- Edge cases ----

describe('simulateTimeline — edge cases', () => {
  it('intervention targeting non-existent character is silently ignored', () => {
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'spd_up',
      targets: ['Z'], value: 100, unit: 'flat', durationTurns: 1,
    }
    expect(() => simulateTimeline([charA], [iv], 200)).not.toThrow()
    const events = simulateTimeline([charA], [iv], 200)
    expect(events.map((e) => e.av)).toEqual([100])
  })

  it('multiple interventions at same triggerAv are all applied in order', () => {
    const iv1: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up',
      targets: ['A'], value: 50, unit: 'flat', durationTurns: 2,
    }
    const iv2: Intervention = {
      id: '2', triggerAv: 100, type: 'spd_up',
      targets: ['A'], value: 50, unit: 'flat', durationTurns: 2,
    }
    // Both +50 SPD buffs fire at the same AV (during action / before), each decremented from 2→1 and still active
    // Combined SPD=200 → interval=50 → next AV=150 (both buffs expire after that action)
    const events = simulateTimeline([charA], [iv1, iv2], 250)
    expect(events[1].av).toBeCloseTo(150, 5)
  })

  it('spd buff prevents speed from dropping below 1', () => {
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'spd_down',
      targets: ['B'], value: 9999, unit: 'flat', durationTurns: 2,
    }
    const events = simulateTimeline([charB], [iv], 200)
    expect(events.every((e) => e.effectiveSpd >= 1)).toBe(true)
  })
})

// ---- Regression tests for the unified event-queue architecture fix ----
// Background: interventions used to only be processed at the moment some action event happened to trigger the
// check, borrowing that action's AV as "now". When no character had acted yet before triggerAv (e.g. a speed-up
// right at the very start of the timeline), this caused:
// 1) The character whose action happened to trigger the check would not have its own current action recalculated
//    via the gauge formula (only its *next* action was affected)
// 2) Other characters' recalculations used the wrong "now" (the AV of whichever action triggered the check,
//    instead of the intervention's actual triggerAv)
// 3) Advance/delay on "the character about to act next" failed completely (its queue entry couldn't be found)
// Fix: treat interventions as events on the timeline too, and process them strictly in real-AV order alongside
// character actions.

describe('simulateTimeline — unified event queue (fixes interventions failing to affect the "nearest" character)', () => {
  it('regression: av_advance now succeeds even when the target is the very next character to act', () => {
    // Previous bug: when the target was "the character about to act next", advance had no effect at all
    // (its queue entry couldn't be found)
    // charA's first action was originally AV=100 (no prior action), advance by 30 (flat) at AV=20
    const iv: Intervention = {
      id: '1', triggerAv: 20, type: 'av_advance',
      targets: ['A'], value: 30, unit: 'flat', durationTurns: 0,
    }
    const events = simulateTimeline([charA], [iv], 200)
    expect(events[0].av).toBeCloseTo(70, 5)
  })

  it('regression: spd_up before any action recalculates that very next action via gauge distance, not just the one after it', () => {
    // Previous bug: when A was the character that happened to trigger the check, the buff showed as active but
    // A's position didn't move at all — only its second action was advanced
    // charA's first action was originally AV=100, +100% speed-up (against white value 100) +100 flat at AV=20
    const iv: Intervention = {
      id: '1', triggerAv: 20, type: 'spd_up',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 2,
    }
    const events = simulateTimeline([charA], [iv], 250)
    // Gauge conservation: remaining=100-20=80, oldSpd=100, newSpd=200
    // gaugeDistance=80×100=8000, newRemainingAv=8000/200=40, new AV=20+40=60
    expect(events[0].av).toBeCloseTo(60, 5)
    expect(events[0].effectiveSpd).toBe(200)
  })

  it('regression: ABC three characters — intervention in the gap before any action correctly recalculates all three using its own triggerAv (not the AV of whichever action happened to trigger the check)', () => {
    const spdA = 10000 / 50    // first action AV=50
    const spdB = 10000 / 75    // first action AV=75
    const spdC = 10000 / 100   // first action AV=100
    const charA2 = { id: 'A2', spd: spdA, baseSpd: spdA }
    const charB2 = { id: 'B2', spd: spdB, baseSpd: spdB }
    const charC2 = { id: 'C2', spd: spdC, baseSpd: spdC }
    const iv: Intervention = {
      id: '1', triggerAv: 20, type: 'spd_up',
      targets: ['A2', 'B2', 'C2'], value: 100, unit: 'percent', durationTurns: 2,
    }
    const events = simulateTimeline([charA2, charB2, charC2], [iv], 200)

    // Every character's first action should be recalculated via the gauge conservation formula:
    // new AV = triggerAv + (original AV - triggerAv) × old speed / new speed (new speed = old speed × 2, since it's a 100% speed-up)
    const expectedA = 20 + (50 - 20) * spdA / (spdA * 2)   // = 35
    const expectedB = 20 + (75 - 20) * spdB / (spdB * 2)   // = 47.5
    const expectedC = 20 + (100 - 20) * spdC / (spdC * 2)  // = 60

    const firstA = events.find((e) => e.characterId === 'A2' && e.actionIndex === 0)
    const firstB = events.find((e) => e.characterId === 'B2' && e.actionIndex === 0)
    const firstC = events.find((e) => e.characterId === 'C2' && e.actionIndex === 0)

    expect(firstA?.av).toBeCloseTo(expectedA, 5)
    expect(firstB?.av).toBeCloseTo(expectedB, 5)
    expect(firstC?.av).toBeCloseTo(expectedC, 5)

    // All three first actions should reflect the buffed effective speed (no longer the inconsistent state of
    // "position unchanged but shown as buffed")
    expect(firstA?.effectiveSpd).toBeCloseTo(spdA * 2, 5)
    expect(firstB?.effectiveSpd).toBeCloseTo(spdB * 2, 5)
    expect(firstC?.effectiveSpd).toBeCloseTo(spdC * 2, 5)
  })

  it('regression: after timing at same AV correctly provides full durationTurns effect via gauge conservation', () => {
    // afterCharId='A' (after action) fires at the same AV, durationTurns=2: gauge conservation provides 2 buffed intervals
    // The buff fires after charA@100 acts: remainingAv=100; gaugeDistance=10000; newSpd=200; new AV=150; 1 turn left
    // charA@150: SPD=200 → AV=200; buff expires; charA@200: SPD=100 → AV=300
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', afterCharId: 'A',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 2,
    }
    const events = simulateTimeline([charA], [iv], 310)
    expect(events.map((e) => e.av)).toEqual([100, 150, 200, 300])
  })
})

// ---- Action-timing semantics (before vs after) ----

describe('simulateTimeline — action-timing semantics (before vs after)', () => {
  it('before timing: spd_up durationTurns=1 at same AV → buff consumed immediately, no effect on intervals', () => {
    // No afterCharId (during action) + triggerAv equal to the target's action AV → the buff is consumed
    // immediately (1→0), with no effect on anything afterward
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 1,
    }
    const events = simulateTimeline([charA], [iv], 300)
    expect(events.map((e) => e.av)).toEqual([100, 200])
    expect(events[0].effectiveSpd).toBe(100)  // the buff was consumed before the action, so it's not active during the action
  })

  it('before timing: spd_up durationTurns=N at same AV → consumed to N-1, still affects next N-1 intervals', () => {
    // before + durationTurns=3 → immediately consumed 3→2, the remaining 2 turns are still active
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 3,
    }
    const events = simulateTimeline([charA], [iv], 400)
    // charA@100: SPD=200 (buff has 2 turns left) → AV=150; decremented, 1 turn left
    // charA@150: SPD=200 (buff has 1 turn left) → AV=200; expires
    // charA@200: SPD=100 → AV=300
    expect(events.map((e) => e.av)).toEqual([100, 150, 200, 300])
  })

  it('after timing: spd_up durationTurns=1 at same AV → 1 fast interval via gauge conservation', () => {
    // afterCharId='A' (end-of-action instant): charA acts at normal speed, then the buff fires and gauge
    // conservation recalculates its next AV
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', afterCharId: 'A',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 1,
    }
    const events = simulateTimeline([charA], [iv], 300)
    // charA@100: SPD=100 (the buff hasn't fired yet); enqueued at AV=200
    // The "after" buff fires: remainingAv=100; gaugeDistance=10000; newSpd=200; newRemainingAv=50; new AV=150; buff exhausted
    // charA@150: SPD=100 (no buff) → AV=250
    expect(events.map((e) => e.av)).toEqual([100, 150, 250])
    expect(events[0].effectiveSpd).toBe(100)   // the buff hadn't fired yet at the time of the action
    expect(events[1].effectiveSpd).toBe(100)   // the buff was already consumed during gauge conservation
  })

  it('after timing: av_advance 100% at same AV → character acts again at same AV', () => {
    // afterCharId='A' (end-of-action instant): av_advance 100% fires after charA@100 acts
    // → pulls the next action back from AV=200 to AV=100 (max(100, 200-100)=100)
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'av_advance', afterCharId: 'A',
      targets: ['A'], value: 100, unit: 'percent', durationTurns: 0,
    }
    const events = simulateTimeline([charA], [iv], 300)
    const aEvents = events.filter((e) => e.characterId === 'A')
    expect(aEvents[0].av).toBeCloseTo(100, 5)
    expect(aEvents[1].av).toBeCloseTo(100, 5)   // acts again at the same AV
    expect(aEvents[2].av).toBeCloseTo(200, 5)   // back to the normal interval afterward
  })

  it('after iv fires exactly once, no infinite loop: afterActionIndex=undefined defaults to 0, only fires at first action', () => {
    // afterActionIndex defaults to 0 when unset, so it only fires at actionIndex=0 and never refires at actionIndex=1
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'av_advance', afterCharId: 'A',
      targets: ['A'], value: 100, unit: 'percent', durationTurns: 0,
    }
    const events = simulateTimeline([charA], [iv], 300)
    expect(events.length).toBe(3)  // AV=100 (actionIndex=0), AV=100 (actionIndex=1), AV=200
  })
})

// ---- afterActionIndex exact binding ----

describe('simulateTimeline — afterActionIndex exact binding', () => {
  it('afterActionIndex=1 does NOT fire at actionIndex=0 (no second action in range)', () => {
    // This intervention is bound to actionIndex=1, but charA only acts once at AV=100 (no pull-back),
    // so it should not fire
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', afterCharId: 'A', afterActionIndex: 1,
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 1,
    }
    const events = simulateTimeline([charA], [iv], 300)
    // If the intervention incorrectly fired at idx=0: AV≈150 after gauge conservation; correctly not firing: AV=[100, 200]
    expect(events.map((e) => e.av)).toEqual([100, 200])
    expect(events[0].effectiveSpd).toBe(100)
  })

  it('chain: afterActionIndex=0 + afterActionIndex=1 both av_advance 100% → character acts 3 times at same AV', () => {
    // idx=0 → after-0 fires → pulled back to AV=100 (idx=1)
    // idx=1 → after-1 fires → pulled back to AV=100 (idx=2)
    // idx=2 → no matching intervention → proceeds normally to AV=200
    const iv0: Intervention = {
      id: '0', triggerAv: 100, type: 'av_advance', afterCharId: 'A', afterActionIndex: 0,
      targets: ['A'], value: 100, unit: 'percent', durationTurns: 0,
    }
    const iv1: Intervention = {
      id: '1', triggerAv: 100, type: 'av_advance', afterCharId: 'A', afterActionIndex: 1,
      targets: ['A'], value: 100, unit: 'percent', durationTurns: 0,
    }
    const events = simulateTimeline([charA], [iv0, iv1], 300)
    const aEvents = events.filter((e) => e.characterId === 'A')
    expect(aEvents.length).toBe(4)                           // three actions at AV=100 + one at AV=200
    expect(aEvents[0].av).toBeCloseTo(100, 5)
    expect(aEvents[1].av).toBeCloseTo(100, 5)
    expect(aEvents[2].av).toBeCloseTo(100, 5)
    expect(aEvents[3].av).toBeCloseTo(200, 5)
  })
})

// ---- beforeActionIndex exact binding (during-action timing bound to a specific character action) ----

describe('simulateTimeline — beforeActionIndex exact binding', () => {
  it('beforeActionIndex=0: durationTurns=1 buff consumed immediately by current action (matches legacy global-before semantics)', () => {
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', beforeCharId: 'A', beforeActionIndex: 0,
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 1,
    }
    const events = simulateTimeline([charA], [iv], 300)
    // The buff is immediately consumed by this action, with no effect on any future AV: identical to no intervention
    expect(events.map((e) => e.av)).toEqual([100, 200])
    expect(events[0].effectiveSpd).toBe(100)
  })

  it('beforeActionIndex=1 does NOT fire at actionIndex=0 (no second action without a trigger)', () => {
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', beforeCharId: 'A', beforeActionIndex: 1,
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 1,
    }
    const events = simulateTimeline([charA], [iv], 300)
    // There's no after-0 intervention to create a second action, so beforeActionIndex=1 can never match;
    // behavior is identical to no intervention
    expect(events.map((e) => e.av)).toEqual([100, 200])
    expect(events[0].effectiveSpd).toBe(100)
  })

  it('chain: after-0 av_advance (creates a 2nd action) + before-1 spd_up → buff only affects the 2nd action, not the 1st or 3rd', () => {
    // idx=0: normal action (no buff, spd=100); after-0 fires at the end-of-action instant: av_advance 100% → pulled back to AV=100
    // idx=1: before-1 fires before the action: spd_up flat 100, durationTurns=2 → remainingAv=0 immediately decremented to 1
    //        (not removed, so this action gets spd=200)
    // idx=1 post-action uniform decrement: remainingTurns 1→0 → removed, AV=100+10000/200=150
    // idx=2: no buff, spd=100 → AV=150+100=250
    const ivAfter: Intervention = {
      id: 'after0', triggerAv: 100, type: 'av_advance', afterCharId: 'A', afterActionIndex: 0,
      targets: ['A'], value: 100, unit: 'percent', durationTurns: 0,
    }
    const ivBefore: Intervention = {
      id: 'before1', triggerAv: 100, type: 'spd_up', beforeCharId: 'A', beforeActionIndex: 1,
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 2,
    }
    const events = simulateTimeline([charA], [ivAfter, ivBefore], 300)
    const aEvents = events.filter((e) => e.characterId === 'A')
    expect(aEvents.length).toBe(4)
    expect(aEvents[0].av).toBeCloseTo(100, 5)
    expect(aEvents[0].effectiveSpd).toBe(100)   // 1st action: no buff
    expect(aEvents[1].av).toBeCloseTo(100, 5)
    expect(aEvents[1].effectiveSpd).toBe(200)   // 2nd action: buff active
    expect(aEvents[2].av).toBeCloseTo(150, 5)
    expect(aEvents[2].effectiveSpd).toBe(100)   // 3rd action: buff consumed, back to normal speed
    expect(aEvents[3].av).toBeCloseTo(250, 5)
  })
})

// ---- Same-AV sort tiebreaker ----

describe('simulateTimeline — same-AV sort tiebreaker', () => {
  it('characters pulled to same AV: the one originally closer to this AV acts first', () => {
    // charE: spd=100, first action AV=100; pulled to AV=50 by av_advance 50 (flat), originalAv=100
    // charF: spd=200, first action AV=50 (arrives naturally, originalAv=undefined)
    // At the same AV=50: F.originalAv??50=50 < E.originalAv=100 → F acts first (closer to AV=50)
    const charE = { id: 'E', spd: 100, baseSpd: 100 }
    const charF = { id: 'F', spd: 200, baseSpd: 200 }
    const iv: Intervention = {
      id: '1', triggerAv: 0, type: 'av_advance',
      targets: ['E'], value: 50, unit: 'flat', durationTurns: 0,
    }
    const events = simulateTimeline([charE, charF], [iv], 150)
    const atAv50 = events.filter((e) => Math.abs(e.av - 50) < 0.001)
    expect(atAv50.length).toBe(2)
    expect(atAv50[0].characterId).toBe('F')   // F was already at 50 (distance 0)
    expect(atAv50[1].characterId).toBe('E')   // E was pulled here from 100 (distance 50)
  })
})
