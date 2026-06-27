# Step 5 — 能量系统

## 目标

引擎开始追踪每个角色的能量状态，并在 `BattleEvent.stateBefore / stateAfter` 中填充真实快照。Playhead 停在某个行动节点时，用户可以在 CharacterStatePanel 看到该角色当前的能量值。

---

## 范围边界

| 本步骤做 | 本步骤跳过 |
|---|---|
| 角色初始能量 = `max_sp × 50%` | SP（战技点）追踪（后续步骤）|
| `energy_gain / energy_loss` 模板在每次行动后展开 | `sp_gain / sp_loss` 模板（后续步骤）|
| 手动添加的 `energy_gain / energy_loss` Intervention 生效 | `stat_buff / spd_up` 等类型（Step 7）|
| `BattleEvent.stateBefore / stateAfter` 填入 `energy + spd` 快照 | `activeInterventions`（Step 7 填充）|
| `CharacterStatePanel` 能量区域从占位变为真实显示 | `extras`（Step 9 填充）|
| `InterventionEditPanel` 表单添加 `energy_gain / energy_loss` 类型选项 | 大招释放能量归零（Step 6）|
| `types.ts` 中 `CharacterBattleConfig` 新增 `ultThreshold?` / `ultEnergyCost?` 字段（只加类型定义） | 大招释放能量扣除逻辑（Step 6）|
| `simulateBattle.test.ts` 新增能量相关测试场景 | 能量满时的 ult 触发逻辑（Step 6）|

---

## 设计决策

### D1：`energy_gain` 模板始终展开，不再限制于有 override 时

Step 3 的模板展开只在 `if (override)` 块内，因为 Step 3 只关心 AV 效果（用普攻不会 av_advance 自己）。但能量回复在普攻/战技都有，因此 Step 5 需要无条件展开：

```
effectiveChoice = override?.choice ?? 'basic'
templates = getBattleConfig(characterId)?.abilities[effectiveChoice] ?? []
for template in templates:
  if av_advance/av_delay: expandAvTemplate (已有)
  if energy_gain/loss:    applyEnergyTemplate (新增)
  else: skip (Step 7+)
```

没有 BattleConfig 的角色 `templates` 为 `[]`，循环直接跳过，不影响现有逻辑。

### D2：能量状态存在独立的 `energyStates` Map 中

不放进 `charStates`（只追踪速度），也不放进 `BattleEvent`（输出）。与 `charStates` 并列维护：

```typescript
type EnergyState = { energy: number; maxEnergy: number }
const energyStates = new Map<string, EnergyState>()
```

`maxEnergy` 从 `getGameMetadata().characters[id]?.max_sp ?? 100` 读取（与 `calculateContext.ts` 的现有用法一致）。

### D3：`applyIntervention` 扩展接受 `energyStates`，处理 energy 类型

现有 `applyIntervention` 只处理 spd 和 av 类型。改为接受可选的 `energyStates` 参数：

```typescript
function applyIntervention(
  iv: Intervention,
  charStates: Map<string, CharState>,
  queue: QueueEntry[],
  energyStates?: Map<string, EnergyState>,
): void
```

在函数内部新增 `energy_gain / energy_loss` 分支。现有调用点只需保持不传 `energyStates` 即可向后兼容（但主循环里要传）。

能量变化逻辑：
```typescript
const delta = iv.unit === 'percent'
  ? target.maxEnergy * (iv.value / 100)
  : iv.value
target.energy = iv.type === 'energy_gain'
  ? Math.min(target.maxEnergy, target.energy + delta)
  : Math.max(0, target.energy - delta)
```

### D4：`stateBefore / stateAfter` 快照围绕模板展开

当前 BattleEvent 被 push 进 results 之后，模板才展开。Step 5 调整顺序：

```
1. snapshot stateBefore   → 行动前全部角色能量+速度
2. results.push(...)      → 含 stateBefore，stateAfter 先填 {}
3. 重新入队 + tick SpdBuffs (已有)
4. 展开 energy / av 模板   → 修改 energyStates / queue
5. 处理 pendingAfter        (已有)
6. snapshot stateAfter    → 能量已更新
7. results[last].stateAfter = stateAfter
```

snapshot 函数：

```typescript
function snapshotStates(
  energyStates: Map<string, EnergyState>,
  charStates: Map<string, CharState>,
  allCharacterIds: string[],
): Record<string, CharacterBattleState> {
  const snap: Record<string, CharacterBattleState> = {}
  for (const id of allCharacterIds) {
    const e = energyStates.get(id)
    const s = charStates.get(id)
    if (!e || !s) continue
    snap[id] = {
      energy: e.energy,
      spd: computeEffectiveSpd(s),
      activeInterventions: [],  // Step 7
      extras: {},               // Step 9
    }
  }
  return snap
}
```

