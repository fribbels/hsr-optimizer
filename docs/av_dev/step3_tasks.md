# Step 3 — 实现子任务清单

依赖关系：`3.1`（store）和 `3.3`（引擎）相互独立，可同时进行；`3.2`（controller）依赖两者；`3.4`（测试）依赖 `3.3`。每个子任务结束后应能编译通过。

---

## Task 3.1 — store 新增 `actionOverrides`

**文件**：`useAVVisualTabStore.ts`

**改动**：

1. 头部追加 import：
   ```typescript
   import type { ActionNodeOverride, Intervention } from 'lib/tabs/tabAvVisualizer/types'
   ```

2. `AVVisualizerTabSavedSession` 追加字段：
   ```typescript
   actionOverrides: ActionNodeOverride[]
   ```

3. `defaultState.savedSession` 追加：
   ```typescript
   actionOverrides: [],
   ```

4. `AVVisualTabStateActions` 追加方法签名：
   ```typescript
   setActionOverride:    (override: ActionNodeOverride) => void
   removeActionOverride: (characterId: string, actionIndex: number) => void
   clearActionOverrides: () => void
   ```

5. store 实现体追加三个 action：
   ```typescript
   setActionOverride: (override) => set((s) => {
     const list = s.savedSession.actionOverrides
     const idx = list.findIndex(
       (o) => o.characterId === override.characterId && o.actionIndex === override.actionIndex
     )
     const next = idx >= 0
       ? list.map((o, i) => (i === idx ? override : o))
       : [...list, override]
     return { savedSession: { ...s.savedSession, actionOverrides: next } }
   }),

   removeActionOverride: (characterId, actionIndex) => set((s) => ({
     savedSession: {
       ...s.savedSession,
       actionOverrides: s.savedSession.actionOverrides.filter(
         (o) => !(o.characterId === characterId && o.actionIndex === actionIndex)
       ),
     },
   })),

   clearActionOverrides: () => set((s) => ({
     savedSession: { ...s.savedSession, actionOverrides: [] },
   })),
   ```

**注意事项**：
- `ActionNodeOverride` 所有字段均为 JSON 可序列化类型（无函数），可直接持久化
- 旧存档（无 `actionOverrides` 字段）加载时，`persistenceService.ts` 的合并逻辑与 `defaultState` 的 `[]` 一起确保向后兼容，无需特殊处理
- `setActionOverride` 用 `findIndex` + `map` 实现 upsert，不能用 `filter` + `push`——后者创建新引用，React 无法检测到已存在 override 被替换

**验收标准**：
- `tsc --noEmit` 无新增错误
- 在 JS 控制台中调用 `useAVVisualTabStore.getState().setActionOverride({ characterId: 'x', actionIndex: 0, choice: 'skill' })`，再次调用相同 (characterId, actionIndex) 时条目被替换而非追加

---

## Task 3.2 — controller 新增 CRUD + 切换引擎

**文件**：`avVisualTabController.ts`

**前置条件**：Task 3.1（store 类型）和 Task 3.3（`simulateBattle` 函数）均完成

**改动**：

1. 更新 import：
   ```typescript
   // 删除：
   import { simulateTimeline } from 'lib/tabs/tabAvVisualizer/simulation/simulateTimeline'
   // 新增：
   import { simulateBattle } from 'lib/tabs/tabAvVisualizer/simulation/simulateBattle'
   import type { ActionNodeOverride, BattleEntity, BattleEvent, Intervention } from 'lib/tabs/tabAvVisualizer/types'
   ```

2. 删除文件顶部的局部 `SimInput` 类型（已被 `BattleEntity` 取代）

