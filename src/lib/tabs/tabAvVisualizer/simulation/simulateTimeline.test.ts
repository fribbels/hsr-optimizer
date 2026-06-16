// @vitest-environment node
import { describe, expect, it } from 'vitest'
import type { Intervention } from 'lib/tabs/tabAvVisualizer/types'
import { simulateTimeline } from './simulateTimeline'

// charA: 面板速度=100, 白值=100（无遗器）
const charA = { id: 'A', spd: 100, baseSpd: 100 }
// charB: 面板速度=200, 白值=170（遗器+30）
const charB = { id: 'B', spd: 200, baseSpd: 170 }

// ---- 无干预（静态排轴，应与 Phase 1 一致）----

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
    // afterCharId='A'（行动后）：charA@100 以 SPD=100 行动，行动后 buff 触发（行动条守恒）
    // remainingAv=100; gaugeDistance=10000; newSpd=200; newRemainingAv=50; 新AV=150; buff 耗尽
    const events = simulateTimeline([charA], [iv], 300)
    expect(events.map((e) => e.av)).toEqual([100, 150, 250])
  })

  it('spd_up lasts exactly durationTurns then reverts', () => {
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', afterCharId: 'A',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 2,
    }
    // afterCharId='A'（行动后）：charA@100 行动后 buff 触发，行动条守恒
    // remainingAv=100; newRemainingAv=50; 新AV=150; buff 剩1回合
    // charA@150: SPD=200 → AV=200; buff 过期; charA@200: SPD=100 → AV=300
    const events = simulateTimeline([charA], [iv], 310)
    expect(events.map((e) => e.av)).toEqual([100, 150, 200, 300])
  })

  it('spd_up percent: uses white value (base speed without relic) as basis', () => {
    // charA 白值=100，面板速度=100；50% buff = +50 flat → 面板150 → interval≈66.67
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', afterCharId: 'A',
      targets: ['A'], value: 50, unit: 'percent', durationTurns: 1,
    }
    const events = simulateTimeline([charA], [iv], 200)
    // afterCharId='A'（行动后）：白值 100 × 50% = +50 flat；行动条守恒 → AV = 100 + 10000/150
    expect(events[1].av).toBeCloseTo(100 + 10000 / 150, 5)
  })

  it('spd_up percent with relic speed: percent uses white value, not panel speed', () => {
    // charB 白值=170，面板速度=200（遗器+30）；50% buff = 170×0.5 = +85 flat → SPD=285
    const charBWithRelic = { id: 'B', spd: 200, baseSpd: 170 }
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'spd_up', afterCharId: 'B',
      targets: ['B'], value: 50, unit: 'percent', durationTurns: 1,
    }
    const events = simulateTimeline([charBWithRelic], [iv], 200)
    // afterCharId='B'（行动后）：白值 170 × 50% = +85 flat；行动条守恒 → AV = 50 + 10000/285
    expect(events[1].av).toBeCloseTo(50 + 10000 / 285, 5)
  })

  it('spd_down flat: lengthens subsequent intervals', () => {
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'spd_down', afterCharId: 'B',
      targets: ['B'], value: 100, unit: 'flat', durationTurns: 1,
    }
    // afterCharId='B'（行动后）：charB@50 行动后 debuff 触发；行动条守恒 → 新AV=150; debuff 耗尽
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
    // triggerAv=100 与 A 首次行动重合（行动期间/before），立即递减 2→1 回合，buff 仍生效
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 2,
    }
    const events = simulateTimeline([charA], [iv], 300)
    // AV=100：buff 仍有 1 回合 → effectiveSpd=200（用于计算下次间隔）
    expect(events[0].effectiveSpd).toBe(200)
    // AV=150：buff 在 AV=100 行动后递减至 0 已过期 → effectiveSpd 恢复为 100
    expect(events[1].effectiveSpd).toBe(100)
    // AV=250：无 buff
    expect(events[2].effectiveSpd).toBe(100)
  })

  it('gauge distance recalculation: mid-interval speed buff recalculates target next-action AV', () => {
    // 崩铁行动条守恒：gaugeDistance = remainingAV × oldSpd，newRemainingAV = gaugeDistance / newSpd
    // charA: spd=100（白值100），首次行动 AV=100
    // charB: spd=200，AV=50 时触发 spd_up 对 A：+100 flat
    // buff 在 AV=50 生效，A 下次行动原为 100
    // remaining = 100 - 50 = 50; oldSpd=100; gaugeDistance = 50 × 100 = 5000
    // newSpd = 100 + 100 = 200; newRemainingAV = 5000 / 200 = 25
    // A 新 AV = 50 + 25 = 75
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'spd_up',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 2,
    }
    const events = simulateTimeline([charA, charB], [iv], 150)
    const aAction0 = events.find((e) => e.characterId === 'A' && e.actionIndex === 0)
    expect(aAction0?.av).toBeCloseTo(75, 5)
  })

  it('gauge distance: percent buff uses white value; acts at correct position', () => {
    // charD: 面板200（白值100，遗器+100）；首次行动 AV=10000/200=50
    // charC: 面板400，AV=25 时触发 spd_up 对 D：50% 白值 → 100×0.5=50 flat
    // remaining = 50 - 25 = 25; oldSpd=200; gaugeDistance = 25 × 200 = 5000
    // newSpd = 200 + 50 = 250; newRemainingAV = 5000 / 250 = 20
    // D 新 AV = 25 + 20 = 45
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
    // 验证：buff 跨角色中途生效时，总共提供的加速区间数应与"恰好在角色自己回合生效"时一致
    // （都是 durationTurns 个），不会因为行动条重算的局部区间而多送一回合。
    // charA: spd=100（白值100），首次行动 AV=100
    // charB: spd=200，AV=50 时触发 spd_up 对 A：+100 flat，durationTurns=2
    // 重算区间(AV50→75)算第1回合；A@75→A@125 算第2回合（耗尽）；A@125→A@225 已恢复
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'spd_up',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 2,
    }
    const events = simulateTimeline([charA, charB], [iv], 250)
    const aEvents = events.filter((e) => e.characterId === 'A')
    // A@75（重算后的第1次行动，buff生效，effectiveSpd=200 用于算下一次间隔）
    expect(aEvents[0].av).toBeCloseTo(75, 5)
    expect(aEvents[0].effectiveSpd).toBe(200)
    // A@125（75+10000/200=125，仍在 buff 区间内到达，但此时 buff 已耗尽，effectiveSpd 恢复为100）
    expect(aEvents[1].av).toBeCloseTo(125, 5)
    expect(aEvents[1].effectiveSpd).toBe(100)
    // A@225（125+10000/100=225，恢复正常间隔）
    expect(aEvents[2].av).toBeCloseTo(225, 5)
  })
})

