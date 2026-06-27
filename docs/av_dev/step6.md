# Step 6 — 大招插入

## 目标

用户可以在 Timeline 的行动节点前后插入大招，引擎验证能量后产生 `turnKind: 'ult'` 的 `BattleEvent`，展开大招的 `InterventionTemplate[]`（能量回复、AV 效果等），并扣除施放者能量。Timeline 中大招节点以区别于普通行动的视觉样式显示。

---

## 范围边界

| 本步骤做 | 本步骤跳过 |
|---|---|
| `UltInsertion` 存入 store 并持久化 | 云璃双充的专属 UI 快捷入口（手动加两条即可）|
| 引擎在大招插入点校验能量、展开 ult 模板、扣除能量 | SP 追踪（后续步骤）|
| 大招 BattleEvent 在 Timeline 中显示（区别样式） | ult 事件对 AV 队列的重新排序（`turnKind: 'ult'` 不再入队）|
| ActionDisplayPanel 在 Playhead 处显示大招事件 | 希儿复生态（Step 9）|
| AddBranchPanel「Add Ult」按钮解锁 | Timeline 空白处点击插入大招（可选延伸，Step 6 不做）|
| 新增 `UltCasterPanel`：选施放者、验证能量、选目标 | `at_av` 时机（暂只支持 `after_action` / `during_action`）|
| `types.ts` 中 `RightPanelContext` 新增 `ult-caster` 类型 | 大招无效时的 UI 提示（静默跳过）|
| `BattleEntity` 新增 `ultInsertionId?: string` 关联 | — |

---

## 设计决策

### D1：大招插入时机映射到引擎 AV

`UltTiming` 有三种变体，Step 6 只支持前两种：

```
during_action (charId, actionIndex):
  大招在该角色第 N 次行动的同一 AV 触发，但排序在行动之前。
  → 引擎在 pop event 之前检查 pendingUltDuringAction

after_action (charId, actionIndex):
  大招在该角色第 N 次行动结束后立即触发，AV 相同，排序在行动之后。
  → 引擎在当前 event 处理完毕（含 pendingAfter）之后检查 pendingUltAfterAction

at_av:
  Step 6 跳过（不从 AddBranchPanel 触发，留待后续）
```

### D2：能量校验发生在引擎，UI 做预检

引擎是唯一可信的校验点（能量状态随模拟进展实时变化）。UI 在 `UltCasterPanel` 中用 `energyAtPlayhead`（Step 5 产物）做展示性预检：能量不足的角色置灰，但不阻止 store 写入。引擎如发现能量不足则静默跳过该 `UltInsertion`，不产生 BattleEvent。

### D3：`ultThreshold` 与 `ultEnergyCost` 的默认值解析

```typescript
const threshold = config?.ultThreshold ?? max_sp
const cost     = config?.ultEnergyCost ?? threshold
```

- 没有 `CharacterBattleConfig`（未配置）的角色：threshold = max_sp（从 gameMetadata 读），cost = threshold
- 云璃（`ultThreshold: 120, max_sp: 240`）：threshold=120, cost=120 → 可连续释放两次
- 标准角色（未设置）：threshold = max_sp, cost = max_sp

### D4：大招 BattleEvent 的 `actionIndex`

大招事件不属于正常回合序列，用 `actionIndex: -1` 作为哨兵值。引擎不会将此值与正常行动的 override 查找混淆（`ActionNodeOverride.choice` 查找只在 `actionIndex >= 0` 时有意义）。同一角色在同一 AV 插入多次大招时，按 store 中 `ultInsertions` 的顺序依次处理。

### D5：能量扣除与模板展开的顺序

```
1. snapshot stateBefore（含当前能量）
2. 扣除施放者能量：energy -= cost
3. 展开 ult 模板（expandAvTemplate + expandEnergyTemplate，复用现有函数）
4. snapshot stateAfter
5. push BattleEvent { turnKind: 'ult', actionChoice: 'ult', ... }
```

先扣再展开，防止 `energy_gain` 模板把能量加回来后超出刚好验证通过的上限边界。

### D6：大招不重新入队

`turnKind: 'ult'` 的 BattleEvent 只作为输出记录，不像普通行动那样把施放者重新排入 AV 队列。大招不占用行动格，施放后施放者的下一个普通行动 AV 不变。

