# Step 2 — 实现子任务清单

依赖关系原则：先查 characterId（不猜），再逐个写 config 文件，最后整体验收。每个子任务结束后应能编译通过。

---

## Task 2.0 — 确认所有角色的 characterId（先决条件）

**文件**：只读，不写代码

**操作**：在 `src/lib/conditionals/character/` 下找到以下角色的 conditionals 文件，读取 `.id` 字段：

| 角色 | 预期文件位置 | 读取字段 |
|---|---|---|
| 花火（Sparkle） | `conditionals/character/1200/Sparkle.ts` 附近 | `Sparkle.id` |
| 希儿（Seele） | `conditionals/character/1100/Seele.ts` 附近 | `Seele.id` |
| 景元（Jing Yuan） | `conditionals/character/1200/JingYuan.ts` 附近 | `JingYuan.id` |
| 藿藿（Huohuo） | `conditionals/character/1200/Huohuo.ts` 附近 | `Huohuo.id` |
| 阮梅（Ruan Mei） | `conditionals/character/1300/RuanMei.ts` 附近 | `RuanMei.id` |

**注意事项**：
- 文件夹编号（1100/1200/1300）对应角色 ID 段，不一定完全准确，找不到时在上下相邻文件夹搜索
- 部分角色有多个文件（如 `FireflyB1.ts`）；只取对应正式角色的 `.id`，忽略 `B1` 等变体

**验收标准**：
- 记录下五个 characterId 字符串，后续任务直接使用，不写 TODO

---

## Task 2.1 — `battleConfigs/Sparkle.ts`

**文件**：新建 `tabAvVisualizer/battleConfigs/Sparkle.ts`

**改动**：写出完整的 `CharacterBattleConfig`，覆盖：

```typescript
import { Stats } from 'lib/constants/constants'
import type { CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'

export const SparkleConfig: CharacterBattleConfig = {
  characterId: '<从 Task 2.0 获取>',
  energyType: 'standard',
  spCapBonus: 3,
  abilities: {
    basic: [
      { type: 'energy_gain', targets: 'self', value: <待核实>, unit: 'flat' },
      { type: 'sp_gain',     targets: 'team', value: 1, unit: 'flat' },
    ],
    skill: [
      { type: 'av_advance', targets: 'single_ally', value: 50, unit: 'percent' },
      { type: 'stat_buff', targets: 'single_ally', stat: Stats.CD, value: 27, unit: 'percent', durationTurns: 1 },
      { type: 'sp_loss', targets: 'team', value: 1, unit: 'flat' },
    ],
    ult: [
      { type: 'stat_buff', targets: 'all_allies', stat: Stats.ATK_P, value: 15, unit: 'percent', durationTurns: 2 },
      { type: 'sp_gain', targets: 'team', value: 6, unit: 'flat' },
    ],
  },
}
```

**注意事项**：
- `spCapBonus: 3` 是顶层字段，不是 `InterventionTemplate`——引擎在初始化 `TeamBattleState.spMax` 时累加，不在技能触发时执行
- 战技 CD buff（`value: 27`）是估算值（公式 `6% × 面板CD + 12%`，CD ≈ 250%）；加注释 `// TODO: verify`
- 大招 ATK% buff（`value: 15`）待核实；加注释 `// TODO: verify`
- 大招 SP +6：施放者自身能量归零由 `UltInsertion` 引擎处理，不在 template 里写
- 导出名 `SparkleConfig` 或 `Sparkle`（任意），`import.meta.glob` 通过 `'characterId' in value` 自动识别，不依赖导出名

**验收标准**：
- `tsc --noEmit` 无新增错误
- `getBattleConfig('<sparkle_id>')` 返回配置，`spCapBonus === 3`
- `abilities.skill[1]` TypeScript 推断为 `stat_buff` variant（有 `stat` 字段）
- `abilities.ult[0]` TypeScript 推断为 `stat_buff` variant，`abilities.ult[1]` 推断为 `sp_gain` variant

---

## Task 2.2 — `battleConfigs/Seele.ts`

**文件**：新建 `tabAvVisualizer/battleConfigs/Seele.ts`

**改动**：

