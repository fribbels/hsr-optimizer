# Step 1 — 回顾优化器 Config 详细记录

## 目标

从代码和数据两个维度理解优化器是如何表达花火的星魂和行迹的，并识别优化器覆盖不到、需要由 AV Config 补充的内容。

---

## 1. 优化器星魂/行迹的代码实现

### 1.1 技能等级由星魂参数化（`AbilityEidolon`）

入口是 `conditionals(e: Eidolon, withContent: boolean)` 工厂函数，`e` 是运行时传入的星魂等级（0–6）。

```typescript
// src/lib/conditionals/conditionalUtils.ts
export const ability = (upgradeEidolon: number) => {
  return function<T extends number, K extends number>(eidolon: number, value1: T, value2: K): T | K {
    return eidolon >= upgradeEidolon ? value2 : value1
  }
}
```

`AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5` 是一个预设配置对象：

```typescript
SKILL_BASIC_3_ULT_TALENT_5: {
  basic: ability(3),   // E3 时普攻倍率升级
  skill: ability(3),   // E3 时战技倍率升级
  ult:   ability(5),   // E5 时大招倍率升级
  talent: ability(5),  // E5 时天赋倍率升级
}
```

使用时，`skill(e, 0.45, 0.486)` 等价于 `e >= 3 ? 0.486 : 0.45`，即 E3 升级后战技 CD 基础加成从 0.45 升到 0.486。

**整个倍率系统的核心是：所有技能数值都在工厂函数调用时确定，是纯静态计算，没有运行时分支。**

### 1.2 行迹 stat 加成的数据流

行迹 stat 加成（CRIT DMG +0.24、HP% +0.28 等）完全来自 `game_data.json`，流程如下：

```
game_data.json
  └─ characters.1306b1.traces: { "CRIT DMG": 0.24, "HP%": 0.28, "Effect RES": 0.10 }
  └─ characters.1306b1.traceTree: [...]          ← 树形结构，用于"停用单条行迹"功能

metadataInitializer.ts
  └─ characters[id].traces = dbMetadataCharacter.traces   ← 加载到内存

calculateTraces.ts → calculateCustomTraces()
  └─ 基于 traceTree 减去"已停用"的行迹节点值（覆盖场景）
  └─ 返回最终 traces 对象

calculateStats.ts → calculateBaseStats()
  └─ trace 与 base（基础属性）、lightCone 并列作为第三个加成来源
  └─ sumPercentStat(Stats.CD, base, lc, trace, c, 0) 三源叠加
```

**行迹 stat 加成不经过任何 `conditionals.ts` 文件，它们是自动的静态加成，无需在角色 conditionals 里写任何代码。**

### 1.3 主要行迹（A2/A4/A6）机制的实现

主要行迹的"机制性"效果（不是 stat 加成，而是 buff）才需要在 conditionals 里写代码。以花火 A4 为例：

```typescript
// SparkleB1.ts → precomputeMutualEffectsContainer
// B1: ATK_P team buff 0.45 (via trace A4)
x.buff(StatKey.ATK_P, m.teamAtkBuff ? 0.45 : 0,
  x.targets(TargetTag.FullTeam).source(SOURCE_TRACE))
```

关键点：
- `SOURCE_TRACE` 明确标注来源为行迹（用于 UI 展示 buff 来源）
- `TargetTag.FullTeam` 表示全队生效
- `m.teamAtkBuff` 是 UI 上一个布尔开关（用户可以手动关掉以测试无花火情况）
- 这个效果写在 `precomputeMutualEffectsContainer` 里，意味着无论计算花火自身还是队友时都会执行

### 1.4 星魂直接改变机制（E1/E2/E4/E6）

```typescript
// E1: 花火 SPD +15%（自身条件 buff）
x.buff(StatKey.SPD_P, (e >= 1 && r.e1SpdBuff) ? 0.15 : 0, x.source(SOURCE_E1))

// E2: DEF 穿透（队友共享）
x.buff(StatKey.DEF_PEN, (e >= 2 && m.e2DefPen) ? 0.10 * m.talentStacks : 0,
  x.targets(TargetTag.FullTeam).source(SOURCE_E2))

// E6: 战技 CD scaling 额外 +0.30（在倍率定义处）
const effectiveCdScaling = skillCdBuffScaling + (e >= 6 ? 0.30 : 0)
```

