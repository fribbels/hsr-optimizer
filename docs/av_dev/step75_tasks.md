# Step 7.5 — 战技点（SP）系统实现子任务清单

依赖关系：`75.1`（内部类型 + `teamState` 初始化）无前置，可直接开始。`75.2`（`applyIntervention` SP 分支）依赖 `75.1`。`75.3`（`expandSpTemplate` + 调用点接入）依赖 `75.2`。`75.4`（主循环 Step C + `processUlt` + `snapshotTeamState`）依赖 `75.2` + `75.3`。`75.5`（Sparkle 补全）仅依赖类型编译通过，可与 `75.2`–`75.4` 并行。`75.6`（测试）依赖 `75.1`–`75.5`。`75.7`（ActionDisplayPanel UI）依赖 `75.4`（`teamStateAfter` 快照已填充）。

---

## Task 75.1 — 内部类型定义 + `teamState` 初始化

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.ts`

**前置条件**：无

---

### 75.1-A 新增内部类型

在文件顶部（`SpdBuff` 类型之后）添加：

```typescript
type SpCapChange = {
  id: string
  restoreDelta: number   // 到期时对 spMax 的修正量（sp_cap_up +2 → restoreDelta = -2）
  remainingTurns: number
}

type TeamStateInternal = {
  sp: number
  spMax: number
  spCapChanges: SpCapChange[]
}
```

---

### 75.1-B 验证 `types.ts` 中 SP 相关类型完整性

打开 `src/lib/tabs/tabAvVisualizer/types.ts`，确认以下项已存在（Step 1.5 中定义）：

1. `TeamBattleState`：`{ sp: number; spMax: number }`
2. `BattleEvent.teamStateBefore / teamStateAfter` 字段（`TeamBattleState` 类型）
3. `InterventionTemplate` 联合体包含 `sp_gain / sp_loss / sp_cap_up / sp_cap_down` 变体
4. `Intervention.type` 联合体包含以上 4 种 SP 类型
5. `CharacterBattleConfig.spCapBonus?: number` 字段

若缺失任何一项，在 `types.ts` 中补全后执行 `npm run update-resources`。

---

### 75.1-C `teamState` 初始化

在 `simulateBattle` 函数主体内，`activeBuffsMap` 初始化块之后追加：

```typescript
// 累加所有上场角色 BattleConfig 的永久 SP 上限加成
const spCapBonus = allCharacterIds.reduce((sum, id) => {
  return sum + (getBattleConfig(id)?.spCapBonus ?? 0)
}, 0)
const teamState: TeamStateInternal = {
  sp: 3,                    // MoC / 普通关卡标准开局值
  spMax: 5 + spCapBonus,    // 花火在队：5 + 3 = 8
  spCapChanges: [],
}
```

**注意事项**：
- `getBattleConfig(id)` 已在 Step 2 中封装，直接调用；返回 `undefined` 时 `??` 保证不加成
- `spCapBonus` 是**永久**加成（不通过 `spCapChanges` 管理），只在初始化时累加一次
- 若后续支持开局 SP 可配置（BattleSetup 界面），只需将 `sp: 3` 替换为读取配置值

**验收标准**：
- `tsc --noEmit` 无新增错误
- `TeamStateInternal` / `SpCapChange` 在文件内可正常引用

---

## Task 75.2 — `applyIntervention` SP 分支 + 签名扩展

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.ts`

**前置条件**：Task 75.1

---

### 75.2-A 函数签名新增 `teamState?` 可选参数

```typescript
function applyIntervention(
  iv: Intervention,
  charStates: Map<string, CharState>,
  queue: QueueEntry[],
  energyStates?: Map<string, EnergyState>,
  activeBuffsMap?: Map<string, ActiveIntervention[]>,
  casterId?: string,
  teamState?: TeamStateInternal,   // ← 新增，第 7 个参数，可选
): void
```

所有**现有**调用点无需修改（可选参数，向后兼容）。

---

### 75.2-B `sp_gain / sp_loss` 分支

在函数体最顶部（进入 per-target 循环之前）插入：

```typescript
// SP 即时效果：team 资源，不影响 charStates / queue，直接处理后返回
if (iv.type === 'sp_gain' || iv.type === 'sp_loss') {
  if (teamState) {
    const delta = iv.value   // 始终 flat
    teamState.sp = iv.type === 'sp_gain'
      ? Math.min(teamState.spMax, teamState.sp + delta)
      : Math.max(0, teamState.sp - delta)
  }
  return   // 无 sortQueue；iv.targets 对 SP 来说始终为 []
}
```

