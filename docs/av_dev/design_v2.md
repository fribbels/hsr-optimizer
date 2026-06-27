# AV Visualizer 战斗模拟器 — 设计方案 v2

## 一、核心定位

复刻崩铁的战斗行动系统，做成一个**交互式战斗模拟器**。

用户不是在"规划"时间轴，而是在逐个行动节点做决策——和真实打这场战斗的方式完全一样：

```
导入角色（速度 / 遗器 / 光锥）
        ↓
系统生成默认 Timeline（全程普攻）
        ↓
用 Playhead 查看任意时刻各角色的能量 / BUFF 状态
        ↓
点击行动节点 → 改为战技（若技能需选目标则显示下拉框）
点击 Timeline 空白处 / 行动节点前后 → 插入大招（施放者能量满时可选）
        ↓
系统从该变更点起重新推算所有后续 AV / 能量 / BUFF 状态
```

---

## 二、Phase 1 范围

### 目标角色

| 角色 | 核心机制 | 备注 |
|---|---|---|
| 希儿 | 复苏（额外回合）+ 复苏期间 SPD/DMG 提升 | 手动勾选触发复苏 |
| 景元 | 闪电主（召唤物，独立 AV）+ HPA 叠层 | 最复杂，召唤物进入队列 |
| 藿藿 | 大招给全队一次性回能 + ATK BUFF | 标准 `energy_gain` 覆盖 |
| 花火 | 战技对单体队友拉条 50% | 标准 `av_advance` 覆盖 |
| 阮梅 | 战技光环 BUFF（全队，释放者基准计时） | 光环 BUFF 系统覆盖 |

### 约束

- 只做**直伤**，无击破机制，无忆灵
- 敌人使用固定配置（见下）

### 固定敌人配置

```
Level: 95 | HP: 无限 | SPD: 100 | Toughness: 120
Resist: 全属性 20% | DamageReduction: 0%
```

扩散目标 = 3 个；群体目标 = 5 个。

---

## 三、行动与目标类型

```typescript
// 行动节点的行为类型（不含大招，大招是独立插入事件）
type ActionChoice = 'basic' | 'skill' | 'follow_up'
// follow_up 由引擎自动产生，用户不主动选择

type TargetType =
  | 'self'
  | 'single_ally'    // 用户选择目标，显示下拉框
  | 'all_allies'
  | 'single_enemy'
  | 'blast'          // 扩散：3 个敌人
  | 'all_enemies'    // 群体：5 个敌人
```

**大招不属于行动节点内的行为。** 大招是独立的插入事件，不替换任何行动节点，详见 5.7。

---

## 四、核心设计原则：扩展 Intervention，不引入新系统

现有 `Intervention` 已是"在某 AV 点对某些目标施加效果"的通用模型。

**角色技能的效果 = 一组 `InterventionTemplate` 的绑定。** 角色在某节点使用战技时，引擎以当前 AV 为触发点将模板展开注入队列，走已有的处理逻辑。手动添加的 Intervention（受击回能等）与技能自动注入的 Intervention 共用同一套引擎。

---

## 五、类型定义

### 5.1 Intervention 类型扩展

```typescript
type InterventionType =
  | 'spd_up'       // 已有
  | 'spd_down'     // 已有
  | 'av_advance'   // 已有
  | 'av_delay'     // 已有
  | 'energy_gain'  // 新增（Phase 2）
  | 'stat_buff'    // 新增（Phase 4）
```

### 5.2 Intervention 模板

技能绑定的效果描述，不含触发 AV（由引擎在行动时填入）。

```typescript
type InterventionTemplate = {
  type: InterventionType
  targets: TargetType
  value: number
  unit: 'flat' | 'percent'
  durationTurns?: number        // 持续类效果（spd_up / stat_buff）
  stat?: string                 // stat_buff 专用，如 'CR' | 'CD' | 'DMG_BOOST'

  // 光环 BUFF 专用（不填 buffKind 默认为 'direct'）
  buffKind?: 'direct' | 'aura'
  auraTargets?: 'all_allies' | 'all_enemies'
  auraEffect?: {
    type: InterventionType
    stat?: string
    value: number
    unit: 'flat' | 'percent'
  }
}
```