### D5：CharacterStatePanel 的能量数据来源

CharacterStatePanel 需要 `energy` 和 `maxEnergy`。

- `energy`：由 AvVisualizerTab 从 `simEvents` 中查找该角色在当前 playhead 处最近的 `stateBefore.energy` 传入
- `maxEnergy`：CharacterStatePanel 自行调用 `getGameMetadata().characters[id]?.max_sp ?? 100` 读取（单次同步调用，无需 memo）

AvVisualizerTab 新增计算：

```typescript
const energyAtPlayhead = useMemo(() => {
  const map = new Map<string, number>()
  // 取每个角色在 playheadAv 处最近的 stateBefore.energy
  for (const event of simEvents) {
    if (event.av > playheadAv + 0.005) break  // simEvents 按 av 升序
    const state = event.stateBefore[event.characterId]
    if (state) map.set(event.characterId, state.energy)
  }
  return map
}, [simEvents, playheadAv])
```

传给 CharacterStatePanel：`energy={energyAtPlayhead.get(characterId)}`

### D6（类型预定义）：`CharacterBattleConfig` 新增 `ultThreshold` / `ultEnergyCost`

部分角色能量机制与"能量满归零"不同：

| 角色类型 | 示例 | max_sp | ultThreshold | ultEnergyCost |
|---|---|---|---|---|
| 标准 | 花火 | 120 | 120（默认）| 120（默认）|
| 双充大招 | 云璃 | 240 | 120 | 120 |
| 部分保留 | Saber | X | X（默认）| Y（Y<X）|

Step 5 只在 `CharacterBattleConfig` 类型定义中声明这两个可选字段，不加任何实现逻辑：

```typescript
ultThreshold?: number   // 触发大招所需的最低能量，默认等于 max_sp
ultEnergyCost?: number  // 每次释放扣除的能量，默认等于 ultThreshold
```

Step 6 的 UltInsertion 引擎读取这两个字段：校验 `energy >= ultThreshold`，释放后 `energy -= ultEnergyCost`。

### D7：`resolveTargets` 扩展处理 `'team'` 目标（energy 不适用，但 sp 未来需要）

目前 `resolveTargets` 对 `'team'` 返回 `[]`。能量回复不会用 `'team'` 目标（SP 才用），所以 Step 5 不需要改。保持现状，Step 6/7 再处理 SP。

---

## 各模块详细设计

### 5.1 `simulation/simulateBattle.ts` — 引擎扩展

**新增 import**：
```typescript
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { CharacterId } from 'types/character'
```

**新增内部类型**：
```typescript
type EnergyState = { energy: number; maxEnergy: number }
```

**初始化（循环前）**：
```typescript
const energyStates = new Map<string, EnergyState>()
for (const char of characters) {
  const maxEnergy = getGameMetadata().characters[char.id as CharacterId]?.max_sp ?? 100
  energyStates.set(char.id, { energy: maxEnergy * 0.5, maxEnergy })
}
```

**`applyIntervention` 扩展**：
- 签名加 `energyStates?: Map<string, EnergyState>`
- 在现有 spd / av 分支后新增 `energy_gain / energy_loss` 分支
- 只有传入 `energyStates` 时才处理能量类型

**主循环调整**：

原来 `if (override) { ... }` 块改为无条件展开（见 D1）：

```typescript
const effectiveChoice = override?.choice ?? 'basic'
const config = getBattleConfig(event.characterId)
const templates: InterventionTemplate[] = config?.abilities[effectiveChoice] ?? []

// Snapshot stateBefore (before any template effects)
const stateBefore = snapshotStates(energyStates, charStates, allCharacterIds)

results.push({
  ...,
  actionChoice: override?.choice ?? 'basic',
  stateBefore,
  stateAfter: {},  // filled below
})

// Re-enqueue + tick SPD buffs (existing code, unchanged)
...

// Expand templates
for (const template of templates) {
  const resolvedTargets = resolveTargets(template.targets, event.characterId, allCharacterIds, override?.targets)
  const iv = expandAvTemplate(template, event.av, event.characterId, event.actionIndex, resolvedTargets)
  if (iv) applyIntervention(iv, charStates, queue, energyStates)
  // energy_gain / energy_loss 通过扩展后的 applyIntervention 处理
}

// Fire pendingAfter (unchanged, 但传入 energyStates)
for (const iv of pendingAfter) { ... applyIntervention(iv, charStates, queue, energyStates) }

// Snapshot stateAfter
results[results.length - 1].stateAfter = snapshotStates(energyStates, charStates, allCharacterIds)
```