### D7：Timeline ActionMarker 区分大招

现有 ActionMarker 对 `turnKind: 'ult'` 的节点：
- 用 `⚡`（或专用图标）替换头像
- 不显示「多行动」角标（大招事件始终只有 1 个）
- 颜色沿用施放者的 slot color，但加金色描边以示区别

`EnrichedSimEvent` 携带 `turnKind`，ActionMarker 据此分支渲染。

### D8：`UltCasterPanel` 的 UI 流程

AddBranchPanel 中「Add Ult」按钮 onClick：
```
onContextChange({ kind: 'ult-caster', timing: resolvedTiming })
```

`resolvedTiming` 从当前 `add-branch` context 推导：
- `afterCharId` → `{ type: 'after_action', charId, actionIndex }`
- `beforeCharId` → `{ type: 'during_action', charId, actionIndex }`
- 两者都没有 → 暂不支持（按钮禁用，提示「请从行动节点旁添加」）

UltCasterPanel 显示：
1. 角色列表（4 格 slot），每格显示头像 + 当前能量 / threshold + 是否满足
2. 点击满足条件的角色 → 如果其 ult 有 `single_ally` 目标 → 展示目标选择；否则直接调用 `addUltInsertion`
3. 插入成功后回到 `idle`

---

## 各模块详细设计

### 6.1 `useAVVisualTabStore.ts` — store 扩展

**`AVVisualizerTabSavedSession` 新增字段**：
```typescript
ultInsertions: UltInsertion[]
```

**`defaultState.savedSession` 新增**：
```typescript
ultInsertions: [],
```

**`AVVisualTabStateActions` 新增方法签名**：
```typescript
addUltInsertion:    (insertion: UltInsertion) => void
removeUltInsertion: (id: string) => void
clearUltInsertions: () => void
```

**store 实现**：
```typescript
addUltInsertion: (insertion) => set((s) => ({
  savedSession: {
    ...s.savedSession,
    ultInsertions: [...s.savedSession.ultInsertions, insertion],
  },
})),

removeUltInsertion: (id) => set((s) => ({
  savedSession: {
    ...s.savedSession,
    ultInsertions: s.savedSession.ultInsertions.filter((u) => u.id !== id),
  },
})),

clearUltInsertions: () => set((s) => ({
  savedSession: { ...s.savedSession, ultInsertions: [] },
})),
```

**向后兼容**：旧存档无 `ultInsertions` 字段时，`persistenceService.ts` 与 `defaultState` 的 `[]` 合并，自动补全。

---

### 6.2 `avVisualTabController.ts` — controller 扩展

**新增 import**：
```typescript
import type { UltInsertion } from 'lib/tabs/tabAvVisualizer/types'
import { uuid } from 'lib/utils/miscUtils'
```

**新增 UltInsertion CRUD**（在 ActionNodeOverride 方法之后）：
```typescript
addUltInsertion(insertion: Omit<UltInsertion, 'id'>) {
  useAVVisualTabStore.getState().addUltInsertion({ ...insertion, id: uuid() })
  SaveState.delayedSave()
},

removeUltInsertion(id: string) {
  useAVVisualTabStore.getState().removeUltInsertion(id)
  SaveState.delayedSave()
},

clearUltInsertions() {
  useAVVisualTabStore.getState().clearUltInsertions()
  SaveState.delayedSave()
},
```

**更新 `simulate()` 签名**：
```typescript
simulate(entities: BattleEntity[], interventions: Intervention[], totalAv: number): BattleEvent[] {
  const { actionOverrides, ultInsertions } = useAVVisualTabStore.getState().savedSession
  return simulateBattle(entities, interventions, actionOverrides, ultInsertions, totalAv)
},
```

---

### 6.3 `simulation/simulateBattle.ts` — 引擎扩展

**函数签名新增参数**：
```typescript
export function simulateBattle(
  entities: BattleEntity[],
  interventions: Intervention[],
  actionOverrides: ActionNodeOverride[],
  ultInsertions: UltInsertion[],      // ← 新增
  totalAv: number,
): BattleEvent[]
```

**新增内部类型**（`type QueueEntry` 之后）：
```typescript
type PendingUlt = UltInsertion & { resolvedAv?: number }
```

