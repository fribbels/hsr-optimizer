# Step 6 — 实现子任务清单

依赖关系：`6.1`（store）、`6.2`（i18n）、`6.4`（types）、`6.5`（引擎）相互独立，可同时进行。`6.3`（controller）依赖 `6.1` + `6.5`。`6.6`（测试）依赖 `6.5`。`6.7`（AddBranchPanel）依赖 `6.4`。`6.8`（UltCasterPanel）依赖 `6.2` + `6.4`。`6.9`（ActionMarker/TimelineRow）依赖 `6.2`（tooltip i18n）。`6.10`（AvVisualizerTab）依赖 `6.3` + `6.4` + `6.8`。`6.11`（ActionDisplayPanel）独立于其他 UI 任务。

---

## Task 6.1 — store 新增 `ultInsertions`

**文件**：`src/lib/tabs/tabAvVisualizer/useAVVisualTabStore.ts`

**改动**：

1. 头部 import 追加：
   ```typescript
   import type { ActionNodeOverride, Intervention, UltInsertion } from 'lib/tabs/tabAvVisualizer/types'
   ```

2. `AVVisualizerTabSavedSession` 追加字段：
   ```typescript
   ultInsertions: UltInsertion[]
   ```

3. `defaultState.savedSession` 追加：
   ```typescript
   ultInsertions: [],
   ```

4. `AVVisualTabStateActions` 追加三个方法签名：
   ```typescript
   addUltInsertion:    (insertion: UltInsertion) => void
   removeUltInsertion: (id: string) => void
   clearUltInsertions: () => void
   ```

5. store 实现体追加三个 action（在 `clearActionOverrides` 之后）：
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

**注意事项**：
- `UltInsertion` 所有字段均为 JSON 可序列化类型（`id: string`、`casterId: string`、`timing: object`、`targets?: string[]`），可直接持久化
- 旧存档无 `ultInsertions` 字段时，`persistenceService.ts` 的 merge 逻辑会用 `defaultState` 的 `[]` 补全，向后兼容

**验收标准**：
- `tsc --noEmit` 无新增错误
- `useAVVisualTabStore.getState().addUltInsertion({ id: 'x', casterId: 'y', timing: { type: 'after_action', charId: 'y', actionIndex: 0 } })` 后 `ultInsertions.length === 1`
- 再次调用 `removeUltInsertion('x')` 后 `ultInsertions.length === 0`

---

## Task 6.2 — i18n 新增大招相关翻译键

**文件**：`public/locales/en_US/avVisualizerTab.yaml`

**改动**：

1. `Marker:` 节点下现有 `ActionTooltip` / `InterventionTooltip` 之后追加：
   ```yaml
     UltTooltip: "{{name}} Ultimate  AV {{av}}"
   ```

2. `AddBranch:` 节点下将现有 `AddUltHint` 的值改为：
   ```yaml
     AddUltHint: Select next to a character's action to add an ultimate
   ```
   （原值「Available in Step 6」是开发占位文本，Step 6 完成后换为真实提示）

3. 在文件末尾（`TargetType:` 之后）新增 `UltCaster:` 节点：
   ```yaml
   UltCaster:
     Title: Insert Ultimate
     EnergyStatus: "{{energy}} / {{threshold}}"
     EnergyInsufficient: Insufficient energy
     NeedTarget: Select target
     Confirm: Insert
     NoAnchor: Select next to a character action first
   ```

**改动后执行**：
```bash
npm run update-resources
```

**验收标准**：
- 命令无报错
- `tsc --noEmit` 无新增错误
- `tAv('UltCaster.Title')` 不报 TypeScript 类型错误

---

## Task 6.3 — controller 新增 UltInsertion 方法 + 更新 simulate()

**文件**：`src/lib/tabs/tabAvVisualizer/avVisualTabController.ts`

**前置条件**：Task 6.1（store 类型）和 Task 6.5（`simulateBattle` 签名）均完成

**改动**：

1. 头部 import 追加：
   ```typescript
   import type { ActionNodeOverride, BattleEntity, BattleEvent, Intervention, UltInsertion } from 'lib/tabs/tabAvVisualizer/types'
   import { uuid } from 'lib/utils/miscUtils'
   ```