---

### 75.2-C `sp_cap_up / sp_cap_down` 分支

紧接 75.2-B 之后：

```typescript
if (iv.type === 'sp_cap_up' || iv.type === 'sp_cap_down') {
  if (teamState) {
    const delta = iv.type === 'sp_cap_up' ? iv.value : -iv.value
    teamState.spMax += delta
    if (iv.durationTurns > 0) {
      teamState.spCapChanges.push({
        id: iv.id,
        restoreDelta: -delta,            // 到期时撤销本次 spMax 变化
        remainingTurns: iv.durationTurns,
      })
    }
    if (delta < 0) {
      // 上限下降时将超出部分 SP 截断至新上限
      teamState.sp = Math.min(teamState.sp, teamState.spMax)
    }
  }
  return
}
```

**注意事项**：
- `iv.durationTurns === 0` 表示永久变化（不推回 `spCapChanges`），对应开局时 `spCapBonus` 的累加方式，两者语义区分明确
- 现阶段没有 `durationTurns === 0` 的 `sp_cap_up` 用例；花火大招的 `sp_cap_up +2` 有明确 `durationTurns: 2`
- `sp_cap_down` 对应极少数场景（敌方减 SP 上限），暂无 BattleConfig 使用，但逻辑对称实现

**验收标准**：
- `tsc --noEmit` 无新增错误
- 不传 `teamState` 时（`undefined`），所有 SP 分支执行后直接 `return`，行为与 Step 6 一致

---

## Task 75.3 — `expandSpTemplate` + 模板展开调用点接入

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.ts`

**前置条件**：Task 75.2

---

### 75.3-A 新增 `expandSpTemplate` 函数

在 `expandStatTemplate` 之后（或同一 expand 函数组末尾）添加：

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
    targets: [],        // SP 是团队资源，无个体目标；applyIntervention 不迭代 targets
    value: template.value,
    unit: 'flat',
    durationTurns: 'durationTurns' in template ? (template.durationTurns ?? 0) : 0,
  }
}
```

**与其他 expand 函数的区别**：
- 不接受 `resolvedTargets` 参数（SP 无个体目标）
- 始终返回 `unit: 'flat'`（SP 没有百分比变化）
- `durationTurns` 对 `sp_gain / sp_loss` 为 0（即时效果），对 `sp_cap_up / sp_cap_down` 来自 template

---

### 75.3-B 主循环模板展开调用点接入

在主循环内现有的 `statIv` 调用之后追加（每个 template 的展开循环内）：

```typescript
const spIv = expandSpTemplate(template, event.av)
if (spIv) applyIntervention(spIv, charStates, queue, energyStates, activeBuffsMap, event.characterId, teamState)
```

---

### 75.3-C `processUlt` 模板展开调用点接入

在 `processUlt` 函数内现有的 `statIv` 调用之后追加：

```typescript
const spIv = expandSpTemplate(template, triggerAv)
if (spIv) applyIntervention(spIv, charStates, queue, energyStates, activeBuffsMap, ult.casterId, teamState)
```

**此处 `processUlt` 尚未接收 `teamState` 参数**，该参数在 Task 75.4 中新增到签名，Task 75.3 只写调用逻辑（TS 会报错，75.4 完成后消除）。可以选择在 75.3 中先同步完成 75.4 的签名扩展以保持编译通过。

**注意事项**：
- `expandSpTemplate` 不需要 `resolvedTargets`，在 template 循环中无需对 SP 类型模板调用 `resolveTargets`（虽然调用了也只返回 `[]`，不影响正确性）
- `sp_gain / sp_loss` 的 `applyIntervention` 执行后立即 `return`，不会进入后续 `sortQueue`，无副作用

**验收标准**：
- `tsc --noEmit` 无新增错误（配合 Task 75.4 的 `processUlt` 签名扩展一起验证）
- `expandSpTemplate` 对非 SP 类型 template 返回 `null`（不影响其他 template 展开）

---

