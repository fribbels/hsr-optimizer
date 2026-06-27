# Step 2 — Phase 1 角色 BattleConfig

## 目标

为 Phase 1 五个角色手写 `CharacterBattleConfig`，放入 `battleConfigs/`，验证：

1. `battleConfigs/index.ts` 的 `import.meta.glob` 自动注册正确工作
2. `InterventionTemplate` discriminated union 的各 variant 均能被正确表达
3. `CharacterBattleConfig` 结构足够承载后续步骤的需求

---

## 重要约束

- **只描述时间轴行为**：AV 位移、SPD 变动、能量/SP 变化、BUFF 挂载时机。伤害倍率、属性缩放不写在这里（由 `conditionals/` 负责）。
- **E0 满级写死固定值**，不做星魂分支函数。星魂对时间轴有影响的（如拉条量提升）可后续按需扩展。
- `energy_gain`、`sp_gain/loss/cap`、`stat_buff` 类型的 template 在 Step 2 写入，但引擎 Step 5/7 才处理，写入是为了**验证数据结构**，不是为了让它们立即生效。
- **SP 的通用规则**：普通攻击 `+1 sp_gain`，战技 `-1 sp_loss`——几乎所有角色都相同，每个 config 必须显式写出（引擎不隐含默认值）。
- **Stat key 命名**：一律使用 `Stats.CD`、`Stats.ATK_P` 等常量（从 `lib/constants/constants` 导入），不硬编码字符串。
- **characterId 来源**：从对应 `conditionals/` 文件的 `.id` 字段获取，不猜测。
- **数值估算**：游戏数值不确定时加 `// TODO: verify` 注释，Phase 3 前补正。

---

## 子任务

### 2.1 花火（Sparkle）— `battleConfigs/Sparkle.ts`

首选起点。战技同时覆盖 `av_advance` 和 `stat_buff` 两个 variant，能一次验证 discriminated union 的正确性。大招还覆盖 `sp_cap_up`，是 SP 上限变动的唯一测试案例。

#### 技能效果（E0，仅时间轴相关部分）

| 技能 | 效果 | Template 类型 | 生效步骤 |
|---|---|---|---|
| 被动 | SP 上限永久 +3（在队时生效） | `spCapBonus: 3`（顶层字段，非 template） | Step 5 |
| 普通攻击 | 自身回能 | `energy_gain`, `self` | Step 5 |
| 普通攻击 | 团队 +1 SP | `sp_gain`, `team`, 1 | Step 5 |
| 战技 | 单体队友拉条 50% | `av_advance`, 50%, `percent`, `single_ally` | Step 3 ✅ |
| 战技 | 叠加 CD 给目标 1 回合 | `stat_buff`, `Stats.CD`, `single_ally`, `durationTurns: 1` | Step 7 |
| 战技 | 团队 -1 SP | `sp_loss`, `team`, 1 | Step 5 |
| 大招 | 全队 ATK% 提升 2 回合 | `stat_buff`, `Stats.ATK_P`, `all_allies`, `durationTurns: 2` | Step 7 |
| 大招 | 团队 +6 SP | `sp_gain`, `team`, 6 | Step 5 |

#### CD 叠加量的处理

花火战技 CD buff 量 = `6% × 自身面板CD + 12%`（估算公式，需核实）。

Phase 1 写典型值：花火面板 CD ≈ 250% 时，buff ≈ 27%。加注释说明是估算，Phase 3 伤害计算接入时再动态化。

#### 大招能量处理

大招能量消耗（施放者能量归零）由 `UltInsertion` 处理逻辑负责，不放在 template 里。`abilities.ult` 只放大招产生的**对外效果**。

#### 代码骨架

