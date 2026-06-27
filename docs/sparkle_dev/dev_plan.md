# 花火（SparkleB1）角色细化开发计划

## 目标

以花火为第一个完整细化对象，目标有两个：
1. **建立角色 Config 构建规范**：通过花火确立一套从"读数据 → 分边界 → 写行迹 → 写星魂 → 全量复现"的可复用流程
2. **完整复现花火 B1**：对齐真实游戏数值，覆盖所有技能、被动、行迹、星魂机制

---

## Step 1 — 回顾优化器 Config，了解星魂和行迹如何影响数值与机制

优化器中花火对应文件：`src/lib/conditionals/character/1300/SparkleB1.ts`

### 1.1 星魂升级规则（`AbilityEidolon`）

```typescript
const { basic, skill, ult, talent } = AbilityEidolon.SKILL_BASIC_3_ULT_TALENT_5
```

含义：**E3 升级战技和普攻**，**E5 升级大招和天赋**。具体体现为技能倍率从基础档升至升级档：

| 参数 | E0–E2 基础值 | E3+ 升级值 | 受哪颗星魂影响 |
|---|---|---|---|
| `skillCdBuffBase`（CD 基础加成） | 0.45 | 0.486 | E3 |
| `skillCdBuffScaling`（CD 比例加成系数）| 0.24 | 0.264 | E3 |
| `basicScaling`（普攻倍率）| 1.00 | 1.10 | E3 |
| `cipherTalentStackBoost`（大招 Cipher 层叠系数）| 0.06 | 0.0648 | E5 |
| `talentBaseStackBoost`（天赋基础层叠系数）| 0.04 | 0.044 | E5 |

### 1.2 星魂直接影响机制（1、2、4、6 魂）

| 星魂 | 效果 | 是否与 AV 相关 |
|---|---|---|
| E1 | Cipher 激活时，全队 SPD +15% | ✅ AV 相关（SPD buff）|
| E2 | Cipher 激活时，全队 DEF 穿透 per stack × 0.10 | ❌ 伤害计算，AV 无关 |
| E4 | 战技 Cipher 目标再获得额外 DMG 加成 | ❌ 伤害计算 |
| E6 | 战技 CD 比例加成系数额外 +0.30（即 `effectiveCdScaling += 0.30`）| ✅ 影响 CD buff 数值 |

### 1.3 行迹（Trace）影响

**被动 stat 加成**（来自 `traces` 字段，全解锁时固定加成到角色面板）：

| 行迹 stat | 加成值 |
|---|---|
| CRIT DMG | +0.24 |
| HP% | +0.28 |
| Effect RES | +0.10 |

**主要行迹（A2/A4/A6，触发机制变化）**：

| 行迹 | 效果 | AV 相关性 |
|---|---|---|
| A2（量子速度）| 花火自身在 Cipher 状态时，基础速度加成（内容待查）| 可能 AV 相关 |
| A4（群体 ATK%）| 花火在队时，全队永久 ATK +45%（SOURCE_TRACE）| ❌ 数值层面 |
| A6（RES 穿透）| 战技目标在 Cipher 状态时获得抵抗穿透 +10% | ❌ 数值层面 |

> **关键发现**：优化器中 ATK% 0.45 全队 buff 来自 `SOURCE_TRACE`（行迹 A4），是**永久被动**，不是大招效果。当前 AV Config 中 ult 里的 ATK_P buff 是错误的来源归属，需要移到"开局被动"位置。

---

## Step 2 — 对比优化器数据与现有 AV Config，划清边界

### 2.1 哪些数据来自项目已有数据（无需在 AV Config 重复定义）

| 数据 | 来源 | AV 引擎读取方式 |
|---|---|---|
| `max_sp`（能量上限 110）| `game_data.json → characters.1306b1.max_sp` | `getGameMetadata().characters[id].max_sp` |
| 基础速度（101）| `game_data.json → characters.1306b1.stats.SPD` | 用户在槽位输入面板速度 |
| 行迹 stat 加成（CRIT DMG +0.24 等）| `game_data.json → characters.1306b1.traces` | 面板速度已含行迹；CD buff 公式需另外处理 |
| 基础 CRIT DMG（0.50）| `game_data.json → characters.1306b1.stats.CRIT DMG` | 不直接读，CD buff 公式需用户输入面板 CD |

### 2.2 哪些需要 AV Config 自定义

| 内容 | 原因 |
|---|---|
| 技能模板（energy/SP/AV/buff 时序）| game_data 没有技能效果数据 |
| SP 上限加成（spCapBonus: 3）| 花火特有，需 AV Config 声明 |
| CD buff 动态公式（依赖花火面板 CD）| 需要运行时计算，优化器有但 AV 引擎未接入 |
| 行迹 A4 的全队 ATK% 被动 | AV 展示层需要表达（开局 stat buff）|
| E1 SPD buff（Cipher 时全队 +15%）| AV 引擎需追踪 SPD buff，E1 需进入 AV Config |
| E6 对 CD buff 数值的影响 | 影响战技 stat_buff 数值，需星魂参数化 |
| 开局效果（秘技：全队 +3 SP）| 无对应数据来源，AV Config 专属字段 |
| 星魂开关（E3/E5 升级技能等级）| 影响各技能 buff 数值 |

### 2.3 当前 AV Config 已知错误