3. 在 `clearInterventions` 之后追加三个 CRUD 方法（`simulate()` 之前）：
   ```typescript
   setActionOverride(override: ActionNodeOverride) {
     useAVVisualTabStore.getState().setActionOverride(override)
     SaveState.delayedSave()
   },

   removeActionOverride(characterId: string, actionIndex: number) {
     useAVVisualTabStore.getState().removeActionOverride(characterId, actionIndex)
     SaveState.delayedSave()
   },

   clearActionOverrides() {
     useAVVisualTabStore.getState().clearActionOverrides()
     SaveState.delayedSave()
   },
   ```

4. 修改 `simulate()` 方法：
   ```typescript
   simulate(entities: BattleEntity[], interventions: Intervention[], totalAv: number): BattleEvent[] {
     const { actionOverrides } = useAVVisualTabStore.getState().savedSession
     return simulateBattle(entities, interventions, actionOverrides, totalAv)
   },
   ```

**注意事项**：
- 现有调用方（`AvVisualizerTab.tsx`）将 `BattleEntity[]` 传给 `simulate()`，与原来的 `SimInput[]` 结构兼容（`BattleEntity` 是 `SimInput` 的超集），无需改 `AvVisualizerTab.tsx`
- `avVisualTabController.ts` 里原本的局部 `SimInput` 类型定义（`type SimInput = { id, spd, baseSpd }`）应随 `simulateTimeline` import 一并删除，避免未使用类型残留

**验收标准**：
- `tsc --noEmit` 无新增错误
- `AvVisualizerTab.tsx` 无任何改动（调用签名兼容）
- 控制台调用 `AvVisualTabController.setActionOverride(...)` 正常工作

---

## Task 3.3 — 新建 `simulateBattle.ts`

**文件**：新建 `simulation/simulateBattle.ts`

**整体思路**：从 `simulateTimeline.ts` 复制内部类型和核心函数，在事件循环中加入 override 展开逻辑。`simulateTimeline.ts` 本身不修改。

**结构模板**：

```typescript
import { getBattleConfig } from '../battleConfigs'
import { uuid } from 'lib/utils/miscUtils'
import type {
  ActionNodeOverride, BattleEntity, BattleEvent, Intervention,
  InterventionTemplate, TargetType,
} from 'lib/tabs/tabAvVisualizer/types'

// ---- Internal types（与 simulateTimeline.ts 相同）----
type SpdBuff    = { delta: number; remainingTurns: number }
type CharState  = { panelSpd: number; whiteSpd: number; spdBuffs: SpdBuff[] }
type QueueEntry = { av: number; originalAv?: number; characterId: string; actionIndex: number }

// ---- Internal helpers（与 simulateTimeline.ts 相同，全量复制）----
function computeEffectiveSpd(state: CharState): number { ... }
function sortQueue(queue: QueueEntry[]): void { ... }
function applyIntervention(iv: Intervention, charStates: Map<string, CharState>, queue: QueueEntry[]): void { ... }

// ---- Step 3 新增 ----
function resolveTargets(
  targetType: TargetType,
  casterId: string,
  allCharacterIds: string[],
  overrideTargets: string[] | undefined,
): string[] {
  switch (targetType) {
    case 'self':        return [casterId]
    case 'all_allies':  return allCharacterIds
    case 'single_ally': return overrideTargets ?? []
    default:            return []   // 敌方 / team：Step 3 跳过
  }
}

function expandAvTemplate(
  template: InterventionTemplate,
  triggerAv: number,
  casterId: string,
  actionIndex: number,
  resolvedTargets: string[],
): Intervention | null {
  if (template.type !== 'av_advance' && template.type !== 'av_delay') return null
  if (resolvedTargets.length === 0) return null
  return {
    id: uuid(),
    triggerAv,
    type: template.type,
    targets: resolvedTargets,
    value: template.value,
    unit: template.unit,
    durationTurns: 0,
    afterCharId: casterId,
    afterActionIndex: actionIndex,
  }
}

// ---- 主函数 ----
export function simulateBattle(
  entities: BattleEntity[],
  interventions: Intervention[],
  actionOverrides: ActionNodeOverride[],
  totalAv: number,
): BattleEvent[] { ... }
```