### 5.3 角色战斗配置

```typescript
type CharacterBattleConfig = {
  characterId: string
  energyType: 'standard' | 'special'  // special 暂不支持（黄泉等）
  // max_sp 直接从 game_data.json 读取，无需手写
  // 开局初始能量 = max_sp × 50%（高难副本标准），无需配置
  // 角色天赋 / 光锥 / 遗器的开局加能：作为 AV=0 的 energy_gain 配置在此处

  abilities: {
    basic:      InterventionTemplate[]
    skill:      InterventionTemplate[]
    ult:        InterventionTemplate[]
    follow_up?: InterventionTemplate[]
  }

  // 召唤物配置（景元等）
  summon?: {
    id: string                  // 如 'jing_yuan_lightning_lord'
    baseSpd: number
    ownerId: string
    derivedSpd?: (ownerExtras: Record<string, number>) => number
  }

  // 角色自定义状态的变更规则（叠层、特殊状态等）
  extrasOnAction?: {
    ability: ActionChoice
    patch: (currentExtras: Record<string, number>) => Record<string, number>
  }[]
}
```

配置文件存放位置：`tabAvVisualizer/battleConfigs/<characterId>.ts`

### 5.4 战斗状态快照

```typescript
// 某时刻单个实体（角色或召唤物）的完整状态
type CharacterBattleState = {
  energy: number
  spd: number                              // 当前有效速度（含 SPD BUFF）
  activeInterventions: ActiveIntervention[]
  extras: Record<string, number>           // 自定义状态（HPA 叠层、复苏标记等）
}

// 一条激活中的效果
type ActiveIntervention = {
  id: string
  sourceCharacterId: string
  sourceAbility: ActionChoice | 'external'
  type: InterventionType
  stat?: string
  value: number
  unit: 'flat' | 'percent'
  remainingTurns: number    // tick 基准：direct = 接受者回合结束；aura = 释放者回合结束
  buffKind: 'direct' | 'aura'
  auraTargets?: 'all_allies' | 'all_enemies'
  auraEffect?: {
    type: InterventionType
    stat?: string
    value: number
    unit: 'flat' | 'percent'
  }
}
```

### 5.5 队列实体

```typescript
// Timeline 和模拟队列中的统一实体类型
type BattleEntity = {
  id: string
  type: 'character' | 'summon'
  ownerId?: string     // summon 专用
  name: string
  spd: number
  color: string
  slotIndex: number
}
```

### 5.6 行动节点覆盖

```typescript
type ActionNodeOverride = {
  characterId: string
  actionIndex: number         // 第几次行动（0-based）
  choice: ActionChoice        // 'basic' | 'skill' | 'follow_up'，不含 'ult'
  targets?: string[]          // single_ally 时用户选择的目标 characterId 列表
  triggerResurgence?: boolean // 希儿专用：是否在本次行动后触发复苏额外回合
}
```

### 5.7 大招插入（UltInsertion）

大招不属于回合内的行为，是可以在任意时机插入的独立事件。施放者在该时机能量满时才允许插入。

```typescript
// 大招的触发时机（三选一）
type UltTiming =
  | { type: 'during_action'; charId: string; actionIndex: number }
  // 某角色第 N 次行动的行动前瞬间
  | { type: 'after_action';  charId: string; actionIndex: number }
  // 某角色第 N 次行动结束的瞬间
  | { type: 'at_av';         av: number }
  // 任意 AV 处（无需有角色在此行动）

type UltInsertion = {
  id: string
  casterId: string    // 施放者 characterId
  timing: UltTiming
  targets?: string[]  // single_ally 时的目标
}
```

引擎处理 `UltInsertion` 时：
1. 校验施放者在该时机能量是否等于 `max_sp`，不满足则忽略
2. 在对应位置插入一个 `BattleEvent`（`actionChoice: 'ult'`）
3. 展开该角色 `CharacterBattleConfig.abilities.ult` 的 `InterventionTemplate[]`
4. 施放者能量归零

> `UltTiming` 的 `during_action / after_action` 结构与现有 `Intervention` 的 `beforeCharId / afterCharId` 机制高度一致，引擎实现可参考复用。