// ---- AV 拉条 / 推条（跨角色：A 触发，修改 B；或 B 触发，修改 A）----
// 注意：AV 干预修改目标在队列中的下次行动 AV。统一事件队列架构下，自身触发并自身为
// 目标时也能正确生效（见下方"统一事件队列"describe 块中的回归测试），这里仍用跨角色
// 场景测试是为了让基础用例更清晰直观。

describe('simulateTimeline — av_advance / av_delay', () => {
  it('av_advance flat: reduces target next action AV by flat amount', () => {
    // charB(spd=200) 在 AV=50 行动，干预对 charA 提前 30
    // charA 下次 AV=100, 剩余=50, delta=30(flat) → 新 AV=70
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'av_advance',
      targets: ['A'], value: 30, unit: 'flat', durationTurns: 0,
    }
    const events = simulateTimeline([charA, charB], [iv], 150)
    const aAction0 = events.find((e) => e.characterId === 'A' && e.actionIndex === 0)
    expect(aAction0?.av).toBeCloseTo(70, 5)
  })

  it('av_advance percent: reduces target AV by X% of target max action interval', () => {
    // charB 在 AV=50 行动，干预对 charA(spd=100) 提前 25%
    // charA 最大间隔=100, delta=100*25%=25 → 新 AV=max(50, 100-25)=75
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'av_advance',
      targets: ['A'], value: 25, unit: 'percent', durationTurns: 0,
    }
    const events = simulateTimeline([charA, charB], [iv], 150)
    const aAction0 = events.find((e) => e.characterId === 'A' && e.actionIndex === 0)
    expect(aAction0?.av).toBeCloseTo(75, 5)
  })

  it('av_delay flat: increases target next action AV by flat amount', () => {
    // charB 在 AV=50 行动，干预对 charA 推迟 60
    // charA 下次 AV=100, delta=60(flat) → 新 AV=160
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'av_delay',
      targets: ['A'], value: 60, unit: 'flat', durationTurns: 0,
    }
    const events = simulateTimeline([charA, charB], [iv], 200)
    const aAction0 = events.find((e) => e.characterId === 'A' && e.actionIndex === 0)
    expect(aAction0?.av).toBeCloseTo(160, 5)
  })

  it('av_delay percent: increases target AV by X% of target max action interval', () => {
    // charB 在 AV=50 行动，干预对 charA(spd=100) 推迟 50%
    // charA 最大间隔=100, delta=100*50%=50 → 新 AV=100+50=150
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'av_delay',
      targets: ['A'], value: 50, unit: 'percent', durationTurns: 0,
    }
    const events = simulateTimeline([charA, charB], [iv], 200)
    const aAction0 = events.find((e) => e.characterId === 'A' && e.actionIndex === 0)
    expect(aAction0?.av).toBeCloseTo(150, 5)
  })

  it('av_advance clamps target to no earlier than triggerAv', () => {
    // charB 在 AV=50 行动，干预对 charA(spd=100) 提前 100%
    // delta=100*100%=100 → 新 AV=max(50, 100-100)=max(50,0)=50（clamp 到触发 AV）
    const iv: Intervention = {
      id: '1', triggerAv: 50, type: 'av_advance',
      targets: ['A'], value: 100, unit: 'percent', durationTurns: 0,
    }
    const events = simulateTimeline([charA, charB], [iv], 200)
    const aAction0 = events.find((e) => e.characterId === 'A' && e.actionIndex === 0)
    expect(aAction0?.av).toBeCloseTo(50, 5)
  })

  it('av_advance only affects the next action; subsequent interval reverts to normal', () => {
    // charB 在 AV=50 行动，对 charA(spd=100) 提前 25%
    // charA 最大间隔=100, delta=25 → 新 AV=max(50, 100-25)=75
    // charA 第二次行动=75+100=175（恢复正常间隔）
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

// ---- 边界情况 ----

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
    // 两个 +50 SPD buff 在同 AV 同时触发（行动期间/before），各自 2→1 回合后仍生效
    // 叠加后 SPD=200 → interval=50 → next AV=150（行动后两 buff 均过期）
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

// ---- 统一事件队列架构修复的回归测试 ----
// 背景：干预曾经只在"凑巧触发检查的某次行动事件"那一刻才被处理，借用该行动的 AV 当"现在"。
// 当 triggerAv 之前没有任何角色行动时（比如时间轴最前段就有一次加速），这会导致：
// 1) 凑巧触发检查的那个角色自己的当前行动不会被行动条公式重算（只影响它的下一次行动）
// 2) 其他角色的重算用错了"现在"（用了触发检查的行动AV，而不是干预真正的 triggerAv）
// 3) 拉条/推条对"即将行动的角色"完全失效（队列里找不到它的条目）
// 修复：把干预也当成时间轴上的事件，和角色行动一起按真实 AV 严格排序处理。

describe('simulateTimeline — 统一事件队列（修复"最近角色"无法正确响应干预）', () => {
  it('regression: av_advance now succeeds even when the target is the very next character to act', () => {
    // 之前的 bug：目标是"最近即将行动的角色"时，拉条完全不生效（队列里找不到它的条目）
    // charA 首次行动原为 AV=100（之前没有任何行动），AV=20 处拉条 30（flat）
    const iv: Intervention = {
      id: '1', triggerAv: 20, type: 'av_advance',
      targets: ['A'], value: 30, unit: 'flat', durationTurns: 0,
    }
    const events = simulateTimeline([charA], [iv], 200)
    expect(events[0].av).toBeCloseTo(70, 5)
  })

  it('regression: spd_up before any action recalculates that very next action via gauge distance, not just the one after it', () => {
    // 之前的 bug：A 是"凑巧触发检查"的角色时，显示加速但位置完全不动，只提前了第二次行动
    // charA 首次行动原为 AV=100，AV=20 处加速 100%（按白值100）+100 flat
    const iv: Intervention = {
      id: '1', triggerAv: 20, type: 'spd_up',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 2,
    }
    const events = simulateTimeline([charA], [iv], 250)
    // 行动条守恒：remaining=100-20=80, oldSpd=100, newSpd=200
    // gaugeDistance=80×100=8000, newRemainingAv=8000/200=40, 新AV=20+40=60
    expect(events[0].av).toBeCloseTo(60, 5)
    expect(events[0].effectiveSpd).toBe(200)
  })

  it('regression: ABC three characters — intervention in the gap before any action correctly recalculates all three using its own triggerAv (not the AV of whichever action happened to trigger the check)', () => {
    const spdA = 10000 / 50    // 首次行动 AV=50
    const spdB = 10000 / 75    // 首次行动 AV=75
    const spdC = 10000 / 100   // 首次行动 AV=100
    const charA2 = { id: 'A2', spd: spdA, baseSpd: spdA }
    const charB2 = { id: 'B2', spd: spdB, baseSpd: spdB }
    const charC2 = { id: 'C2', spd: spdC, baseSpd: spdC }
    const iv: Intervention = {
      id: '1', triggerAv: 20, type: 'spd_up',
      targets: ['A2', 'B2', 'C2'], value: 100, unit: 'percent', durationTurns: 2,
    }
    const events = simulateTimeline([charA2, charB2, charC2], [iv], 200)

    // 每个角色的首次行动都应该用行动条守恒公式重算：
    // 新AV = triggerAv + (原AV - triggerAv) × 旧速度 / 新速度（新速度=旧速度×2，因为是100%加速）
    const expectedA = 20 + (50 - 20) * spdA / (spdA * 2)   // = 35
    const expectedB = 20 + (75 - 20) * spdB / (spdB * 2)   // = 47.5
    const expectedC = 20 + (100 - 20) * spdC / (spdC * 2)  // = 60

    const firstA = events.find((e) => e.characterId === 'A2' && e.actionIndex === 0)
    const firstB = events.find((e) => e.characterId === 'B2' && e.actionIndex === 0)
    const firstC = events.find((e) => e.characterId === 'C2' && e.actionIndex === 0)

    expect(firstA?.av).toBeCloseTo(expectedA, 5)
    expect(firstB?.av).toBeCloseTo(expectedB, 5)
    expect(firstC?.av).toBeCloseTo(expectedC, 5)

    // 三者首次行动都应显示加速后的有效速度（不再是"位置不动但显示加速"的不一致状态）
    expect(firstA?.effectiveSpd).toBeCloseTo(spdA * 2, 5)
    expect(firstB?.effectiveSpd).toBeCloseTo(spdB * 2, 5)
    expect(firstC?.effectiveSpd).toBeCloseTo(spdC * 2, 5)
  })

  it('regression: after timing at same AV correctly provides full durationTurns effect via gauge conservation', () => {
    // afterCharId='A'（行动后）在同 AV 触发，durationTurns=2：行动条守恒提供 2 次加速间隔
    // charA@100 行动后 buff 触发：remainingAv=100; gaugeDistance=10000; newSpd=200; 新AV=150; 剩1回合
    // charA@150: SPD=200 → AV=200; buff 过期; charA@200: SPD=100 → AV=300
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', afterCharId: 'A',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 2,
    }
    const events = simulateTimeline([charA], [iv], 310)
    expect(events.map((e) => e.av)).toEqual([100, 150, 200, 300])
  })
})

// ---- 行动时机语义（before vs after）----

describe('simulateTimeline — 行动时机语义（before vs after）', () => {
  it('before timing: spd_up durationTurns=1 at same AV → buff consumed immediately, no effect on intervals', () => {
    // 无 afterCharId（行动期间）+ triggerAv 与目标行动 AV 相同 → buff 立即消耗（1→0），对后续无效
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 1,
    }
    const events = simulateTimeline([charA], [iv], 300)
    expect(events.map((e) => e.av)).toEqual([100, 200])
    expect(events[0].effectiveSpd).toBe(100)  // buff 已在行动前消耗，行动时无 buff
  })

  it('before timing: spd_up durationTurns=N at same AV → consumed to N-1, still affects next N-1 intervals', () => {
    // before + durationTurns=3 → 立即消耗 3→2，剩 2 回合仍生效
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 3,
    }
    const events = simulateTimeline([charA], [iv], 400)
    // charA@100: SPD=200(buff 2回合) → AV=150; 过期后剩1回合
    // charA@150: SPD=200(buff 1回合) → AV=200; 过期
    // charA@200: SPD=100 → AV=300
    expect(events.map((e) => e.av)).toEqual([100, 150, 200, 300])
  })

  it('after timing: spd_up durationTurns=1 at same AV → 1 fast interval via gauge conservation', () => {
    // afterCharId='A'（行动结束瞬间）：charA 以正常速度行动后 buff 触发，行动条守恒重算
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', afterCharId: 'A',
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 1,
    }
    const events = simulateTimeline([charA], [iv], 300)
    // charA@100: SPD=100（buff 尚未触发）; 入队 AV=200
    // after buff 触发：remainingAv=100; gaugeDistance=10000; newSpd=200; newRemainingAv=50; 新AV=150; buff 耗尽
    // charA@150: SPD=100（无 buff）→ AV=250
    expect(events.map((e) => e.av)).toEqual([100, 150, 250])
    expect(events[0].effectiveSpd).toBe(100)   // 行动时 buff 尚未触发
    expect(events[1].effectiveSpd).toBe(100)   // buff 已在守恒时消耗
  })

  it('after timing: av_advance 100% at same AV → character acts again at same AV', () => {
    // afterCharId='A'（行动结束瞬间）：charA@100 行动后 av_advance 100% 触发
    // → 将下次行动从 AV=200 拉回到 AV=100（max(100, 200-100)=100）
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'av_advance', afterCharId: 'A',
      targets: ['A'], value: 100, unit: 'percent', durationTurns: 0,
    }
    const events = simulateTimeline([charA], [iv], 300)
    const aEvents = events.filter((e) => e.characterId === 'A')
    expect(aEvents[0].av).toBeCloseTo(100, 5)
    expect(aEvents[1].av).toBeCloseTo(100, 5)   // 同一 AV 再次行动
    expect(aEvents[2].av).toBeCloseTo(200, 5)   // 之后恢复正常间隔
  })

  it('after iv fires exactly once, no infinite loop: afterActionIndex=undefined defaults to 0, only fires at first action', () => {
    // afterActionIndex 未设置默认为 0，仅在 actionIndex=0 时触发，不会在 actionIndex=1 时重复触发
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'av_advance', afterCharId: 'A',
      targets: ['A'], value: 100, unit: 'percent', durationTurns: 0,
    }
    const events = simulateTimeline([charA], [iv], 300)
    expect(events.length).toBe(3)  // AV=100（actionIndex=0）, AV=100（actionIndex=1）, AV=200
  })
})