**事件循环扩展点（在 `pendingAfter` 处理之前插入）**：

在 `simulateTimeline.ts` 的 `queue.push({ av: nextAv, ... })` 和 `sortQueue(queue)` 之后，找到原有的 pendingAfter 循环，在它**之前**插入：

```typescript
// 查找本次行动的 override
const override = actionOverrides.find(
  (o) => o.characterId === event.characterId && o.actionIndex === event.actionIndex
)

// 展开 av_advance / av_delay template（Step 3 只处理这两种类型）
if (override) {
  const config = getBattleConfig(event.characterId)
  const templates = config?.abilities[override.choice] ?? []
  for (const template of templates) {
    const resolvedTargets = resolveTargets(
      template.targets, event.characterId, allCharacterIds, override.targets
    )
    const iv = expandAvTemplate(template, event.av, event.characterId, event.actionIndex, resolvedTargets)
    if (iv) applyIntervention(iv, charStates, queue)
  }
}
```

**`BattleEvent` 构造时填入 `actionChoice`**：

在 `results.push(...)` 处，`override` 需在 re-enqueue **之前**就查找好（先 find，后 push result，后 re-enqueue）：

```typescript
// 在 queue.shift()! 之后立即查找
const override = actionOverrides.find(
  (o) => o.characterId === event.characterId && o.actionIndex === event.actionIndex
)

results.push({
  ...,
  actionChoice: override?.choice ?? 'basic',
  // 其余占位值与 simulateTimeline.ts 相同
  turnKind: 'normal',
  stateBefore: {} as Record<string, CharacterBattleState>,
  stateAfter: {} as Record<string, CharacterBattleState>,
  teamStateBefore: { sp: 0, spMax: 5 },
  teamStateAfter: { sp: 0, spMax: 5 },
})
```

注意：`override` 变量在 push result 和 expand templates 两处复用（同一个 const 声明即可）。

**注意事项**：

- `allCharacterIds` 只取 `type === 'character'` 的实体 id；召唤物不计入 `all_allies` 目标（Step 8 再处理）
  ```typescript
  const allCharacterIds = entities.filter(e => e.type === 'character').map(e => e.id)
  ```
- `config?.abilities[override.choice]` 的类型是 `InterventionTemplate[] | undefined`。`override.choice` 是 `ActionChoice`（`'basic' | 'skill' | 'follow_up'`），但 `abilities.follow_up` 是可选字段，需 `?? []` 避免 undefined 遍历
- `expandAvTemplate` 中 `template.type` 判断只排除非 av 类型；不要直接 `instanceof` 或 `'stat' in template`——用 type 字段 narrowing 更清晰
- `resolveTargets` 的 `'team'` 分支返回 `[]`；后续 `expandAvTemplate` 中 `resolvedTargets.length === 0` 会 return null，不会产生 Intervention——即 SP 相关 template 在 Step 3 静默跳过，无需报错或警告
- `applyIntervention` 在 `simulateBattle.ts` 中是完整复制（不 import），因为它依赖内部类型 `CharState` 和 `QueueEntry`
- `simulateBattle.ts` 不处理 `UltInsertion`，大招机制在 Step 6 实现

**验收标准**：
- `tsc --noEmit` 无新增错误
- `simulateBattle(entities, [], [], totalAv)` 的结果（av、characterId、actionIndex、effectiveSpd）与 `simulateTimeline(...)` 的对应字段完全一致
- `results[i].actionChoice` 在无 override 时为 `'basic'`，有 override 时为 `override.choice`
- 传入 `type: 'stat_buff'` 的 template 时 `expandAvTemplate` 返回 `null`，AV 不发生变化

---

## Task 3.4 — 新建 `simulateBattle.test.ts`

**文件**：新建 `simulation/simulateBattle.test.ts`

**前置条件**：Task 3.3 完成

**参考**：`simulation/simulateTimeline.test.ts` 的测试辅助结构

**测试辅助函数**（在文件顶部定义）：

