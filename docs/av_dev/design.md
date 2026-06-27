# AV Visualizer 战斗模拟器 — 设计方案

## 核心定位

复刻崩铁的战斗行动系统，做成一个**交互式战斗模拟器**。

用户不是在"规划"时间轴，而是在逐个行动节点做决策——和真实打这场战斗的方式完全一样。

---

## 用户操作流程

```
导入角色（速度/遗器/光锥）
        ↓
系统生成默认 Timeline（全程普攻）
        ↓
用 Playhead 查看任意时刻的能量 / BUFF 状态
        ↓
选中某个行动节点 → 改为战技或大招（大招需能量满）
        ↓
系统从该节点起重新推算所有后续状态
```

---

## 行动与目标类型

### 行动类型（4 种）

| 类型 | 说明 |
|---|---|
| `basic` | 普通攻击 |
| `skill` | 战技 |
| `ult` | 终结技（需能量满） |
| `follow_up` | 追加攻击（由技能/天赋触发，非用户主动选择） |

### 目标类型（6 种）

| 类型 | 说明 |
|---|---|
| `self` | 自身 |
| `single_ally` | 选择一个队友（用户选择） |
| `all_allies` | 全部队友 |
| `single_enemy` | 单体敌人 |
| `blast` | 扩散（主目标 + 相邻，共 3 个敌人） |
| `all_enemies` | 群体（全部 5 个敌人） |

### 固定敌人配置

Phase 1-3 中所有敌人使用同一固定配置：

```
Level: 95        HP: 无限       SPD: 100
Toughness: 120
Resist: 全属性 20%
DamageReduction: 0%
```

扩散 = 3 个该敌人；群体 = 5 个该敌人。

---

## Phase 1 目标角色

Phase 1 聚焦直伤机制，不做击破队伍、不做忆灵。

| 角色 | 主要机制 | 实现难点 |
|---|---|---|
| 希儿 | 杀敌后复苏（额外回合） + SPD/DMG 提升 | 敌人 HP 无限，击杀无法自动检测，需要手动触发 |
| 景元 | 闪电主（召唤物，独立 AV）+ HPA 叠层 | 召唤物进入队列，HPA 影响神君速度和攻击次数 |
| 藿藿 | 大招一次性给全队回能 + ATK BUFF | `energy_gain + targets: 'all_allies'` 直接覆盖 |
| 花火 | 战技对单体队友拉条 50% | `av_advance` 直接覆盖；强化形态先跳过 |
| 阮梅 | 战技光环 BUFF（全队，释放者基准计时） | 光环 BUFF 系统直接覆盖 |

---

## 核心设计思路：扩展 Intervention，而非引入新系统

**不新建并行的效果系统。** 现有的 `Intervention` 已经是"在某个 AV 点对某些目标施加效果"的通用模型，只需扩展其类型即可覆盖能量、属性 BUFF 等所有战斗效果。

角色技能的效果 = **一组 Intervention 模板的绑定**。当角色在某个节点使用战技时，系统自动以当前 AV 为触发点，将这组 Intervention 模板展开注入到模拟队列中，走已有的处理逻辑。

手动添加的 Intervention（受击回能、自定义效果等）和技能自动触发的 Intervention 共用同一套引擎，没有区别。

---

## Intervention 类型扩展

现有类型：
```typescript
type InterventionType = 'spd_up' | 'spd_down' | 'av_advance' | 'av_delay'
```

扩展后：
```typescript
type InterventionType =
  | 'spd_up'       // 已有：速度提升（影响 AV）
  | 'spd_down'     // 已有：速度降低（影响 AV）
  | 'av_advance'   // 已有：直接拉条
  | 'av_delay'     // 已有：直接推条
  | 'energy_gain'  // 新增：目标回复指定能量（Phase 2）
  | 'stat_buff'    // 新增：属性加成（CR/CD/DMG等，Phase 4）
```

`stat_buff` 类型需要新增 `stat` 字段标识作用属性。`durationTurns` 字段已有，直接复用于持续类效果。

---

## 新增类型

### 行动选择与覆盖