```ts
import { Stats } from 'lib/constants/constants'
import type { CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'

export const SparkleConfig: CharacterBattleConfig = {
  characterId: '1222', // TODO: verify from Sparkle.id in conditionals/
  energyType: 'standard',
  spCapBonus: 3,        // Permanent +3 SP cap while Sparkle is in team (default 5 → 8)
  abilities: {
    basic: [
      { type: 'energy_gain', targets: 'self', value: 20, unit: 'flat' }, // TODO: verify
      { type: 'sp_gain',     targets: 'team', value: 1,  unit: 'flat' },
    ],
    skill: [
      { type: 'av_advance', targets: 'single_ally', value: 50, unit: 'percent' },
      {
        type: 'stat_buff',
        targets: 'single_ally',
        stat: Stats.CD,
        value: 27,        // TODO: verify — estimated from 6% × 250% CD + 12%
        unit: 'percent',
        durationTurns: 1,
      },
      { type: 'sp_loss', targets: 'team', value: 1, unit: 'flat' },
    ],
    ult: [
      {
        type: 'stat_buff',
        targets: 'all_allies',
        stat: Stats.ATK_P,
        value: 15,        // TODO: verify ult ATK buff %
        unit: 'percent',
        durationTurns: 2,
      },
      { type: 'sp_gain', targets: 'team', value: 6, unit: 'flat' },
    ],
  },
}
```

#### 验收

- `tsc --noEmit` 无新增错误
- `getBattleConfig('1222')` 返回花火配置，且 `spCapBonus === 3`
- `abilities.skill[1]` 被 TypeScript 推断为 `stat_buff` variant（有 `stat` 字段，有 `durationTurns`）
- `abilities.ult[1]` 为 `sp_gain`，`value === 6`

---

### 2.2 希儿（Seele）— `battleConfigs/Seele.ts`

#### 特殊机制

复苏（Resurgence）额外回合：击杀后触发，由 `ActionNodeOverride.triggerResurgence` 控制，`extras.resurgenceActive` 记录状态。Step 2 只写 `extrasOnAction` 骨架，Step 9 完整实现。

#### 技能效果

| 技能 | 效果 | Template 类型 | 备注 |
|---|---|---|---|
| 普通攻击 | 自身回能 | `energy_gain`, `self` | 值待查 |
| 普通攻击 | 团队 +1 SP | `sp_gain`, `team`, 1 | |
| 战技 | 自身回能 + SPD 提升 | `energy_gain` + `spd_up`, `self`, `durationTurns: 2` | SPD 值待查 |
| 战技 | 团队 -1 SP | `sp_loss`, `team`, 1 | |
| 大招 | 自身 SPD 提升（复苏状态） | `spd_up`, `self`, `durationTurns: 2` | 持续回合数待查 |

`extrasOnAction` 预留骨架（Step 9 填充完整逻辑）：

```ts
extrasOnAction: [
  {
    ability: 'ult',
    patch: (extras) => ({ ...extras, resurgenceActive: 1 }),
  },
],
```

#### 验收

- `getBattleConfig(seeleId)` 返回配置
- `abilities.skill` 包含 `spd_up` template 和 `sp_loss` template

---

### 2.3 景元（Jing Yuan）— `battleConfigs/JingYuan.ts`

#### 特殊机制

召唤物闪电主（Lightning Lord），速度随 `extras.hpa`（追加攻击叠层，0-10）动态变化。

#### 技能效果

| 技能 | 效果 | Template 类型 |
|---|---|---|
| 普通攻击 | 自身回能 | `energy_gain`, `self` |
| 普通攻击 | 团队 +1 SP | `sp_gain`, `team`, 1 |
| 战技 | 自身回能 | `energy_gain`, `self` |
| 战技 | hpa +2（由 extrasOnAction 处理） | — |
| 战技 | 团队 -1 SP | `sp_loss`, `team`, 1 |
| 大招 | hpa +3（由 extrasOnAction 处理） | — |

`hpa` 叠层变化在 `extrasOnAction` 里更新，闪电主速度通过 `derivedSpd` 推导：

```ts
summon: {
  id: 'jing_yuan_lightning_lord',
  baseSpd: 60,  // TODO: verify Lightning Lord base speed
  ownerId: characterId,
  derivedSpd: (extras) => 60 + (extras['hpa'] ?? 0) * 10, // TODO: verify per-stack delta
},
extrasOnAction: [
  {
    ability: 'skill',
    patch: (extras) => ({ ...extras, hpa: Math.min(10, (extras['hpa'] ?? 0) + 2) }),
  },
  {
    ability: 'ult',
    patch: (extras) => ({ ...extras, hpa: Math.min(10, (extras['hpa'] ?? 0) + 3) }),
  },
],
```

