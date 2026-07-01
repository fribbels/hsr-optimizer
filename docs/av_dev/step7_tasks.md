# Step 7 — 实现子任务清单

依赖关系：`7.1`（i18n）、`7.2`（`SpdBuff` 类型扩展）相互独立，可同时进行。`7.3`（expand 函数）依赖 `7.2`。`7.4`（`applyIntervention`）依赖 `7.2` + `7.3`。`7.5`（`activeBuffsMap` 初始化 + `snapshotStates`）依赖 `7.2` + `7.4`。`7.6`（主循环 tick 重构）依赖 `7.4` + `7.5`。`7.7`（测试）依赖 `7.4`—`7.6`。`7.8`（CharacterStatePanel UI）依赖 `7.1` + `7.5`（`snapshotStates` 填充后快照才有真实数据）。

---

## Task 7.1 — i18n 新增 buff 翻译键

**文件**：`public/locales/en_US/avVisualizerTab.yaml`

**改动**：

1. `Types:` 节点末尾追加：
   ```yaml
   Types:
     # 已有: SpdUp, SpdDown, AvAdvance, AvDelay, EnergyGain, EnergyLoss
     StatBuff: Stat Buff
     StatDebuff: Stat Debuff
   ```

2. `CharacterState:` 节点追加（移除原占位键 `BuffsPlaceholder`，替换为真实键）：
   ```yaml
   CharacterState:
     SpeedLabel: "SPD {{value}}"
     # 删除: BuffsPlaceholder: Buffs — available in Step 7
     NoBuffs: No active buffs
   ```

**改动后执行**：
```bash
npm run update-resources
```

**注意事项**：
- `BuffsPlaceholder` 已在 `CharacterStatePanel.tsx` 中引用，Task 7.8 将替换为 `NoBuffs`，需同步删除 yaml 旧 key
- `Types.StatBuff / StatDebuff` 在 Task 7.8 的 buff 列表 UI 中引用

**验收标准**：
- `npm run update-resources` 无报错
- `tsc --noEmit` 无新增错误
- `tAv('Types.StatBuff')` 和 `tAv('CharacterState.NoBuffs')` 不报 TypeScript 类型错误

---

## Task 7.2 — `SpdBuff` 内部类型扩展

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.ts`

**前置条件**：无

**改动**：

将文件顶部的 `SpdBuff` 类型从：
```typescript
type SpdBuff = {
  delta: number
  remainingTurns: number
}
```
改为：
```typescript
type SpdBuff = {
  id: string                  // 与 activeBuffsMap 中 ActiveIntervention.id 对应
  delta: number
  remainingTurns: number
  buffKind: 'direct' | 'aura'
  casterId: string            // direct: 等于 targetId；aura: 施放者 id
}
```

**同步更新 `applyIntervention` 中 `newBuff` 构造（先填占位值，Task 7.4 完整实现）**：

```typescript
const newBuff: SpdBuff = {
  id: iv.id,                            // 使用 Intervention 的 id（已由 expandSpdTemplate 生成）
  delta,
  remainingTurns: iv.buffKind === 'aura' ? Number.MAX_SAFE_INTEGER : iv.durationTurns,
  buffKind: iv.buffKind ?? 'direct',
  casterId: iv.buffKind === 'aura' && casterId ? casterId : targetId,
}
```

**aura buff 用 `Number.MAX_SAFE_INTEGER` 作为哨兵**：aura buff 的到期由 `activeBuffsMap` 中的 `ActiveIntervention.remainingTurns` 驱动（在施放者行动时 tick），而不是由目标自身的回合 tick 驱动。`Number.MAX_SAFE_INTEGER` 防止目标自身的 tick 逻辑把 aura buff 错误移除。

**即时 tick 逻辑调整（`applyIntervention` 中 `remainingAv > 0` 分支）**：

```typescript
// 只有 direct 类型才在应用时即时 tick；aura 的 tick 由施放者回合驱动
if (iv.buffKind !== 'aura') {
  newBuff.remainingTurns -= 1
  if (newBuff.remainingTurns <= 0) {
    targetState.spdBuffs = targetState.spdBuffs.filter((b) => b !== newBuff)
  }
}
```

`remainingAv === 0` 分支同理（当前行动恰好是目标行动时）：
```typescript
} else if (remainingAv === 0) {
  if (iv.buffKind !== 'aura') {
    newBuff.remainingTurns -= 1
    if (newBuff.remainingTurns <= 0) {
      targetState.spdBuffs = targetState.spdBuffs.filter((b) => b !== newBuff)
    }
  }
}
```

**注意事项**：
- 此时 `applyIntervention` 尚未接收 `casterId` 参数（Task 7.4 引入），Task 7.2 中 `casterId` 字段先填 `targetId`（占位），Task 7.4 会覆盖
- `iv.id` 已由 `expandSpdTemplate` 通过 `uuid()` 生成，可直接用于 `SpdBuff.id`

**验收标准**：
- `tsc --noEmit` 无新增错误（`SpdBuff` 使用处须同步更新构造写法）

---

## Task 7.3 — `expandSpdTemplate` 补全字段 + 新增 `expandStatTemplate`

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.ts`

