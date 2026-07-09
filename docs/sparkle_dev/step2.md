# Step 2 — 对比优化器与 AV Config，划清数据边界

## 目标

在动手修改花火 Config 之前，先彻底理解 AV Config 系统的结构和引擎如何消费它，然后逐条对照优化器中的花火效果，确认每条效果在 AV 侧的处理方式，并列出已知错误和缺失的系统能力。

---

## 1. AV Config 系统结构详解

### 1.1 `CharacterBattleConfig` — 角色 Config 的根类型

```typescript
// src/lib/tabs/tabAvVisualizer/types.ts
type CharacterBattleConfig = {
  characterId: string           // 对应 game_data.json 的角色 ID（如 '1306b1'）
  energyType: 'standard' | 'special'  // 目前只有 standard 可用
  spCapBonus?: number           // 永久团队 SP 上限加成（花火：+3）
  ultThreshold?: number         // 触发大招所需最低能量；省略 = 等于 max_sp
  ultEnergyCost?: number        // 大招释放扣除的能量；省略 = 等于 ultThreshold
  abilities: {
    basic:      InterventionTemplate[]
    skill:      InterventionTemplate[]
    ult:        InterventionTemplate[]  // 由 UltInsertion 触发，不是行动选项
    follow_up?: InterventionTemplate[]
  }
  summon?: { ... }              // 召唤物（景元：雷鸣法王）
  extrasOnAction?: [...]        // 角色专属状态追踪（希儿：复活计数；景元：HPA 层数）
}
```

**`abilities` 中的每个数组**描述角色释放该技能时**触发的所有即时效果**。引擎在角色行动时按顺序执行这些 template，依次转换为带有 `triggerAv` 和已解析 `targets` 的 `Intervention` 对象并应用到战斗状态。

### 1.2 `InterventionTemplate` — 技能效果模板

这是一个**按 `type` 字段区分的联合类型**，不同 type 有不同必填字段：

| type | 含义 | 必填额外字段 | 举例 |
|---|---|---|---|
| `av_advance` / `av_delay` | 立即推进/延迟目标行动值 | — | 花火战技推进 50% |
| `energy_gain` / `energy_loss` | 立即改变角色能量 | — | 战技回 30 能量 |
| `sp_gain` / `sp_loss` | 立即改变团队战技点 | `targets` 只能是 `'team'` | 战技消耗 1 SP |
| `sp_cap_up` / `sp_cap_down` | 临时调整 SP 上限 | `durationTurns`，`targets` 只能 `'team'` | 花火大招 SP 上限+2 |
| `spd_up` / `spd_down` | 速度 buff/debuff | `durationTurns`，可选 `buffKind` | 希儿战技自身速度+25% |
| `stat_buff` / `stat_debuff` | 属性 buff/debuff | `stat`，`durationTurns`，可选 `buffKind` | 花火战技 CD buff |

**`buffKind` 字段**（`'direct'` | `'aura'`）决定 buff 的 tick 机制：
- `direct`（默认）：buff 挂在目标身上，目标每次行动 tick 一回合（目标行动 N 次后消失）
- `aura`：buff 挂在施放者身上，施放者每次行动 tick 一回合（阮梅的 buff 是 aura：她行动 3 次后消失）

**`targets` 字段**（`TargetType`）描述效果作用对象：
```typescript
type TargetType =
  | 'self'          // 仅花火自身
  | 'single_ally'   // 用户从 UI 下拉框选择的单个队友
  | 'all_allies'    // 全队所有角色
  | 'single_enemy'  // 单个敌人（仅用于 av_delay / stat_debuff）
  | 'team'          // 团队 SP 池（特殊，不对应具体角色）
```

### 1.3 引擎如何消费 Config

```
simulateBattle.ts 主循环
│
├─ 初始化阶段
│   ├─ getBattleConfig(id) → 读取 CharacterBattleConfig
│   ├─ getGameMetadata().characters[id].max_sp → 角色能量上限（自动读，无需在 Config 里写）
│   └─ sumSpCapBonus across all slots → team SP max = 5 + 所有角色的 spCapBonus 之和
│
└─ 每次角色行动
    ├─ 确认 actionChoice（basic / skill / follow_up）
    ├─ 取 config.abilities[actionChoice] 的 templates
    ├─ 每个 template → expandTemplate()：填入 triggerAv、解析 targets → Intervention
    └─ applyIntervention()：更新 charStates / energyStates / teamState / queue
```

