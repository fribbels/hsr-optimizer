# Step 5 — 实现子任务清单

依赖关系：`5.1`（types）、`5.2`（i18n）、`5.3`（引擎）三者相互独立，可同时进行。`5.4`（测试）依赖 `5.3`。`5.5`（表单）依赖 `5.2`。`5.6`（UI）依赖 `5.3`。每个子任务结束后应能编译通过。

---

## Task 5.1 — types.ts 新增 `ultThreshold?` / `ultEnergyCost?`

**文件**：`src/lib/tabs/tabAvVisualizer/types.ts`

**改动**：

1. 在 `CharacterBattleConfig`（第 140 行）的现有字段末尾、`abilities` 之前追加：
   ```typescript
   ultThreshold?: number   // 触发大招所需的最低能量，默认等于 max_sp
   ultEnergyCost?: number  // 每次释放扣除的能量，默认等于 ultThreshold；低于 max_sp 时支持部分保留能量
   ```

2. 将 `UltInsertion`（第 187 行）的注释从：
   ```typescript
   // The engine validates caster energy >= max_sp before producing a BattleEvent.
   ```
   改为：
   ```typescript
   // The engine validates caster energy >= ultThreshold (or max_sp if omitted) before producing a BattleEvent.
   ```

**注意事项**：
- 字段为可选，不改变现有 `battleConfigs/` 下的任何文件，向后兼容
- 不在此步骤实现任何读取这两个字段的逻辑，逻辑在 Step 6

**验收标准**：
- `tsc --noEmit` 无新增错误
- `CharacterBattleConfig` 类型可以携带 `ultThreshold: 120, ultEnergyCost: 120` 而不报错

---

## Task 5.2 — i18n 新增 energy 类型翻译键

**文件**：`public/locales/en_US/avVisualizerTab.yaml`

**改动**：

在 `Types:` 节点下现有 4 行之后追加：
```yaml
    EnergyGain: Energy Gain
    EnergyLoss: Energy Loss
```

**改动后执行**：
```bash
npm run update-resources
```

**验收标准**：
- `npm run update-resources` 无报错
- `tsc --noEmit` 无新增错误
- 在任意文件中写 `tAv('Types.EnergyGain')` 时 TypeScript 不报错

---