```typescript
type ActionChoice = 'basic' | 'skill' | 'ult' | 'follow_up'

// 用户在某个行动节点做的决定（follow_up 由引擎自动产生，不走此类型）
type ActionNodeOverride = {
  characterId: string
  actionIndex: number   // 第几次行动（0-based）
  choice: ActionChoice
  targets?: string[]    // single_ally 类效果需指定目标 characterId
}
```

### 角色战斗配置

```typescript
// 单条 Intervention 模板（不含触发 AV，由引擎在行动时填入）
type InterventionTemplate = {
  type: InterventionType
  targets: 'self' | 'all_allies' | 'single_ally' | 'single_enemy' | 'blast' | 'all_enemies'
  value: number
  unit: 'flat' | 'percent'
  durationTurns?: number
  stat?: string            // stat_buff 专用

  // 光环 BUFF 专用
  buffKind?: 'direct' | 'aura'   // 不填默认 'direct'
  auraTargets?: 'all_allies' | 'all_enemies'
  auraEffect?: {
    type: InterventionType
    stat?: string
    value: number
    unit: 'flat' | 'percent'
  }
}

// 某个角色的完整战斗行为定义
type CharacterBattleConfig = {
  characterId: string
  // max_sp 直接从 game_data.json 读取，无需手写
  energyType: 'standard' | 'special'  // special 暂不支持

  abilities: {
    basic: InterventionTemplate[]
    skill: InterventionTemplate[]
    ult: InterventionTemplate[]
    follow_up?: InterventionTemplate[]
  }

  // 召唤物配置（景元等）
  summon?: {
    id: string           // 如 'jing_yuan_lightning_lord'
    baseSpd: number
    ownerId: string
    // 召唤物属性从主人 extras 派生的公式
    derivedSpd?: (ownerExtras: Record<string, number>) => number
  }

  // 角色自定义状态变更规则（叠层、特殊状态等）
  extrasOnAction?: {
    ability: ActionChoice
    patch: (currentExtras: Record<string, number>) => Record<string, number>
  }[]
}
```

### 战斗状态快照

