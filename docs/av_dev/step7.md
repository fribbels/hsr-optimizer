# Step 7 — BUFF 系统

## 目标

引擎追踪每个实体的 buff 状态，并在 `BattleEvent.stateBefore / stateAfter` 的 `activeInterventions` 字段中填入真实数据（目前始终为 `[]`）。Playhead 停在某个行动节点时，用户可在 CharacterStatePanel 看到该角色当前的激活 buff 列表（类型、来源、剩余回合）。

---

## 范围边界

| 本步骤做 | 本步骤跳过 |
|---|---|
| `spd_up / spd_down` buff 追踪（含 direct 和 aura 两种类型）| `stat_buff / stat_debuff` 的数值效果（Phase 4 再用）|
| `stat_buff / stat_debuff` 存储与到期 tick（不计算数值效果）| SP 类 buff（`sp_cap_up / sp_cap_down`，后续步骤）|
| SPD buff 到期时反向 gauge conservation（补全当前的缺失）| `extras` 驱动的角色特殊 buff（Step 9）|
| `activeInterventions` 字段在快照中填充真实数据 | 光环 buff 在受益方行动时标注"受 XXX 光环影响"（可选延伸，Step 7 不做）|
| CharacterStatePanel 显示激活 buff 列表 | 大招触发的 stat_buff / spd_up 在 UltEffectsPanel 中已展示，Step 7 重点是引擎追踪 |
| `expandSpdTemplate` 携带 `buffKind` / `auraTargets` | 同一 buff 多个目标的各自 tick（Step 7 统一管理）|
| 手动 Intervention（`spd_up` 类型）也纳入追踪 | `aura` 类 buff 的受益方 SPD 在 AV 队列中的实时撤回（当前设计：到期时再撤）|

---

## 设计决策

### D1：双轨追踪 — `spdBuffs`（队列数学）与 `activeBuffsMap`（快照展示）

引擎内部已有 `charState.spdBuffs: SpdBuff[]` 用于 AV 队列数学。Step 7 **不修改**这一结构，而是在旁边新增：

```typescript
const activeBuffsMap = new Map<string, ActiveIntervention[]>()
```

两者同步维护：
- `spd_up / spd_down`：同时写入 `spdBuffs`（队列数学）和 `activeBuffsMap`（展示）
- `stat_buff / stat_debuff`：只写 `activeBuffsMap`（无 AV 效果）
- `id` 字段（UUID）用于跨两个结构定位同一条 buff

`snapshotStates` 从 `activeBuffsMap` 读取，填充 `activeInterventions` 字段：

```typescript
snap[id] = {
  energy: e.energy,
  spd: computeEffectiveSpd(s),
  activeInterventions: activeBuffsMap.get(id) ?? [],  // 取代原来的 []
  extras: {},  // Step 9
}
```

---

### D2：Direct vs Aura — Tick 规则

| `buffKind` | Tick 触发时机 | 存放位置（`activeBuffsMap`） |
|---|---|---|
| `direct`（默认）| **接受者**回合结束 | 接受者的 `activeBuffsMap[targetId]` |
| `aura` | **施放者**回合结束 | 施放者的 `activeBuffsMap[casterId]` |

光环 SPD 效果仍然**立即应用**到所有目标的 `spdBuffs`（AV 队列必须即时更新），但展示和 tick 语义放在施放者身上。到期时，施放者的 aura 条目被删除，同时在所有目标的 `spdBuffs` 中移除对应 entry 并做反向 gauge conservation。

---

### D3：SPD buff 到期时补做反向 Gauge Conservation

当前实现（Step 3-6）：buff 到期时直接从 `spdBuffs` 过滤，**不做反向** gauge conservation。角色的下一次入队 AV（已在上一个回合末 push 到 queue）不受影响，但下一次行动后再次入队时速度已经降低，实际上等于 buff 在下一次行动时才生效失效——这是不精确的。

Step 7 补全：buff 到期时，如果该角色的下一次行动 AV（`charEntry.av`）尚未到达（`charEntry.av > event.av`），重新做 gauge conservation：