三类处理位置：
| 位置 | 作用范围 | 对应花火例子 |
|---|---|---|
| `precomputeEffectsContainer` | 仅花火自身面板 | E1 SPD buff（仅花火获益）|
| `precomputeMutualEffectsContainer` | 队友视角计算中也生效 | A4 ATK%、E2 DEF 穿透（队友获益）|
| `precomputeTeammateEffectsContainer` | 仅作用于其他角色 | E6 影响战技 CD scaling（给被花火 buff 的角色）|

### 1.5 动态条件（`dynamicConditionals`）

花火的 CD buff 依赖"被 buff 角色的面板 CD"，是一个运行时动态计算，优化器用了特殊的 `dynamicConditionals` 机制：

```typescript
dynamicConditionals: [
  {
    id: 'SparkleCdConditional',
    type: ConditionalType.ABILITY,
    activation: ConditionalActivation.CONTINUOUS,
    dependsOn: [Stats.CD],   // 监听 CD 变化
    chainsTo: [Stats.CD],    // 每次 CD 变化时重新计算
    condition: (x, action, context) => r.skillBuffs,
    effect: (x, action, context) => {
      dynamicStatConversionContainer(Stats.CD, Stats.CD, this, x, action, context, SOURCE_SKILL,
        (convertibleValue) => convertibleValue * (skillCdBuffScaling + (e >= 6 ? 0.30 : 0)))
    },
  },
],
```

这是优化器专属机制——AV Config 目前不需要完全复现，只需要一个近似值或用户输入的固定值即可。

---

## 2. 可借鉴的写法

### 2.1 工厂函数 + `e` 参数（最重要）

优化器中每个角色 conditionals 都是 `(e: Eidolon, withContent: boolean) => Controller` 的工厂函数，`e` 在调用时传入。AV Config 应该完全复制这一模式：

```typescript
// AV Config 目标写法
export function buildSparkleConfig(e: number): CharacterBattleConfig {
  const skillCdBase = e >= 3 ? 0.486 : 0.45
  const skillCdScaling = e >= 3 ? 0.264 : 0.24
  const effectiveCdScaling = skillCdScaling + (e >= 6 ? 0.30 : 0)
  // ...
}
```

### 2.2 `ability(n)(e, base, upgraded)` 二值选择

这个工具函数极度简洁，可以直接在 AV 的 `buildSparkleConfig` 里复用或重写一个同等的：

```typescript
const skill = (e: number, v1: number, v2: number) => e >= 3 ? v2 : v1
const ult   = (e: number, v1: number, v2: number) => e >= 5 ? v2 : v1
```

### 2.3 `Source` 来源标注体系

优化器用 `SOURCE_SKILL`、`SOURCE_TRACE`、`SOURCE_E1` 等标注每个 buff 的来源，用于 UI 展示。AV Config 在 `InterventionTemplate` 中目前没有 `source` 字段，但未来可以参考这个体系。

### 2.4 区分"自身/队友/全队"三种作用域

优化器用三个不同的 `precompute*` 方法区分效果作用范围，AV Config 用 `targets: 'self' | 'single_ally' | 'all_allies' | 'team'` 字段表达同一概念，逻辑是一致的。

---

## 3. 可以直接用的数据

以下数据来自 `game_data.json`，AV 引擎已经可以直接读取：

| 字段 | SparkleB1 实际值 | AV 引擎读取路径 |
|---|---|---|
| `max_sp`（能量上限）| **110** | `getGameMetadata().characters[id].max_sp` → `ultThreshold` |
| `stats.SPD`（白字速度）| **101** | 用户输入面板速度时的参考基准 |
| `stats.CRIT DMG`（基础暴伤）| **0.50 (50%)** | 不直接读，但 CD buff 公式的 base 值来自这里 |
| `traces.CRIT DMG`（行迹暴伤）| **0.24 (24%)** | 同上，全解锁面板 CD = 基础 + 行迹 + 遗器 |
| `traces.HP%` | 0.28 | 不影响 AV 仿真 |
| `traces.Effect RES` | 0.10 | 不影响 AV 仿真 |
| `traceTree` | 9 个节点 | 仅用于验算行迹数值总和，无需在 AV 中直接处理 |