## Task 75.4 — 主循环 Step C tick + `processUlt` 扩展 + `snapshotTeamState`

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.ts`

**前置条件**：Task 75.2、Task 75.3

---

### 75.4-A 新增 `snapshotTeamState` 辅助函数

在 `snapshotStates` 函数之后添加：

```typescript
function snapshotTeamState(teamState: TeamStateInternal): TeamBattleState {
  return { sp: teamState.sp, spMax: teamState.spMax }
}
```

---

### 75.4-B 主循环 Step C tick — `spCapChanges` 全局 tick

在主循环末尾的 Step B（`activeBuffsMap` tick）之后、`energyTimeline.push` 之前插入：

```typescript
// Step C: tick spCapChanges — 全局 tick，每次任意角色行动后 -1（对应游戏"队伍回合数"语义）
teamState.spCapChanges = teamState.spCapChanges.map((c) => ({
  ...c,
  remainingTurns: c.remainingTurns - 1,
}))

const expiredCaps = teamState.spCapChanges.filter((c) => c.remainingTurns <= 0)
teamState.spCapChanges = teamState.spCapChanges.filter((c) => c.remainingTurns > 0)

for (const c of expiredCaps) {
  teamState.spMax += c.restoreDelta
  teamState.spMax = Math.max(1, teamState.spMax)          // 防止非法值（上限不能低于 1）
  teamState.sp = Math.min(teamState.sp, teamState.spMax)  // clamp 当前 SP
}
```

**注意事项**：
- Step C 与 Step A（direct SPD tick）和 Step B（activeBuffsMap tick）独立，不影响 queue 顺序，放在 Step B 之后即可
- `restoreDelta` 在 `sp_cap_up +2` 的场景下为 `-2`（还原），施加后 `spMax` 降回原值；若当时 SP = 7 而新上限变回 5，则 SP clamp 为 5

---

### 75.4-C `teamStateBefore / teamStateAfter` 快照填充（主循环）

**Before 快照**（在 `stateBefore = snapshotStates(...)` 之前取，确保是 during-action ult 后、模板展开前的状态）：

```typescript
const teamBefore = snapshotTeamState(teamState)
```

**在 `results.push(...)` 中使用**：

```typescript
results.push({
  av: event.av,
  characterId: event.characterId,
  actionIndex: event.actionIndex,
  ability: event.ability,
  stateBefore,
  stateAfter: {},              // 占位，下方填充
  teamStateBefore: teamBefore,
  teamStateAfter: { sp: 0, spMax: 5 },  // 占位，下方填充
  ...
})
```

**模板展开和 after-intervention 执行完毕后，Step C tick 之后**，填充 `teamStateAfter`：

```typescript
results[normalActionResultIdx].teamStateAfter = snapshotTeamState(teamState)
```

---

### 75.4-D `processUlt` 签名新增 `teamState` 参数

```typescript
function processUlt(
  ult: UltInsertion,
  triggerAv: number,
  charStates: Map<string, CharState>,
  energyStates: Map<string, EnergyState>,
  queue: QueueEntry[],
  allCharacterIds: string[],
  results: BattleEvent[],
  activeBuffsMap: Map<string, ActiveIntervention[]>,
  teamState: TeamStateInternal,   // ← 新增
): void
```

**`processUlt` 内快照填充**：

```typescript
// 大招模板展开前
const teamBefore = snapshotTeamState(teamState)

// ... 展开模板（含 spIv）...