**前置条件**：Task 7.2

---

### 7.3-A `expandSpdTemplate` 补全 `buffKind` / `auraTargets`

当前 `expandSpdTemplate` 不传递 `buffKind` 和 `auraTargets`。补全：

```typescript
function expandSpdTemplate(
  template: InterventionTemplate,
  triggerAv: number,
  resolvedTargets: string[],
): Intervention | null {
  if (template.type !== 'spd_up' && template.type !== 'spd_down') return null
  if (resolvedTargets.length === 0) return null
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets: resolvedTargets,
    value: template.value,
    unit: template.unit,
    durationTurns: template.durationTurns,
    buffKind:    template.buffKind,      // ← 新增
    auraTargets: template.auraTargets,   // ← 新增
  }
}
```

---

### 7.3-B 新增 `expandStatTemplate`

在 `expandSpdTemplate` 之后添加：

```typescript
function expandStatTemplate(
  template: InterventionTemplate,
  triggerAv: number,
  resolvedTargets: string[],
): Intervention | null {
  if (template.type !== 'stat_buff' && template.type !== 'stat_debuff') return null
  if (resolvedTargets.length === 0) return null
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets: resolvedTargets,
    value: template.value,
    unit: template.unit,
    durationTurns: template.durationTurns,
    stat:        template.stat,
    buffKind:    template.buffKind,
    auraTargets: template.auraTargets,
  }
}
```

---

### 7.3-C 模板展开调用处追加 `expandStatTemplate`

**主循环**（现有 `expandSpdTemplate` 之后追加）：
```typescript
const statIv = expandStatTemplate(template, event.av, resolvedTargets)
if (statIv) applyIntervention(statIv, charStates, queue, energyStates, activeBuffsMap, event.characterId)
```

**`processUlt` 函数**（现有 `expandSpdTemplate` 之后追加）：
```typescript
const statIv = expandStatTemplate(template, triggerAv, resolvedTargets)
if (statIv) applyIntervention(statIv, charStates, queue, energyStates, activeBuffsMap, ult.casterId)
```

**注意事项**：
- `activeBuffsMap` 和 `casterId` 这两个参数在 Task 7.4 中才加入 `applyIntervention` 签名，Task 7.3 写出调用但先用占位值，编译通过后 Task 7.4 完善

**验收标准**：
- `tsc --noEmit` 无新增错误
- `expandStatTemplate(template, 0, [])` 对非 `stat_buff/stat_debuff` 类型返回 `null`

---