```typescript
import type { CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'

export const SeeleConfig: CharacterBattleConfig = {
  characterId: '<从 Task 2.0 获取>',
  energyType: 'standard',
  abilities: {
    basic: [
      { type: 'energy_gain', targets: 'self', value: <待核实>, unit: 'flat' },
      { type: 'sp_gain',     targets: 'team', value: 1, unit: 'flat' },
    ],
    skill: [
      { type: 'energy_gain', targets: 'self', value: <待核实>, unit: 'flat' },
      { type: 'spd_up', targets: 'self', value: <待核实>, unit: 'percent', durationTurns: <待核实> },
      { type: 'sp_loss', targets: 'team', value: 1, unit: 'flat' },
    ],
    ult: [
      { type: 'spd_up', targets: 'self', value: <待核实>, unit: 'percent', durationTurns: <待核实> },
    ],
  },
  extrasOnAction: [
    {
      ability: 'ult',
      patch: (extras) => ({ ...extras, resurgenceActive: 1 }),
    },
  ],
}
```

**注意事项**：
- 大招不消耗 SP，不加 `sp_loss`
- `extrasOnAction` 只是骨架，`resurgenceActive` 的完整驱动逻辑（触发额外回合、复苏状态下的 stat 提升）在 Step 9 实现；Step 2 只确保字段能写入且类型正确
- 战技和大招的 SPD 提升值与持续回合数从 Seele conditionals 文件核实；战技大约 +25% SPD 2 回合，大招大约 +25% SPD 2 回合（含复苏期间），数值加 `// TODO: verify`

**验收标准**：
- `getBattleConfig('<seele_id>')` 返回配置
- `abilities.skill` 包含 `spd_up` template（speed variant，有 `durationTurns`）和 `sp_loss` template
- `extrasOnAction[0].patch({ resurgenceActive: 0 })` 返回 `{ resurgenceActive: 1 }`

---

## Task 2.3 — `battleConfigs/JingYuan.ts`

**文件**：新建 `tabAvVisualizer/battleConfigs/JingYuan.ts`

**改动**：

```typescript
import type { CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'

const characterId = '<从 Task 2.0 获取>'

export const JingYuanConfig: CharacterBattleConfig = {
  characterId,
  energyType: 'standard',
  abilities: {
    basic: [
      { type: 'energy_gain', targets: 'self', value: <待核实>, unit: 'flat' },
      { type: 'sp_gain',     targets: 'team', value: 1, unit: 'flat' },
    ],
    skill: [
      { type: 'energy_gain', targets: 'self', value: <待核实>, unit: 'flat' },
      { type: 'sp_loss', targets: 'team', value: 1, unit: 'flat' },
    ],
    ult: [],
  },
  summon: {
    id: `${characterId}_lightning_lord`,
    baseSpd: 60,    // TODO: verify Lightning Lord base speed
    ownerId: characterId,
    derivedSpd: (extras) => 60 + (extras['hpa'] ?? 0) * 10,  // TODO: verify per-stack delta
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
}
```

**注意事项**：
- `summon.derivedSpd` 是函数，`CharacterBattleConfig` 不能序列化进 localStorage；该对象只存在内存中，不经过持久化
- `summon.ownerId` 必须与 `characterId` 完全一致，引擎用它来找归属关系
- `extrasOnAction` 顺序是 `skill` 在前、`ult` 在后，引擎按 `ability` 字段匹配，顺序不影响正确性，但保持一致性
- `Math.min(10, ...)` 确保 HPA 不超过上限 10；闪电主速度公式和上限值待核实，加 `// TODO: verify`
- 大招 `abilities.ult` 为空数组：大招本身无 AV/能量/BUFF 对外效果，hpa 变化由 `extrasOnAction` 处理

**验收标准**：
- `getBattleConfig('<jingyuan_id>')` 返回配置，`summon` 字段存在
- `config.summon!.derivedSpd!({ hpa: 5 })` 返回合理速度值（≥ 60）
- `extrasOnAction` 包含 2 条，`ability` 分别为 `'skill'` 和 `'ult'`

---

## Task 2.4 — `battleConfigs/Huohuo.ts`

**文件**：新建 `tabAvVisualizer/battleConfigs/Huohuo.ts`

**改动**：