// results.push 中
results.push({
  ...,
  teamStateBefore: teamBefore,
  teamStateAfter: snapshotTeamState(teamState),
})
```

**所有 `processUlt(...)` 调用点补传 `teamState`**：共 2 处（主循环内 `at_av` 和 `pendingUlt`）。

---

**注意事项**：
- `teamStateBefore` 在主循环中的取点时机：`during-action ult（processUlt）`执行后、普通行动模板展开前——与 `stateBefore`（snapshotStates）取点一致
- `processUlt` 内的 `teamStateBefore` 是大招模板展开前的快照，`teamStateAfter` 是大招所有模板（含 `sp_gain`）全部执行后的快照
- `results[normalActionResultIdx].teamStateAfter` 索引写法与 `stateAfter` 填充位置一致

**验收标准**：
- `tsc --noEmit` 无新增错误
- 单元测试：花火普攻后 `event.teamStateAfter.sp === event.teamStateBefore.sp + 1`

---

## Task 75.5 — `battleConfigs/Sparkle.ts` 补全

**文件**：`src/lib/tabs/tabAvVisualizer/battleConfigs/Sparkle.ts`

**前置条件**：Task 75.1（`types.ts` 中 `sp_cap_up` 类型已确认存在）

**当前缺失**（其他角色 BattleConfig 的 SP 模板均已完整）：

---

### 75.5-A 花火战技补充 `sp_loss`

当前 `skill` 数组缺少 SP 消耗，补充：

```typescript
skill: [
  { type: 'energy_gain', targets: 'self',         value: 30, unit: 'flat' },
  { type: 'sp_loss',     targets: 'team',         value: 1,  unit: 'flat' },  // ← 新增
  { type: 'av_advance',  targets: 'single_ally',  value: 50, unit: 'percent' },
  {
    type: 'stat_buff', targets: 'single_ally', stat: Stats.CD,
    value: 27, unit: 'percent', durationTurns: 2,  // TODO: CD buff 数值待核实
  },
],
```

---

### 75.5-B 花火大招补充 `sp_cap_up`

当前 `ult` 数组缺少 SP 上限临时提升，补充：

```typescript
ult: [
  {
    type: 'stat_buff', targets: 'all_allies', stat: Stats.ATK_P,
    value: 15, unit: 'percent', durationTurns: 2,  // TODO: ATK% 数值待核实
  },
  { type: 'sp_gain',   targets: 'team', value: 6, unit: 'flat' },
  { type: 'sp_cap_up', targets: 'team', value: 2, unit: 'flat', durationTurns: 2 },  // ← 新增
],
```

**注意事项**：
- 花火的 `spCapBonus: 3`（永久加成，战斗开始时生效）已正确存在，**不需要修改**
- `sp_cap_up` 的 `durationTurns: 2` 对应游戏中"队伍 2 次行动"，Task 75.4 的 Step C 全局 tick 保证每次任意角色行动后 -1
- 数值（ATK%、CD% 等）均已标注 TODO，Step 7.5 不要求精确，能追踪 SP 行为即可

**验收标准**：
- `tsc --noEmit` 无新增错误（`sp_cap_up` 类型必须已在 `InterventionTemplate` 中定义）
- 浏览器：花火大招触发后 ActionDisplayPanel 顶部 SP 圆点数增加至 `min(sp + 6, spMax)`，且 `spMax` 临时 +2

---

## Task 75.6 — `simulateBattle.test.ts` 新增 SP 场景测试

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.test.ts`

**前置条件**：Task 75.1–75.5

在现有 `'buff tracking'` describe 块之后追加：

```typescript
describe('simulateBattle — SP tracking', () => {
  // 使用已有 SPARKLE_ID / HUOHUO_ID 等测试角色
})
```

---

### 测试场景与断言

**辅助常量**（复用已有值）：

```typescript
// AV0 由各角色速度决定，参照 buff tracking 中的写法
// 花火速度按 BattleConfig 中值，藿藿速度取 100（测试通用）
```

**场景 1 — 初始 SP 值（无 spCapBonus）**

```typescript
it('初始 teamStateBefore.sp === 3，spMax === 5（无花火）', () => {
  const result = simulateBattle([huohuo], [], [], [], AV_LIMIT)
  const first = result.events[0]
  expect(first.teamStateBefore.sp).toBe(3)
  expect(first.teamStateBefore.spMax).toBe(5)
})
```

**场景 2 — 初始 SP（含 spCapBonus）**

```typescript
it('花火在队时 spMax === 8', () => {
  const result = simulateBattle([sparkle, huohuo], [], [], [], AV_LIMIT)
  const first = result.events[0]
  expect(first.teamStateBefore.spMax).toBe(8)
})
```

**场景 3 — 普攻 sp_gain +1**

```typescript
it('普攻后 teamStateAfter.sp === teamStateBefore.sp + 1', () => {
  const result = simulateBattle([huohuo], [], [], [], AV_LIMIT)
  const basicEv = result.events.find((e) => e.ability === 'basic')!
  expect(basicEv.teamStateAfter.sp).toBe(basicEv.teamStateBefore.sp + 1)
})
```

**场景 4 — 战技 sp_loss -1**

```typescript
it('战技后 teamStateAfter.sp === teamStateBefore.sp - 1', () => {
  // 使用战技 actionOverride 或找到 skill event
  const result = simulateBattle([huohuo], [], [], [], AV_LIMIT)
  const skillEv = result.events.find((e) => e.ability === 'skill')
  if (!skillEv) return  // 若无战技 event 则跳过
  expect(skillEv.teamStateAfter.sp).toBe(skillEv.teamStateBefore.sp - 1)
})
```

**场景 5 — SP 不超过 spMax**

