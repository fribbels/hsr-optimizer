# Step 7.5 — 战技点（SP）系统

## 目标

引擎追踪全队共享的战技点（SP）状态，`BattleEvent.teamStateBefore / teamStateAfter` 字段从硬编码占位值 `{ sp: 0, spMax: 5 }` 替换为真实数据。UI 在 ActionDisplayPanel 顶部或 Playhead 旁展示当前 SP 值。

---

## 范围边界

| 本步骤做 | 本步骤跳过 |
|---|---|
| `sp_gain / sp_loss` 即时效果（引擎追踪） | SP 对行为选择的约束校验（SP=0 时禁止战技，后续按需添加）|
| `sp_cap_up / sp_cap_down` 有 duration 的上限变更 | `sp_cap_up / sp_cap_down` 的 UI 展示（上限变化用数字体现即可）|
| `spCapBonus` 字段：战斗开始时累加到 `spMax` | 战技点影响伤害的计算（Phase 4）|
| Sparkle 战技补全 `sp_loss -1`；Sparkle 大招补全 `sp_cap_up +2` | 战技点回收机制（如某些角色普攻可回 2 点）|
| `teamStateBefore / teamStateAfter` 填入真实快照 | 开局 SP 可配置 UI（初始值 3，先硬编码）|
| `simulateBattle.test.ts` 新增 SP 场景测试 | SP 日志逐行展示（Timeline 上悬浮 SP 变化详情）|
| UI：ActionDisplayPanel 顶部显示当前 SP / spMax | 多队员同时 sp_loss（同 AV 行动时的扣除顺序歧义）|

---

## 当前状态分析

### BattleConfig SP 模板覆盖情况

| 角色 | 普攻 sp_gain | 战技 sp_loss | 大招 SP 效果 | spCapBonus |
|---|---|---|---|---|
| 花火（Sparkle）| ✅ +1 | ❌ **缺失** | ✅ sp_gain +6；❌ **缺 sp_cap_up +2** | ✅ +3（永久）|
| 藿藿（Huohuo）| ✅ +1 | ✅ -1 | 无 | 无 |
| 阮梅（Ruan Mei）| ✅ +1 | ✅ -1 | 无 | 无 |
| 希儿（Seele）| ✅ +1 | ✅ -1 | 无 | 无 |
| 景元（Jing Yuan）| ✅ +1 | ✅ -1 | 无 | 无 |

其余角色（普通角色）普攻 +1 / 战技 -1 是统一规律，上表已覆盖。

### 引擎当前状态

`applyIntervention` 没有 `sp_gain / sp_loss / sp_cap_up / sp_cap_down` 分支，这些类型的 Intervention 静默忽略（`iv.targets = []`，循环不执行，`sortQueue` 空调用）。`teamStateBefore / teamStateAfter` 硬编码为 `{ sp: 0, spMax: 5 }`。

---

## 设计决策

### D1：`TeamStateInternal` — 引擎内部可变对象

类似 `charStates / energyStates`，新增一个独立的可变对象追踪全队 SP 状态：

```typescript
type SpCapChange = {
  id: string
  restoreDelta: number   // 到期时对 spMax 的补偿量（sp_cap_up +2 → restoreDelta = -2）
  remainingTurns: number
}

type TeamStateInternal = {
  sp: number
  spMax: number
  spCapChanges: SpCapChange[]
}
```

初始化：

```typescript
// spCapBonus：遍历所有角色的 BattleConfig，累加永久上限加成
const spCapBonus = allCharacterIds.reduce((sum, id) => {
  return sum + (getBattleConfig(id)?.spCapBonus ?? 0)
}, 0)

const teamState: TeamStateInternal = {
  sp: 3,                    // MoC / 普通关卡标准开局
  spMax: 5 + spCapBonus,    // 花火在队时 = 8；无加成 = 5
  spCapChanges: [],
}
```

---

### D2：SP 即时效果不涉及 AV 队列，在 `applyIntervention` 中提前返回

`sp_gain / sp_loss` 目标是 `'team'`，`Intervention.targets = []`，不需要遍历角色。在进入 per-target 循环之前处理，处理后直接 `return`（无 `sortQueue` 调用）：