2. 在 `clearActionOverrides` 方法之后追加三个方法：
   ```typescript
   // ---- UltInsertion CRUD ----

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

3. 更新 `simulate()` 方法（传入 `ultInsertions`）：
   ```typescript
   simulate(entities: BattleEntity[], interventions: Intervention[], totalAv: number): BattleEvent[] {
     const { actionOverrides, ultInsertions } = useAVVisualTabStore.getState().savedSession
     return simulateBattle(entities, interventions, actionOverrides, ultInsertions, totalAv)
   },
   ```

**注意事项**：
- `addUltInsertion` 在 controller 层生成 `id`（用 `uuid()`），而不是在 store 层。与 `addIntervention` 的模式对称
- `simulate()` 调用侧（`AvVisualizerTab.tsx`）不需要改动，签名不变

**验收标准**：
- `tsc --noEmit` 无新增错误
- `AvVisualizerTab.tsx` 无需任何修改

---

## Task 6.4 — types.ts 新增 `ult-caster` RightPanelContext

**文件**：`src/lib/tabs/tabAvVisualizer/types.ts`

**改动**：

在 `RightPanelContext` 的 `character-state` variant 之后追加：
```typescript
| { kind: 'ult-caster'; timing: Extract<UltTiming, { type: 'after_action' | 'during_action' }> }
```

完整 `RightPanelContext` 类型变为：
```typescript
export type RightPanelContext =
  | { kind: 'idle' }
  | { kind: 'add-branch'; triggerAv: number; afterCharId?: string; afterActionIndex?: number; beforeCharId?: string; beforeActionIndex?: number }
  | { kind: 'intervention'; request: EditRequest }
  | { kind: 'action-config'; characterId: string; actionIndex: number }
  | { kind: 'character-state'; characterId: string }
  | { kind: 'ult-caster'; timing: Extract<UltTiming, { type: 'after_action' | 'during_action' }> }
```

**注意事项**：
- `at_av` 时机被排除在外；`UltTiming` 的 `at_av` variant 通过 `Extract` 过滤掉
- 此改动本身不影响任何现有代码（新 variant 只在新加的 `ult-caster` 分支里使用）

**验收标准**：
- `tsc --noEmit` 无新增错误

---

## Task 6.5 — simulateBattle.ts 引擎扩展

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.ts`

**前置条件**：无（可独立完成）

---

### 6.5-A import 和函数签名

头部 import 追加 `UltInsertion` 和 `UltTiming`：
```typescript
import type {
  ActionNodeOverride,
  BattleEntity,
  BattleEvent,
  CharacterBattleState,
  Intervention,
  InterventionTemplate,
  TargetType,
  TurnKind,
  UltInsertion,       // ← 新增
} from 'lib/tabs/tabAvVisualizer/types'
```

`simulateBattle` 函数签名新增第四个参数（`ultInsertions`）：
```typescript
export function simulateBattle(
  entities: BattleEntity[],
  interventions: Intervention[],
  actionOverrides: ActionNodeOverride[],
  ultInsertions: UltInsertion[],      // ← 新增
  totalAv: number,
): BattleEvent[]
```

---

### 6.5-B 初始化：分桶 UltInsertion

在 `energyStates` 初始化块之后（循环开始之前）追加：

```typescript
// Split ult insertions by timing type for efficient inline lookup
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
  // at_av: Step 6 skipped
}
```

---

### 6.5-C `processUlt` 内部函数

在 `snapshotStates` 函数之后、`simulateBattle` 主函数之前添加：

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
  if (!casterEnergy) return  // casterId not participating in this simulation

  const metadata = getGameMetadata().characters?.[ult.casterId as CharacterId]
  const maxSp    = metadata?.max_sp ?? 100
  const config   = getBattleConfig(ult.casterId)
  const threshold = config?.ultThreshold ?? maxSp
  const cost      = config?.ultEnergyCost ?? threshold

  if (casterEnergy.energy < threshold) return  // insufficient energy — silent skip

  const stateBefore = snapshotStates(energyStates, charStates, allCharacterIds)

  // Deduct energy before applying templates (mirrors in-game: ult is consumed then resolves)
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

---

### 6.5-D 主循环：插入 during_action 和 after_action 检查