## Task 7.4 — `applyIntervention` 扩展

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.ts`

**前置条件**：Task 7.2、Task 7.3

**改动**：

### 7.4-A 函数签名新增可选参数

```typescript
function applyIntervention(
  iv: Intervention,
  charStates: Map<string, CharState>,
  queue: QueueEntry[],
  energyStates?: Map<string, EnergyState>,
  activeBuffsMap?: Map<string, ActiveIntervention[]>,   // ← 新增
  casterId?: string,                                    // ← 新增
): void
```

所有现有调用点不传新参数，向后兼容（均为可选）。

---

### 7.4-B `spd_up / spd_down` 分支：补全 `newBuff` 构造 + 注册到 `activeBuffsMap`

在 `targetState.spdBuffs.push(newBuff)` 之后（gauge conservation 之前）添加：

```typescript
// 注册到 activeBuffsMap（仅当 activeBuffsMap 传入时）
if (activeBuffsMap) {
  const activeIv: ActiveIntervention = {
    id: newBuff.id,
    sourceCharacterId: casterId ?? targetId,
    sourceAbility: 'external',      // 来自 BattleConfig 模板时可优化，Step 7 统一用 'external'
    type: iv.type,
    value: iv.value,
    unit: iv.unit,
    remainingTurns: iv.durationTurns,   // 展示用：记录原始 duration，与 SpdBuff.remainingTurns 不同
    buffKind: iv.buffKind ?? 'direct',
    auraTargets: iv.auraTargets,
  }
  // aura 展示条目放到施放者身上；direct 放到目标身上
  const storeKey = (iv.buffKind === 'aura' && casterId) ? casterId : targetId
  const list = activeBuffsMap.get(storeKey) ?? []
  list.push(activeIv)
  activeBuffsMap.set(storeKey, list)
}
```

**同步即时 tick 时 `activeBuffsMap` 清除**：当即时 tick 导致 buff 立即到期（`remainingTurns <= 0`），也要从 `activeBuffsMap` 中删除该条目：

```typescript
if (iv.buffKind !== 'aura') {
  newBuff.remainingTurns -= 1
  if (newBuff.remainingTurns <= 0) {
    targetState.spdBuffs = targetState.spdBuffs.filter((b) => b !== newBuff)
    // 同步清除 activeBuffsMap
    if (activeBuffsMap) {
      const storeKey = targetId
      activeBuffsMap.set(storeKey, (activeBuffsMap.get(storeKey) ?? []).filter((a) => a.id !== newBuff.id))
    }
  }
}
```

---

### 7.4-C 新增 `stat_buff / stat_debuff` 分支

在 `energy_gain / energy_loss` 分支之后新增：

```typescript
} else if (iv.type === 'stat_buff' || iv.type === 'stat_debuff') {
  if (!activeBuffsMap) continue
  const buffKind = iv.buffKind ?? 'direct'
  // aura: 展示条目存在施放者；direct: 每个目标各存一条
  if (buffKind === 'aura' && casterId) {
    const list = activeBuffsMap.get(casterId) ?? []
    list.push({
      id: iv.id,
      sourceCharacterId: casterId,
      sourceAbility: 'external',
      type: iv.type,
      stat: iv.stat,
      value: iv.value,
      unit: iv.unit,
      remainingTurns: iv.durationTurns,
      buffKind: 'aura',
      auraTargets: iv.auraTargets,
    })
    activeBuffsMap.set(casterId, list)
  } else {
    for (const targetId of iv.targets) {
      const list = activeBuffsMap.get(targetId) ?? []
      list.push({
        id: iv.id,
        sourceCharacterId: casterId ?? targetId,
        sourceAbility: 'external',
        type: iv.type,
        stat: iv.stat,
        value: iv.value,
        unit: iv.unit,
        remainingTurns: iv.durationTurns,
        buffKind: 'direct',
      })
      activeBuffsMap.set(targetId, list)
    }
  }
}
```

`stat_buff / stat_debuff` 不修改 `charStates` 或 `queue`（无 AV 效果），最后也不调用 `sortQueue`。

---

### 7.4-D 全部调用点补全新参数

| 调用位置 | 新增参数 |
|---|---|
| 主循环 template 展开 (`avIv`, `energyIv`, `spdIv`, `statIv`) | `activeBuffsMap, event.characterId` |
| 主循环 `pendingAfter` 展开 | `activeBuffsMap, iv.afterCharId ?? undefined`（手动 intervention 无明确 casterId，填 `undefined`）|
| 主循环 `pendingGlobalBefore` | `activeBuffsMap, undefined`（全局 intervention 无 casterId）|
| 主循环 `charBeforeMatch` | `activeBuffsMap, undefined` |
| `processUlt` 内的 `avIv, energyIv, spdIv, statIv` | `activeBuffsMap, ult.casterId` |
| `processUlt` 接收 `activeBuffsMap` 参数（需同步修改函数签名） | 见下 |

**`processUlt` 签名新增 `activeBuffsMap`**：
```typescript
function processUlt(
  ult: UltInsertion,
  triggerAv: number,
  charStates: Map<string, CharState>,
  energyStates: Map<string, EnergyState>,
  queue: QueueEntry[],
  allCharacterIds: string[],
  results: BattleEvent[],
  activeBuffsMap: Map<string, ActiveIntervention[]>,   // ← 新增
): void
```

所有 `processUlt(...)` 调用点补传 `activeBuffsMap`。

**注意事项**：
- 手动 Intervention（来自 `pendingAfter` / `pendingGlobalBefore`）的 `casterId` 传 `undefined`；`buffKind` 默认为 `direct`（`Intervention.buffKind` 字段为可选，旧数据中不存在则为 `undefined`，`applyIntervention` 中 `iv.buffKind ?? 'direct'` 处理）
- `activeBuffsMap` 在 Task 7.5 中初始化后，在 `simulateBattle` 中传入所有调用点；此前调用不传（`undefined`），行为退化为 Step 6 等价

**验收标准**：
- `tsc --noEmit` 无新增错误
- 不传 `activeBuffsMap`（`undefined`）时行为与 Step 6 完全一致（所有新分支有 `if (!activeBuffsMap) return / continue` 守卫）

---

## Task 7.5 — `activeBuffsMap` 初始化 + `snapshotStates` 填充

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.ts`