**大招是特殊的**：`ult` 不在普通行动队列里，而是由 `UltInsertion` 驱动（用户在 UI 中手动安排），引擎在满足能量条件时触发 `processUlt()` 读取 `config.abilities.ult` 的 templates。

### 1.4 `extrasOnAction` — 角色专属状态追踪

当角色有需要追踪的内部状态（不是通用的速度/能量/SP），用 `extrasOnAction` 在每次特定技能被选择时更新 `extras` 对象：

```typescript
// 景元示例：技能触发 HPA+2，大招触发 HPA+3，上限 10 层
extrasOnAction: [
  { ability: 'skill', patch: (extras) => ({ ...extras, hpa: Math.min(10, (extras['hpa'] ?? 0) + 2) }) },
  { ability: 'ult',   patch: (extras) => ({ ...extras, hpa: Math.min(10, (extras['hpa'] ?? 0) + 3) }) },
]
```

`extras` 会传给 `summon.derivedSpd` 用于动态计算召唤物速度，也存入 `CharacterBattleState.extras` 供 UI 展示。

---

## 2. 引擎自动读什么 vs 需要 Config 手写什么

### 2.1 引擎从 `game_data.json` 自动读取的数据

| 数据 | 字段 | 用途 |
|---|---|---|
| 能量上限 | `characters[id].max_sp` | ultThreshold 默认值；初始能量 = max_sp × 50% |
| 白字速度 | `characters[id].stats.SPD` | percent SPD buff 转换基准（白字速度，即未包含遗器加成的速度）|

**AV 引擎不从 game_data.json 读取其他任何内容**。行迹 stat 加成、基础 CRIT DMG、ATK 等都与 AV 仿真无关，引擎只关心速度和能量这两个驱动时序的属性。

面板速度（包含遗器和光锥加成的最终速度）由用户在槽位卡片上手动输入，不是自动计算的。

### 2.2 必须在 Config 手写的内容

一切技能的**时序效果**都需要在 Config 里定义，因为 game_data.json 完全没有技能效果数据：

- 每次普攻/战技/大招/追击回多少能量
- 每次战技消耗/回复多少 SP
- 战技推进队友多少行动值（花火 50%）
- 技能给出的 buff（CD、ATK%、速度等）和持续时间
- SP 上限特殊加成（花火 +3）
- 开局效果和永久被动（目前无对应字段，是待实现的空白）

---

## 3. 花火优化器效果 → AV Config 映射对照表

以下将花火 SparkleB1 优化器中每条效果逐一对应到 AV Config 机制，并注明当前状态。

### 3.1 能量与大招阈值

| 优化器来源 | 数值 | AV Config 字段 | 当前状态 |
|---|---|---|---|
| `game_data.max_sp` | 110 | 无需写——引擎自动读 | ✅ 已自动处理 |
| 大招能量消耗 | = max_sp = 110（每次用完） | `ultEnergyCost` 省略即可 | ✅ 默认行为正确 |
| 初始能量 | max_sp × 50% = 55 | 引擎初始化时自动赋值 | ✅ 已自动处理 |

### 3.2 SP 系统

| 优化器来源 | 数值/效果 | AV Config 字段 | 当前状态 |
|---|---|---|---|
| SP 上限加成 | 花火在队：+3 | `spCapBonus: 3` | ✅ 已正确配置 |
| 普攻 SP | 普攻回 1 SP | `basic[].sp_gain team 1` | ✅ 已配置（优化器无此信息）|
| 战技 SP | 战技消 1 SP | `skill[].sp_loss team 1` | ✅ 已配置 |
| 大招 SP | 大招回 4 SP | `ult[].sp_gain team 4` | ❌ **当前写的是 +6，应为 +4** |
| 大招 SP 上限 | +2 临时上限（2 团队回合）| `ult[].sp_cap_up team 2 durationTurns:2` | ✅ 已配置 |

### 3.3 速度与行动值

