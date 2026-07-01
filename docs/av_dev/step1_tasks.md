# Step 1 — 实现子任务清单

依赖关系原则：先做纯类型新增（无行为影响），再做迁移（影响现有工作代码）。每个子任务结束后应能编译通过。

---

## Task 1.1 — 扩展 `InterventionType` 与 `Intervention`

**文件**：`types.ts`

**改动**：
- `InterventionType` union 末尾追加 `'energy_gain' | 'energy_loss' | 'stat_buff' | 'stat_debuff'`
- `Intervention` 追加三个可选字段：
  ```typescript
  stat?: string
  buffKind?: 'direct' | 'aura'
  auraTargets?: 'all_allies' | 'all_enemies'
  ```

**注意事项**：
- 所有新字段必须为可选（`?`），localStorage 里可能有不含这些字段的旧数据，反序列化时不能报错
- 引擎暂时不处理新 type，只是让类型声明不报错

**验收标准**：
- `tsc --noEmit` 无报错
- 现有 `EditPanel`、`InterventionItem` 等组件无 TS 错误

---

## Task 1.2 — 新增基础枚举类型

**文件**：`types.ts`

**改动**：新增以下三个类型：
```typescript
export type TurnKind = 'normal' | 'ult' | 'extra'
export type ActionChoice = 'basic' | 'skill' | 'follow_up'
export type TargetType = 'self' | 'single_ally' | 'all_allies' | 'single_enemy' | 'blast' | 'all_enemies'
```

**注意事项**：
- `ActionChoice` 不含 `'ult'`，`'ult'` 只出现在 `TurnKind` 和 `BattleEvent.actionChoice` 里
- `'follow_up'` 由引擎产生，用户不主动选择

**验收标准**：
- `tsc --noEmit` 无报错
- 三个类型可从 `types.ts` 正常 import

---

## Task 1.3 — 新增 `InterventionTemplate`

**文件**：`types.ts`

**改动**：新增 discriminated union（三个 variant，详见 `step1.md` 3.2 节）

**注意事项**：
- `stat_buff | stat_debuff` variant 的 `stat` 字段是**必填**，不是可选——这是使用 discriminated union 的核心收益，写 battleConfigs 时缺少 `stat` 会立即报红
- `buffKind` 在 `spd_up/down` 和 `stat_buff/debuff` 两个 variant 上都有，不是 `stat_buff` 专属

**验收标准**：
- 以下对象能通过类型检查：
  ```typescript
  const t: InterventionTemplate = { type: 'av_advance', targets: 'single_ally', value: 50, unit: 'percent' }
  ```
- 以下对象报错（缺少必填 `stat`）：
  ```typescript
  const t: InterventionTemplate = { type: 'stat_buff', targets: 'all_allies', value: 0.1, unit: 'percent', durationTurns: 3 }
  ```

---

## Task 1.4 — 新增 `CharacterBattleConfig`

**文件**：`types.ts`

**改动**：新增类型（详见 `step1.md` 3.3 节）

**注意事项**：
- `extrasOnAction.ability` 类型是 `ActionChoice | 'ult'`
- `summon.derivedSpd` 是函数类型，不可序列化，`CharacterBattleConfig` 只存在内存中，不进 localStorage
- `max_sp` 不在此类型中，从 `game_data.json` 运行时读取

**验收标准**：
- 能写出一个最简角色 config 不报错：
  ```typescript
  const cfg: CharacterBattleConfig = {
    characterId: '1222',
    energyType: 'standard',
    abilities: { basic: [], skill: [], ult: [] },
  }
  ```

---

## Task 1.5 — 新增 `ActionNodeOverride`

**文件**：`types.ts`

**改动**：新增类型（详见 `step1.md` 3.4 节）

**注意事项**：
- `resurgenceChoice` 和 `resurgenceTargets` 是希儿专用字段，但放在通用类型里——Phase 1 只有希儿用到，命名上不要写死 "seele"
- `triggerResurgence` 为 `false` 或 `undefined` 时，`resurgenceChoice` 应被引擎忽略