| 字段 | 当前值 | 正确值 | 说明 |
|---|---|---|---|
| ult `sp_gain` | +6 | **+4** | 花火大招实际回 4 点 SP |
| ult `stat_buff ATK_P` | ult 中 +15% | **行迹被动永久存在** | 来源应为 A4 行迹，不属于大招 |
| skill `stat_buff CD` value | 固定 27% | **动态：0.45 + 0.24 × 面板CD** | 需动态计算 |
| skill `stat_buff CD` durationTurns | 1 | **1（目标下次行动前）** | 正确 |

---

## Step 3 — 完善 AV Config 的行迹内容

行迹对 AV Config 的影响分三类：

### 3.1 纯 stat 加成行迹（不需要 AV Config 处理）

CRIT DMG、HP%、Effect RES 等 stat 加成已体现在角色面板数值中，AV 引擎通过面板速度输入读取，**无需在 AV Config 中声明**。

### 3.2 影响技能数值的行迹

这类行迹改变技能模板的具体数值，需要在 Config 中体现：

- **战技 CD buff 公式**：`base = 0.45`，`scaling = 0.24`（E3 后分别为 0.486 / 0.264）
  - 最终 CD buff = `base + scaling × 花火面板CRIT DMG`
  - 需引入"动态数值"机制或在 UI 配置时注入
- **E6 额外 CD scaling +0.30**：`effectiveCdScaling = scaling + (e >= 6 ? 0.30 : 0)`

### 3.3 影响机制的主要行迹（A2/A4/A6）

- **A4（全队 ATK +45%）**：永久被动，需要在 BattleConfig 新增 `passiveTeamBuffs` 或 `battleStart` 字段表达
- **A2/A6**：当前 AV 阶段优先级较低，先标注 TODO

**待确立的新能力**：`CharacterBattleConfig` 新增 `battleStart?: InterventionTemplate[]` 字段用于开局一次性效果（秘技 +3 SP）和永久被动 buff（A4 ATK%）

---

## Step 4 — 完善 AV Config 的星魂内容

### 4.1 通过影响行迹等级来改变数值（E3、E5）

E3 和 E5 分别升级技能/普攻和大招/天赋的能力等级，对应技能模板数值变化：

| 星魂 | 影响能力 | AV Config 变化 |
|---|---|---|
| E3 | 战技 CD buff base：0.45 → 0.486；scaling：0.24 → 0.264 | skill `stat_buff` 数值参数化 |
| E3 | 普攻倍率 1.00 → 1.10 | 普攻伤害相关，AV 暂无需处理 |
| E5 | 天赋层叠系数微调 | AV 暂无需处理（天赋层数由伤害计算决定）|

### 4.2 直接改变机制（E1、E2、E4、E6）

| 星魂 | AV 相关？ | 处理方式 |
|---|---|---|
| E1：Cipher 激活时全队 SPD +15% | ✅ | 战技触发 `spd_up all_allies 15% aura`，天赋层/Cipher 状态驱动，durationTurns 由 Cipher 存续决定 |
| E2：DEF 穿透 | ❌ | 伤害计算层，AV Config 不处理 |
| E4：额外 DMG 加成 | ❌ | 伤害计算层，AV Config 不处理 |
| E6：战技 CD scaling +0.30 | ✅ | 战技 `stat_buff CD` 数值随 E6 增加 |

### 4.3 星魂参数化方案

将 `Sparkle.ts` 改写为工厂函数，接受星魂等级参数：

```typescript
export function buildSparkleConfig(eidolons: number): CharacterBattleConfig { ... }
```

`getBattleConfig()` 在读取 Config 时需要接受角色当前星魂等级，从 session 的 slot 数据中获取。

---

## Step 5 — 根据真实数据，完整复现花火 B1

在前四步的调研和规范确立后，执行最终实现：

### 5.1 数值校正清单

- [ ] ult `sp_gain`：+6 → **+4**
- [ ] ult `stat_buff ATK_P`：移除，改为 `battleStart` 中的永久行迹被动
- [ ] skill `stat_buff CD`：固定值 → 动态公式 `0.45 + 0.24 × 面板CD`（E3 后 `0.486 + 0.264 × 面板CD`）
- [ ] skill energy：核实是否为 30（待查游戏实际数据）
- [ ] basic energy：核实是否为 20

### 5.2 新增机制清单

- [ ] `battleStart`：秘技效果 `sp_gain team +3`
- [ ] `battleStart`：A4 行迹 ATK% +45% 全队永久 buff
- [ ] E1 星魂：战技触发时附加全队 `spd_up 15% aura`（Cipher 持续时间驱动）
- [ ] E6 星魂：skill CD scaling 从 0.24 变为 0.54（+0.30）

### 5.3 工厂函数重构

将 `battleConfigs/Sparkle.ts` 改为导出 `buildSparkleConfig(eidolons: number)` 工厂函数，并在 `battleConfigs/index.ts` 中注册，由 `getBattleConfig(id, eidolons)` 调用。

### 5.4 形成规范文档

所有在花火细化过程中确立的设计决策，整理到 `docs/char_config_standard.md`，作为后续角色参照模板。

---

## 进度追踪

| 步骤 | 状态 |
|---|---|
| Step 1 — 回顾优化器 Config | ✅ 已完成（见上文分析）|
| Step 2 — 划清数据边界 | ✅ 已完成（见上文分析）|
| Step 3 — 行迹内容完善 | 待开始 |
| Step 4 — 星魂内容完善 | 待开始 |
| Step 5 — 全量复现 | 待开始 |