| 优化器来源 | 数值/效果 | AV Config 字段 | 当前状态 |
|---|---|---|---|
| 战技 AV 推进 | 推进单一队友 50% | `skill[].av_advance single_ally 50 percent` | ✅ 已配置 |
| E1 Cipher 时全队 SPD +15% | `SOURCE_E1`，`TargetTag.FullTeam` | `skill[].spd_up all_allies 15 percent durationTurns:?` | ❌ **未实现；E1 时才需要加入；durationTurns 待确认** |

### 3.4 Buff 效果

| 优化器来源 | 数值/效果 | AV Config 字段 | 当前状态 |
|---|---|---|---|
| 战技 CD buff（A4 行迹驱动公式）| `base + scaling × 面板CD`，目标回合后过期 | `skill[].stat_buff single_ally CD durationTurns:1` | ⚠️ **字段存在但数值固定 27%，应为动态公式** |
| 大招 ATK% buff（实际为 A4 行迹永久被动）| 全队永久 +45%，`SOURCE_TRACE` | 应在 `battleStart`（永久 buff）| ❌ **当前错误地放在 ult 里，且数值 15% 错误（正确值 45%）** |
| E6 战技 CD buff 数值变化 | scaling 从 0.24 增至 0.54 | 工厂函数里 `effectiveCdScaling += 0.30` | ❌ **Config 无工厂函数；无法感知星魂** |

### 3.5 行迹 stat 加成

| 优化器来源 | 数值/效果 | AV Config 字段 | 状态 |
|---|---|---|---|
| CRIT DMG +0.24 | 面板 CD 加成 | 无需——不影响时序 | ✅ AV 无需处理 |
| HP% +0.28 | 面板血量加成 | 无需 | ✅ AV 无需处理 |
| Effect RES +0.10 | 抵抗加成 | 无需 | ✅ AV 无需处理 |
| A4 ATK% +45%（永久被动）| 全队加成 | 应写在 `battleStart` | ❌ **battleStart 字段尚未实现** |
| A6 RES 穿透 | Cipher 状态下穿透 | 无需（伤害计算层）| ✅ AV 无需处理 |

### 3.6 开局/秘技效果

| 效果 | 描述 | AV Config 字段 | 状态 |
|---|---|---|---|
| 秘技 | 战斗开始前给全队 +3 SP | `battleStart[].sp_gain team 3` | ❌ **battleStart 字段尚未实现** |

### 3.7 星魂参数化需求

| 星魂 | 效果 | 实现方式 | 状态 |
|---|---|---|---|
| E3 | 战技 CD base 0.45→0.486，scaling 0.24→0.264 | `buildSparkleConfig(e)` 工厂函数 | ❌ **Config 目前是静态对象，无法参数化** |
| E5 | 天赋系数微调（与 AV 无关）| 不需要在 AV Config 处理 | ✅ 无需处理 |
| E6 | CD scaling 额外 +0.30 | 工厂函数里 `skillCdScaling + (e >= 6 ? 0.30 : 0)` | ❌ 同上 |
| E1 | Cipher 时全队 SPD +15% | 工厂函数里，E1 条件下在 skill templates 里加 `spd_up` | ❌ 同上 |

---

## 4. 当前 `Sparkle.ts` 错误清单

按优先级排序，Step 3–5 中逐步修复：

| 编号 | 字段 | 当前值 | 正确值 | 修复时机 |
|---|---|---|---|---|
| #1 | `ult.sp_gain.value` | `6` | **4** | Step 5（数值校正）|
| #2 | `ult` 中的 `stat_buff ATK_P` | 存在，value=15 | **不应存在**（来源是行迹 A4 永久被动，不是大招效果）| Step 5 |
| #3 | `skill.stat_buff CD.value` | 固定 `27`（percent）| **动态：`base + scaling × 面板CD`**（E0: 0.45+0.24×CD；E3: 0.486+0.264×CD）| Step 5（引入工厂函数后）|
| #4 | 全局 | 静态对象 | **工厂函数 `buildSparkleConfig(e: number)`** | Step 4（引入星魂）|
| #5 | 缺少 E1 SPD buff | 无 | 战技里加 `spd_up all_allies 15 percent durationTurns:?` | Step 4 |
| #6 | 缺少 A4 永久 ATK% | 无 | `battleStart` 里 `stat_buff all_allies ATK_P 45%` | Step 3（引入 battleStart）|
| #7 | 缺少秘技效果 | 无 | `battleStart` 里 `sp_gain team 3` | Step 3 |