**验收标准**：`tsc --noEmit` 无报错

---

## Task 1.6 — 新增 `UltTiming` / `UltInsertion`

**文件**：`types.ts`

**改动**：新增两个类型（详见 `step1.md` 3.5 节）

**注意事项**：
- `UltTiming` 是 discriminated union，三个 variant 的 discriminant 字段名是 `type`（不是 `kind`）——与现有代码风格保持一致
- `UltInsertion` 有 `id` 字段，由 store 在创建时生成（`crypto.randomUUID()`），用于后续删除操作

**验收标准**：
- 三种 timing 都能正确推导专属字段（TypeScript narrowing 生效）

---

## Task 1.7 — 新增 `ActiveIntervention`

**文件**：`types.ts`

**改动**：新增类型（详见 `step1.md` 3.6 节）

**注意事项**：
- `buffKind` 在此处是**必填**（非可选），因为 `ActiveIntervention` 是已生效的运行时状态，必须明确计时基准
- 与 `Intervention.buffKind?`（可选）和 `InterventionTemplate.buffKind?`（可选）形成对比：模板和手动添加时可以不填（默认 direct），但运行时状态必须已确定

**验收标准**：`tsc --noEmit` 无报错

---

## Task 1.8 — 新增 `CharacterBattleState`

**文件**：`types.ts`

**改动**：新增类型（详见 `step1.md` 3.7 节）

**注意事项**：
- Phase 1 的引擎暂时不会填充 `energy` 和 `activeInterventions`，但结构先完整定义
- `extras` 的 key 是角色自定义的字符串（如 `'hpa'`、`'resurgenceActive'`），值为数字，`0` 表示未激活

**验收标准**：`tsc --noEmit` 无报错

---

## Task 1.9 — 新增 `BattleEntity`，替换 `TimelineCharacter`

**文件**：
- `types.ts`（新增 `BattleEntity`）
- `Timeline.tsx`（删除 `TimelineCharacter` 定义，更新 import 和类型引用）
- `AvVisualizerTab.tsx`（更新对象构造和类型引用）
- `avVisualTabController.ts`（`SimInput` 与 `TimelineCharacter` 有重叠，一并整理）

**改动顺序**：
1. 在 `types.ts` 新增 `BattleEntity`（export）
2. 删除 `Timeline.tsx` 中的 `TimelineCharacter` 定义
3. 将 `Timeline.tsx` 中所有 `TimelineCharacter` 引用改为 `BattleEntity`（从 `types.ts` import）
4. 将 `AvVisualizerTab.tsx` 中构造 `TimelineCharacter` 的对象字面量补充 `type: 'character'`
5. `avVisualTabController.ts` 中的局部 `SimInput` 类型可直接改为引用 `BattleEntity`，或保留局部类型（只用 id/spd/baseSpd 字段）

**注意事项**：
- `BattleEntity` 比 `TimelineCharacter` 多两个字段：`type: 'character' | 'summon'` 和 `ownerId?: string`
- 现有代码所有构造 `TimelineCharacter` 的地方都需要补 `type: 'character'`（当前只有角色，无召唤物）
- `avVisualTabController.ts` 里有局部的 `SimInput` 类型（只含 id/spd/baseSpd），它和 `BattleEntity` 存在字段重叠但不完全相同；可以让 simulate 函数的入参改为 `BattleEntity[]`，或者保留 `SimInput` 不动——Task 1.10 之后再统一

**验收标准**：
- `tsc --noEmit` 无报错
- 浏览器打开 AV Visualizer Tab，Timeline 正常渲染（视觉无变化）

---

## Task 1.10 — 新增 `BattleEvent`，替换 `SimEvent`（最复杂）

**文件**：
- `types.ts`（新增 `BattleEvent`，删除 `SimEvent`）
- `Timeline.tsx`（更新 `EnrichedSimEvent`）
- `TimelineRow.tsx`（仅 import 变化）
- `simulateTimeline.ts`（返回类型改为 `BattleEvent[]`，填入占位值）
- `avVisualTabController.ts`（`simulate()` 返回类型）
- `simulateTimeline.test.ts`（更新测试对象结构）