注意：`expandAvTemplate` 返回的 av 类型 Intervention，调用 `applyIntervention` 时传 `energyStates` 也无害（函数内对非 energy 类型不做任何操作）。

### 5.2 `interventionPanel/InterventionEditPanel.tsx` — 添加能量类型

`TYPE_OPTIONS` 数组新增两项：

```typescript
{ label: tAv('Types.EnergyGain'), value: 'energy_gain' },
{ label: tAv('Types.EnergyLoss'), value: 'energy_loss' },
```

`isAvType` 判断不变（energy 类型有 `durationTurns` 且 = 0，与 av 类型行为一致）：

```typescript
const isAvType = formType === 'av_advance' || formType === 'av_delay'
    || formType === 'energy_gain' || formType === 'energy_loss'
```

同步在 `avVisualizerTab.yaml` 新增翻译键（`Types.EnergyGain` / `Types.EnergyLoss`）并跑 `npm run update-resources`。

### 5.3 `interventionPanel/CharacterStatePanel.tsx` — 能量显示

Props 新增：
```typescript
energy?: number   // undefined 表示该角色在当前 playhead 无行动数据
```

将占位文字替换为真实显示：
```typescript
const maxEnergy = getGameMetadata().characters[characterId as CharacterId]?.max_sp ?? 100

// 渲染
{energy !== undefined ? (
  <Text size='xs'>{energy.toFixed(0)} / {maxEnergy}</Text>
) : (
  <Text size='xs' c='dimmed'>—</Text>
)}
```

### 5.4 `AvVisualizerTab.tsx` — 传递能量快照

新增 `energyAtPlayhead` useMemo（见 D5），传给 CharacterStatePanel：

```tsx
if (ctx.kind === 'character-state') {
  return (
    <CharacterStatePanel
      characterId={ctx.characterId}
      characters={timelineCharacters}
      energy={energyAtPlayhead.get(ctx.characterId)}
    />
  )
}
```

---

## 测试场景（追加到 simulateBattle.test.ts）

| 场景 | 验收条件 |
|---|---|
| 角色初始能量 = max_sp × 50% | 第一个 BattleEvent 的 `stateBefore[id].energy` 等于 `max_sp * 0.5` |
| Sparkle 普攻回能 20（flat） | 行动后 `stateAfter[id].energy = stateBefore[id].energy + 20`（不超上限）|
| 藿藿普攻回能 20（flat）| 同上 |
| `energy_gain percent` 模板 | 能量变化 = maxEnergy × value% |
| 能量上限截断 | 初始满能时 energy_gain 后仍等于 maxEnergy |
| 能量下限截断 | energy_loss 超过当前能量时归零，不为负 |
| 手动添加的 energy_gain Intervention 生效 | 在指定 afterCharId 之后能量上升 |
| `stateBefore / stateAfter` 均为非空对象 | 所有角色的 id 均出现在快照中 |
| 无 BattleConfig 的角色不报错 | 引擎正常运行，能量快照中仍有该角色（初始值 = max_sp × 50%）|

---

## 文件清单

| 操作 | 文件 |
|---|---|
| 修改 | `types.ts`（`CharacterBattleConfig` 新增 `ultThreshold?` / `ultEnergyCost?`）|
| 修改 | `simulation/simulateBattle.ts` |
| 修改（追加测试） | `simulation/simulateBattle.test.ts` |
| 修改 | `interventionPanel/InterventionEditPanel.tsx` |
| 修改 | `interventionPanel/CharacterStatePanel.tsx` |
| 修改 | `AvVisualizerTab.tsx` |
| 修改 | `public/locales/en_US/avVisualizerTab.yaml` |

---

## 验收标准

- `tsc --noEmit` 无新增错误
- `simulateTimeline.test.ts` 41/41 仍全部通过
- `simulateBattle.test.ts` 新增能量场景全部通过
- 浏览器：选一个已配置 BattleConfig 的角色（如花火 `1306b1`），Playhead 停在其行动节点，点击头像，CharacterStatePanel 显示非零能量值，且随 Playhead 移动而变化
- 浏览器：在 InterventionEditPanel 可以选择 `energy_gain` 类型并成功添加；刷新后能量变化体现在 CharacterStatePanel
