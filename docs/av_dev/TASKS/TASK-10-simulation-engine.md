# TASK-10 — 模拟引擎

> **状态：已完成**，且已根据崩铁实际机制做过三轮修正（白值速度 buff、行动条守恒重算、AV 拉推条百分比基准、buff 回合数对称性；以及后续发现的统一事件队列架构重写，修复"拉条/推条对即将行动角色失效"与"操作触发位置计算错误"两个问题）。本文档已更新为与 [simulateTimeline.ts](../../../src/lib/tabs/tabAvVisualizer/simulation/simulateTimeline.ts) 实际实现一致的版本；测试见 [simulateTimeline.test.ts](../../../src/lib/tabs/tabAvVisualizer/simulation/simulateTimeline.test.ts)（50 个测试全部通过）。

## 目标

实现事件驱动的时间轴模拟器，替代第一阶段的静态 `computeActionPoints`。支持速度 buff/debuff 和 AV 拉推条操作。纯函数，无副作用，无 React 依赖。

---

## 关键机制（与崩铁实际游戏机制对齐）

**1. 白值 vs 面板速度：**
- `SimCharacter` 同时需要 `spd`（面板总速度，含遗器）和 `baseSpd`（白值，角色基础速度，不含遗器）
- 百分比速度 buff/debuff 必须按**白值**换算成固定值：`flatDelta = whiteSpd × (value / 100)`，而不是按当前面板速度的百分比
- 例：白值100，遗器+30（面板130），50% 加速 buff → `100×50% = +50`，加速后速度 = `130+50 = 180`（不是 `130×1.5=195`）

**2. 行动条守恒（gauge distance conservation）：**
- 速度变化在角色行动间隙生效时，必须用行动条守恒公式重算该角色排在队列中的下次行动 AV：
  ```
  剩余行动条距离 = 剩余AV × 旧速度   （这是不变量）
  新剩余AV = 距离 / 新速度
  新的队列AV = 当前事件AV + 新剩余AV
  ```

**3. buff 回合数对称性：**
- `durationTurns = N` 表示该 buff 总共提供 N 个"加速区间"，无论是恰好在角色自己回合触发，还是在跨角色的间隙中触发（需要行动条重算）
- 若不做特殊处理，跨角色中途触发时，行动条重算产生的局部区间不会计入回合消耗，导致多送一个区间。修复：**在做完行动条重算后，立即把刚推入的这个 buff 消耗 1 个回合**（归零则直接移除），使两种触发时机下提供的总加速区间数严格一致

**4. AV 拉条/推条（`av_advance` / `av_delay`）percent 基准：**
- percent 表示"目标当前**最大行动间隔**（`10000 / effectiveSpd`）的 X%"，**不是**"剩余 AV 的 X%"
- `av_advance` 会 clamp，最多只能拉到当前触发点（不能拉到触发点之前）

**5. 统一事件队列（修复"操作只在凑巧触发检查时才生效"的架构缺陷）：**
- 早期实现里，操作只在"某次角色行动事件被取出队列处理"时才顺便检查、借用该行动的 AV 当"现在"。这导致两个问题：① 如果触发检查的那次行动恰好是操作目标自己，它当前这次行动不会被行动条公式重算（只影响下一次行动）；② 其他目标的重算会用错"现在"的基准（用了凑巧触发检查的那次行动 AV，而不是操作真正的 `triggerAv`），尤其当 `triggerAv` 之前没有任何角色行动时（时间轴最前段就有效果生效），偏差非常明显
- 修复：把操作也当成时间轴上的一种事件，和角色行动放进**同一个按真实 AV 严格排序处理的主循环**（二路归并）；`triggerAv` 与某次行动 AV 相同时，操作先处理。所有重算/拉条/推条统一用**操作自己的 `triggerAv`**当基准，不再借用任何行动事件的 AV
- 副作用：这个修复同时让"目标恰好是即将行动的角色"这一边界情况自动变得正确（不再需要为它特殊处理），包括拉条/推条目标是自己的情况

---

## 需要新建的文件

### `src/lib/tabs/tabAvVisualizer/simulation/simulateTimeline.ts`