```typescript
it('SP 已满时再 gain 不超过 spMax', () => {
  // 构造手动 sp_gain 使 SP 到达上限
  const ivFill: Intervention = {
    id: 'fill-sp', type: 'sp_gain', targets: [], value: 10,
    unit: 'flat', durationTurns: 0, triggerAv: 0,
  }
  const result = simulateBattle([huohuo], [ivFill], [], [], AV_LIMIT)
  // 找 ivFill 触发后的第一个 event
  const after = result.events.find((e) => e.teamStateBefore.sp === 5 || e.teamStateAfter.sp === 5)
  expect(after?.teamStateAfter.sp).toBeLessThanOrEqual(5)
})
```

**场景 6 — SP 不低于 0**

```typescript
it('SP 已空时再 loss 不低于 0', () => {
  const ivDrain: Intervention = {
    id: 'drain-sp', type: 'sp_loss', targets: [], value: 10,
    unit: 'flat', durationTurns: 0, triggerAv: 0,
  }
  const result = simulateBattle([huohuo], [ivDrain], [], [], AV_LIMIT)
  result.events.forEach((e) => {
    expect(e.teamStateAfter.sp).toBeGreaterThanOrEqual(0)
  })
})
```

**场景 7 — `sp_cap_up` 生效**

```typescript
it('sp_cap_up +2 后 spMax 提升 2', () => {
  const ivCapUp: Intervention = {
    id: 'cap-up', type: 'sp_cap_up', targets: [], value: 2,
    unit: 'flat', durationTurns: 3, triggerAv: 0,
  }
  const result = simulateBattle([huohuo], [ivCapUp], [], [], AV_LIMIT)
  const after = result.events[0]
  expect(after.teamStateAfter.spMax).toBe(7)   // 5 + 2
})
```

**场景 8 — `sp_cap_up` 到期恢复**

```typescript
it('sp_cap_up durationTurns:1 在 1 次行动后恢复', () => {
  const ivCapUp: Intervention = {
    id: 'cap-up-1', type: 'sp_cap_up', targets: [], value: 2,
    unit: 'flat', durationTurns: 1, triggerAv: 0,
  }
  const result = simulateBattle([huohuo], [ivCapUp], [], [], AV_LIMIT)
  // 第 1 个 event：sp_cap_up 生效，spMax = 7
  // 经过 Step C tick：durationTurns -1 = 0，cap 到期，spMax 恢复 5
  // 第 2 个 event：teamStateBefore.spMax 应回到 5
  const ev1 = result.events[0]
  const ev2 = result.events[1]
  expect(ev1.teamStateAfter.spMax).toBe(7)
  expect(ev2.teamStateBefore.spMax).toBe(5)
})
```

**场景 9 — `sp_cap_down` 时 SP 被 clamp**

```typescript
it('sp_cap_down 使 SP 被 clamp 至新上限', () => {
  // 先填满 SP，再降低上限
  const ivFill: Intervention = {
    id: 'fill', type: 'sp_gain', targets: [], value: 10, unit: 'flat', durationTurns: 0, triggerAv: 0,
  }
  const ivCapDown: Intervention = {
    id: 'cap-down', type: 'sp_cap_down', targets: [], value: 3, unit: 'flat', durationTurns: 0, triggerAv: 0,
  }
  const result = simulateBattle([huohuo], [ivFill, ivCapDown], [], [], AV_LIMIT)
  // spMax 降至 2（5 - 3），SP clamp 至 2
  const ev0 = result.events[0]
  expect(ev0.teamStateAfter.spMax).toBe(2)
  expect(ev0.teamStateAfter.sp).toBeLessThanOrEqual(2)
})
```

**场景 10 — 快照隔离**

```typescript
it('teamStateBefore / teamStateAfter 是独立快照（修改不影响历史）', () => {
  const result = simulateBattle([huohuo], [], [], [], AV_LIMIT)
  const ev0 = result.events[0]
  const ev1 = result.events[1]
  // 两个 event 的 teamStateAfter 是不同对象，不共享引用
  expect(ev0.teamStateAfter).not.toBe(ev1.teamStateBefore)
  // 修改 ev0.teamStateAfter 不影响 ev1.teamStateBefore
  ev0.teamStateAfter.sp = 999
  expect(ev1.teamStateBefore.sp).not.toBe(999)
})
```

---

**注意事项**：
- 手动 `Intervention` 的 `type: 'sp_gain'`（`targets: []`）需要 `Intervention` 类型在 `types.ts` 中支持这些 type 值；若 `Intervention` 类型限制了 `targets` 格式，临时用 `as Intervention` 绕过即可，后续在 `types.ts` 补全
- 若现有测试工具函数 `sim()` 只返回 `events` 数组，直接调用 `simulateBattle(...)` 来访问 `events[n].teamStateBefore`
- 场景 4 需要战技行动：若测试角色（藿藿/花火）的默认 ability 为 basic，需通过 `actionOverrides` 将某次行动设为 skill