```typescript
// 某一时刻单个实体（角色或召唤物）的完整状态
type CharacterBattleState = {
  energy: number
  spd: number
  activeInterventions: ActiveIntervention[]
  extras: Record<string, number>  // 自定义状态：景元的 hpa、希儿的复苏状态等
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
  remainingTurns: number   // direct = 接受者回合结束 tick，aura = 释放者回合结束 tick
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

### 队列实体（角色 + 召唤物统一）

```typescript
// Timeline 和队列中的实体，区分角色与召唤物
type BattleEntity = {
  id: string
  type: 'character' | 'summon'
  ownerId?: string     // summon 专用，指向主人 characterId
  name: string
  spd: number
  color: string
  slotIndex: number
}
```

### 战斗事件

```typescript
// 扩展自现有 SimEvent
type BattleEvent = {
  av: number
  characterId: string        // 实体 id（角色或召唤物）
  actionIndex: number
  actionChoice: ActionChoice

  effectiveSpd: number

  // 行动前后所有实体的完整状态快照（用于重算和 Playhead 显示）
  stateBefore: Record<string, CharacterBattleState>
  stateAfter: Record<string, CharacterBattleState>
}
```

---

## 召唤物设计

### 召唤物 vs 忆灵

| | 召唤物（Phase 1 支持） | 忆灵（Phase 1 不做） |
|---|---|---|
| 行动队列 | 有独立 AV | 有独立 AV |
| 行动选择 | 预定义，用户不可改 | 用户可操控（视同角色） |
| HP | 无独立 HP | 有独立 HP |
| 属性来源 | 继承主人，部分派生 | 完全独立 |
| 示例 | 景元闪电主 | — |

### 召唤物与主人的动态关联

**情况一：召唤物属性依赖主人叠层**
主人的 `extrasOnAction` 定义叠层如何变化；召唤物的 `derivedSpd` 从主人 `extras` 计算实时速度。叠层改变时，引擎自动对召唤物注入 `spd_up` Intervention 使速度同步。

**情况二：召唤物被外部效果拉条**
直接对召唤物 id 施加 `av_advance` Intervention，和对角色拉条完全一致。

### Phase 1 需要 `extras` 的角色

| 角色 | extras 字段 | 用途 |
|---|---|---|
| 景元 | `hpa` | 影响闪电主速度和每次行动攻击次数 |
| 希儿 | `resurgenceActive` | 标记复苏状态是否激活，影响额外回合判断 |

其余角色（藿藿、花火、阮梅）效果均可用 Intervention 直接覆盖，不需要自定义状态。

---

## UI 影响

### Timeline 行数动态化

当前 UI 写死 4 个角色槽（2×2 CharacterSlotCard）。加入景元后，闪电主作为独立行自动出现在 Timeline 中。

- Timeline 行数 = 角色数 + 召唤物数，动态计算
- CharacterSlotCard 区域布局需从固定 2×2 改为动态列表
- 召唤物行在 UI 上需有视觉区分（颜色标注 / 图标区别）

### 召唤物行动节点

召唤物的行动节点在 Timeline 上显示，但**不支持点击修改行动类型**（行动逻辑预定义）。可显示本次行动的攻击次数（如 HPA）。

---

## 现有代码的变动

| 现有内容 | 处理方式 |
|---|---|
| `InterventionType` | 扩展，加入 `energy_gain`、`stat_buff` |
| `Intervention` | 结构小幅扩展，加入 `stat`、`buffKind` 等字段 |
| `TimelineCharacter` | 扩展为 `BattleEntity`，加入 `type: 'character' \| 'summon'` |
| `simulateTimeline.ts` | 扩展引擎，加入能量、行动选择展开、召唤物、extras 逻辑 |
| `SimEvent` | 扩展为 `BattleEvent`，兼容现有用法 |
| `useAVVisualTabStore` | 新增 `actionOverrides`、`battleConfigs` 字段 |
| `avVisualTabController` | 新增对应 CRUD 方法 |
| Timeline UI | 行数动态化，召唤物行只读 |
| CharacterSlotCard 区域 | 从固定 2×2 改为动态列表 |

---

## 现有 optimizer 中可直接复用的数据

| 数据 | 来源 | 用途 |
|---|---|---|
| `DBMetadataCharacter.max_sp` | `game_data.json` | 每角色最大能量上限，无需手写 |
| `AbilityKind` | `turnAbilityConfig.ts` | 技能类型枚举，可参考 |
| `BUFF_ABILITY` | `buffSource.ts` | buff 来源描述，可参考 |

能量回复量、AV 效果、属性 BUFF 内容和持续回合等数据 optimizer 中**没有结构化存储**，需要在 `CharacterBattleConfig` 中手写。

---

## 开发阶段规划

### Phase 1 — 行动选择 + AV 效果 + 召唤物
- 新增 `ActionNodeOverride`、`BattleEntity`、`CharacterBattleConfig` 类型
- 手写 Phase 1 五个角色的 `CharacterBattleConfig`
- 扩展模拟引擎：行动选择展开 Intervention、召唤物入队、`extras` 状态维护
- Timeline 行数动态化，召唤物行只读显示
- Timeline 行动节点支持点击切换行动

### Phase 2 — 能量系统
- 扩展 `InterventionType` 加入 `energy_gain`
- 引擎维护每实体能量状态，`max_sp` 从 `game_data.json` 读取
- 开局默认 `max_sp × 50%`，AV=0 处理开局加能 Intervention
- 大招节点只在能量满时可选

### Phase 3 — BUFF 系统
- 扩展 `InterventionType` 加入 `stat_buff`
- 引擎维护 `activeInterventions`，每回合 tick（接受者/释放者基准分别处理）
- 光环 BUFF：引擎在每个实体行动时检查队伍中的光环并临时叠加
- Playhead 显示当前各实体激活的 BUFF

### Phase 4 — 伤害计算
- `BattleEvent` 中加入伤害字段
- 调用现有 optimizer 计算管线

---

## 待讨论的问题

见 `open-questions.md`