```typescript
if (iv.type === 'sp_gain' || iv.type === 'sp_loss') {
  if (teamState) {
    const delta = iv.value  // 始终 flat
    teamState.sp = iv.type === 'sp_gain'
      ? Math.min(teamState.spMax, teamState.sp + delta)
      : Math.max(0, teamState.sp - delta)
  }
  return  // SP 不影响 AV 队列
}
```

`sp_cap_up / sp_cap_down` 同理：

```typescript
if (iv.type === 'sp_cap_up' || iv.type === 'sp_cap_down') {
  if (teamState) {
    const delta = iv.type === 'sp_cap_up' ? iv.value : -iv.value
    teamState.spMax += delta
    if (iv.durationTurns > 0) {
      teamState.spCapChanges.push({ id: iv.id, restoreDelta: -delta, remainingTurns: iv.durationTurns })
    }
    if (delta < 0) {
      // 上限下降时 clamp 当前 SP
      teamState.sp = Math.min(teamState.sp, teamState.spMax)
    }
  }
  return
}
```

---

### D3：`spCapChanges` 全局 tick — 每次任意角色行动时 -1

`sp_cap_up / sp_cap_down` 的持续回合对应游戏中的"队伍行动数"（任意角色行动一次 = 1 回合），而非绑定到特定施放者。这与 SPD BUFF 的 direct/aura tick 规则不同。

具体位置：在主循环末尾（Step B activeBuffsMap tick 之后、`energyTimeline.push` 之前）：

```typescript
// Step C: tick spCapChanges（全局，每次任意角色行动后 -1）
teamState.spCapChanges = teamState.spCapChanges.map((c) => ({
  ...c,
  remainingTurns: c.remainingTurns - 1,
}))

const expiredCaps = teamState.spCapChanges.filter((c) => c.remainingTurns <= 0)
teamState.spCapChanges = teamState.spCapChanges.filter((c) => c.remainingTurns > 0)

for (const c of expiredCaps) {
  teamState.spMax += c.restoreDelta
  teamState.spMax = Math.max(1, teamState.spMax)   // 防止非法值
  teamState.sp = Math.min(teamState.sp, teamState.spMax)
}
```

与 BUFF tick 位置（Step B）分开写，明确语义区别。

---

### D4：`applyIntervention` 新增 `teamState?` 可选参数（向后兼容）

```typescript
function applyIntervention(
  iv: Intervention,
  charStates: Map<string, CharState>,
  queue: QueueEntry[],
  energyStates?: Map<string, EnergyState>,
  activeBuffsMap?: Map<string, ActiveIntervention[]>,
  casterId?: string,
  teamState?: TeamStateInternal,   // ← 新增，可选
): void
```

所有现有调用点不传 `teamState`（行为不变，SP 类型 Intervention 静默忽略）。Step 7.5 中补传 `teamState` 的调用点：主循环模板展开、`processUlt`、手动 after-intervention、global-before intervention。

---

### D5：`snapshotTeamState` + `processUlt / 主循环` 补全快照

新增辅助函数：

```typescript
function snapshotTeamState(teamState: TeamStateInternal): TeamBattleState {
  return { sp: teamState.sp, spMax: teamState.spMax }
}
```

在所有 `snapshotStates` 调用之后，补充 `teamStateBefore / teamStateAfter`：

```typescript
// processUlt 内
const teamBefore = snapshotTeamState(teamState)
// ... 展开 ult 模板 ...
results.push({ ..., teamStateBefore: teamBefore, teamStateAfter: snapshotTeamState(teamState) })

// 主循环
const teamBefore = snapshotTeamState(teamState)
// ... 展开模板、after interventions、tick ...
results[normalActionResultIdx].teamStateAfter = snapshotTeamState(teamState)
```

注意：`teamStateBefore` 应在 during-action ult 之后、normal action 之前取快照（与 `stateBefore` 时机一致）。

---

### D6：`expandSpTemplate` — 新增模板展开函数

SP 类型模板的展开逻辑与其他类型一致，但 `targets` 始终为 `[]`（team 资源不需要 resolvedTargets）：

```typescript
function expandSpTemplate(
  template: InterventionTemplate,
  triggerAv: number,
): Intervention | null {
  if (
    template.type !== 'sp_gain' && template.type !== 'sp_loss'
    && template.type !== 'sp_cap_up' && template.type !== 'sp_cap_down'
  ) return null
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets: [],      // SP 是团队资源，无个体目标
    value: template.value,
    unit: 'flat',     // SP 始终是 flat
    durationTurns: 'durationTurns' in template ? template.durationTurns : 0,
  }
}
```