```typescript
import type { CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'

export const HuohuoConfig: CharacterBattleConfig = {
  characterId: '<从 Task 2.0 获取>',
  energyType: 'standard',
  abilities: {
    basic: [
      { type: 'energy_gain', targets: 'self', value: <待核实>, unit: 'flat' },
      { type: 'sp_gain',     targets: 'team', value: 1, unit: 'flat' },
    ],
    skill: [
      { type: 'energy_gain', targets: 'self', value: <待核实>, unit: 'flat' },
      { type: 'sp_loss', targets: 'team', value: 1, unit: 'flat' },
    ],
    ult: [
      { type: 'energy_gain', targets: 'all_allies', value: 20, unit: 'percent' },
    ],
  },
}
```

**注意事项**：
- 大招 `energy_gain` 用 `unit: 'percent'`（回复 20% 最大能量），不是 `'flat'`——引擎在 Step 5 处理时需根据各角色 `max_sp` 换算实际回复量
- 大招目标是 `'all_allies'`，包含藿藿自身
- 大招不消耗 SP，不加 `sp_loss`

**验收标准**：
- `getBattleConfig('<huohuo_id>')` 返回配置
- `abilities.ult[0]` 的 `unit === 'percent'` 且 `targets === 'all_allies'`

---

## Task 2.5 — `battleConfigs/RuanMei.ts`

**文件**：新建 `tabAvVisualizer/battleConfigs/RuanMei.ts`

**改动**：

```typescript
import { Stats } from 'lib/constants/constants'
import type { CharacterBattleConfig } from 'lib/tabs/tabAvVisualizer/types'

export const RuanMeiConfig: CharacterBattleConfig = {
  characterId: '<从 Task 2.0 获取>',
  energyType: 'standard',
  abilities: {
    basic: [
      { type: 'energy_gain', targets: 'self', value: <待核实>, unit: 'flat' },
      { type: 'sp_gain',     targets: 'team', value: 1, unit: 'flat' },
    ],
    skill: [
      {
        type: 'stat_buff', targets: 'all_allies', stat: Stats.DMG_BOOST,  // TODO: verify stat key name
        value: 32, unit: 'percent', durationTurns: 3, buffKind: 'aura',
      },
      {
        type: 'stat_buff', targets: 'all_allies', stat: Stats.BE,
        value: 50, unit: 'percent', durationTurns: 3, buffKind: 'aura',
      },
      { type: 'sp_loss', targets: 'team', value: 1, unit: 'flat' },
    ],
    ult: [
      {
        type: 'stat_buff', targets: 'all_allies', stat: Stats.RES_PEN,
        value: 25, unit: 'percent', durationTurns: 2,  // TODO: verify duration
      },
    ],
  },
}
```

**注意事项**：
- 战技两条 `stat_buff` 均带 `buffKind: 'aura'`：buff 挂在阮梅身上，阮梅每次行动后 tick -1；引擎 Step 7 才实际处理光环逻辑，Step 2 只验证数据结构
- `Stats.DMG_BOOST` 是否为正确常量名需核实（可能是 `Stats.ALL_TYPE_DMG_BOOST` 或其他）；如果常量不存在，暂时写字符串字面量并加 `// TODO: replace with Stats.xxx`
- 大招不含 `buffKind: 'aura'`，默认 `direct`（buff 直接叠在目标身上，各自 tick）
- 大招持续回合数（`durationTurns: 2`）待核实，加 `// TODO: verify`

**验收标准**：
- `getBattleConfig('<ruanmei_id>')` 返回配置
- `abilities.skill[0].buffKind === 'aura'` 且 TypeScript 推断为 `stat_buff` variant
- `abilities.skill[1].stat === Stats.BE`（或确认后的正确常量）
- `abilities.ult[0]` 无 `buffKind` 字段（使用默认 direct）

---

## 整体验收

完成全部子任务后：

- [ ] `tsc --noEmit` 无新增错误（仅保留 `AvVisualizerTab.tsx` 预存的 2 条 i18n 错误）
- [ ] 五个文件均被 `battleConfigs/index.ts` 的 `import.meta.glob` 自动发现
- [ ] `getBattleConfig(id)` 对五个 characterId 均返回正确配置，对未知 id 返回 `undefined`
- [ ] `stat_buff` variant 缺少 `stat` 字段时 TypeScript 即时报错（验证 discriminated union 正常工作）
- [ ] `sp_cap_up` variant 缺少 `durationTurns` 时 TypeScript 即时报错
- [ ] 所有 `// TODO: verify` 数值已在注释中说明估算依据