**初始化阶段（energyStates 之后）**：
```typescript
const pendingUltDuringAction = new Map<string, UltInsertion[]>()
const pendingUltAfterAction  = new Map<string, UltInsertion[]>()

for (const ult of ultInsertions) {
  if (ult.timing.type === 'during_action') {
    const key = `${ult.timing.charId}:${ult.timing.actionIndex}`
    pendingUltDuringAction.set(key, [...(pendingUltDuringAction.get(key) ?? []), ult])
  } else if (ult.timing.type === 'after_action') {
    const key = `${ult.timing.charId}:${ult.timing.actionIndex}`
    pendingUltAfterAction.set(key, [...(pendingUltAfterAction.get(key) ?? []), ult])
  }
  // at_av: Step 6 跳过
}
```

**新增 `processUlt` 内部函数**：
```typescript
function processUlt(
  ult: UltInsertion,
  triggerAv: number,
  charStates: Map<string, CharState>,
  energyStates: Map<string, EnergyState>,
  queue: QueueEntry[],
  allCharacterIds: string[],
  results: BattleEvent[],
): void {
  const casterEnergy = energyStates.get(ult.casterId)
  if (!casterEnergy) return  // casterId not in this simulation

  const metadata = getGameMetadata().characters?.[ult.casterId as CharacterId]
  const maxSp = metadata?.max_sp ?? 100
  const config = getBattleConfig(ult.casterId)
  const threshold = config?.ultThreshold ?? maxSp
  const cost      = config?.ultEnergyCost ?? threshold

  if (casterEnergy.energy < threshold) return  // 能量不足，静默跳过

  const stateBefore = snapshotStates(energyStates, charStates, allCharacterIds)

  // Deduct caster energy first, then apply templates
  casterEnergy.energy = Math.max(0, casterEnergy.energy - cost)

  const ultTemplates: InterventionTemplate[] = config?.abilities.ult ?? []
  for (const template of ultTemplates) {
    const resolvedTargets = resolveTargets(
      template.targets, ult.casterId, allCharacterIds, ult.targets,
    )
    const avIv = expandAvTemplate(template, triggerAv, ult.casterId, -1, resolvedTargets)
    if (avIv) applyIntervention(avIv, charStates, queue, energyStates)

    const energyIv = expandEnergyTemplate(template, triggerAv, resolvedTargets)
    if (energyIv) applyIntervention(energyIv, charStates, queue, energyStates)
  }

  const stateAfter = snapshotStates(energyStates, charStates, allCharacterIds)

  const casterState = charStates.get(ult.casterId)
  results.push({
    av: triggerAv,
    characterId: ult.casterId,
    actionIndex: -1,
    effectiveSpd: casterState ? computeEffectiveSpd(casterState) : 0,
    turnKind: 'ult',
    actionChoice: 'ult',
    stateBefore,
    stateAfter,
    teamStateBefore: { sp: 0, spMax: 5 },
    teamStateAfter:  { sp: 0, spMax: 5 },
  })
}
```

**主循环调整**：

在 `charBeforeMatch` 检测之前插入 `during_action` 检查：
```typescript
// Check ult events that fire during this character's action (before it)
const duringKey = `${head.characterId}:${head.actionIndex}`
for (const ult of (pendingUltDuringAction.get(duringKey) ?? [])) {
  processUlt(ult, head.av, charStates, energyStates, queue, allCharacterIds, results)
}
pendingUltDuringAction.delete(duringKey)
```

在 `pendingAfter` 处理之后插入 `after_action` 检查：
```typescript
// Check ult events that fire after this character's action
const afterUltKey = `${event.characterId}:${event.actionIndex}`
for (const ult of (pendingUltAfterAction.get(afterUltKey) ?? [])) {
  processUlt(ult, event.av, charStates, energyStates, queue, allCharacterIds, results)
}
pendingUltAfterAction.delete(afterUltKey)
```

注意 `during_action` 的 delete 必须在处理完所有同一 key 的 ults 之后，防止重复触发。

---

### 6.4 `types.ts` — `RightPanelContext` 扩展

在现有 `character-state` 变体之后追加：
```typescript
| { kind: 'ult-caster'; timing: Extract<UltTiming, { type: 'after_action' | 'during_action' }> }
```

注：`at_av` 类型被排除在 `ult-caster` 外，Step 6 不从 UI 触发此路径。