```typescript
// 最小化构造 BattleEntity（测试中只需 id/spd/baseSpd/type）
function makeEntity(id: string, spd: number): BattleEntity {
  return { id, type: 'character', name: id, baseSpd: spd, spd, color: '#fff', slotIndex: 0 }
}

// 构造 ActionNodeOverride
function makeOverride(
  characterId: string,
  actionIndex: number,
  choice: ActionChoice,
  targets?: string[],
): ActionNodeOverride {
  return { characterId, actionIndex, choice, targets }
}

// Sparkle config 的 skill 模板（av_advance 50% single_ally）
// 直接从 getBattleConfig('1306b1') 获取，不 hardcode
function sparkleSkillTarget(): InterventionTemplate {
  return getBattleConfig('1306b1')!.abilities.skill.find(t => t.type === 'av_advance')!
}
```

**测试场景**：

### 场景 1 — 无 override：结果与 simulateTimeline 一致

```typescript
it('no overrides: results match simulateTimeline', () => {
  const entities = [makeEntity('A', 120), makeEntity('B', 160)]
  const result = simulateBattle(entities, [], [], 300)
  const reference = simulateTimeline(
    entities.map(e => ({ id: e.id, spd: e.spd, baseSpd: e.baseSpd })),
    [],
    300,
  )
  expect(result.map(e => e.av)).toEqual(reference.map(e => e.av))
  expect(result.map(e => e.characterId)).toEqual(reference.map(e => e.characterId))
})
```

### 场景 2 — Sparkle 战技，目标 B，AV 前移 50%

```typescript
it('sparkle skill advances target B by 50%', () => {
  const A_SPD = 120   // Sparkle，首行动 AV ≈ 83.33
  const B_SPD = 160   // 目标，首行动 AV ≈ 62.5
  const entities = [makeEntity('1306b1', A_SPD), makeEntity('B', B_SPD)]
  const overrides = [makeOverride('1306b1', 0, 'skill', ['B'])]

  const result = simulateBattle(entities, [], overrides, 300)

  // B 首行动不受影响（Sparkle 此时未行动）
  const bFirst = result.find(e => e.characterId === 'B' && e.actionIndex === 0)!
  expect(bFirst.av).toBeCloseTo(10000 / B_SPD, 2)

  // Sparkle 首行动后，B 的下一行动被前移 50% × interval
  const sparkleFirst = result.find(e => e.characterId === '1306b1' && e.actionIndex === 0)!
  const bSecond = result.find(e => e.characterId === 'B' && e.actionIndex === 1)!
  const interval = 10000 / B_SPD   // ≈ 62.5
  const expectedBSecond = Math.max(sparkleFirst.av, bFirst.av + interval - interval * 0.5)
  expect(bSecond.av).toBeCloseTo(expectedBSecond, 2)
})
```

### 场景 3 — override choice 为 basic，basic 无 av_advance

```typescript
it('basic override with no av_advance: no AV change', () => {
  const entities = [makeEntity('1306b1', 120), makeEntity('B', 160)]
  const overrides = [makeOverride('1306b1', 0, 'basic')]   // Sparkle basic: only energy_gain + sp_gain

  const result = simulateBattle(entities, [], overrides, 300)
  const reference = simulateBattle(entities, [], [], 300)

  expect(result.map(e => e.av)).toEqual(reference.map(e => e.av))
})
```

### 场景 4 — single_ally template 但 targets 为空

```typescript
it('single_ally with no targets: no AV change', () => {
  const entities = [makeEntity('1306b1', 120), makeEntity('B', 160)]
  // 明确传 targets: [] 而非 undefined
  const overrides = [makeOverride('1306b1', 0, 'skill', [])]

  const result = simulateBattle(entities, [], overrides, 300)
  const reference = simulateBattle(entities, [], [], 300)

  expect(result.map(e => e.av)).toEqual(reference.map(e => e.av))
})
```