```ts
import type { Operation, SimEvent } from 'lib/tabs/tabAvVisualizer/types'

type SimCharacter = {
  id: string
  spd: number      // 角色面板总速度（含遗器）
  baseSpd: number  // 白值速度（角色基础速度，不含遗器），用于百分比速度 buff 计算
}

// SpdBuff 内部统一存储 flat delta（percent 在应用时已按白值换算）
type SpdBuff = {
  delta: number
  remainingTurns: number
}

type CharState = {
  panelSpd: number  // 含遗器的面板速度，用于计算有效速度
  whiteSpd: number  // 白值，用于百分比 buff 换算
  spdBuffs: SpdBuff[]
}

type QueueEntry = {
  av: number
  characterId: string
  actionIndex: number
}

function computeEffectiveSpd(state: CharState): number {
  const buffTotal = state.spdBuffs.reduce((sum, b) => sum + b.delta, 0)
  return Math.max(state.panelSpd + buffTotal, 1)
}

// 用操作自己的 triggerAv（而不是凑巧触发检查的某次行动的 AV）对所有目标生效。
// 队列里只要还有该目标的条目，就说明它的下次行动尚未发生，必然可以被正确重算——
// 这对"目标恰好是即将行动的角色"也成立，因为本函数总是在该角色被真正取出队列之前调用。
function applyOperation(
  op: Operation,
  charStates: Map<string, CharState>,
  queue: QueueEntry[],
): void {
  for (const targetId of op.targets) {
    const targetState = charStates.get(targetId)
    if (!targetState) continue

    if (op.type === 'spd_up' || op.type === 'spd_down') {
      // percent 按白值换算为 flat；崩铁机制：X% = X% × 白值，与面板速度无关
      const flatDelta = op.unit === 'flat'
        ? op.value
        : targetState.whiteSpd * (op.value / 100)
      const delta = op.type === 'spd_up' ? flatDelta : -flatDelta

      const oldSpd = computeEffectiveSpd(targetState)
      const newBuff: SpdBuff = { delta, remainingTurns: op.durationTurns }
      targetState.spdBuffs.push(newBuff)
      const newSpd = computeEffectiveSpd(targetState)

      const targetEntry = queue.find((e) => e.characterId === targetId)
      if (targetEntry) {
        const remainingAv = targetEntry.av - op.triggerAv
        // remainingAv > 0：buff 真正跨越了一段尚未发生的距离（跨角色中途生效），
        // 需要行动条守恒重算，且这段被重算的区间本身消耗掉 buff 的 1 个回合。
        // remainingAv === 0：触发点正好与目标排队中的下次行动重合（恰好在角色
        // 自己回合生效），不需要额外处理，交给角色自己行动时的常规递减。
        if (remainingAv > 0) {
          if (oldSpd !== newSpd) {
            const gaugeDistance = remainingAv * oldSpd
            targetEntry.av = op.triggerAv + gaugeDistance / newSpd
          }
          newBuff.remainingTurns -= 1
          if (newBuff.remainingTurns <= 0) {
            targetState.spdBuffs = targetState.spdBuffs.filter((b) => b !== newBuff)
          }
        }
      }
    } else {
      // av_advance / av_delay：直接修改目标在队列中的下次行动 AV
      const targetEntry = queue.find((e) => e.characterId === targetId)
      if (targetEntry) {
        // percent 以目标当前最大行动间隔（10000/effectiveSpd）为基准，与游戏机制一致
        const maxInterval = 10000 / computeEffectiveSpd(targetState)
        const delta = op.unit === 'flat'
          ? op.value
          : maxInterval * (op.value / 100)
        targetEntry.av = op.type === 'av_advance'
          ? Math.max(op.triggerAv, targetEntry.av - delta)
          : targetEntry.av + delta
      }
    }
  }

  queue.sort((a, b) => a.av - b.av)
}

export function simulateTimeline(
  characters: SimCharacter[],
  operations: Operation[],
  totalAv: number,
): SimEvent[] {
  if (characters.length === 0 || totalAv <= 0) return []

  const charStates = new Map<string, CharState>()
  for (const char of characters) {
    charStates.set(char.id, { panelSpd: char.spd, whiteSpd: char.baseSpd, spdBuffs: [] })
  }

  // 用有序数组作优先队列（4 角色 × ~30 行动 ≈ 120 条目，排序开销可忽略）
  const queue: QueueEntry[] = characters
    .map((char) => ({ av: 10000 / char.spd, characterId: char.id, actionIndex: 0 }))
    .sort((a, b) => a.av - b.av)

  const pendingOps = [...operations].sort((a, b) => a.triggerAv - b.triggerAv)
  let opIndex = 0

  const results: SimEvent[] = []

  // 统一离散事件循环：角色行动和操作触发都是时间轴上的事件，按真实 AV 严格排序处理。
  // triggerAv 与某次行动 AV 相同时，操作先处理（保证 buff 在该次行动生效前就位）。
  while (queue.length > 0 || opIndex < pendingOps.length) {
    const nextActionAv = queue.length > 0 ? queue[0].av : Infinity
    const nextOpAv = opIndex < pendingOps.length ? pendingOps[opIndex].triggerAv : Infinity

    if (Math.min(nextActionAv, nextOpAv) >= totalAv) break

    if (nextOpAv <= nextActionAv) {
      applyOperation(pendingOps[opIndex], charStates, queue)
      opIndex++
      continue
    }

    const event = queue.shift()!
    const state = charStates.get(event.characterId)!
    const spd = computeEffectiveSpd(state)

    results.push({
      av: event.av,
      characterId: event.characterId,
      actionIndex: event.actionIndex,
      effectiveSpd: spd,
    })

    // 计算下次行动 AV，使用当前有效速度
    const nextAv = event.av + 10000 / spd

    // 本次行动后递减 SPD buff 剩余回合（递减在调度之后，buff 已计入当前间隔）
    state.spdBuffs = state.spdBuffs
      .map((b) => ({ ...b, remainingTurns: b.remainingTurns - 1 }))
      .filter((b) => b.remainingTurns > 0)

    if (nextAv < totalAv) {
      queue.push({ av: nextAv, characterId: event.characterId, actionIndex: event.actionIndex + 1 })
      queue.sort((a, b) => a.av - b.av)
    }
  }

  return results
}
```