**关键推论**：花火面板 CD 的"行迹贡献"是固定的 +0.24（全解锁时），即花火的 CD buff 计算公式为：
```
cdBuff = 0.45 + 0.24 × 花火面板CD   (E0~E2)
         0.486 + 0.264 × 花火面板CD  (E3+)
         0.486 + 0.564 × 花火面板CD  (E3+E6)
```
其中"花火面板 CD"包含行迹 +0.24，用户需要手动输入实际面板数值（或未来从角色 store 读取）。

---

## 4. 优化器的覆盖范围 vs AV 系统需要补充的内容

### 4.1 优化器只覆盖了什么

优化器关注的是**一次伤害计算**的输入和输出，它的"时间轴"是静态的：给定一套遗器，计算角色在某次动作中的理论伤害。

优化器完整覆盖：
- ✅ **所有 stat 数值**（基础属性 + 行迹 + 遗器）
- ✅ **buff 的数值大小**（CD、ATK%、穿透等）
- ✅ **星魂对 buff 数值的影响**（E3 升倍率、E6 加系数等）
- ✅ **条件性 buff 的开关**（技能 buff 是否激活等）

### 4.2 优化器没有覆盖的内容（需要 AV Config 补充）

| 缺失内容 | 说明 | AV Config 如何处理 |
|---|---|---|
| **技能时序** | 谁先行动、什么时候出手 | `simulateBattle` 的 AV 队列 |
| **能量充能节奏** | 每次技能充多少能量，何时可以放大招 | `energy_gain` template |
| **SP 经济** | 战技消 1 SP，大招回 4 SP，SP 上限 8 | `sp_gain`/`sp_loss` template + `spCapBonus` |
| **AV 推进时序** | 战技推进目标 50% 行动值 | `av_advance` template |
| **buff 持续时间** | CD buff 持续几回合，大招 ATK buff 持续几回合 | `durationTurns` 字段 |
| **E1 SPD buff 的时序性** | E1 的 SPD +15% 是在战技触发后才生效，不是永久存在 | 战技里的 `spd_up` template（待实现）|
| **开局/秘技效果** | 秘技给全队 +3 SP，开局时一次性执行 | `battleStart` 字段（待实现）|
| **A4 行迹永久被动** | ATK% +45% 是永久存在不需要触发，但要在 AV 展示中体现 | `battleStart` 里的 `stat_buff`（待实现）|
| **条件触发的机制性 buff** | Cipher 状态本身的追踪（谁处于 Cipher、持续多久）| 未来可能需要"状态标记"机制 |

### 4.3 哪些内容优化器和 AV 都需要，但实现方式不同

| 内容 | 优化器做法 | AV Config 做法 |
|---|---|---|
| E3 技能倍率升级 | `skill(e, 0.45, 0.486)` 在工厂函数里 | `buildSparkleConfig(e)` 里同样写法 |
| E6 CD scaling +0.30 | `effectiveCdScaling += 0.30` | CD buff 数值计算时加入 E6 分支 |
| 全队 ATK% | `precomputeMutualEffectsContainer` 里 buff | `battleStart` 里 `targets: 'all_allies'` stat_buff |
| E1 SPD buff | `precomputeEffectsContainer` 里条件 buff | 战技 template 里 `spd_up all_allies`（仅 E1 时加入）|

---

## 5. 结论：Step 2 的工作方向

通过本轮调研确认：

1. **行迹 stat 加成**：完全来自 `game_data.json`，AV 引擎只需读 `max_sp`，其余 stat 加成不影响 AV 仿真逻辑
2. **行迹机制性效果（A4 ATK%）**：需要在 AV Config 的 `battleStart` 字段里实现（该字段目前尚未存在）
3. **星魂数值参数化**：AV Config 需要改为工厂函数，接受 `e: number` 参数，参照 `ability(n)(e, v1, v2)` 模式
4. **星魂机制（E1 SPD）**：需要在战技 template 里按 E1 条件插入 `spd_up` 类型（目前 AV 系统没有该 intervention 类型）
5. **CD buff 动态公式**：优化器用 `dynamicConditionals`，AV Config 短期用"用户输入固定 CD 值"代替，长期考虑从角色 store 读取

**Step 2 需要做的**：逐一对照 AV Config 现有字段，确认每条优化器效果能否对应到 AV 系统的某个机制，并列出需要新增的系统能力。