在主循环和 `processUlt` 的模板展开处追加调用：

```typescript
const spIv = expandSpTemplate(template, event.av)
if (spIv) applyIntervention(spIv, charStates, queue, energyStates, activeBuffsMap, event.characterId, teamState)
```

---

## 各模块详细设计

### 7.5.1 `simulation/simulateBattle.ts`

**新增内部类型**（文件顶部，`SpdBuff` 之后）：

```typescript
type SpCapChange = {
  id: string
  restoreDelta: number
  remainingTurns: number
}

type TeamStateInternal = {
  sp: number
  spMax: number
  spCapChanges: SpCapChange[]
}
```

**初始化**（`activeBuffsMap` 初始化之后）：

```typescript
const spCapBonus = allCharacterIds.reduce((sum, id) => {
  return sum + (getBattleConfig(id)?.spCapBonus ?? 0)
}, 0)
const teamState: TeamStateInternal = { sp: 3, spMax: 5 + spCapBonus, spCapChanges: [] }
```

**`applyIntervention` 扩展**：
- 新增 `teamState?: TeamStateInternal` 第 7 个参数
- SP 即时效果和 SP 上限变更在 per-target 循环之前处理（见 D2）

**`expandSpTemplate`**：新增函数，位置在 `expandStatTemplate` 之后（见 D6）

**`processUlt` 扩展**：
- 新增 `teamState: TeamStateInternal` 参数
- 模板展开处追加 `spIv = expandSpTemplate(template, triggerAv)` 调用
- `results.push(...)` 的 `teamStateBefore / teamStateAfter` 使用 `snapshotTeamState`

**主循环扩展**：
- `stateBefore` 之前：`const teamBefore = snapshotTeamState(teamState)`
- `results.push(...)` 使用 `teamBefore`
- 模板展开处追加 `spIv` 调用（需传 `teamState`）
- after-intervention 调用传 `teamState`
- global-before / char-before 调用传 `teamState`
- at_av processUlt 调用传 `teamState`
- Step B tick 之后：Step C tick `spCapChanges`（见 D3）
- `results[normalActionResultIdx].teamStateAfter = snapshotTeamState(teamState)`

---

### 7.5.2 `battleConfigs/Sparkle.ts`

**需要补全的两处**：

1. `skill` 补充 `sp_loss`：

```typescript
skill: [
  { type: 'energy_gain', targets: 'self', value: 30, unit: 'flat' },
  { type: 'sp_loss',     targets: 'team', value: 1,  unit: 'flat' },   // ← 新增
  { type: 'av_advance',  targets: 'single_ally', value: 50, unit: 'percent' },
  { type: 'stat_buff',   targets: 'single_ally', stat: Stats.CD, ... },
],
```

2. `ult` 补充 `sp_cap_up`（花火大招 "+2 SP 上限，持续 2 回合"）：

```typescript
ult: [
  { type: 'stat_buff', targets: 'all_allies', stat: Stats.ATK_P, value: 15, unit: 'percent', durationTurns: 2 },
  { type: 'sp_gain',     targets: 'team', value: 6, unit: 'flat' },
  { type: 'sp_cap_up',   targets: 'team', value: 2, unit: 'flat', durationTurns: 2 },  // ← 新增
],
```

其余 4 个 BattleConfig 的 SP 模板已经完整，无需修改。

---

### 7.5.3 `simulation/simulateBattle.test.ts`

在 `'buff tracking'` describe 块之后追加 `'SP tracking'` describe 块。

