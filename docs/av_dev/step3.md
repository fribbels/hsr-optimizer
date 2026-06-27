# Step 3 — 扩展模拟引擎（AV 效果）

## 目标

新建 `simulateBattle.ts`，在 `simulateTimeline.ts` 的 AV 事件循环基础上引入 `ActionNodeOverride` 处理：
- 用户为某个行动节点选择"战技"时，引擎自动查找对应角色的 `CharacterBattleConfig.abilities.skill`，将其中的 `InterventionTemplate[]` 在行动发生时展开为具体效果
- Step 3 只处理 `av_advance` 和 `av_delay` 两种 template 类型，其余类型暂时忽略
- `BattleEvent.actionChoice` 开始被真实填充（之前固定是 `'basic'`）

---

## 范围边界

| 本步骤做 | 本步骤跳过 |
|---|---|
| `av_advance` / `av_delay` template 展开 | `energy_gain/loss`（Step 5）|
| `BattleEvent.actionChoice` 填充 | `sp_gain/loss/cap`（Step 5）|
| `actionOverrides` 存入 store | `stat_buff/debuff`（Step 7）|
| controller CRUD for overrides | `spd_up/down`（Step 7）|
| `simulateBattle.test.ts` 单测 | 召唤物（Step 8）|
| controller `simulate()` 切换到新引擎 | `stateBefore/stateAfter` 填充（Step 5+）|
| | `TurnKind: 'extra'`（Step 9）|

---

## 设计决策

### D1：simulateBattle.ts 是复制扩展，不是包装

`simulateTimeline.ts` 的事件循环是纯 AV 引擎，无法从外部注入"行动时展开 template"的逻辑。`simulateBattle.ts` 复制其事件循环并扩展，不调用 `simulateTimeline.ts`。

`simulateTimeline.ts` 保持原样不删除——其测试（`simulateTimeline.test.ts`）继续作为 AV 核心逻辑的回归测试。`avVisualTabController` 切换到 `simulateBattle.ts`。

### D2：battleConfigs 不进 store

`CharacterBattleConfig.summon.derivedSpd` 是函数，无法序列化进 localStorage。引擎直接调用 `getBattleConfig(characterId)` 从内存 registry 获取，不通过 zustand store 传递。

### D3：ActionNodeOverride 进 savedSession（持久化）

用户对行动节点的选择（用普攻还是战技、目标是谁）需要跨会话保存，与 `interventions` 并列写入 `savedSession`。

### D4：template 展开发生在"行动后立即"

参照现有 `pendingAfter` 的处理时机——角色行动完毕、下一行动 AV 已入队之后。这确保 AV advance/delay 效果作用在目标的下一次行动 AV 上（而非当前行动 AV）。

---

## 各模块详细设计

### 3.1 store — 新增 `actionOverrides`

**文件**：`useAVVisualTabStore.ts`

`AVVisualizerTabSavedSession` 追加：
```typescript
actionOverrides: ActionNodeOverride[]
```

默认值：`[]`

新增 actions：
```typescript
setActionOverride: (override: ActionNodeOverride) => void
// 若已有相同 (characterId, actionIndex) 的 override，则替换；否则追加
removeActionOverride: (characterId: string, actionIndex: number) => void
clearActionOverrides: () => void
```

`ActionNodeOverride` 字段全为 JSON 可序列化类型（无函数），可直接持久化。

### 3.2 controller — CRUD + 切换引擎

**文件**：`avVisualTabController.ts`

新增方法：
```typescript
setActionOverride(override: ActionNodeOverride): void
removeActionOverride(characterId: string, actionIndex: number): void
clearActionOverrides(): void
```

修改 `simulate()`：
- 入参从 `SimInput[]` 改为 `BattleEntity[]`（两者结构兼容，BattleEntity 是超集）
- 从 store 读取 `actionOverrides`，一并传入 `simulateBattle()`
- 内部改为调用 `simulateBattle()` 而非 `simulateTimeline()`

```typescript
simulate(entities: BattleEntity[], interventions: Intervention[], totalAv: number): BattleEvent[] {
  const { actionOverrides } = useAVVisualTabStore.getState().savedSession
  return simulateBattle(entities, interventions, actionOverrides, totalAv)
}
```

### 3.3 simulateBattle.ts — 核心引擎

**文件**：新建 `simulation/simulateBattle.ts`

