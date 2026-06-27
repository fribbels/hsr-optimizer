# Step 1 — 类型定义详细方案

本文档是对 `dev-plan.md` Step 1 的展开说明，给出每个类型的精确结构，并标注需要你做决定的地方（用 **【决策点 N】** 标记）。

---

## 一、文件组织

**✅ 已决定：全部放在 `types.ts` 单文件中。**

与项目其他 tab 保持一致（`tabWarp/warpCalculatorTypes.ts` 225 行、`tabShowcase/showcaseTabTypes.ts` 98 行，均为单文件）。新类型加上现有约 42 行，预计总共 200-250 行，单文件完全撑得住。

文件位置：`src/lib/tabs/tabAvVisualizer/types.ts`

---

## 二、对现有 `types.ts` 的修改

### 2.1 扩展 `InterventionType`

划分维度是**引擎处理逻辑**，而不是属性粒度。同一 type 的所有 Intervention 走相同的引擎代码路径；靠 `stat` 字段区分属性细节（见 3.2 节）。

当前：
```typescript
type InterventionType = 'spd_up' | 'spd_down' | 'av_advance' | 'av_delay'
```

扩展后：
```typescript
type InterventionType =
  // AV 位移：直接操作行动条位置，专属引擎逻辑
  | 'av_advance'
  | 'av_delay'
  // 速度变化：改变速度值，触发 gauge conservation 重算剩余 AV，专属引擎逻辑
  // （与 av_advance/delay 语义不同，不可混用）
  | 'spd_up'
  | 'spd_down'
  // 能量变化：改变能量值，专属引擎逻辑（Phase 2 起生效）
  | 'energy_gain'
  | 'energy_loss'
  // 属性 BUFF/DEBUFF：CR、CD、增伤、无视防御、穿透等所有属性变化，
  // 引擎处理逻辑相同，靠 stat 字段区分具体属性（Phase 3 起生效）
  | 'stat_buff'
  | 'stat_debuff'
```

> 现在就把所有 type 加上，不影响现有逻辑——引擎暂时只处理前四个，新 type 不会触发任何分支，只是让类型定义不报错。

### 2.2 小幅扩展 `Intervention`

`Intervention` 是用户**手动添加**的效果，保持平坦结构（flat）+ 可选字段。原因：
- Edit Panel UI 已经在做"按类型显示不同表单字段"的工作，TypeScript discriminated union 带来的约束不会增加额外保障
- 平坦结构对 localStorage 序列化友好
- `buffKind` 现在扩展到 `spd_up/down` 也适用（见下文 3.2 节讨论），同样以可选字段追加

```typescript
export type Intervention = {
  // 现有字段（保持不变）
  id: string
  triggerAv: number
  beforeCharId?: string
  beforeActionIndex?: number
  afterCharId?: string
  afterActionIndex?: number
  /** @deprecated */
  sourceCharId?: string
  type: InterventionType
  targets: string[]          // 已解析的 characterId 数组
  value: number
  unit: InterventionUnit
  durationTurns: number

  // 新增可选字段（不影响现有数据）
  stat?: string                       // stat_buff/debuff 专用：作用属性名（如 'CR' | 'CD'）
  buffKind?: 'direct' | 'aura'        // 持续类效果（spd_up/down, stat_buff/debuff）可用；不填默认 'direct'
  auraTargets?: 'all_allies' | 'all_enemies'  // buffKind === 'aura' 时有意义
}
```

---

## 三、新增类型（`battleTypes.ts`）

### 3.1 行动类型与回合类型

```typescript
// 行动节点的行为类型。
// 注意：'ult' 不在这里——大招是独立的 UltInsertion 事件，不替换行动节点。
// 'follow_up' 由引擎自动产生，用户不主动选择。
export type ActionChoice = 'basic' | 'skill' | 'follow_up'

// 技能效果的目标类型（InterventionTemplate 使用）
// 区别于 Intervention.targets（已解析的 characterId[]）
export type TargetType =
  | 'self'
  | 'single_ally'    // 需用户在 UI 中选择目标，显示下拉框
  | 'all_allies'
  | 'single_enemy'
  | 'blast'          // 扩散：3 个固定敌人
  | 'all_enemies'    // 群体：5 个固定敌人

// 回合的性质类型
// 引擎根据 turnKind 决定是否参与 AV 队列计算
export type TurnKind =
  | 'normal'    // AV 驱动，参与队列，受速度/拉推条影响
  | 'ult'       // 大招额外回合，行动固定为 ult，不参与 AV 计算，由 UltInsertion 产生
  | 'extra'     // 其他额外回合（如希儿复苏），用户可选 basic/skill，不参与 AV 计算
```

### 3.2 InterventionTemplate（技能效果模板）