```typescript
// 在 filter 之前，对即将过期的 buff 先做反向 gauge conservation
const expiredBuffs = state.spdBuffs.filter((b) => b.remainingTurns <= 0)
for (const b of expiredBuffs) {
  const charEntry = queue.find((e) => e.characterId === targetId)
  if (!charEntry || charEntry.av <= event.av) continue
  const oldSpd = computeEffectiveSpd(state)  // still includes this buff
  state.spdBuffs = state.spdBuffs.filter((x) => x !== b)  // remove temporarily
  const newSpd = computeEffectiveSpd(state)
  state.spdBuffs.push(b)  // restore for the enclosing filter
  if (oldSpd !== newSpd) {
    const gaugeDistance = (charEntry.av - event.av) * oldSpd
    charEntry.av = event.av + gaugeDistance / newSpd
  }
}
state.spdBuffs = state.spdBuffs.filter((b) => b.remainingTurns > 0)
```

---

### D4：`expandSpdTemplate` 补全 `buffKind` 和 `auraTargets`

当前 `expandSpdTemplate` 不携带 `buffKind`/`auraTargets`，导致所有 SPD 模板展开后都被当作 `direct` 处理。Step 7 补全：

```typescript
function expandSpdTemplate(template, triggerAv, resolvedTargets): Intervention | null {
  ...
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets: resolvedTargets,
    value: template.value,
    unit: template.unit,
    durationTurns: template.durationTurns,
    buffKind: template.buffKind,        // ← 新增
    auraTargets: template.auraTargets,  // ← 新增
  }
}
```

同理 `expandStatTemplate`（新增的函数，展开 `stat_buff / stat_debuff`）也需要携带这两个字段。

---

### D5：`applyIntervention` 新增 `activeBuffsMap` 和 `casterId` 参数

为了正确追踪 buff，`applyIntervention` 需要知道：
- 将 `ActiveIntervention` 写到哪个 Map（`activeBuffsMap`）
- 施放者是谁（`casterId`，用于区分 aura 放在施放者身上）

更新后签名：

```typescript
function applyIntervention(
  iv: Intervention,
  charStates: Map<string, CharState>,
  queue: QueueEntry[],
  energyStates?: Map<string, EnergyState>,
  activeBuffsMap?: Map<string, ActiveIntervention[]>,
  casterId?: string,
): void
```

**`spd_up / spd_down` 分支新增逻辑**：

```typescript
if (iv.buffKind === 'aura' && casterId) {
  // aura: 展示条目写到施放者身上
  const casterBuffs = activeBuffsMap.get(casterId) ?? []
  casterBuffs.push({ id: newBuff.id, sourceCharacterId: casterId, ..., buffKind: 'aura', auraTargets: iv.auraTargets })
  activeBuffsMap.set(casterId, casterBuffs)
} else {
  // direct: 展示条目写到每个目标身上
  for (const targetId of iv.targets) {
    const targetBuffs = activeBuffsMap.get(targetId) ?? []
    targetBuffs.push({ id: newBuff.id, sourceCharacterId: casterId ?? targetId, ..., buffKind: 'direct' })
    activeBuffsMap.set(targetId, targetBuffs)
  }
}
```

**`stat_buff / stat_debuff` 分支（新增）**：

```typescript
if (iv.type === 'stat_buff' || iv.type === 'stat_debuff') {
  const buffKind = iv.buffKind ?? 'direct'
  const storeId = (buffKind === 'aura' && casterId) ? casterId : undefined
  for (const targetId of (storeId ? [storeId] : iv.targets)) {
    const list = activeBuffsMap?.get(targetId) ?? []
    list.push({
      id: iv.id,
      sourceCharacterId: casterId ?? targetId,
      sourceAbility: 'external',
      type: iv.type,
      stat: iv.stat,
      value: iv.value,
      unit: iv.unit,
      remainingTurns: iv.durationTurns,
      buffKind,
      auraTargets: iv.auraTargets,
    })
    activeBuffsMap?.set(targetId, list)
  }
}
```

---

### D6：`stat_buff` 的数值效果在 Step 7 中不生效