// ---- afterActionIndex 精确绑定 ----

describe('simulateTimeline — afterActionIndex 精确绑定', () => {
  it('afterActionIndex=1 does NOT fire at actionIndex=0 (no second action in range)', () => {
    // 该干预绑定 actionIndex=1，但 charA 在 AV=100 只有一次行动（无拉回），不应触发
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', afterCharId: 'A', afterActionIndex: 1,
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 1,
    }
    const events = simulateTimeline([charA], [iv], 300)
    // 若干预错误地在 idx=0 触发：行动条守恒后 AV≈150；正确不触发：AV=[100, 200]
    expect(events.map((e) => e.av)).toEqual([100, 200])
    expect(events[0].effectiveSpd).toBe(100)
  })

  it('chain: afterActionIndex=0 + afterActionIndex=1 both av_advance 100% → character acts 3 times at same AV', () => {
    // idx=0 → after-0 触发 → 拉回 AV=100（idx=1）
    // idx=1 → after-1 触发 → 拉回 AV=100（idx=2）
    // idx=2 → 无匹配干预 → 正常进入 AV=200
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
    expect(aEvents.length).toBe(4)                           // 三次 AV=100 + 一次 AV=200
    expect(aEvents[0].av).toBeCloseTo(100, 5)
    expect(aEvents[1].av).toBeCloseTo(100, 5)
    expect(aEvents[2].av).toBeCloseTo(100, 5)
    expect(aEvents[3].av).toBeCloseTo(200, 5)
  })
})