技能绑定的效果描述。不含 `triggerAv` 和已解析的目标 ID，这两项由引擎在行动发生时填入，展开为真正的 `Intervention`。

`InterventionTemplate` 是开发者手写的配置（battleConfigs/），使用 discriminated union 以获得字段约束和 TypeScript 穷举检查。

**分组原则：按引擎处理差异划分 variant，而非按每个 type 单独建 variant。**

- `buffKind`（direct/aura）与 effect type 正交，任何有持续时间的效果都可以是光环：`spd_up/down` 可以（如 Robin 大招全队加速），`stat_buff/debuff` 可以，瞬发效果（av_advance/delay、energy）不存在光环概念
- `stat` 字段只有 `stat_buff/debuff` 需要，是 variant 的分界线

```typescript
export type InterventionTemplate =
  // 瞬发效果：无持续时间，无光环，无 stat 字段
  | {
      type: 'av_advance' | 'av_delay' | 'energy_gain' | 'energy_loss'
      targets: TargetType
      value: number
      unit: 'flat' | 'percent'
    }
  // 持续速度效果：有持续时间，可以是光环（如 Robin 大招全队加速）
  | {
      type: 'spd_up' | 'spd_down'
      targets: TargetType
      value: number
      unit: 'flat' | 'percent'
      durationTurns: number
      buffKind?: 'direct' | 'aura'
      auraTargets?: 'all_allies' | 'all_enemies'
    }
  // 持续属性效果：有持续时间，可以是光环，stat 字段必填
  | {
      type: 'stat_buff' | 'stat_debuff'
      targets: TargetType
      stat: string               // 必填，如 'CR' | 'CD' | 'BREAK_EFFICIENCY' | 'DEF_REDUCTION'
      value: number
      unit: 'flat' | 'percent'
      durationTurns: number
      buffKind?: 'direct' | 'aura'
      auraTargets?: 'all_allies' | 'all_enemies'
    }
```

**`InterventionTemplate` vs `Intervention` 的区别**：

| | `InterventionTemplate` | `Intervention`（现有） |
|---|---|---|
| 来源 | CharacterBattleConfig 里手写 | 用户在 UI 面板里手动添加 |
| `targets` | `TargetType`（语义类型） | `string[]`（已解析的 ID） |
| `triggerAv` | 无（由引擎填入） | 有 |
| 用途 | 描述技能效果，等待展开 | 直接注入模拟队列 |

### 3.3 CharacterBattleConfig（角色战斗配置）

**文件组织**：参考 conditionals 的精髓，不照搬结构。

| | `conditionals/character/` | `battleConfigs/` |
|---|---|---|
| 内容 | 重逻辑（伤害函数、GPU 注入等） | 轻数据（InterventionTemplate 数组 + 极少量函数） |
| 规模 | 100+ 角色，需子目录分组 | Phase 1 仅 5 个，平铺即可 |
| 注册方式 | `import.meta.glob` 自动发现 | 同，复用相同机制 |

```
tabAvVisualizer/battleConfigs/
  Seele.ts
  JingYuan.ts
  Huohuo.ts
  Firefly.ts
  RuanMei.ts
  index.ts     ← import.meta.glob 自动注册，导出 getBattleConfig(characterId)
```

`index.ts` 与 `characterConfigRegistry.ts` 机制相同：用 `import.meta.glob` 扫描目录下所有 `.ts`，按 `characterId` 字段做 duck typing 注册。新增角色只需新建文件，不需要修改 `index.ts`。

**类型定义**：

```typescript
export type CharacterBattleConfig = {
  characterId: string
  // max_sp 直接从 game_data.json 读取，无需在此手写
  // 开局初始能量 = max_sp × 50%，无需配置
  energyType: 'standard' | 'special'  // 'special' Phase 1 不支持（黄泉等）

  abilities: {
    basic:      InterventionTemplate[]
    skill:      InterventionTemplate[]
    ult:        InterventionTemplate[]   // 由 UltInsertion 触发，不是 ActionChoice
    follow_up?: InterventionTemplate[]
  }

  // 召唤物配置（景元等），没有召唤物的角色不填
  summon?: {
    id: string             // 如 'jing_yuan_lightning_lord'
    baseSpd: number        // 召唤物基础速度（不受遗器影响）
    ownerId: string        // 主人 characterId
    // 若召唤物速度依赖主人的叠层/状态，则提供此公式
    derivedSpd?: (ownerExtras: Record<string, number>) => number
  }

  // 角色自定义状态的更新规则（叠层、特殊状态标记等）
  // 没有自定义状态的角色（花火/藿藿/阮梅）不需要此字段
  extrasOnAction?: Array<{
    ability: ActionChoice | 'ult'  // ✅ 包含 'ult'：大招有自己的 TurnKind: 'ult' 回合，该回合处理时可触发 extras 变化
    patch: (currentExtras: Record<string, number>) => Record<string, number>
  }>
}
```