`stat_buff / stat_debuff` 的 `ActiveIntervention` 被存储、tick 并包含在快照中，但 Step 7 不计算其实际数值影响（不修改速度、不注入伤害倍率）。Phase 4 读取 `stateBefore.activeInterventions` 并交由 `conditionals/` 体系处理。

---

### D7：主循环 Tick 逻辑重构

当角色 `event.characterId` 结束行动时，同时处理两类 buff 的 tick：

```
1. 该角色自身的 direct SPD/stat buff：tick -1，到期 → 反向 gauge conservation + 删除
2. 所有角色中 casterId === event.characterId 的 aura SPD buff：tick -1，到期 → 从对应目标 spdBuffs 反向 + 删除
3. activeBuffsMap 同步删除到期条目
```

这替代当前仅 tick `state.spdBuffs` 的简单实现。

---

## 各模块详细设计

### 7.1 `simulation/simulateBattle.ts` — 引擎扩展

**内部类型扩展**：

```typescript
type SpdBuff = {
  id: string            // 与 ActiveIntervention.id 对应
  delta: number
  remainingTurns: number
  buffKind: 'direct' | 'aura'
  casterId: string      // direct: 等于 targetId；aura: 施放者 id
}
```

**新增内部函数**：

```typescript
// 展开 stat_buff / stat_debuff 模板为 Intervention
function expandStatTemplate(
  template: InterventionTemplate,
  triggerAv: number,
  resolvedTargets: string[],
): Intervention | null
```

逻辑与 `expandSpdTemplate` 对称，只处理 `stat_buff / stat_debuff` 类型，携带 `stat`、`buffKind`、`auraTargets`。

**初始化（`energyStates` 之后）**：

```typescript
const activeBuffsMap = new Map<string, ActiveIntervention[]>()
for (const id of allCharacterIds) activeBuffsMap.set(id, [])
```

**`applyIntervention` 扩展**：见 D5。

**主循环 Tick 替换**：

将原来简单的 `state.spdBuffs = state.spdBuffs.map(...).filter(...)` 替换为 D7 描述的双层 tick 逻辑。结构如下：

```typescript
// Step A: tick direct SPD buffs on event.characterId
tickDirectSpdBuffs(event.characterId, charStates, queue, event.av, activeBuffsMap)

// Step B: tick aura SPD buffs where casterId === event.characterId（遍历所有 charStates）
tickAuraSpdBuffs(event.characterId, charStates, queue, event.av, activeBuffsMap)

// Step C: tick stat buffs（direct on this char, aura as caster of this char）
tickStatBuffs(event.characterId, activeBuffsMap)
```

可以提取为 3 个内部辅助函数，也可以内联在循环中，以最终代码可读性为准。

**模板展开补全**（在主循环和 `processUlt` 的模板展开处）：

```typescript
const statIv = expandStatTemplate(template, triggerAv, resolvedTargets)
if (statIv) applyIntervention(statIv, charStates, queue, energyStates, activeBuffsMap, casterId)
```

---

### 7.2 `interventionPanel/CharacterStatePanel.tsx` — buff 列表

`CharacterStatePanel` 目前的 `BuffsPlaceholder` 区域改为真实数据显示。

数据来源：`ctx.stateSnapshot?.activeInterventions`（每回合独立快照，Step 6.5 引入的 per-turn state 特性使同一 AV 处不同回合展示不同 buff 列表）。

渲染逻辑：

```typescript
const buffs = stateSnapshot?.activeInterventions ?? []

// 将 buff 类型映射到 i18n key
const BUFF_TYPE_LABEL: Record<string, string> = {
  spd_up:      'Types.SpdUp',
  spd_down:    'Types.SpdDown',
  stat_buff:   'Types.StatBuff',
  stat_debuff: 'Types.StatDebuff',
}

{buffs.length === 0 ? (
  <Text size='xs' c='dimmed'>—</Text>
) : (
  <Stack gap={2}>
    {buffs.map((b) => (
      <div key={b.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text size='xs'>{tAv(BUFF_TYPE_LABEL[b.type])}{b.buffKind === 'aura' ? ' ◈' : ''}</Text>
        <Text size='xs' c='dimmed'>{b.remainingTurns}T</Text>
      </div>
    ))}
  </Stack>
)}
```