**改动顺序**：
1. 在 `types.ts` 新增 `BattleEvent`（export），删除 `SimEvent`
2. 更新 `Timeline.tsx`：
   - `EnrichedSimEvent` 改为 `BattleEvent & { color: string; characterName: string; slotIndex: number }`
   - import 从 `types.ts` 改为引入 `BattleEvent`
3. 更新 `TimelineRow.tsx`：仅 import 路径变化（`EnrichedSimEvent` 定义移至 `types.ts` 或仍在 `Timeline.tsx`，统一即可）
4. 更新 `simulateTimeline.ts`：
   - 返回类型 `SimEvent[]` → `BattleEvent[]`
   - 每个事件对象追加占位值（见注意事项）
5. 更新 `avVisualTabController.ts`：`simulate()` 返回类型同步修改
6. 更新 `simulateTimeline.test.ts`：测试中的事件对象补充必填字段

**注意事项**：
- `BattleEvent` 相比 `SimEvent` 多出 `turnKind`、`actionChoice`、`stateBefore`、`stateAfter` 四个字段，均为必填。`simulateTimeline.ts` 暂时无法计算这些值，统一填入占位值：
  ```typescript
  turnKind: 'normal' as TurnKind,
  actionChoice: 'basic' as ActionChoice,
  stateBefore: {} as Record<string, CharacterBattleState>,
  stateAfter: {} as Record<string, CharacterBattleState>,
  ```
- `EnrichedSimEvent` 目前定义在 `Timeline.tsx`，可以选择移到 `types.ts` 或保留原处——保留原处更简单，只改内容不改位置
- `ActionDisplayPanel.tsx` 定义了局部 `ActionEvent` 类型（`SimEvent` 的子集），该文件**不直接 import `SimEvent`**，无需改动

**验收标准**：
- `tsc --noEmit` 无报错
- `npm test` 中 `simulateTimeline.test.ts` 全部通过
- 浏览器打开 AV Visualizer Tab，Timeline 正常渲染，Playhead 拖动无异常

---

## Task 1.11 — 创建 `battleConfigs/index.ts`

**文件**：新建 `tabAvVisualizer/battleConfigs/index.ts`

**改动**：
```typescript
import type { CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'

const modules = import.meta.glob<Record<string, unknown>>('./*.ts', { eager: true })

const registry = new Map<string, CharacterBattleConfig>()

for (const mod of Object.values(modules)) {
  for (const value of Object.values(mod)) {
    if (value != null && typeof value === 'object' && 'characterId' in value && 'abilities' in value) {
      const config = value as CharacterBattleConfig
      registry.set(config.characterId, config)
    }
  }
}

export function getBattleConfig(characterId: string): CharacterBattleConfig | undefined {
  return registry.get(characterId)
}
```

**注意事项**：
- `import.meta.glob` 的路径是相对于当前文件的，`'./*.ts'` 只扫描同目录下的文件，不含子目录
- 需要将 `index.ts` 本身排除在扫描外：`import.meta.glob` 不会 import 自身，无需特殊处理
- 初始状态下 registry 为空（没有任何角色文件），`getBattleConfig` 对任何 id 都返回 `undefined`——这是预期行为，Step 2 才开始写角色文件

**验收标准**：
- `tsc --noEmit` 无报错
- 导入 `getBattleConfig` 并调用，TypeScript 类型正确推导为 `CharacterBattleConfig | undefined`

---

## 整体验收

完成全部子任务后：

- [ ] `tsc --noEmit` 无任何报错
- [ ] `npm test` 全部通过（重点：`simulateTimeline.test.ts`）
- [ ] 浏览器打开 AV Visualizer Tab，功能与改动前完全一致（纯类型改动，无行为变化）
- [ ] `types.ts` 中不再有 `SimEvent` 定义
- [ ] `Timeline.tsx` 中不再有 `TimelineCharacter` 定义