在主循环中，`event = queue.shift()!` 之后、`const stateBefore = snapshotStates(...)` 之前插入 `during_action` 检查：

```typescript
const event = queue.shift()!
const state = charStates.get(event.characterId)!
const spd = computeEffectiveSpd(state)

const override = actionOverrides.find(
  (o) => o.characterId === event.characterId && o.actionIndex === event.actionIndex,
)

// Fire during_action ults BEFORE the normal action (ult events appear first in results at this AV)
const duringKey = `${event.characterId}:${event.actionIndex}`
for (const ult of (pendingUltDuringAction.get(duringKey) ?? [])) {
  processUlt(ult, event.av, charStates, energyStates, queue, allCharacterIds, results)
}
pendingUltDuringAction.delete(duringKey)

// Snapshot stateBefore for normal action (reflects state after during-ult energy deductions)
const stateBefore = snapshotStates(energyStates, charStates, allCharacterIds)
results.push({ ... })
```

在原来 `pendingAfter` 处理循环之后、`results[results.length - 1].stateAfter = snapshotStates(...)` 之前插入 `after_action` 检查：

```typescript
// Fire any manually-added "after" interventions for this action (existing code)
for (const iv of pendingAfter) {
  ...
  applyIntervention(iv, charStates, queue, energyStates)
}

// Fire after_action ults (ult events appear after the normal action in results at this AV)
const afterUltKey = `${event.characterId}:${event.actionIndex}`
for (const ult of (pendingUltAfterAction.get(afterUltKey) ?? [])) {
  processUlt(ult, event.av, charStates, energyStates, queue, allCharacterIds, results)
}
pendingUltAfterAction.delete(afterUltKey)

// stateAfter includes effects from both manual interventions and after-action ults
results[results.length - 1].stateAfter = snapshotStates(energyStates, charStates, allCharacterIds)
```

**注意事项**：
- `processUlt` 内 `expandAvTemplate` 传 `actionIndex: -1`，因为 ult 事件不在正常回合序列中
- `results[results.length - 1]` 指向普通行动的 BattleEvent（在 `processUlt` 内部已各自 push 了 ult BattleEvent），所以 stateAfter 赋值的目标仍然正确
- `pendingUltDuringAction.delete(key)` 和 `pendingUltAfterAction.delete(key)` 需在 for 循环**之后**调用，防止同一 key 在 loop 内被重复触发
- `during_action` ult 的 stateBefore（正常行动的）将反映 ult 能量扣除后的状态，这是正确行为

**验收标准**：
- `tsc --noEmit` 无新增错误
- `simulateTimeline.test.ts` 41/41 不回归（`simulateBattle.ts` 改动不影响 `simulateTimeline`）
- 不传入 `ultInsertions`（空数组）时行为与 Step 5 完全一致

---

## Task 6.6 — simulateBattle.test.ts 新增大招测试

**文件**：`src/lib/tabs/tabAvVisualizer/simulation/simulateBattle.test.ts`

**前置条件**：Task 6.5 完成

**改动**：在现有 `'energy tracking'` describe 块之后追加新的 describe 块：

```typescript
describe('simulateBattle — ult insertion', () => {
  beforeAll(() => {
    setGameMetadata({
      characters: {
        [SPARKLE_ID]: { max_sp: 110 },
        [HUOHUO_ID]:  { max_sp: 140 },
      },
    } as unknown as DBMetadata)
  })
```

覆盖以下场景：

| 场景 | 具体断言 |
|---|---|
| 能量充足 after_action ult → BattleEvent 出现 | results 中存在 `{ turnKind: 'ult', characterId: HUOHUO_ID }` |
| ult BattleEvent 位于触发行动之后 | `results.findIndex(ult) > results.findIndex(normalAction)` |
| during_action ult → 位于触发行动之前 | `results.findIndex(ult) < results.findIndex(normalAction)` |
| ult 扣除能量 | `ultEvent.stateBefore[id].energy >= threshold`；`ultEvent.stateAfter[id].energy === stateBefore - cost` |
| Huohuo ult all_allies +20% 能量 | 所有角色 `stateAfter.energy` 上涨 ≈ `maxEnergy × 0.2`（capped） |
| 能量不足时静默跳过 | results 中无 `turnKind: 'ult'` BattleEvent |
| 云璃模型（threshold=120, cost=120, maxEnergy=240）| 手动设置 metadata max_sp=240；`ultThreshold: 120, ultEnergyCost: 120` 在配置中；energy=240 时插入两次 ult → 两次均成功，最终 energy=0 |
| 无 BattleConfig 角色的 ult 静默跳过 | 不报错，results 不含 ult event |