**验收标准**：
- 全部 10 个新增场景通过
- 原有所有测试不回归

---

## Task 75.7 — ActionDisplayPanel SP 指示器 UI

**文件**：`src/lib/tabs/tabAvVisualizer/interventionPanel/ActionDisplayPanel.tsx`

**前置条件**：Task 75.4（`teamStateAfter` 已正确填充）

---

### 75.7-A `teamSpAtPlayhead` 计算

在 `ActionDisplayPanel` 组件内，仿照 `energyAtPlayhead` 的写法添加（需要 `simEvents` 和 `playheadAv` 两个 prop，确认已存在）：

```typescript
const teamSpAtPlayhead = useMemo<TeamBattleState>(() => {
  let last: TeamBattleState = { sp: 3, spMax: 5 }
  for (const ev of simEvents) {
    if (ev.av > playheadAv + 0.005) break   // simEvents 按 av 升序
    last = ev.teamStateAfter
  }
  return last
}, [simEvents, playheadAv])
```

---

### 75.7-B SP 圆点指示器渲染

在 ActionDisplayPanel 返回的 JSX 最顶部（角色筛选 / 事件列表之前）插入固定行：

```typescript
{/* SP 指示器：始终可见，不随 Playhead 滚动 */}
<div style={{ display: 'flex', alignItems: 'center', gap: 6, paddingBottom: 8, borderBottom: '1px solid var(--mantine-color-dark-5)', marginBottom: 8 }}>
  <Text size='xs' fw={600} c='dimmed'>SP</Text>
  <div style={{ display: 'flex', gap: 3 }}>
    {Array.from({ length: teamSpAtPlayhead.spMax }, (_, i) => (
      <div
        key={i}
        style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: i < teamSpAtPlayhead.sp
            ? 'var(--mantine-color-yellow-5)'
            : 'var(--mantine-color-dark-4)',
          transition: 'background 0.1s',
        }}
      />
    ))}
  </div>
  <Text size='xs' c='dimmed'>{teamSpAtPlayhead.sp} / {teamSpAtPlayhead.spMax}</Text>
</div>
```

**需要 `TeamBattleState` import**：

```typescript
import type { TeamBattleState, ... } from 'lib/tabs/tabAvVisualizer/types'
```

---

**注意事项**：
- `playheadAv` prop 是否已在 `ActionDisplayPanel` 中存在：如未传入，需在 `AvVisualizerTab.tsx` 补传（`AvVisualizerTab` 已有 `playheadAv` state）
- `ev.teamStateAfter` 可能为 `undefined`（若某些 event 是旧数据或 processUlt 产生的部分 event）；若存在这种情况，加 `if (!ev.teamStateAfter) continue` 守卫
- 圆点数量 = `teamSpAtPlayhead.spMax`，最多为 8（花火队），无需担心溢出
- `var(--mantine-color-yellow-5)` 与 HSR SP 金色调一致；实际颜色可根据视觉调整

**验收标准**：
- `tsc --noEmit` 无新增错误
- 浏览器（无花火）：初始显示 `●●●○○ 3 / 5`
- 浏览器（有花火）：初始显示 `●●●○○○○○ 3 / 8`
- Playhead 移动：每次普攻后 SP 圆点增加，每次战技后减少；视觉实时更新
- SP 满时普攻：圆点维持全满，不超出
- 花火大招后：SP 圆点增加 6（clamp 到 spMax）；spMax 临时 +2（圆点总数增加 2）

---

## 整体验收标准

- `tsc --noEmit` 无新增错误
- `simulateBattle.test.ts` 全部通过（含 10 个新增 SP 场景）
- `simulateTimeline.test.ts` 不回归
- 浏览器：
  1. 无花火队伍：开局 SP 圆点 `3 / 5`，普攻后 +1，战技后 -1，SP 满时不溢出，SP 为 0 时不降为负
  2. 含花火队伍：开局 `3 / 8`（`spCapBonus: 3` 生效）；花火大招后 SP +6 clamp 到上限，同时上限临时 +2 变 `10`；N 次行动后上限恢复 `8`
  3. Playhead 往回拖动：SP 圆点正确回溯（`teamStateAfter` 按 AV 重新读取）
  4. 花火战技（补全后）：触发后 SP -1；大招：SP +6 + 上限 +2