### 场景 5 — actionChoice 从 override.choice 读取

```typescript
it('actionChoice reflects override.choice', () => {
  const entities = [makeEntity('1306b1', 120), makeEntity('B', 160)]
  const overrides = [makeOverride('1306b1', 1, 'skill', ['B'])]   // 第 2 次行动

  const result = simulateBattle(entities, [], overrides, 400)

  const sparkle0 = result.find(e => e.characterId === '1306b1' && e.actionIndex === 0)!
  const sparkle1 = result.find(e => e.characterId === '1306b1' && e.actionIndex === 1)!
  expect(sparkle0.actionChoice).toBe('basic')   // 无 override → 默认 basic
  expect(sparkle1.actionChoice).toBe('skill')   // 有 override
})
```

### 场景 6 — 多个 override 叠加

```typescript
it('multiple overrides both take effect', () => {
  // A（spd=100）和 B（spd=80），各有一次 av_advance 战技
  const cfgA: CharacterBattleConfig = {
    characterId: 'A',
    energyType: 'standard',
    abilities: {
      basic: [],
      skill: [{ type: 'av_advance', targets: 'single_ally', value: 50, unit: 'percent' }],
      ult: [],
    },
  }
  const cfgB: CharacterBattleConfig = {
    characterId: 'B',
    energyType: 'standard',
    abilities: {
      basic: [],
      skill: [{ type: 'av_advance', targets: 'single_ally', value: 25, unit: 'percent' }],
      ult: [],
    },
  }

  // 注意：inline config 无法通过 getBattleConfig() 获取
  // 此场景验证需要 mock getBattleConfig 或直接传 config 的方案
  // → Step 3 若引擎直接内联 config 参数会更易测试；若坚持 registry 方案，此场景改用真实角色 config
  // 临时方案：跳过此场景，留待 Step 8 角色测试时完善（在任务中注明）
})
```

**注意**：场景 6 的 inline config 无法被 `getBattleConfig()` registry 发现（registry 通过 `import.meta.glob` 在构建时静态扫描）。有两种处理方式：
1. 用已有的两个真实角色（均有 av_advance skill）验证叠加效果
2. 为测试暴露 registry mock 接口（过度工程，不推荐）

**推荐**：场景 6 改用 Sparkle（`'1306b1'`）和另一个确认有 `av_advance` 的角色（若无，则跳过场景 6，在注释中说明理由）。

**注意事项**：

- `simulateBattle.test.ts` 中 import `simulateTimeline` 仅用于场景 1 的等价性验证，其他场景不依赖它
- 测试文件中使用 `getBattleConfig('1306b1')` 依赖 `battleConfigs/Sparkle.ts` 在 registry 中——Vitest 环境下 `import.meta.glob` 需要 Vite 处理，确认测试配置与 `simulateTimeline.test.ts` 相同
- 断言精度：AV 值用 `toBeCloseTo(x, 2)`（小数点后两位），避免浮点误差导致测试不稳定

**验收标准**：
- 场景 1–5 全部通过
- 场景 6 要么通过，要么有注释说明为何跳过
- 运行 `npm test simulateBattle` 输出绿色，无 skip

---

## 整体验收

完成全部子任务后：

- [ ] `tsc --noEmit` 无新增错误（仅保留 `AvVisualizerTab.tsx` 预存的 2 条 i18n 错误）
- [ ] `npm test` 全部通过，包含 `simulateTimeline.test.ts`（41 条原有用例全部绿色）和 `simulateBattle.test.ts`（场景 1–5 全部绿色）
- [ ] `avVisualTabController.ts` 中不再有 `simulateTimeline` import 和 `SimInput` 局部类型
- [ ] 无 override 时，浏览器 Timeline 渲染与 Step 2 完成时完全一致（视觉无变化——引擎切换但 UI 未传入 override）
- [ ] `BattleEvent.actionChoice` 在 override 存在时被正确填充（可在控制台临时 log 验证）