**注意事项**：
- 云璃模型测试需要在 `beforeAll` 中给测试用角色设置 `max_sp: 240`，并在 BattleEntity 中使用该 id。由于不需要实际 BattleConfig，可以通过手动 Intervention 将能量提升到 240，然后插入两次 UltInsertion（用一个临时 mock config 或直接构造 `UltInsertion` 并设置 threshold/cost）
- 更实用的做法：直接用 Huohuo 测试（max_sp=140，threshold默认=140，cost=140）；云璃机制可以用一个人工设置 `{ max_sp: 240 }` 的匿名 id 来测

---

## Task 6.7 — AddBranchPanel.tsx 解锁「Add Ult」

**文件**：`src/lib/tabs/tabAvVisualizer/interventionPanel/AddBranchPanel.tsx`

**前置条件**：Task 6.4（`ult-caster` 类型存在于 `RightPanelContext`）

**改动**：

1. 在 import 中追加 `UltTiming` 类型：
   ```typescript
   import type { RightPanelContext, UltTiming } from 'lib/tabs/tabAvVisualizer/types'
   ```

2. 在 `handleAddIntervention` 之后追加：
   ```typescript
   function handleAddUlt() {
     const { afterCharId, afterActionIndex, beforeCharId, beforeActionIndex } = context
     let timing: Extract<UltTiming, { type: 'after_action' | 'during_action' }> | null = null
     if (afterCharId !== undefined) {
       timing = { type: 'after_action', charId: afterCharId, actionIndex: afterActionIndex ?? 0 }
     } else if (beforeCharId !== undefined) {
       timing = { type: 'during_action', charId: beforeCharId, actionIndex: beforeActionIndex ?? 0 }
     }
     if (!timing) return
     onContextChange({ kind: 'ult-caster', timing })
   }
   ```

3. 将「Add Ult」按钮从 disabled 改为动态 disabled + 新 onClick：
   ```typescript
   const canAddUlt = context.afterCharId !== undefined || context.beforeCharId !== undefined
   ```
   ```tsx
   <Tooltip
     label={tAv(canAddUlt ? 'AddBranch.AddUltHint' : 'UltCaster.NoAnchor')}
     position='bottom'
   >
     <Button
       variant='default'
       leftSection={<IconBolt size={14} />}
       disabled={!canAddUlt}
       style={{ pointerEvents: 'auto' }}
       onClick={handleAddUlt}
     >
       {tAv('AddBranch.AddUlt')}
     </Button>
   </Tooltip>
   ```

**注意事项**：
- `AddBranch.AddUltHint` 已在 Task 6.2 中改为真实提示文本
- Tooltip 的 `disabled` 按钮需保留 `style={{ pointerEvents: 'auto' }}`（已有）

**验收标准**：
- `tsc --noEmit` 无新增错误
- 从行动节点旁的「+」进入 AddBranchPanel 时「Add Ult」可点击
- 从空白处进入（flat context）「Add Ult」置灰并显示 Tooltip

---

## Task 6.8 — 新建 UltCasterPanel.tsx

**文件**：`src/lib/tabs/tabAvVisualizer/interventionPanel/UltCasterPanel.tsx`（新建）

**前置条件**：Task 6.2（i18n keys）、Task 6.4（`ult-caster` 类型）

**完整实现**：