**签名**：
```typescript
export function simulateBattle(
  entities: BattleEntity[],
  interventions: Intervention[],     // 手动添加的 Intervention[]（现有功能保留）
  actionOverrides: ActionNodeOverride[],
  totalAv: number,
): BattleEvent[]
```

**内部结构**（在 `simulateTimeline.ts` 基础上扩展）：

事件循环的主要扩展点在"行动后立即"阶段，原有的 `pendingAfter` 处理之前，插入 override 展开逻辑：

```
① [原有] 处理 global before interventions
② [原有] 处理 character-specific before interventions
③ [原有] 处理角色行动（shift queue，记录 BattleEvent）
④ [原有] 重新入队角色（nextAv）
⑤ [新增] 查找该角色该 actionIndex 的 ActionNodeOverride
          → 从 getBattleConfig() 获取 abilities[override.choice]
          → 过滤出 av_advance / av_delay template
          → 解析目标（resolveTargets）
          → 展开为具体 Intervention 对象
          → 调用 applyIntervention() 立即生效
⑥ [原有] 处理手动添加的 pendingAfter interventions
```

**BattleEvent 填充**：
- `actionChoice`：有 override 则用 `override.choice`，无则默认 `'basic'`
- `turnKind`：仍填 `'normal'`（`'ult'/'extra'` 在 Step 6/9 处理）
- `stateBefore/stateAfter`：仍填 `{}` 占位（Step 5 开始填充）
- `teamStateBefore/stateAfter`：仍填 `{ sp: 0, spMax: 5 }` 占位

**目标解析（resolveTargets）**：

```typescript
function resolveTargets(
  targetType: TargetType,
  casterId: string,
  allCharacterIds: string[],
  overrideTargets: string[] | undefined,
): string[] {
  switch (targetType) {
    case 'self':         return [casterId]
    case 'all_allies':   return allCharacterIds
    case 'single_ally':  return overrideTargets ?? []   // 用户未指定目标时效果不生效
    default:             return []                       // 敌方目标、team：Step 3 跳过
  }
}
```

**template 展开（Step 3 只处理 av 类型）**：

```typescript
function expandAvTemplate(
  template: InterventionTemplate,
  triggerAv: number,
  casterId: string,
  resolvedTargets: string[],
): Intervention | null {
  if (template.type !== 'av_advance' && template.type !== 'av_delay') return null
  if (resolvedTargets.length === 0) return null
  return {
    id: uuid(),
    triggerAv,
    afterCharId: casterId,
    afterActionIndex: <当前 actionIndex>,
    type: template.type,
    targets: resolvedTargets,
    value: template.value,
    unit: template.unit,
    durationTurns: 0,
  }
}
```

---

## 测试场景（simulateBattle.test.ts）

参考 `simulateTimeline.test.ts` 的写法，使用相同的测试辅助函数。

| 场景 | 验收条件 |
|---|---|
| 无 override | 结果与 `simulateTimeline` 完全一致 |
| Sparkle 战技，目标 = 角色 A | A 的下一次行动 AV 前移 50% |
| override 指定 `choice: 'basic'`，basic 无 av_advance | AV 不变 |
| single_ally template 但 override.targets 为空 | AV 不变（无目标时效果不生效） |
| 多个 override（Sparkle 和另一角色） | 两者效果均正确叠加 |
| `actionChoice` 填充验证 | override 存在时 BattleEvent.actionChoice 等于 override.choice |
| `actionChoice` 默认值 | 无 override 时 BattleEvent.actionChoice 等于 `'basic'` |

---

## 文件清单

| 操作 | 文件 |
|---|---|
| 新建 | `simulation/simulateBattle.ts` |
| 新建 | `simulation/simulateBattle.test.ts` |
| 修改 | `useAVVisualTabStore.ts`（追加 `actionOverrides` 字段和 3 个 action） |
| 修改 | `avVisualTabController.ts`（追加 CRUD，`simulate()` 切换引擎） |

`simulateTimeline.ts` 和 `simulateTimeline.test.ts` 不修改。

---

## 验收标准

- `tsc --noEmit` 无新增错误
- `simulateTimeline.test.ts` 41/41 仍全部通过
- `simulateBattle.test.ts` 新增场景全部通过
- 浏览器打开 Tab，Timeline 渲染与 Step 2 完成时一致（无视觉变化——引擎已切换但 UI 还未传入 override）