### 3.4 ActionNodeOverride（行动节点覆盖）

用户在 Timeline 上对某个行动节点做出的选择。

额外回合（`TurnKind: 'extra'`）的用户选择直接附在触发它的普通行动的 Override 上，不需要单独的 ID 机制：

```typescript
export type ActionNodeOverride = {
  characterId: string
  actionIndex: number            // 该角色的第几次行动（0-based），指普通回合
  choice: ActionChoice           // 普通回合的行动选择
  targets?: string[]             // 普通回合 single_ally 时的目标 characterId[]

  // 希儿复苏（extra 回合）：附在同一个 Override 上
  triggerResurgence?: boolean    // 勾选后在本次行动后插入 TurnKind: 'extra' 回合
  resurgenceChoice?: ActionChoice  // 复苏回合的行动选择（默认 'basic'）
  resurgenceTargets?: string[]     // 复苏回合 single_ally 时的目标
}
```

### 3.5 UltTiming / UltInsertion（大招插入）

大招不替换行动节点，是独立插入 Timeline 的事件。

```typescript
// 大招触发时机（三选一）
export type UltTiming =
  | { type: 'during_action'; charId: string; actionIndex: number }
  // 某角色第 N 次行动开始的瞬间（行动前）
  | { type: 'after_action';  charId: string; actionIndex: number }
  // 某角色第 N 次行动结束的瞬间
  | { type: 'at_av';         av: number }
  // 任意 AV 处（无需有角色在此行动）

export type UltInsertion = {
  id: string
  casterId: string         // 施放大招的角色 characterId
  timing: UltTiming
  targets?: string[]       // single_ally 类效果时的目标
}
```

引擎校验：处理 `UltInsertion` 时，若施放者能量 < `max_sp`，忽略此插入；若满足，在对应位置插入 `BattleEvent`（`actionChoice: 'ult'`），展开 `ult` 的 `InterventionTemplate[]`，施放者能量归零。

### 3.6 ActiveIntervention（激活中的效果）

一条已生效、正在倒计时的 BUFF/效果，存在 `CharacterBattleState.activeInterventions` 中。

```typescript
export type ActiveIntervention = {
  id: string
  sourceCharacterId: string
  sourceAbility: ActionChoice | 'ult' | 'external'
  // 'external' = 用户手动添加的 Intervention（非技能触发）

  type: InterventionType
  stat?: string              // stat_buff 专用
  value: number
  unit: 'flat' | 'percent'

  // BUFF 计时
  remainingTurns: number
  // direct：写在接受者身上，接受者回合结束 tick -1
  // aura：写在释放者身上，释放者回合结束 tick -1，但效果惠及其他实体
  buffKind: 'direct' | 'aura'

  // 光环 BUFF 专用
  auraTargets?: 'all_allies' | 'all_enemies'
  auraEffect?: {
    type: InterventionType
    stat?: string
    value: number
    unit: 'flat' | 'percent'
  }
}
```

**`ActiveIntervention` vs `Intervention` 的区别**：

| | `ActiveIntervention` | `Intervention`（现有） |
|---|---|---|
| 生命周期 | 已触发、正在生效 | 待触发（在某 AV 点等待） |
| 计时字段 | `remainingTurns` | — |
| `triggerAv` | 无 | 有 |
| 存放位置 | `CharacterBattleState.activeInterventions` | 模拟队列 / store |

### 3.7 CharacterBattleState（实体状态快照）

某时刻单个实体（角色或召唤物）的完整状态，用于 `BattleEvent.stateBefore/stateAfter`。

```typescript
export type CharacterBattleState = {
  energy: number                       // 当前能量值
  spd: number                          // 当前有效速度（含 SPD BUFF 叠加后）
  activeInterventions: ActiveIntervention[]
  extras: Record<string, number>       // 自定义状态（0 = 未激活）
  // 示例：{ hpa: 3 }（景元）、{ resurgenceActive: 1 }（希儿）
}
```

### 3.8 BattleEntity（队列实体）

Timeline 显示行和模拟队列的统一实体类型，替换现有 `TimelineCharacter`。

```typescript
export type BattleEntity = {
  id: string
  type: 'character' | 'summon'
  ownerId?: string       // summon 专用，指向主人 characterId
  name: string
  baseSpd: number        // 基础速度（无 BUFF 时），percent 类 SPD BUFF 计算需要
  spd: number            // 当前有效速度（含 BUFF）
  color: string
  slotIndex: number
}
```

**✅ 决策点 3：`TimelineCharacter` 直接替换为 `BattleEntity`。**