```typescript
import { Button, Select, Text } from '@mantine/core'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import { ActionOrderAvatar } from 'lib/tabs/tabAvVisualizer/interventionPanel/ActionOrderAvatar'
import type { BattleEntity, UltTiming } from 'lib/tabs/tabAvVisualizer/types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CharacterId } from 'types/character'

type UltCasterPanelProps = {
  timing: Extract<UltTiming, { type: 'after_action' | 'during_action' }>
  characters: BattleEntity[]
  energyAtPlayhead: Map<string, number>
  onDone: () => void
}

export function UltCasterPanel({ timing, characters, energyAtPlayhead, onDone }: UltCasterPanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const [selectedCasterId, setSelectedCasterId] = useState<string | null>(null)
  const [selectedTarget, setSelectedTarget] = useState<string | null>(null)

  const casterInfo = characters.map((char) => {
    const maxSp     = getGameMetadata().characters?.[char.id as CharacterId]?.max_sp ?? 100
    const config    = getBattleConfig(char.id)
    const threshold = config?.ultThreshold ?? maxSp
    const energy    = energyAtPlayhead.get(char.id) ?? maxSp * 0.5
    const canCast   = energy >= threshold
    const needTarget = config?.abilities.ult.some((t) => t.targets === 'single_ally') ?? false
    return { char, maxSp, threshold, energy, canCast, needTarget }
  })

  const selected = casterInfo.find((c) => c.char.id === selectedCasterId)
  const availableTargets = selected
    ? characters.filter((c) => c.id !== selectedCasterId)
    : []

  function handleInsert() {
    if (!selectedCasterId) return
    AvVisualTabController.addUltInsertion({
      casterId: selectedCasterId,
      timing,
      targets: selected?.needTarget && selectedTarget ? [selectedTarget] : undefined,
    })
    onDone()
  }

  const insertDisabled = !selectedCasterId
    || (selected?.needTarget && !selectedTarget)

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', gap: 12, padding: 4 }}>
      <Text size='xs' fw={600} c='dimmed'>{tAv('UltCaster.Title')}</Text>

      {/* Character grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
        {casterInfo.map(({ char, energy, threshold, canCast }) => {
          const isSelected = selectedCasterId === char.id
          return (
            <div
              key={char.id}
              onClick={() => canCast ? setSelectedCasterId(char.id) : undefined}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                padding: '8px 4px', borderRadius: 6, cursor: canCast ? 'pointer' : 'default',
                opacity: canCast ? 1 : 0.4,
                border: `1.5px solid ${isSelected ? char.color : 'var(--mantine-color-dark-4)'}`,
                background: isSelected ? `${char.color}1a` : 'transparent',
              }}
            >
              <ActionOrderAvatar characterId={char.id} characterName={char.name} color={char.color} size={32} />
              <Text size='xs' style={{ color: char.color, fontWeight: 600 }}>{char.name}</Text>
              <Text size='xs' c={canCast ? 'dimmed' : 'red'}>
                {canCast
                  ? tAv('UltCaster.EnergyStatus', { energy: energy.toFixed(0), threshold })
                  : tAv('UltCaster.EnergyInsufficient')}
              </Text>
            </div>
          )
        })}
      </div>

      {/* Target selector (only when selected caster's ult needs a single_ally target) */}
      {selected?.needTarget && (
        <Select
          label={tAv('UltCaster.NeedTarget')}
          size='xs'
          placeholder='—'
          clearable
          value={selectedTarget}
          data={availableTargets.map((c) => ({ value: c.id, label: c.name }))}
          onChange={setSelectedTarget}
        />
      )}

      <div style={{ marginTop: 'auto' }}>
        <Button size='xs' fullWidth disabled={!!insertDisabled} onClick={handleInsert}>
          {tAv('UltCaster.Confirm')}
        </Button>
      </div>
    </div>
  )
}
```

**注意事项**：
- `energyAtPlayhead` 来自 `AvVisualizerTab` 的 Step 5 产物，无需在此 memo 计算
- 能量不足的角色 `onClick` 为 `undefined`（不是 `disabled` prop），这样不会意外拦截 pointer events
- `insertDisabled` 用 `!!` 将 `string | null | boolean | undefined` 统一转为 `boolean`

---

## Task 6.9 — ActionMarker.tsx + TimelineRow.tsx 大招视觉

**文件**：
- `src/lib/tabs/tabAvVisualizer/timeline/ActionMarker.tsx`
- `src/lib/tabs/tabAvVisualizer/timeline/TimelineRow.tsx`

**前置条件**：Task 6.2（`Marker.UltTooltip` i18n 键）

---

### 6.9-A ActionMarker.tsx