**`actionIndex` 需要接受 -1**：`BattleEvent.actionIndex: number` 类型已允许，无需改动。

---

### 6.5 i18n — `avVisualizerTab.yaml` 新增键

```yaml
UltCaster:
  Title: Insert Ultimate
  EnergyStatus: "{{energy}} / {{threshold}}"
  EnergyInsufficient: Insufficient energy
  NeedTarget: Select target
  ConfirmInsert: Insert
  NoActionContext: Select a character action slot first
```

修改后运行 `npm run update-resources`。

---

### 6.6 `AddBranchPanel.tsx` — 解锁「Add Ult」

将「Add Ult」按钮从 disabled 改为：
```typescript
function handleAddUlt() {
  const { afterCharId, afterActionIndex, beforeCharId, beforeActionIndex } = context
  let timing: Extract<UltTiming, { type: 'after_action' | 'during_action' }> | null = null
  if (afterCharId !== undefined) {
    timing = { type: 'after_action', charId: afterCharId, actionIndex: afterActionIndex ?? 0 }
  } else if (beforeCharId !== undefined) {
    timing = { type: 'during_action', charId: beforeCharId, actionIndex: beforeActionIndex ?? 0 }
  }
  if (!timing) return  // flat context — button stays disabled (no timing anchor)
  onContextChange({ kind: 'ult-caster', timing })
}
```

按钮 disabled 条件从 `disabled` 改为：
```typescript
disabled={!context.afterCharId && !context.beforeCharId}
```
Tooltip 保留（`disabled` 时显示「请从行动节点旁添加」）。

---

### 6.7 新建 `interventionPanel/UltCasterPanel.tsx`

Props：
```typescript
type UltCasterPanelProps = {
  timing: Extract<UltTiming, { type: 'after_action' | 'during_action' }>
  characters: BattleEntity[]
  energyAtPlayhead: Map<string, number>
  onDone: () => void
}
```

内部状态：
```typescript
const [selectedCasterId, setSelectedCasterId] = useState<string | null>(null)
const [selectedTarget, setSelectedTarget] = useState<string | null>(null)
```

渲染逻辑：
1. 显示标题（`UltCaster.Title`）
2. 角色网格（最多 4 格）：每格显示头像 + 能量 `current / threshold`
   - 能量满足（`energy >= threshold`）→ 可点击，正常样式
   - 能量不满足 → 置灰，显示 `UltCaster.EnergyInsufficient`
3. 选中某角色后：若其 ult 含 `single_ally` 目标 → 显示目标 Select（排除施放者自身）
4. 底部「Insert」按钮 → 调用：
   ```typescript
   AvVisualTabController.addUltInsertion({
     casterId: selectedCasterId,
     timing,
     targets: selectedTarget ? [selectedTarget] : undefined,
   })
   onDone()
   ```

能量显示依赖 `energyAtPlayhead`（由 `AvVisualizerTab` 传入）：
```typescript
const energy    = energyAtPlayhead.get(char.id) ?? char.maxEnergy * 0.5  // fallback
const maxSp     = getGameMetadata().characters?.[char.id as CharacterId]?.max_sp ?? 100
const config    = getBattleConfig(char.id)
const threshold = config?.ultThreshold ?? maxSp
const canCast   = energy >= threshold
```

---

### 6.8 `AvVisualizerTab.tsx` — 接入 UltCasterPanel

**新增 import**：
```typescript
import { UltCasterPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/UltCasterPanel'
```

**`renderRightPanel` 新增分支**：
```typescript
if (ctx.kind === 'ult-caster') {
  return (
    <UltCasterPanel
      timing={ctx.timing}
      characters={timelineCharacters}
      energyAtPlayhead={energyAtPlayhead}
      onDone={() => setRightPanelContext(IDLE_CONTEXT)}
    />
  )
}
```

**`simulate()` 调用**：`AvVisualTabController.simulate()` 内部已更新，`AvVisualizerTab.tsx` 无需改动调用侧。

---

### 6.9 `timeline/ActionMarker.tsx` — 大招节点视觉

`ActionMarkerProps` 新增 `turnKind: TurnKind`（已在 `EnrichedSimEvent` 中携带）。