---

## 5. 需要新增的系统能力

通过上述对照，发现当前 AV Config/引擎有两处不支持花火完整复现的能力空白：

### 5.1 `battleStart` 字段（对应 Step 3）

**用途**：表达两类在时序上属于"战斗初始化"的效果：
1. **永久被动 buff**（行迹 A4 的全队 ATK% +45%）：战斗开始时给全队施加一个永久存在的 buff，不应有 durationTurns
2. **开局一次性效果**（秘技 +3 SP）：战斗开始时触发一次，之后不再重复

区别于 `abilities.skill` 等字段，`battleStart` 的效果只执行一次，且不依赖任何行动触发。

**类型设计草案**：
```typescript
type CharacterBattleConfig = {
  // ... 现有字段
  battleStart?: InterventionTemplate[]  // 战斗初始化时执行一次
}
```

**引擎改动**：在 `simulateBattle` 主循环的初始化阶段，遍历所有角色的 `battleStart` 并按顺序 apply。

**`durationTurns` 处理**：对于永久 buff，`durationTurns` 设为 `0` 表示永久（引擎不 tick）；或引入新的 `'permanent'` 常量——具体实现待 Step 3 设计时确定。

### 5.2 工厂函数 + 星魂参数（对应 Step 4）

**用途**：使 Config 能根据星魂等级参数化输出不同的技能数值。

**`index.ts` 改造**：`getBattleConfig` 需要接受星魂等级参数：
```typescript
export function getBattleConfig(characterId: string, eidolons?: number): CharacterBattleConfig | undefined
```

**注册方式改变**：`index.ts` 从导入静态对象改为导入工厂函数，在调用时传入星魂等级：
```typescript
// 现在：导入静态对象，自动注册
// 将来：导入工厂函数，按需调用
import { buildSparkleConfig } from './Sparkle'
registry.set('1306b1', (e) => buildSparkleConfig(e))
```

**星魂等级来源**：从 `useAVVisualTabStore` 的槽位数据（`slot.characterEidolons`）读取，在 `simulateBattle` 调用时传入。

---

## 6. 花火 CD buff 动态公式的处理策略

这是唯一一个依赖运行时角色面板数据（花火的面板 CRIT DMG）的效果，处理方式分三个阶段：

| 阶段 | 处理方式 | 缺点 |
|---|---|---|
| 当前（临时）| 固定值 27%（注释说明这是 CD ≈ 250% 时的估算）| 不准确，随花火装备变化 |
| Step 5（短期）| 工厂函数接受 `panelCd: number` 额外参数，用户在 UI 输入花火面板 CD | 需要用户手动输入 |
| 未来（长期）| 从 `characterStore` 读取花火当前遗器的 CD 属性，自动计算 | 最准确，但实现复杂 |

**Step 5 目标**：实现"短期"方案，即在 `CharacterSlotCard` 上增加可选的 CD 输入框（仅花火类角色显示），`buildSparkleConfig(e, panelCd)` 接受该值并计算正确的 CD buff 数值。

---

## 7. 本步骤结论

**能立刻用的**（无需系统扩展）：
- 修正 `ult.sp_gain` 从 +6 到 +4
- 移除 `ult` 里的 `stat_buff ATK_P`

**Step 3 需要实现的系统能力**：
- 在 `CharacterBattleConfig` 里增加 `battleStart?: InterventionTemplate[]` 字段
- 在 `simulateBattle` 初始化阶段处理 `battleStart` effects
- 为永久 buff 确定 `durationTurns: 0` 或 `'permanent'` 的语义

**Step 4 需要实现的系统能力**：
- `CharacterBattleConfig` 注册从静态对象改为工厂函数
- `getBattleConfig(id, eidolons?)` 接受星魂参数
- `Sparkle.ts` 改写为 `buildSparkleConfig(e, panelCd?)` 工厂函数

**Step 5 才处理的内容**：
- CD buff 动态数值（依赖工厂函数）
- E1 SPD buff 的持续时间确认（Cipher 存续时间待查）
- 全量数值校对