---

### `src/lib/tabs/tabAvVisualizer/simulation/simulateTimeline.test.ts`

实际测试文件包含 50 个测试用例，覆盖：静态排轴（无操作）、`spd_up`/`spd_down`（含白值换算、行动条守恒重算、回合数对称性）、`av_advance`/`av_delay`（含最大行动间隔基准、clamp 边界）、若干边界情况，以及统一事件队列架构修复的专项回归测试（拉条对即将行动角色生效、操作触发位置使用正确基准、ABC 三角色跨空隙场景、精确重合场景复核）。完整内容见源文件，不在此重复列出。

---

## 注意事项

**SPD buff 计数语义：**
- buff 在角色行动后递减，递减发生在"计算下次行动间隔之后"
- 因此 `durationTurns = N` 意味着接下来的 N 次行动间隔使用增速
- 若 buff 是跨角色在角色自己行动间隙中触发的（需要行动条重算，且 `remainingAv > 0`），重算的局部间隔本身也消耗 1 个回合，详见上方"关键机制"第 3、5 点
- `remainingAv === 0`（触发点正好与目标排队中的下次行动重合）时不额外消耗回合，避免与"恰好在角色自己回合生效"的既有语义冲突

**percent 类速度 buff：**
- 按角色**白值**（`getGameMetadata().characters[id].stats[Stats.SPD]`）换算为固定值，不是按当前面板速度

**percent 类 AV 操作：**
- `av_advance percent`：减少"目标当前最大行动间隔（`10000/effectiveSpd`）"的 value%
- `av_delay percent`：同理，增加最大行动间隔的 value%
- 这与崩铁实际拉条/推条机制一致（不是按"剩余 AV"的百分比）

**操作触发时机（统一事件队列）：**
- 操作不再是"借用某次行动事件的 AV 顺便检查"，而是和角色行动放进同一个按真实 AV 排序的主循环；每轮取"队列里最近的行动 AV"与"下一个待执行操作的 `triggerAv`"中较小者处理，相同则操作先处理
- 所有重算（行动条守恒 / AV 拉推条 clamp 基准）统一用**操作自己的 `triggerAv`**，不会再借用任何角色行动的 AV 当"现在"
- 同一 AV 位置有多个操作时，按 `pendingOps` 数组原顺序（即 `triggerAv` 相同则按 `addOperation` 顺序）依次处理

**不依赖 React 或 store：**
- 此文件只 import `types.ts` 中的类型，其余无外部依赖
- 纯函数，便于 vitest 直接测试，也便于在 Web Worker 中运行（未来可选）

---

## 验收方法

```bash
npm run vitest -- "simulateTimeline"
npm run typecheck:fast
```

两条命令均通过后，本 TASK 完成。（已完成：50/50 测试通过）