#### 验收

- 配置包含 `summon` 字段，TypeScript 类型正确
- `derivedSpd(extras)` 在 `hpa=5` 时返回合理速度值

---

### 2.4 藿藿（Huohuo）— `battleConfigs/Huohuo.ts`

标准用例：大招 `energy_gain` 打 `all_allies`，是 Step 5 能量系统的主要验收场景之一。

#### 技能效果

| 技能 | 效果 | Template 类型 |
|---|---|---|
| 普通攻击 | 自身回能 | `energy_gain`, `self` |
| 普通攻击 | 团队 +1 SP | `sp_gain`, `team`, 1 |
| 战技 | 自身回能 | `energy_gain`, `self` |
| 战技 | 团队 -1 SP | `sp_loss`, `team`, 1 |
| 大招 | 全队回复 20% 能量 | `energy_gain`, `all_allies`, 20, `percent`，Step 5 生效 |

大招不消耗 SP（独立于 SP 系统）。

#### 验收

- `abilities.ult` 包含 `targets: 'all_allies'` 的 `energy_gain` template

---

### 2.5 阮梅（Ruan Mei）— `battleConfigs/RuanMei.ts`

#### 特殊机制

光环 BUFF（`buffKind: 'aura'`）：buff 挂在阮梅身上，由阮梅的回合 tick -1，队友行动时受益。Step 7 完整处理光环逻辑，Step 2 预埋数据结构。

#### 技能效果

| 技能 | 效果 | Template 类型 | 备注 |
|---|---|---|---|
| 普通攻击 | 自身回能 | `energy_gain`, `self` | |
| 普通攻击 | 团队 +1 SP | `sp_gain`, `team`, 1 | |
| 战技 | 全队伤害提升 32%（光环） | `stat_buff`, `Stats.DMG_BOOST`, `all_allies`, 32%, `buffKind: 'aura'`, `durationTurns: 3` | stat key 待核实 |
| 战技 | 全队击破效率 +50%（光环） | `stat_buff`, `Stats.BE`, `all_allies`, 50%, `buffKind: 'aura'`, `durationTurns: 3` | |
| 战技 | 团队 -1 SP | `sp_loss`, `team`, 1 | |
| 大招 | 全队属性穿透 +25% | `stat_buff`, `Stats.RES_PEN`, `all_allies`, 25%, `durationTurns: 2` | 持续回合数待查 |

战技两条 `stat_buff` 均为 `aura`（buff 挂在阮梅身上，阮梅行动后 tick -1，队友行动时受益）。大招直接叠在队友身上（`direct` 默认），Step 7 生效。

#### 验收

- `abilities.skill` 包含 2 条 `buffKind: 'aura'` 的 `stat_buff` template（`DMG_BOOST` 和 `BE`）及 1 条 `sp_loss`
- TypeScript 推断两条 stat_buff template 为 stat variant（有 `stat` 字段，有 `durationTurns`）

---

### 2.6 整体验收

- 五个文件均被 `battleConfigs/index.ts` 的 `import.meta.glob` 自动发现
- `getBattleConfig(id)` 对每个 characterId 均返回正确配置，对未知 id 返回 `undefined`
- `tsc --noEmit` 无新增错误
- `sp_cap_up` variant 缺少 `durationTurns` 时 TypeScript 报错（验证 discriminated union 正常工作）
- `stat_buff` variant 缺少 `stat` 字段时 TypeScript 报错

---

## 数值核实清单

实现前需从 `conditionals/` 文件或游戏 wiki 确认以下值：

| 角色 | 待确认项 |
|---|---|
| 花火 | `characterId`；战技 CD buff 公式；普攻/战技自身回能量；大招 ATK% 值；大招 SP 回复量 |
| 希儿 | `characterId`；战技 SPD 提升值和持续回合；大招 SPD 提升值和持续回合 |
| 景元 | `characterId`；闪电主基础速度；每层 HPA 速度增量 |
| 藿藿 | `characterId` |
| 阮梅 | `characterId`；战技 `DMG_BOOST` 对应的 `Stats` 常量名；大招持续回合数 |