// ---- beforeActionIndex 精确绑定（行动期间与角色行动绑定）----

describe('simulateTimeline — beforeActionIndex 精确绑定', () => {
  it('beforeActionIndex=0: durationTurns=1 buff consumed immediately by current action (matches legacy global-before semantics)', () => {
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', beforeCharId: 'A', beforeActionIndex: 0,
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 1,
    }
    const events = simulateTimeline([charA], [iv], 300)
    // buff 立即被本次行动消耗，对后续 AV 无影响：与无干预时一致
    expect(events.map((e) => e.av)).toEqual([100, 200])
    expect(events[0].effectiveSpd).toBe(100)
  })

  it('beforeActionIndex=1 does NOT fire at actionIndex=0 (no second action without a trigger)', () => {
    const iv: Intervention = {
      id: '1', triggerAv: 100, type: 'spd_up', beforeCharId: 'A', beforeActionIndex: 1,
      targets: ['A'], value: 100, unit: 'flat', durationTurns: 1,
    }
    const events = simulateTimeline([charA], [iv], 300)
    // 没有任何 after-0 干预制造第2次行动，beforeActionIndex=1 永远不会匹配，行为与无干预一致
    expect(events.map((e) => e.av)).toEqual([100, 200])
    expect(events[0].effectiveSpd).toBe(100)
  })

  it('chain: after-0 av_advance(创造第2次行动) + before-1 spd_up → buff only affects the 2nd action, not the 1st or 3rd', () => {
    // idx=0: 正常行动（无 buff，spd=100）；行动结束瞬间 after-0 触发 av_advance 100% → 拉回 AV=100
    // idx=1: 行动前 before-1 触发 spd_up flat 100, durationTurns=2 → remainingAv=0 立即递减为 1（未被移除，本次行动生效 spd=200）
    // idx=1 行动后统一递减：remainingTurns 1→0 → 移除，AV=100+10000/200=150
    // idx=2: 无 buff，spd=100 → AV=150+100=250
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
    expect(aEvents[0].effectiveSpd).toBe(100)   // 第1次：无 buff
    expect(aEvents[1].av).toBeCloseTo(100, 5)
    expect(aEvents[1].effectiveSpd).toBe(200)   // 第2次：buff 生效
    expect(aEvents[2].av).toBeCloseTo(150, 5)
    expect(aEvents[2].effectiveSpd).toBe(100)   // 第3次：buff 已消耗，恢复正常速度
    expect(aEvents[3].av).toBeCloseTo(250, 5)
  })
})