## Task 5.3 — simulateBattle.ts 引擎扩展

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.ts`

这是本步骤改动最多的任务，分六个小节。

---

### 5.3-A 新增 import + 内部类型

在文件头部现有 import 之后追加：
```typescript
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { CharacterId } from 'types/character'
```

在 `type QueueEntry = { ... }` 之后追加新的内部类型：
```typescript
type EnergyState = { energy: number; maxEnergy: number }
```

---

### 5.3-B 扩展 `applyIntervention` 接受 `energyStates`

将函数签名（第 50-54 行）改为：
```typescript
function applyIntervention(
  iv: Intervention,
  charStates: Map<string, CharState>,
  queue: QueueEntry[],
  energyStates?: Map<string, EnergyState>,
): void {
```

在现有 `else {` 分支（处理 av_advance/av_delay，第 89 行）之前，插入 energy 分支：

```typescript
    } else if (iv.type === 'energy_gain' || iv.type === 'energy_loss') {
      const energyTarget = energyStates?.get(targetId)
      if (!energyTarget) continue
      const delta = iv.unit === 'percent'
        ? energyTarget.maxEnergy * (iv.value / 100)
        : iv.value
      energyTarget.energy = iv.type === 'energy_gain'
        ? Math.min(energyTarget.maxEnergy, energyTarget.energy + delta)
        : Math.max(0, energyTarget.energy - delta)
```

即完整的 `else if / else if / else` 结构变为：
```
if (iv.type === 'spd_up' || iv.type === 'spd_down') { ... }
else if (iv.type === 'energy_gain' || iv.type === 'energy_loss') { ... }  ← 新增
else { /* av_advance / av_delay */ ... }
```

**注意**：能量修改直接 mutate `energyTarget`（Map 中的对象引用），不需要 `sortQueue`，也不需要在 energy 分支末尾调用 `sortQueue`。`sortQueue` 的调用保留在函数最末。

---

### 5.3-C 新增 `expandEnergyTemplate` + `snapshotStates`

在现有 `expandAvTemplate` 函数（第 129 行）之后追加：

```typescript
function expandEnergyTemplate(
  template: InterventionTemplate,
  triggerAv: number,
  resolvedTargets: string[],
): Intervention | null {
  if (template.type !== 'energy_gain' && template.type !== 'energy_loss') return null
  if (resolvedTargets.length === 0) return null
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets: resolvedTargets,
    value: template.value,
    unit: template.unit,
    durationTurns: 0,
  }
}

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

---

### 5.3-D 能量状态初始化（主函数循环前）

在 `simulateBattle` 函数内，`charStates` Map 构建之后（第 167 行之后）追加：

```typescript
const energyStates = new Map<string, EnergyState>()
for (const char of characters) {
  const maxEnergy = getGameMetadata().characters[char.id as CharacterId]?.max_sp ?? 100
  energyStates.set(char.id, { energy: maxEnergy * 0.5, maxEnergy })
}
```

---

### 5.3-E 更新所有 `applyIntervention` 调用点

文件中共有 3 处现有 `applyIntervention` 调用，全部追加第四个参数 `energyStates`：

| 位置 | 原调用 | 改为 |
|---|---|---|
| 第 191 行（pendingGlobalBefore）| `applyIntervention(pendingGlobalBefore[beforeIdx], charStates, queue)` | `applyIntervention(pendingGlobalBefore[beforeIdx], charStates, queue, energyStates)` |
| 第 203 行（charBeforeMatch）| `applyIntervention(charBeforeMatch, charStates, queue)` | `applyIntervention(charBeforeMatch, charStates, queue, energyStates)` |
| 第 248 行（expandAvTemplate 结果）| `if (iv) applyIntervention(iv, charStates, queue)` | `if (iv) applyIntervention(iv, charStates, queue, energyStates)` |

---

### 5.3-F 重构主循环（快照 + 模板展开）

替换主循环中从 `results.push` 到末尾（第 217-258 行）的代码段，新版如下：

```typescript
    // Snapshot stateBefore: taken before re-enqueue and template effects, so it reflects
    // each character's state at the exact moment this action starts.
    const stateBefore = snapshotStates(energyStates, charStates, allCharacterIds)

    results.push({
      av: event.av,
      characterId: event.characterId,
      actionIndex: event.actionIndex,
      effectiveSpd: spd,
      turnKind: 'normal' as TurnKind,
      actionChoice: override?.choice ?? 'basic',
      stateBefore,
      stateAfter: {},  // filled after template expansion below
      teamStateBefore: { sp: 0, spMax: 5 },
      teamStateAfter: { sp: 0, spMax: 5 },
    })

    const nextAv = event.av + 10000 / spd

    state.spdBuffs = state.spdBuffs
      .map((b) => ({ ...b, remainingTurns: b.remainingTurns - 1 }))
      .filter((b) => b.remainingTurns > 0)

    queue.push({ av: nextAv, characterId: event.characterId, actionIndex: event.actionIndex + 1 })
    sortQueue(queue)

    // Always expand templates for effectiveChoice (basic when no override).
    // AV templates only fired if there's a config; energy templates always fire.
    const effectiveChoice = override?.choice ?? 'basic'
    const config = getBattleConfig(event.characterId)
    const templates: InterventionTemplate[] = config?.abilities[effectiveChoice] ?? []
    for (const template of templates) {
      const resolvedTargets = resolveTargets(
        template.targets, event.characterId, allCharacterIds, override?.targets,
      )
      const avIv = expandAvTemplate(template, event.av, event.characterId, event.actionIndex, resolvedTargets)
      if (avIv) applyIntervention(avIv, charStates, queue, energyStates)

      const energyIv = expandEnergyTemplate(template, event.av, resolvedTargets)
      if (energyIv) applyIntervention(energyIv, charStates, queue, energyStates)
    }

    // Fire any manually-added "after" interventions for this action
    for (const iv of pendingAfter) {
      const targetIdx = iv.afterActionIndex ?? 0
      if (iv.afterCharId === event.characterId && iv.triggerAv === event.av && targetIdx === event.actionIndex) {
        applyIntervention(iv, charStates, queue, energyStates)
      }
    }

    // Snapshot stateAfter: all template and manual-intervention effects have been applied.
    results[results.length - 1].stateAfter = snapshotStates(energyStates, charStates, allCharacterIds)
```

**注意事项**：
- `snapshotStates` 中的 `computeEffectiveSpd` 在 `stateBefore` 时用旧 `spdBuffs`（tick 之前），在 `stateAfter` 时用新 `spdBuffs`（tick 之后），行为正确
- `expandEnergyTemplate` 对非 energy 类型返回 `null`，与 `expandAvTemplate` 对非 av 类型返回 `null` 对称，两者互不干扰
- `stateAfter` 直接 mutate `results[results.length - 1]`；由于同一次循环内没有其他地方读取 `stateAfter`，不存在竞态

**验收标准**：
- `tsc --noEmit` 无新增错误
- `simulateTimeline.test.ts` 41/41 全部通过（`simulateBattle.ts` 的改动不影响 `simulateTimeline`）
- 第一个 BattleEvent 的 `stateBefore` 不为空对象，所有角色的 id 均出现在快照中

---

## Task 5.4 — simulateBattle.test.ts 新增能量测试

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.test.ts`

**前置条件**：Task 5.3 完成

**改动**：在现有测试文件末尾追加一个 `describe('energy tracking', ...)` 块，覆盖以下场景：

| 场景 | 具体写法 |
|---|---|
| 初始能量 = max_sp × 50% | 跑一个 Sparkle 单人队列（需要实际 max_sp），第一个事件 `stateBefore[SPARKLE_ID].energy === max_sp * 0.5` |
| 普攻回能（flat）| 花火第一次行动后 `stateAfter[id].energy === stateBefore[id].energy + X`（X 来自 Sparkle BattleConfig basic 的 energy_gain 值）|
| 藿藿普攻回能 | 同上，用 `HUOHUO_ID = '1217b1'` |
| percent 单位 | 手写一个包含 `energy_gain percent` 模板的 mock，验证 `delta === maxEnergy * value / 100` |
| 上限截断 | 初始 `energy = maxEnergy` 时再 energy_gain → 仍等于 maxEnergy |
| 下限截断 | `energy_loss` 超过当前能量 → energy === 0，不为负 |
| 手动 energy_gain Intervention 生效 | 添加 afterCharId Intervention，行动后 energy 上升 |
| stateAfter 非空 | 所有事件的 stateAfter 均包含所有角色 id |
| 无 BattleConfig 角色不报错 | 临时构造 id 不在 battleConfigs 中的 BattleEntity，引擎正常返回，stateBefore 中仍有该角色的能量条目 |

**注意事项**：
- 花火 Sparkle 的 BattleConfig 中 `basic` 的 `energy_gain` 值需要先读 `Sparkle.ts` 确认具体数值，测试中 hardcode 该值（不要动态读取 BattleConfig）
- `max_sp` 来自 `getGameMetadata()`，在 `beforeAll` 或测试内调用一次后 hardcode

---

## Task 5.5 — InterventionEditPanel.tsx 添加能量类型

**文件**：`src/lib/tabs/tabAvVisualizer/interventionPanel/InterventionEditPanel.tsx`

**前置条件**：Task 5.2 完成（i18n 键已存在）

**改动**：

1. `TYPE_OPTIONS` 数组追加两项（第 22 行之后）：
   ```typescript
   { label: tAv('Types.EnergyGain'), value: 'energy_gain' },
   { label: tAv('Types.EnergyLoss'), value: 'energy_loss' },
   ```

2. 将 `isAvType` 变量（第 69 行）重命名为 `isInstantType` 并扩展：
   ```typescript
   const isInstantType = formType === 'av_advance' || formType === 'av_delay'
     || formType === 'energy_gain' || formType === 'energy_loss'
   ```
   同步将文件中所有 `isAvType` 引用替换为 `isInstantType`（共 3 处：定义处 + `handleSubmit` + JSX 条件）

3. `handleTypeChange` 内的局部变量同步改名和扩展（第 73-74 行）：
   ```typescript
   const nowInstantType = newType === 'av_advance' || newType === 'av_delay'
     || newType === 'energy_gain' || newType === 'energy_loss'
   if (nowInstantType) setFormDuration(0)
   else if (formDuration === 0) setFormDuration(1)
   ```

**注意事项**：
- `SegmentedControl` 的 `data` 数组从 4 项增至 6 项，`fullWidth` + `size='xs'` 下宽度可能偏窄；如果视觉上过于拥挤，可改用 `Select` 组件替换 `SegmentedControl`，这是 UI 判断，不影响功能
- energy 类型的 `durationTurns` 在提交时会被 `isInstantType ? 0 : formDuration` 强制为 0，行为与 av 类型一致

**验收标准**：
- `tsc --noEmit` 无新增错误
- 表单中可以选择 `Energy Gain` / `Energy Loss`，选中后 Duration 字段隐藏
- 提交后 Intervention 持久化到 store，type 值为 `'energy_gain'` 或 `'energy_loss'`

---

## Task 5.6 — CharacterStatePanel + AvVisualizerTab 能量显示

**文件**：
- `src/lib/tabs/tabAvVisualizer/interventionPanel/CharacterStatePanel.tsx`
- `src/lib/tabs/tabAvVisualizer/AvVisualizerTab.tsx`

**前置条件**：Task 5.3 完成（`stateBefore.energy` 有真实数值）

---

### 5.6-A CharacterStatePanel.tsx

**新增 import**：
```typescript
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { CharacterId } from 'types/character'
```

**新增 prop**：
```typescript
type CharacterStatePanelProps = {
  characterId: string
  characters: BattleEntity[]
  energy?: number   // undefined = no BattleEvent at or before playhead for this character
}
```

**替换占位内容**（原第 41-45 行）：

原来：
```typescript
      {/* Energy — placeholder until Step 5 */}
      <Stack gap={4}>
        <Text size='xs' fw={600} c='dimmed'>Energy</Text>
        <Text size='xs' c='dimmed'>{tAv('CharacterState.EnergyPlaceholder')}</Text>
      </Stack>
```

改为：
```typescript
      {/* Energy */}
      <Stack gap={4}>
        <Text size='xs' fw={600} c='dimmed'>Energy</Text>
        {energy !== undefined ? (() => {
          const maxEnergy = getGameMetadata().characters[characterId as CharacterId]?.max_sp ?? 100
          return <Text size='xs'>{energy.toFixed(0)} / {maxEnergy}</Text>
        })() : (
          <Text size='xs' c='dimmed'>—</Text>
        )}
      </Stack>
```

**注意**：`getGameMetadata()` 是同步调用，不需要 memo，直接在渲染函数中调用即可。只在 `energy !== undefined` 时才读，避免无意义的元数据查询。

---

### 5.6-B AvVisualizerTab.tsx

**新增 `energyAtPlayhead` useMemo**（在 `simEvents` useMemo 之后追加）：
```typescript
const energyAtPlayhead = useMemo(() => {
  const map = new Map<string, number>()
  for (const event of simEvents) {
    if (event.av > playheadAv + 0.005) break  // simEvents is sorted by av ascending
    const state = event.stateBefore[event.characterId]
    if (state !== undefined) map.set(event.characterId, state.energy)
  }
  return map
}, [simEvents, playheadAv])
```

**更新 `renderRightPanel` 中 `character-state` 分支**（第 142-149 行）：
```typescript
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

**注意事项**：
- `energyAtPlayhead` 用 `stateBefore[event.characterId]`（不是 stateAfter）——反映角色"在这一刻行动之前"的能量，更直观
- 循环 `break` 的条件 `event.av > playheadAv + 0.005` 利用了 `simEvents` 已按 av 升序的特性，O(n) 一次遍历
- `energyAtPlayhead.get(characterId)` 对首次行动前没有出现过的角色返回 `undefined`，CharacterStatePanel 会显示 `—`

**验收标准**：
- `tsc --noEmit` 无新增错误
- 浏览器：选一个配置了 BattleConfig 的角色（如花火 `1306b1`），Playhead 停在其第一个行动节点，点击头像，CharacterStatePanel 能量区显示 `X / 120`（X 为 max_sp × 50%）
- Playhead 向右移动若干行动后，能量数值随能量回复模板单调递增（直至 max_sp 上限）
- 没有出现过的角色（Playhead 在其首次行动之前）显示 `—`

---

## 整体验收标准

- `tsc --noEmit` 无新增错误
- `simulateTimeline.test.ts` 原有用例全部通过（不能回归）
- `simulateBattle.test.ts` 新增能量场景全部通过
- 浏览器：在 InterventionEditPanel 选 `Energy Gain`，添加给某角色；Playhead 移到该时间点后点击头像，CharacterStatePanel 显示能量上涨
- 浏览器：能量不会超过 `max_sp`（上限截断），不会低于 0（下限截断）