### 5.8 战斗事件

```typescript
// 扩展自现有 SimEvent
type BattleEvent = {
  av: number
  characterId: string        // 行动实体 id（角色或召唤物）
  actionIndex: number
  actionChoice: ActionChoice | 'ult'   // ult 仅来自 UltInsertion
  effectiveSpd: number

  // 行动前后所有实体的完整状态快照（用于节点重算和 Playhead 显示）
  stateBefore: Record<string, CharacterBattleState>
  stateAfter: Record<string, CharacterBattleState>

  // 伤害计算结果（Phase 4，懒计算，用户点击后填入）
  damageResult?: number
  damageStale?: boolean      // Timeline 变化后标记为失效
}
```

---

## 六、关键机制说明

### 6.1 能量系统

- **开局初始能量**：`max_sp × 50%`（高难副本标准）
- **`max_sp`**：直接读取 `game_data.json` 中 `DBMetadataCharacter.max_sp`，无需手写
- **开局额外加能**（天赋 / 光锥 / 遗器）：配置为 `AV=0` 的 `energy_gain` Intervention，引擎在首次行动**前**统一处理
- **受击回能**：用户手动添加 `energy_gain` Intervention
- **大招**：通过 `UltInsertion` 插入，引擎在处理时校验施放者能量是否等于 `max_sp`，满足则插入大招事件并将能量归零

### 6.2 BUFF 系统

两类 BUFF，计时基准不同：

| 类型 | 写在谁身上 | tick 时机 | 显示 |
|---|---|---|---|
| 直接 BUFF（`direct`） | 接受者 | 接受者回合**结束时** | 接受者状态栏显示剩余回合 |
| 光环 BUFF（`aura`） | 释放者 | 释放者回合**结束时** | 释放者身上显示；受益者行动时标注受影响 |

光环 BUFF 生效方式：引擎处理任意实体行动时，检查全队中是否有激活光环，有则将 `auraEffect` 临时叠入该实体当次行动，不在受益者身上建独立条目。

**示例（阮梅战技）**：阮梅身上挂 `buffKind: 'aura', remainingTurns: 3, auraTargets: 'all_allies', auraEffect: { stat: 'BREAK_EFFICIENCY', ... }`，每次阮梅行动结束 tick -1，期间所有队友行动时自动受益。

### 6.3 SPD BUFF

现有 `simulateTimeline.ts` 的 `applyIntervention` 已实现 gauge conservation 数学（SPD BUFF 施加时对剩余距离按旧速/新速重算），直接复用。BUFF 到期时在接受者回合结束时移除，速度恢复后同样重算剩余距离。

### 6.4 召唤物

| | 召唤物（Phase 1 支持） | 忆灵（Phase 1 不做） |
|---|---|---|
| 行动队列 | 有独立 AV | 有独立 AV |
| 行动选择 | 预定义，用户不可改 | 用户可操控 |
| HP | 无独立 HP | 有独立 HP |
| 属性 | 继承主人，部分派生 | 完全独立 |

召唤物与主人的动态关联：
- **属性依赖叠层**：主人 `extrasOnAction` 更新叠层 → 引擎对召唤物注入 `spd_up` 同步速度，召唤物 `derivedSpd` 从主人 `extras` 派生
- **被外部效果拉条**：直接对召唤物 id 施加 `av_advance`，与角色无异

Phase 1 中需要 `extras` 的角色：

| 角色 | extras 字段 | 作用 |
|---|---|---|
| 景元 | `hpa` | 影响闪电主速度和每次行动攻击次数 |
| 希儿 | `resurgenceActive` | 复苏状态标记，驱动额外回合和 stat_buff 注入 |

### 6.5 节点重算

用户修改节点 N 的行动后，从 `events[N].stateBefore` 出发重算，N 之前的结果不变。N 之后的 `damageResult` 自动标记为 `damageStale: true`。

### 6.6 希儿复苏

用户在希儿的行动节点勾选 `triggerResurgence`，引擎在该行动后立即为希儿插入额外行动节点（AV 不变）。复苏期间 SPD / DMG 提升通过 `extras.resurgenceActive = 1` 驱动 `extrasOnAction` 自动注入对应 `stat_buff` Intervention。