| 场景 | 断言 |
|---|---|
| 初始 SP = 3，无 spCapBonus 时 spMax = 5 | 第一个 event 的 `teamStateBefore.sp === 3`，`spMax === 5` |
| spCapBonus 正确累加（含花火时 spMax = 8） | 含花火角色时，第一个 event `teamStateBefore.spMax === 8` |
| 普攻后 sp +1 | action 0 `teamStateAfter.sp === teamStateBefore.sp + 1`（clamp 上限）|
| 战技后 sp -1 | Sparkle 战技 action 的 `teamStateAfter.sp === teamStateBefore.sp - 1`（clamp 下限 0）|
| sp 不超过 spMax | 在 sp = spMax 时再 gain，`teamStateAfter.sp === spMax` |
| sp 不低于 0 | 在 sp = 0 时再 loss，`teamStateAfter.sp === 0` |
| sp_cap_up 生效后 spMax 提升 | Sparkle 大招后 `teamStateAfter.spMax === teamStateBefore.spMax + 2` |
| sp_cap_up 到期后 spMax 恢复 | N 回合后 spMax 恢复；若 sp > 新 spMax 则 sp 被 clamp |
| Huohuo 大招：无 SP 效果 | 大招 `teamStateBefore.sp === teamStateAfter.sp` |
| teamStateBefore / teamStateAfter 独立（快照隔离）| 两个连续 event 的 `teamStateAfter` 对象不共享引用 |

---

### 7.5.4 UI — ActionDisplayPanel 顶部 SP 指示器

SP 是全队状态，最合适的位置是 `ActionDisplayPanel` 的顶部（始终可见），或 Playhead 旁边的固定区域。

**建议位置**：ActionDisplayPanel 顶部固定行，格式：

```
[●●●○○]  3 / 5        ← 点状 + 数字，spMax 个圆点，sp 个填充
```

数据来源：当前 Playhead 位置 `playheadAv` 下、最近一次 event 的 `teamStateAfter`（与 `energyAtPlayhead` 类似，遍历 events 找最后一个 `av ≤ playheadAv` 的 event）。

`ActionDisplayPanel` 已有 `simEvents` prop，直接遍历即可：

```typescript
const teamSpAtPlayhead = useMemo(() => {
  let last: TeamBattleState = { sp: 3, spMax: 5 }
  for (const ev of simEvents) {
    if (ev.av > playheadAv + 0.005) break
    last = ev.teamStateAfter
  }
  return last
}, [simEvents, playheadAv])
```

渲染：

```typescript
<div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', marginBottom: 4 }}>
  <Text size='xs' fw={600} c='dimmed'>SP</Text>
  <div style={{ display: 'flex', gap: 3 }}>
    {Array.from({ length: teamSpAtPlayhead.spMax }, (_, i) => (
      <div
        key={i}
        style={{
          width: 10, height: 10, borderRadius: '50%',
          background: i < teamSpAtPlayhead.sp
            ? 'var(--mantine-color-yellow-4)'
            : 'var(--mantine-color-dark-4)',
        }}
      />
    ))}
  </div>
  <Text size='xs' c='dimmed'>{teamSpAtPlayhead.sp} / {teamSpAtPlayhead.spMax}</Text>
</div>
```

需要 `ActionDisplayPanel` 接收 `playheadAv: number` prop（目前已有）。

---

## 文件清单

| 操作 | 文件 |
|---|---|
| 修改 | `simulation/simulateBattle.ts`（`TeamStateInternal` / `SpCapChange` 新类型，init，`applyIntervention` SP 分支，`expandSpTemplate`，`processUlt` 扩展，主循环 SP tick，`snapshotTeamState`）|
| 修改（追加测试）| `simulation/simulateBattle.test.ts` |
| 修改 | `battleConfigs/Sparkle.ts`（skill 补 `sp_loss`，ult 补 `sp_cap_up`）|
| 修改 | `interventionPanel/ActionDisplayPanel.tsx`（顶部 SP 指示器）|

不涉及：`types.ts`（类型已完整）、`useAVVisualTabStore.ts`（SP 状态在引擎内部追踪，不持久化）、`CharacterStatePanel.tsx`（SP 是团队状态，放在 ActionDisplayPanel 更合适）。

---

## 验收标准

- `tsc --noEmit` 无新增错误
- `simulateTimeline.test.ts` 不回归
- `simulateBattle.test.ts` 新增 SP 场景全部通过
- 浏览器：
  1. 队伍无花火：ActionDisplayPanel 顶部显示 `●●●○○ 3 / 5`（初始状态）
  2. 队伍有花火：初始显示 `●●●○○○○○ 3 / 8`（spCapBonus = 3）
  3. 移动 Playhead：每次普攻后 SP +1，每次战技后 SP -1，实时更新圆点
  4. SP 触到上限（如 5）后，下一次普攻不超过上限，圆点全满
  5. 花火大招后 SP +6 + 上限 +2；N 回合后上限恢复，若当前 SP > 原上限则被 clamp