渲染分支：
```typescript
if (turnKind === 'ult') {
  // 金色 ⚡ 图标，施放者 slot color 描边
  return (
    <div ... style={{ border: `2px solid gold`, background: char.color + '33', ... }}>
      <IconBolt size={14} color='gold' />
    </div>
  )
}
// 原有头像渲染路径不变
```

`TimelineRow.tsx` 需将 `event.turnKind` 传给 `ActionMarker`。

---

### 6.10 `interventionPanel/ActionDisplayPanel.tsx` — 显示大招事件

`actionsAtAv` 已过滤出 `ev.actionChoice === 'ult'` 的事件。`renderBehaviorRow` 对 `ult` 类型：
```typescript
if (ev.actionChoice === 'ult') {
  return (
    <div style={{ ... }}>
      <Text size='xs' fw={600} c='yellow'>⚡ Ultimate</Text>
    </div>
  )
}
```

大招事件不显示「Add Ult」或「+」按钮（`turnKind: 'ult'` 的事件不需要在其内部再插入内容）。

---

## 测试场景（追加到 simulateBattle.test.ts）

| 场景 | 验收条件 |
|---|---|
| 能量充足时插入 after_action 大招 | BattleEvent 出现 `turnKind: 'ult'`，位于触发角色之后 |
| 大招扣除能量 | `stateBefore.energy >= threshold`，`stateAfter.energy === stateBefore.energy - cost` |
| 大招展开 all_allies energy_gain 模板（藿藿 ult +20%）| 所有角色 `stateAfter.energy` 上涨 ≈ `maxEnergy × 20%` |
| 大招展开 av_advance 模板（花火 skill + ult 组合）| 目标 AV 提前 |
| 能量不足时大招被静默跳过 | results 中无 `turnKind: 'ult'` BattleEvent |
| `ultThreshold: 120 / ultEnergyCost: 120`（云璃模型）| maxEnergy=240，初始120；手动加满后（gain 120）连续插两次 ult，两次均成功，最终 energy=0 |
| `during_action` 时机：大招排在触发角色的行动之前 | results 顺序：ult event 在 normal event 之前（相同 av，ult 先出现）|
| `after_action` 时机：大招排在触发角色的行动之后 | results 顺序：normal event 在 ult event 之前 |

---

## 文件清单

| 操作 | 文件 |
|---|---|
| 修改 | `types.ts`（`RightPanelContext` 新增 `ult-caster`）|
| 修改 | `useAVVisualTabStore.ts`（新增 `ultInsertions` 字段 + 3 个 action）|
| 修改 | `avVisualTabController.ts`（新增 3 个方法 + 更新 simulate）|
| 修改 | `simulation/simulateBattle.ts`（新增 `ultInsertions` 参数 + `processUlt` 函数）|
| 修改（追加测试）| `simulation/simulateBattle.test.ts` |
| 修改 | `interventionPanel/AddBranchPanel.tsx`（解锁 Add Ult）|
| 新建 | `interventionPanel/UltCasterPanel.tsx` |
| 修改 | `AvVisualizerTab.tsx`（接入 UltCasterPanel、传 energyAtPlayhead）|
| 修改 | `timeline/ActionMarker.tsx`（新增 `turnKind` prop + 大招样式分支）|
| 修改 | `timeline/TimelineRow.tsx`（传 `turnKind` 给 ActionMarker）|
| 修改 | `interventionPanel/ActionDisplayPanel.tsx`（大招事件行渲染）|
| 修改 | `public/locales/en_US/avVisualizerTab.yaml`（UltCaster 节点）|

---

## 验收标准

- `tsc --noEmit` 无新增错误
- `simulateTimeline.test.ts` 41/41 不回归
- `simulateBattle.test.ts` 新增大招场景全部通过
- 浏览器：藿藿满能（70/140 初始 → 手动添加 `energy_gain 70` 使其达到 140），在某行动节点旁点击「+」→「Add Ult」→ UltCasterPanel 显示藿藿可施放 → 点击藿藿 → 大招插入，Timeline 出现金色 ⚡ 节点，全队能量在 ActionMarker 悬停或 CharacterStatePanel 中反映上涨
- 浏览器：能量不足的角色在 UltCasterPanel 中置灰，无法点击
- 浏览器：移除大招插入后（通过 clearUltInsertions 或单独移除）Timeline 恢复原状