**前置条件**：Task 7.2、Task 7.4

---

### 7.5-A 初始化 `activeBuffsMap`

在 `energyStates` 初始化块之后（`queue` 构造之前）追加：

```typescript
const activeBuffsMap = new Map<string, ActiveIntervention[]>()
for (const id of allCharacterIds) {
  activeBuffsMap.set(id, [])
}
```

---

### 7.5-B `snapshotStates` 签名新增 `activeBuffsMap` 参数

```typescript
function snapshotStates(
  energyStates: Map<string, EnergyState>,
  charStates: Map<string, CharState>,
  allCharacterIds: string[],
  activeBuffsMap?: Map<string, ActiveIntervention[]>,  // ← 新增，可选保持向后兼容
): Record<string, CharacterBattleState> {
  const snap: Record<string, CharacterBattleState> = {}
  for (const id of allCharacterIds) {
    const e = energyStates.get(id)
    const s = charStates.get(id)
    if (!e || !s) continue
    snap[id] = {
      energy: e.energy,
      spd: computeEffectiveSpd(s),
      activeInterventions: activeBuffsMap?.get(id) ?? [],   // 取代原来的 []
      extras: {},  // Step 9
    }
  }
  return snap
}
```

---

### 7.5-C 所有 `snapshotStates` 调用点补传 `activeBuffsMap`

共 4 处（`processUlt` 内的 `stateBefore` / `stateAfter`，主循环内的 `stateBefore` / `stateAfter`）：

```typescript
const stateBefore = snapshotStates(energyStates, charStates, allCharacterIds, activeBuffsMap)
// ...
results[normalActionResultIdx].stateAfter = snapshotStates(energyStates, charStates, allCharacterIds, activeBuffsMap)
```

**注意事项**：
- `activeBuffsMap` 中存储的是对象引用，`snapshotStates` 只是把当前列表浅拷贝进快照（`[...list]`），防止后续 tick 修改了快照内容。需要在读取时做拷贝：
  ```typescript
  activeInterventions: [...(activeBuffsMap?.get(id) ?? [])],
  ```

**验收标准**：
- `tsc --noEmit` 无新增错误
- 单元测试：一个有 `spd_up` 模板的角色行动后，其 `stateAfter[id].activeInterventions` 包含对应条目

---