`◈` 符号用于标注光环 buff（简洁区分，无需额外 i18n key）。

CharacterStatePanel 的 Props 现有 `stateSnapshot?: CharacterBattleState`（已在 Step 6.5 引入），无需改动签名。

---

### 7.3 `avVisualizerTab.yaml` — 新增 i18n 键

```yaml
Types:
  # 已有: SpdUp, SpdDown, AvAdvance, AvDelay, EnergyGain, EnergyLoss
  StatBuff: Stat Buff
  StatDebuff: Stat Debuff

CharacterState:
  # 已有: SpeedLabel, EnergyPlaceholder (改为实际显示已在 Step 5 完成)
  NoBuffs: No active buffs
```

修改后执行 `npm run update-resources`。

---

### 7.4 `simulation/simulateBattle.test.ts` — 新增 buff 测试

在现有 `'ult insertion'` describe 块之后追加 `'buff tracking'` describe 块。

| 场景 | 验收断言 |
|---|---|
| `spd_up` direct，`durationTurns: 2` | 第 1 次行动后 `stateAfter[id].activeInterventions` 含该条目，`remainingTurns: 1`；第 2 次行动后条目消失 |
| `spd_up` 到期时反向 gauge conservation | 受益角色的下一次 AV 在 buff 到期后向右移动（速度下降）|
| `stat_buff` 存储不影响速度 | `stateAfter[id].spd` 不变，`activeInterventions` 含 stat_buff 条目 |
| `spd_up` aura，caster 行动时 tick | 所有目标在 caster 的第 N 次行动后 remainingTurns -1；aura 条目只出现在 caster 的 `activeInterventions` 中 |
| `spd_up` aura 到期 | caster 行动后 aura 消失，受益方速度恢复，AV 重新计算 |
| 手动 `spd_up` Intervention（无 BattleConfig）| `activeInterventions` 仍然被追踪 |
| 同时存在 direct 和 aura | 互不干扰，各自 tick |

---

## 文件清单

| 操作 | 文件 |
|---|---|
| 修改 | `simulation/simulateBattle.ts`（`SpdBuff` 类型扩展、`activeBuffsMap` 追踪、`applyIntervention` 扩展、tick 逻辑重构、`expandSpdTemplate` 补全 `buffKind`、新增 `expandStatTemplate`）|
| 修改（追加测试）| `simulation/simulateBattle.test.ts` |
| 修改 | `interventionPanel/CharacterStatePanel.tsx`（buff 列表 UI）|
| 修改 | `public/locales/en_US/avVisualizerTab.yaml`（`Types.StatBuff`、`Types.StatDebuff`、`CharacterState.NoBuffs`）|

不涉及 store / controller / types.ts / AvVisualizerTab.tsx（`activeInterventions` 字段已在 types.ts 中定义，快照填充通过引擎完成，UI 只需读取现有 `stateSnapshot` prop）。

---

## 验收标准

- `tsc --noEmit` 无新增错误
- `simulateTimeline.test.ts` 不回归
- `simulateBattle.test.ts` 新增 buff 场景全部通过
- 浏览器：
  1. 阮梅使用战技（含 `spd_up` aura 模板，`durationTurns: 2`）→ ActionDisplayPanel 出现阮梅战技行动后的队友行动节点，点击队友查看 CharacterStatePanel，`activeInterventions` 显示阮梅的 SPD 光环（标注 `◈`，剩余回合数正确）
  2. Playhead 移动到阮梅第 2 次行动后，光环条目消失，队友速度恢复（CharacterStatePanel 中 SPD 数值降低）
  3. `stat_buff` 类型的 buff（如花火战技 CD 叠加）显示在 CharacterStatePanel buff 列表中，不影响 SPD 显示
  4. 同 AV 的不同回合（如普通攻击 vs 大招回合）buff 列表各自独立（得益于 Step 6.5 的 per-turn stateSnapshot）