1. import 追加：
   ```typescript
   import { IconBolt } from '@tabler/icons-react'
   import type { TurnKind } from 'lib/tabs/tabAvVisualizer/types'
   import { TIMELINE_AVATAR_SIZE } from 'lib/tabs/tabAvVisualizer/constants'
   ```

2. `ActionMarkerProps` 追加：
   ```typescript
   turnKind: TurnKind
   ```

3. 函数解构追加 `turnKind`：
   ```typescript
   export function ActionMarker({ av, spd, color, characterName, characterId, leftPercent, stackLevel, actionCount, turnKind, onMarkerClick }: ActionMarkerProps) {
   ```

4. 在 avatar `<div>` 渲染部分（`{/* Avatar */}` 注释之后），在现有 `imgError ? ... : <img>` 之前添加 ult 分支：

   将原来：
   ```typescript
   {/* Avatar */}
   <div style={{ position: 'absolute', top: avatarTop, left: '50%', transform: 'translateX(-50%)' }}>
     {imgError ? (...) : (<img ... />)}
   </div>
   ```
   改为：
   ```typescript
   {/* Avatar / Ult icon */}
   <div style={{ position: 'absolute', top: avatarTop, left: '50%', transform: 'translateX(-50%)' }}>
     {turnKind === 'ult' ? (
       <div style={{
         width: TIMELINE_AVATAR_SIZE,
         height: TIMELINE_AVATAR_SIZE,
         borderRadius: '50%',
         border: `2px solid gold`,
         backgroundColor: `${color}33`,
         display: 'flex',
         alignItems: 'center',
         justifyContent: 'center',
       }}>
         <IconBolt size={Math.round(TIMELINE_AVATAR_SIZE * 0.55)} color='gold' />
       </div>
     ) : imgError ? (
       <div style={{ ... }}>  {/* 保持原有 imgError fallback 不变 */}
         {characterName.charAt(0)}
       </div>
     ) : (
       <img ... />  {/* 保持原有 img 不变 */}
     )}
   </div>
   ```

5. Tooltip `label` 根据 `turnKind` 选择：
   ```typescript
   label={turnKind === 'ult'
     ? tAv('Marker.UltTooltip', { name: characterName, av: av.toFixed(2) })
     : tAv('Marker.ActionTooltip', { name: characterName, spd: spd.toFixed(1), av: av.toFixed(2) })}
   ```

6. `{/* Multi-action badge */}` 区块添加 `turnKind !== 'ult'` 守卫（ult 节点始终是单个事件，不显示角标）：
   ```typescript
   {turnKind !== 'ult' && actionCount !== undefined && actionCount > 1 && (
     <div ...>{actionCount}</div>
   )}
   ```

---

### 6.9-B TimelineRow.tsx

1. **修复 markers 分组 key**（当前 key 会把同 AV 的 ult 和 normal 合并）：

   将（第 115 行左右）：
   ```typescript
   const key = `${event.characterId}:${event.av}`
   ```
   改为：
   ```typescript
   const key = `${event.characterId}:${event.av}:${event.turnKind}`
   ```

2. **ActionMarker 渲染处传入 `turnKind`**（第 273-286 行左右）：
   ```tsx
   <ActionMarker
     key={`${m.event.characterId}:${m.event.av}:${m.event.turnKind}`}
     av={m.event.av}
     spd={m.event.effectiveSpd}
     color={m.event.color}
     characterName={m.event.characterName}
     characterId={m.event.characterId}
     leftPercent={m.event.leftPercent}
     stackLevel={m.event.slotIndex}
     actionCount={m.actionCount}
     turnKind={m.event.turnKind}           {/* ← 新增 */}
     onMarkerClick={onSeek}
   />
   ```
   注：`m.event.characterId` 等字段现在来自 `m.event`（已经是 `EnrichedSimEvent & { leftPercent }`），`key` 也同步更新。

**注意事项**：
- `EnrichedSimEvent` 已经包含 `turnKind`（继承自 `BattleEvent`），`TimelineRow` 无需额外类型改动
- ult 节点的 `actionCount` 在分组后始终为 1（因为 key 包含 `turnKind`），多角标守卫逻辑对 ult 无影响，但仍建议加上 `turnKind !== 'ult'` 守卫语义更明确

---

## Task 6.10 — AvVisualizerTab.tsx 接入 UltCasterPanel