## Task 7.6 — 主循环 Tick 重构

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.ts`

**前置条件**：Task 7.4、Task 7.5

将当前第 435-438 行的简单 tick：
```typescript
state.spdBuffs = state.spdBuffs
  .map((b) => ({ ...b, remainingTurns: b.remainingTurns - 1 }))
  .filter((b) => b.remainingTurns > 0)
```
替换为下面三步（建议抽成一个内联块或辅助函数，命名为 `tickBuffs`）：

---

### 7.6-A Direct SPD buff tick + 反向 Gauge Conservation

```typescript
// Step A: tick direct SPD buffs on event.characterId; apply reverse gauge conservation on expiry
const directSpdToExpire = state.spdBuffs.filter(
  (b) => b.buffKind === 'direct' && b.remainingTurns - 1 <= 0,
)
for (const b of directSpdToExpire) {
  const oldSpd = computeEffectiveSpd(state)
  state.spdBuffs = state.spdBuffs.filter((x) => x !== b)
  const newSpd = computeEffectiveSpd(state)
  const myEntry = queue.find((e) => e.characterId === event.characterId)
  if (myEntry && myEntry.av > event.av && oldSpd !== newSpd) {
    const gaugeDistance = (myEntry.av - event.av) * oldSpd
    myEntry.av = event.av + gaugeDistance / newSpd
  }
}
// Tick remaining direct buffs (those that don't expire)
state.spdBuffs = state.spdBuffs.map((b) =>
  b.buffKind === 'direct' ? { ...b, remainingTurns: b.remainingTurns - 1 } : b,
)
sortQueue(queue)
```

---

### 7.6-B Tick `activeBuffsMap[event.characterId]`；aura SPD 到期时反向 Gauge Conservation

```typescript
// Step B: tick all ActiveIntervention entries for event.characterId (direct received + aura emitted)
const myActive = activeBuffsMap.get(event.characterId) ?? []
const afterTickActive = myActive.map((a) => ({ ...a, remainingTurns: a.remainingTurns - 1 }))
const expiredActive = afterTickActive.filter((a) => a.remainingTurns <= 0)
activeBuffsMap.set(event.characterId, afterTickActive.filter((a) => a.remainingTurns > 0))

// For expired aura SPD buffs: remove from all affected targets' spdBuffs + reverse gauge conservation
for (const expired of expiredActive) {
  if (expired.buffKind !== 'aura') continue
  if (expired.type !== 'spd_up' && expired.type !== 'spd_down') continue

  for (const [charId, charState] of charStates) {
    const auraBuffInTarget = charState.spdBuffs.find((b) => b.id === expired.id)
    if (!auraBuffInTarget) continue

    const oldSpd = computeEffectiveSpd(charState)
    charState.spdBuffs = charState.spdBuffs.filter((b) => b.id !== expired.id)
    const newSpd = computeEffectiveSpd(charState)

    const targetEntry = queue.find((e) => e.characterId === charId)
    if (targetEntry && targetEntry.av > event.av && oldSpd !== newSpd) {
      const gaugeDistance = (targetEntry.av - event.av) * oldSpd
      targetEntry.av = event.av + gaugeDistance / newSpd
    }
  }
  sortQueue(queue)
}
```

---

### 7.6-C Stat buff tick（已在 Step B 中处理）

`stat_buff / stat_debuff` 条目同样存在 `activeBuffsMap[event.characterId]`，Step B 统一 tick 并移除，无需额外处理（stat buff 不影响 `charStates` 或 `queue`）。

---

**注意事项**：

- **正确顺序**：Step A（direct SPD tick）在 Step B（activeBuffsMap tick）之前，因为 Step A 可能改变 queue，Step B 可能再次 `sortQueue`，保证最终顺序一致
- **aura buff 的 `remainingTurns` 双轨**：`SpdBuff.remainingTurns = Number.MAX_SAFE_INTEGER`（永不被 direct tick 清除），`ActiveIntervention.remainingTurns` 为真实剩余回合数（Step B 驱动）。两者通过 `id` 关联
- **`processUlt` 无需加 tick 逻辑**：大招触发的 buff 与普通行动的 buff 使用同一 `activeBuffsMap`，tick 统一在主循环末尾发生
- **`energyTimeline` checkpoint**：已在 Step 5-6 中建立，Step 7 不改动

**验收标准**：
- `tsc --noEmit` 无新增错误
- `simulateBattle.test.ts`（现有 73 个测试）全部通过

---

## Task 7.7 — `simulateBattle.test.ts` 新增 buff 测试

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.test.ts`