### 6.7 伤害计算（Phase 4）

- **管线**：复用现有 optimizer 计算管线，以 `BattleEvent.stateBefore` 中的激活 BUFF 快照构造属性上下文
- **懒计算**：每个伤害性行动节点旁提供"计算"按钮，点击后计算并填入 `damageResult`；Timeline 变化时将受影响节点标记 `damageStale`
- **总伤害统计**：独立 UI 输入 AV 范围，统计范围内所有行动伤害总量；范围内未计算的节点自动触发计算

---

## 七、UI 变动

| 现有 UI | 变动 |
|---|---|
| CharacterSlotCard 2×2 固定布局 | 改为动态列表，召唤物自动追加（无法手动操作） |
| Timeline 固定 4 行 | 行数 = 角色数 + 召唤物数，动态计算 |
| 行动节点只显示 AV | 新增点击交互：选择行动类型（basic/skill）+ 单体目标下拉框 |
| 无大招插入入口 | Timeline 行动节点前后 / 空白 AV 处可插入大招；能量不足时不可选 |
| 无能量显示 | Playhead 处显示各实体当前能量 |
| 无 BUFF 显示 | Playhead 处显示各实体激活的 BUFF 列表 |

召唤物行在 Timeline 上有视觉区分（图标 / 颜色标注），行动节点只读，不支持修改行动类型。

---

## 八、现有代码变动对照

| 现有内容 | 变动方式 |
|---|---|
| `InterventionType` | 扩展加入 `energy_gain`、`stat_buff` |
| `Intervention` | 小幅扩展，加入 `stat`、`buffKind` 等字段 |
| `TimelineCharacter` | 替换为 `BattleEntity`（加入 `type` 和 `ownerId`） |
| `SimEvent` | 扩展为 `BattleEvent`（加入 `actionChoice`、`stateBefore/After`、`damageResult`） |
| `simulateTimeline.ts` | 扩展为 `simulateBattle.ts`，加入能量、行动展开、召唤物、extras、BUFF tick 逻辑 |
| `useAVVisualTabStore` | 新增 `actionOverrides`、`ultInsertions`、`battleConfigs` 字段 |
| `avVisualTabController` | 新增对应 CRUD 方法 |

---

## 九、可复用的现有 optimizer 数据

| 数据 | 来源 | 用途 |
|---|---|---|
| `DBMetadataCharacter.max_sp` | `game_data.json` | 最大能量上限，直接读取 |
| `AbilityKind` | `turnAbilityConfig.ts` | 技能类型枚举，可参考 |
| `BUFF_ABILITY` | `buffSource.ts` | BUFF 来源描述，可参考 |

能量回复量、AV 效果数值、BUFF 内容和持续回合等数据在 optimizer 中**没有结构化存储**，需在 `CharacterBattleConfig` 中手写。

---

## 十、开发阶段规划

### Phase 1 — 行动选择 + AV 效果 + 召唤物
- 新增 `BattleEntity`、`ActionNodeOverride`、`CharacterBattleConfig`、`BattleEvent` 类型
- 手写 5 个角色的 `CharacterBattleConfig`（希儿 / 景元 / 藿藿 / 花火 / 阮梅）
- 扩展模拟引擎：行动选择展开 Intervention、`UltInsertion` 处理、召唤物入队、`extras` 维护
- Timeline 行数动态化，行动节点支持 basic/skill 切换 + 单体目标下拉框
- Timeline 支持在行动节点前后 / 任意 AV 处插入大招

### Phase 2 — 能量系统
- `InterventionType` 加入 `energy_gain`
- 引擎维护每实体能量状态，开局 `max_sp × 50%`
- AV=0 处理开局加能，大招节点能量校验

### Phase 3 — BUFF 系统
- `InterventionType` 加入 `stat_buff`
- 引擎维护 `activeInterventions`，每回合结束 tick
- 光环 BUFF 检测与临时叠加
- Playhead 显示能量 / BUFF 状态

### Phase 4 — 伤害计算
- 懒计算按钮 + `damageResult` / `damageStale` 字段
- 总伤害统计 UI（AV 范围输入）
- 对接现有 optimizer 计算管线