`TimelineCharacter` 定义在 `Timeline.tsx` 中，Step 1 完成后删除，所有使用处（`Timeline.tsx`、`AvVisualizerTab.tsx`、`avVisualTabController.ts`，约 3 个文件）同步改为 `BattleEntity`。

### 3.9 BattleEvent（战斗事件）

扩展自现有 `SimEvent`，是模拟引擎输出的主要数据结构。

```typescript
export type BattleEvent = {
  // --- 与 SimEvent 字段对齐 ---
  av: number
  characterId: string          // 行动实体 id（角色或召唤物）
  actionIndex: number
  effectiveSpd: number

  // --- 新增字段 ---
  turnKind: TurnKind           // 回合性质：引擎据此决定是否参与 AV 队列计算
  actionChoice: ActionChoice | 'ult'
  // 'ult' 仅在 turnKind === 'ult' 时出现，由 UltInsertion 产生
  // 'extra' 回合（希儿复苏）的 actionChoice 为 ActionChoice（用户可选 basic/skill）

  // 行动前后所有实体的完整状态快照（用于节点重算和 Playhead 显示）
  stateBefore: Record<string, CharacterBattleState>
  stateAfter: Record<string, CharacterBattleState>

  // Phase 4 伤害计算（懒计算，用户点击后填入）
  damageResult?: number
  damageStale?: boolean        // Timeline 变化后标记为失效
}
```

**✅ 决策点 4：`BattleEvent` 直接替换 `SimEvent`。**

`BattleEvent` 已包含 `SimEvent` 的所有字段，引擎改为输出 `BattleEvent[]`。`EnrichedSimEvent` 改为 `BattleEvent & { color: string; characterName: string; slotIndex: number }`。旧 `SimEvent` 类型删除。需同步更新 `Timeline.tsx`、`TimelineRow.tsx`、`ActionDisplayPanel.tsx`、`simulateTimeline.ts` 等约 8 个文件。

---

## 四、类型关系概览

```
CharacterBattleConfig
  └── abilities.{basic,skill,ult,follow_up}: InterventionTemplate[]
           └── type: InterventionType  (扩展自 types.ts)
           └── targets: TargetType
           └── buffKind → auraEffect

UltInsertion
  └── timing: UltTiming
  └── casterId → CharacterBattleConfig.abilities.ult

ActionNodeOverride
  └── choice: ActionChoice
  └── characterId + actionIndex → BattleEvent

BattleEntity               (替换 TimelineCharacter)
  └── type: 'character' | 'summon'
  └── ownerId → 另一个 BattleEntity

CharacterBattleState       (每个 BattleEvent 里有一份 Record<entityId, state>)
  └── activeInterventions: ActiveIntervention[]

BattleEvent                (替换 SimEvent)
  └── turnKind: TurnKind  ('normal' | 'ult' | 'extra')
  └── stateBefore / stateAfter: Record<string, CharacterBattleState>
  └── actionChoice: ActionChoice | 'ult'
```

展开流程：
```
ActionNodeOverride (用户决策)
      +
CharacterBattleConfig.abilities[choice].InterventionTemplate[]
      ↓ 引擎展开（填入 triggerAv + 解析 targets）
Intervention[]（注入模拟队列，走现有引擎逻辑）
      ↓
BattleEvent（记录结果 + 状态快照）
```

---

## 五、各类型与开发步骤的对应关系

| 类型 | 在哪一步开始使用 |
|---|---|
| `ActionChoice`、`TargetType` | Step 2（BattleConfig）|
| `InterventionTemplate` | Step 2（BattleConfig）|
| `CharacterBattleConfig` | Step 2 |
| `ActionNodeOverride` | Step 3（引擎）/ Step 4（UI）|
| `BattleEntity` | Step 3（引擎）/ Step 4（UI 改行数）|
| `BattleEvent` | Step 3（引擎输出）|
| `UltTiming`、`UltInsertion` | Step 6 |
| `CharacterBattleState`（energy 字段） | Step 5（能量系统）|
| `CharacterBattleState`（activeInterventions） | Step 7（BUFF 系统）|
| `ActiveIntervention` | Step 7 |
| `BattleEvent.damageResult` | Phase 4 |

Step 1 只写类型文件，**不改任何逻辑代码**。

---

## 六、待确认的决策

1. **文件组织**：✅ 单文件 `types.ts`
2. **`extrasOnAction.ability`**：✅ 包含 `'ult'`，大招有独立的 `TurnKind: 'ult'` 回合
3. **`TimelineCharacter` 迁移**：✅ Step 1 直接替换为 `BattleEntity`，同步更新约 3 个文件
4. **`SimEvent` 迁移**：✅ 直接替换，`EnrichedSimEvent` 改为继承 `BattleEvent`，旧 `SimEvent` 删除