**前置条件**：Task 7.4、Task 7.5、Task 7.6

在现有 `'ult insertion'` describe 块之后追加新的 describe 块：

```typescript
describe('simulateBattle — buff tracking', () => {
  // 使用已有 Sparkle / Huohuo 测试角色
  // 需要在 battleConfigs 中添加带 spd_up 和 stat_buff 模板的测试 config，
  // 或者通过手动 Intervention 直接注入 spd_up 来避免依赖 BattleConfig
})
```

---

### 测试场景与断言

| 场景 | 具体断言 |
|---|---|
| `spd_up` direct `durationTurns: 2`，目标下次行动的 `stateAfter` | `activeInterventions` 含该条目，`remainingTurns === 1`；再次行动后消失 |
| `spd_up` direct 到期反向 gauge conservation | 受益角色 buff 到期那次行动后，其下一次 AV 比预期（按原速度）更晚 |
| `stat_buff` direct `durationTurns: 3` | `stateAfter[id].activeInterventions` 包含 `type: 'stat_buff'` 条目；`spd` 不变；到期后消失 |
| `spd_up` aura，施放者行动驱动 tick | 受益方 `stateAfter[id].spd` 升高；施放者 `stateAfter[casterId].activeInterventions` 含该 aura 条目 |
| `spd_up` aura 到期（施放者行动 N 次后） | 所有受益方速度恢复，gauge conservation 生效（AV 向右移动） |
| `spd_up` aura：受益方自身行动不 tick | 受益方行动 3 次但施放者未行动 → aura 条目 `remainingTurns` 不变 |
| 手动 `Intervention` 类型 `spd_up`（无 BattleConfig） | `activeInterventions` 正确追踪；`buffKind` 默认 `direct` |
| direct + aura 同时存在 | 各自独立 tick，互不干扰 |
| `snapshotStates` 浅拷贝隔离 | 修改 `activeBuffsMap` 后不影响已 push 到 results 的历史快照 |

---

**测试辅助写法**（直接注入 Intervention，避免依赖 BattleConfig）：

```typescript
// 构造一个 spd_up Intervention 并通过 pendingAfter 触发（afterCharId / afterActionIndex）
const spdUpIv: Intervention = {
  id: 'test-spd-up',
  triggerAv: /* Sparkle 首次行动 AV */,
  type: 'spd_up',
  targets: [HUOHUO_ID],
  value: 20,
  unit: 'flat',
  durationTurns: 2,
  afterCharId: SPARKLE_ID,
  afterActionIndex: 0,
  buffKind: 'direct',
}
const result = sim([sparkle, huohuo], [spdUpIv], [], [], totalAv)
// 找 Huohuo 的第一个 normal event（buff 应用后）
// 验证其 stateAfter[HUOHUO_ID].activeInterventions
```

**注意事项**：
- 需要在 `beforeAll` / `beforeEach` 中设置 `gameMetadata`（已有测试中已初始化，复用）
- `sim()` wrapper 已在现有测试中定义为 `simulateBattle(...).events`；buff 测试直接调用 `simulateBattle(...)` 获取完整 events，对 `stateBefore / stateAfter` 做断言

**验收标准**：
- 所有新增场景通过
- 原有 73 个测试不回归

---

## Task 7.8 — `CharacterStatePanel.tsx` buff 列表 UI

**文件**：
- `src/lib/tabs/tabAvVisualizer/interventionPanel/CharacterStatePanel.tsx`
- `src/lib/tabs/tabAvVisualizer/AvVisualizerTab.tsx`

**前置条件**：Task 7.1（i18n key `NoBuffs`）、Task 7.5（`activeInterventions` 在快照中有真实数据）

---

### 7.8-A `CharacterStatePanel.tsx`

**新增 prop `activeInterventions`**：