**文件**：`src/lib/tabs/tabAvVisualizer/AvVisualizerTab.tsx`

**前置条件**：Task 6.3（controller simulate 更新）、Task 6.4（types）、Task 6.8（UltCasterPanel 组件）

**改动**：

1. import 追加：
   ```typescript
   import { UltCasterPanel } from 'lib/tabs/tabAvVisualizer/interventionPanel/UltCasterPanel'
   ```

2. 在 `renderRightPanel` 中，`character-state` 分支之后追加：
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

**注意事项**：
- `energyAtPlayhead` 已在 Step 5 中作为 `useMemo` 存在，直接传入，无需重复计算
- `simulate()` 调用链（`AvVisualTabController.simulate()`）已在 Task 6.3 中更新，`AvVisualizerTab.tsx` 本身的 `simEvents` 计算不需要改动

**验收标准**：
- `tsc --noEmit` 无新增错误
- 点击「Add Ult」后右侧面板渲染 UltCasterPanel

---

## Task 6.11 — ActionDisplayPanel.tsx 大招事件显示

**文件**：`src/lib/tabs/tabAvVisualizer/interventionPanel/ActionDisplayPanel.tsx`

**前置条件**：Task 6.5（引擎产生 `turnKind: 'ult'` BattleEvent）

**改动**：

在 `renderList` 函数的 `actionsAtAv.map((ev) => ...)` 内部，在每个 ev 的 Fragment 开头添加 ult 分支：

```typescript
return (
  <Fragment key={`${ev.turnKind}:${ev.characterId}:${ev.actionIndex}:${ev.av}`}>
    {ev.turnKind === 'ult' ? (
      /* Ult events: simplified card, no behavior row, no + buttons */
      <div style={{
        border: `1px solid gold`,
        borderRadius: 6, padding: '6px 8px',
        display: 'flex', flexDirection: 'column', gap: 4,
      }}>
        <div
          onClick={() => onContextChange({ kind: 'character-state', characterId: ev.characterId })}
          style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}
        >
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'gold', flexShrink: 0 }} />
          <Text size='xs' fw={700} style={{ color: ev.color }}>⚡ {ev.characterName}</Text>
        </div>
      </div>
    ) : (
      /* existing normal-action rendering */
      <div style={{ border: `1px solid ${isCharActive ? ...}`, ... }}>
        ...
      </div>
    )}
    {/* after-zone add button: skip for ult events */}
    {ev.turnKind !== 'ult' && (
      <div style={{ paddingLeft: 8, paddingRight: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {afterIvs.map(renderItem)}
        {renderAddButton(...)}
      </div>
    )}
  </Fragment>
)
```

**注意事项**：
- Fragment key 更新为包含 `turnKind` 和 `av`，避免 ult 和 normal 事件在同一 AV 时 key 冲突（`actionIndex` 对 ult 为 -1，对 normal 为 ≥ 0）
- `isCharActive` 对 ult 事件不适用（`activeActionConfig` 基于 `actionIndex >= 0`），不需要特殊处理（isCharActive 会是 false）
- ult 事件 Fragment 下方不渲染 afterIvs / renderAddButton，避免错误地在大招后挂 intervention

---

## 整体验收标准

- `tsc --noEmit` 无新增错误
- `simulateTimeline.test.ts` 41/41 不回归
- `simulateBattle.test.ts` 新增大招场景全部通过
- 浏览器：
  1. 将藿藿加入队伍（SPD=134，max_sp=140，初始 energy=70）
  2. 手动添加 `energy_gain` Intervention（flat 70，target 藿藿，after 其首次行动）使其达到满能
  3. 移动 Playhead 到该行动节点后，点击「+」→「Add Ult」→ UltCasterPanel 显示藿藿可施放（70 / 140 变为 140 / 140）
  4. 点击藿藿 → 点击「Insert」→ Timeline 出现金色 ⚡ 节点，ActionDisplayPanel 显示「⚡ Huohuo」卡片
  5. CharacterStatePanel 中各角色能量上涨（Huohuo ult all_allies +20%）
  6. 点击「⚡ Huohuo」卡片 → 打开 CharacterStatePanel
  7. 能量不足的角色在 UltCasterPanel 中置灰，无法选中