// ---- 同 AV 排序 tiebreaker ----

describe('simulateTimeline — 同 AV 排序 tiebreaker', () => {
  it('characters pulled to same AV: the one originally closer to this AV acts first', () => {
    // charE: spd=100, 首次行动 AV=100；被 av_advance 50(flat) 拉到 AV=50，originalAv=100
    // charF: spd=200, 首次行动 AV=50（自然到达，originalAv=undefined）
    // 同 AV=50 时：F.originalAv??50=50 < E.originalAv=100 → F 先行动（离 AV=50 更近）
    const charE = { id: 'E', spd: 100, baseSpd: 100 }
    const charF = { id: 'F', spd: 200, baseSpd: 200 }
    const iv: Intervention = {
      id: '1', triggerAv: 0, type: 'av_advance',
      targets: ['E'], value: 50, unit: 'flat', durationTurns: 0,
    }
    const events = simulateTimeline([charE, charF], [iv], 150)
    const atAv50 = events.filter((e) => Math.abs(e.av - 50) < 0.001)
    expect(atAv50.length).toBe(2)
    expect(atAv50[0].characterId).toBe('F')   // F 原本就在 50（距离 0）
    expect(atAv50[1].characterId).toBe('E')   // E 从 100 被拉来（距离 50）
  })
})