```typescript
type CharacterStatePanelProps = {
  characterId: string
  characters: BattleEntity[]
  energy?: number
  activeInterventions?: ActiveIntervention[]   // ← 新增
}
```

**新增 import**：
```typescript
import type { ActiveIntervention, BattleEntity } from 'lib/tabs/tabAvVisualizer/types'
```

**Buff 区域替换**（删除 `BuffsPlaceholder`，改为真实显示）：

```typescript
// Buff 类型 → 翻译 key 映射
const BUFF_TYPE_KEY: Partial<Record<string, string>> = {
  spd_up:      'Types.SpdUp',
  spd_down:    'Types.SpdDown',
  stat_buff:   'Types.StatBuff',
  stat_debuff: 'Types.StatDebuff',
}

// 渲染区域（替换原有 BuffsPlaceholder 的 Stack）
<Stack gap={4}>
  <Text size='xs' fw={600} c='dimmed'>Buffs</Text>
  {(!activeInterventions || activeInterventions.length === 0) ? (
    <Text size='xs' c='dimmed'>{tAv('CharacterState.NoBuffs')}</Text>
  ) : (
    <Stack gap={2}>
      {activeInterventions.map((b) => {
        const typeLabel = BUFF_TYPE_KEY[b.type] ? tAv(BUFF_TYPE_KEY[b.type] as never) : b.type
        const auraMarker = b.buffKind === 'aura' ? ' ◈' : ''
        return (
          <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text size='xs' style={{ color: b.type.endsWith('_up') || b.type === 'stat_buff' ? 'var(--mantine-color-green-5)' : 'var(--mantine-color-red-5)' }}>
              {typeLabel}{auraMarker}
            </Text>
            <Text size='xs' c='dimmed'>{b.remainingTurns}T</Text>
          </div>
        )
      })}
    </Stack>
  )}
</Stack>
```

**删除 `CharacterState.BuffsPlaceholder`**：`yaml` 已在 Task 7.1 中移除，此处不再引用。

---

### 7.8-B `AvVisualizerTab.tsx` 补传 `activeInterventions`

在 `character-state` 渲染分支中补传：

```typescript
if (ctx.kind === 'character-state') {
  return (
    <CharacterStatePanel
      characterId={ctx.characterId}
      characters={timelineCharacters}
      energy={ctx.stateSnapshot?.energy ?? energyAtPlayhead.get(ctx.characterId)}
      activeInterventions={ctx.stateSnapshot?.activeInterventions}   // ← 新增
    />
  )
}
```

**注意事项**：
- `ctx.stateSnapshot` 来自 Step 6.5 引入的 per-turn snapshot，同一 AV 处不同回合会有独立的 `activeInterventions`
- `BUFF_TYPE_KEY` 的 `as never` 类型断言仅用于满足 `tAv` 的严格类型；与项目现有写法一致
- `◈`（U+25C8）无需 i18n，用作光环 buff 的简洁标注符号

**验收标准**：
- `tsc --noEmit` 无新增错误
- 浏览器：CharacterStatePanel 的 Buffs 区域显示实际 buff 列表而非占位文字
- 浏览器：`durationTurns: 2` 的 SPD buff 在第一次行动后显示 `1T`，第二次行动后消失
- 浏览器：光环 buff 带 `◈` 标注，显示在**施放者**的面板中

---

## 整体验收标准

- `tsc --noEmit` 无新增错误
- `simulateBattle.test.ts` 全部通过（含新增场景）
- `simulateTimeline.test.ts` 不回归
- 浏览器：
  1. 阮梅使用战技（`spd_up` aura，`durationTurns: 2`）→ Playhead 移到该行动后，点击阮梅 → CharacterStatePanel 显示 `SPD Up ◈ 2T`
  2. Playhead 移到阮梅第 2 次行动后 → `1T`；第 3 次行动后 → 消失，队友速度恢复
  3. 花火战技（`stat_buff`，`durationTurns: 2`）→ 点击目标角色 → CharacterStatePanel 显示 `Stat Buff 2T`
  4. 同 AV 处大招回合与普通攻击回合的 buff 列表各自独立（Step 6.5 per-turn 特性）
