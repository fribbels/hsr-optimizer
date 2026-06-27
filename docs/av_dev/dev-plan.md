# AV Visualizer 战斗模拟器 — 开发计划

核心原则：**每一步结束都有可以在浏览器里看到的东西**，不要攒到最后才能运行。

---

## 数据复用说明

开发前先明确哪些数据可以直接用，哪些需要手写：

| 数据 | 来源 | 是否需要新增 |
|---|---|---|
| 角色面板速度 / 全属性 | `getShowcaseStats()` | 否，直接用 |
| 最大能量 `max_sp` | `getGameMetadata().characters[id].max_sp` | 否，直接读 |
| 角色名字 | `t(\`${characterId}.Name\`)` | 否，直接用 |
| 遗器 / 光锥属性 | `getPreviewRelics()` + `getShowcaseStats()` | 否，直接用 |
| 技能效果（回能量、AV效果、BUFF） | 无 | **是，手写 `CharacterBattleConfig`** |
| 伤害数值计算 | `conditionals/` + optimizer 管线 | 否，Phase 4 直接调用 |

**不需要为这个页面另建角色 / 遗器 / 光锥的专用数据格式。** 只有描述战斗行为的 `CharacterBattleConfig` 需要手写，存放在 `tabAvVisualizer/battleConfigs/<Name>.ts`（英文角色名命名），每角色一个文件，由 `battleConfigs/index.ts` 通过 `import.meta.glob` 自动注册。

### CharacterBattleConfig 与伤害计算的关系

`CharacterBattleConfig` 只描述**时间轴行为**——谁在什么时候行动、技能拉谁多少条、给谁加速、持续几回合。伤害数值由已有的 `conditionals/` 体系负责，两套系统职责不重叠：

| | `CharacterBattleConfig` | `conditionals/` |
|---|---|---|
| 负责什么 | AV 位移、能量变动、BUFF 挂载 | 给定配装，伤害是多少 |
| Phase 4 时 | 提供 `stateBefore` 状态快照 | 被调用计算 `damageResult` |

因此 `CharacterBattleConfig` 中不需要写伤害倍率、星魂分支、光锥词条——这些 `conditionals/` 已经有完整实现。配置中只填 E0 满级的技能效果固定值，星魂 / 行迹对时间轴有影响的（如拉条量随星魂提升）可在后续按需扩展。

---

## 开发步骤

### Step 1 — 类型定义 ✅ 已完成

**结果**：所有新类型写入 `types.ts`（单文件，与其他 tab 保持一致）。

**类型变动**：
- `InterventionType`：扩展加入 `energy_gain | energy_loss | stat_buff | stat_debuff`，按引擎行为分组注释
- `Intervention`：追加可选字段 `stat?`、`buffKind?`、`auraTargets?`（向后兼容，旧数据不受影响）
- `SimEvent`：**已删除**，替换为 `BattleEvent`
- `TimelineCharacter`（原定义在 `Timeline.tsx`）：**已删除**，替换为 `BattleEntity`
- **新增**：`TurnKind`、`ActionChoice`、`TargetType`、`InterventionTemplate`（discriminated union，3 个 variant）、`CharacterBattleConfig`、`ActionNodeOverride`、`UltTiming`、`UltInsertion`、`ActiveIntervention`、`CharacterBattleState`、`BattleEntity`、`BattleEvent`

**同步改动**：
- `simulateTimeline.ts`：返回类型改为 `BattleEvent[]`，新增字段填入占位值（Step 3 替换）
- `avVisualTabController.ts`：`simulate()` 返回类型同步
- `Timeline.tsx`：`EnrichedSimEvent` 改为继承 `BattleEvent`，删除 `TimelineCharacter`
- `AvVisualizerTab.tsx`：改用 `BattleEntity`，构造时加 `type: 'character'`
- `InterventionItem.tsx`：`TYPE_VISUAL` Record 补充 4 个新类型的图标和颜色
- **新建** `battleConfigs/index.ts`：`import.meta.glob` 自动注册框架，初始 registry 为空

**验收**：`tsc --noEmit` 无新增错误，`simulateTimeline.test.ts` 41/41 通过，Tab 渲染无变化。

**详细设计**：见 `step1.md` / `step1_tasks.md`。

---

### Step 1.5 — 补全 SP（战技点）类型

**背景**：战技点（Skill Points）是全队共享资源，默认上限 5，部分角色可临时提升上限（如花火大招 +2）。Step 1 设计时遗漏，在此补全。

**改动范围（均在已完成的 Step 1 文件基础上追加）**：

- `InterventionType`：新增 `sp_gain | sp_loss | sp_cap_up | sp_cap_down`
- `TargetType`：新增 `'team'`（SP 是不可分割的共享池，与 `'all_allies'` 语义不同）
- `InterventionTemplate`：新增 2 个 variant
  - `sp_gain | sp_loss`：即时，`targets: 'team'`，`unit: 'flat'`
  - `sp_cap_up | sp_cap_down`：有 `durationTurns`，`targets: 'team'`，`unit: 'flat'`
- 新增 `TeamBattleState { sp: number; spMax: number }`
- `BattleEvent`：新增 `teamStateBefore / teamStateAfter: TeamBattleState`（Step 3 前填占位值 `{ sp: 0, spMax: 5 }`）
- `simulateTimeline.ts`：`results.push(...)` 补充两个 team 字段占位值
- `InterventionItem.tsx`：`TYPE_VISUAL` 补充 4 条 SP 图标（`IconCirclePlus/Minus`、`IconLayoutGridAdd/Remove`）

**验收**：`tsc --noEmit` 无新增错误，`simulateTimeline.test.ts` 41/41 通过。

---

### Step 2 — 第一个角色 BattleConfig（花火 / Sparkle）

> **名称说明**：花火 = Sparkle（量子命途：虚无），流萤 = Firefly（火属性 DPS），两者不同。

**目标**：验证 `CharacterBattleConfig` 结构合理，写通一个角色再写其他角色。

花火（Sparkle）是合适的起点——战技同时覆盖 `av_advance` 和 `stat_buff` 两个 variant，能一次验证 `InterventionTemplate` 的 discriminated union 设计是否合理。

**花火技能效果（E0，只写时间轴相关部分）：**

| 技能 | 效果 | InterventionTemplate |
|---|---|---|
| 普通攻击 | 自身回能 | `energy_gain`（Phase 2 生效）|
| 战技 | 单体队友拉条 50% | `av_advance` 50%，`single_ally` |
| 战技 | 叠加自身 CD 给目标 | `stat_buff` CD，`single_ally`，固定回合数 |
| 大招 | 回 SP + 全队 DMG 提升 | SP = Phase 2；DMG buff = `stat_buff`，Phase 3 生效 |
| 天赋 | SP 消耗时触发 ATK 提升 | 被动，Phase 1 跳过 |

**值的处理**：CD 叠加量依赖花火自身面板，Phase 1 填典型值（约 55-60%）并注释说明是估算；行迹、星魂、光锥对时间轴无直接影响的全部跳过；遗器速度已由 `getShowcaseStats()` 体现，无需重复配置。

文件位置：`tabAvVisualizer/battleConfigs/Sparkle.ts`

完成后按同样结构补充其余 Phase 1 角色：
- 希儿（`extras.resurgenceActive` + 额外回合）
- 景元（`extras.hpa` + 召唤物配置）
- 藿藿（`energy_gain` 全队）
- 阮梅（光环 BUFF）

**可视结果**：无，但类型和数据结构经过验证。

---

### Step 3 — 扩展模拟引擎（不含能量）

**目标**：将 `simulateTimeline.ts` 扩展为 `simulateBattle.ts`，先只处理 AV 效果。

本步骤范围：
- 读取 `ActionNodeOverride`，将对应技能的 `InterventionTemplate[]` 展开注入队列
- 支持 `BattleEntity`（character / summon 区分），暂时只处理 character
- 暂时跳过：能量、BUFF、召唤物、extras

同步更新：
- `useAVVisualTabStore`：新增 `actionOverrides`、`battleConfigs` 字段
- `avVisualTabController`：新增对应 CRUD 方法

**建议**：先写单测验证引擎逻辑（参考现有 `simulateTimeline.test.ts`）。

**可视结果**：无（引擎改动，尚未接入 UI）。

---

### Step 4 — UI：行动节点点击交互 ✅ 第一个可视检查点

**目标**：点击 Timeline 上的行动节点，可以切换 basic / skill，立刻看到 AV 变化。

需要改动：
- `ActionMarker.tsx`：加点击交互，弹出行动类型选择
- 若选中技能含 `single_ally` 效果，显示目标选择下拉框
- 下拉框选项 = 当前队伍中其他角色

**验收**：点花火的行动节点选"战技"，被拉条的队友 AV 在 Timeline 上立刻前移。

---

### Step 4.5 — UI 重构：右侧上下文面板 ✅ 已完成

**背景**：Step 4 完成后，行为选择入口在 ActionMarker 的 Popover 上，操作路径隐蔽且与 ActionDisplayPanel 割裂。改为将行为选择整合到 ActionDisplayPanel 内部，右侧面板统一改为上下文感知的多面板槽位。

**核心架构变更：RightPanelContext**

原来 `editRequest: EditRequest | null` 单一状态只能驱动 EditPanel 一种面板。现改为判别联合：

```typescript
type RightPanelContext =
  | { kind: 'idle' }
  | { kind: 'add-branch'; triggerAv: number; afterCharId?; afterActionIndex?; beforeCharId?; beforeActionIndex? }
  | { kind: 'intervention'; request: EditRequest }
  | { kind: 'action-config'; characterId: string; actionIndex: number }
  | { kind: 'character-state'; characterId: string }
```

Playhead 移动时重置为 `idle`（与原来的清除逻辑一致）。

**文件变动**

| 文件 | 变化 |
|---|---|
| `EditPanel.tsx` | 重命名为 `InterventionEditPanel.tsx`，内部逻辑不变 |
| `ActionMarker.tsx` | 去掉 Popover / SegmentedControl / Select，回归纯展示；移除 4 个 props |
| `TimelineRow.tsx` | 去掉 `allCharacters` prop 及向 ActionMarker 的多余传参 |
| `Timeline.tsx` | 去掉 `allCharacters` useMemo |
| `ActionDisplayPanel.tsx` | 新增**行为行**（显示当前行为，点击 → action-config）；头像/角色名点击 → character-state；"+" 改为触发 add-branch；prop 由 `request/onRequest` 改为 `activeContext/onContextChange` |
| `AddBranchPanel.tsx`（新建） | 分支选择：添加 Intervention / 添加大招（禁用，Step 6 启用） |
| `ActionConfigPanel.tsx`（新建） | 普攻/战技切换 + 单体目标选择 + 效果预览列表（从 `getBattleConfig` 静态读取 InterventionTemplate） |
| `CharacterStatePanel.tsx`（新建） | 角色头像 + 速度；能量区域占位（Step 5 填充），Buff 区域占位（Step 7 填充） |
| `AvVisualizerTab.tsx` | 以 `RightPanelContext` 替换 `editRequest`，右侧槽位按 `kind` 渲染对应组件 |

**不受影响的部分**：`simulateBattle` 引擎、store、controller、`InterventionItem`、所有测试（76/76 通过）。

---

### Step 5 — 能量系统

**目标**：引擎开始追踪每个实体的能量状态。

范围：
- `CharacterBattleState` 加入 `energy` 字段
- 初始能量 = `max_sp × 50%`（从 `game_data.json` 读取）
- `energy_gain` Intervention 类型处理
- AV=0 时统一处理开局加能 Intervention（在首次行动前）
- 每次行动按 `CharacterBattleConfig.abilities[choice]` 中的 `energy_gain` 模板回能
- `BattleEvent.stateBefore/stateAfter` 开始携带能量快照

**可视结果**：Playhead 处可以显示各角色当前能量（UI 可以在此步同步加上能量显示）。

---

### Step 6 — 大招插入 ✅ 第二个可视检查点

**目标**：用户可以在 Timeline 的行动节点前后或空白处插入大招。

引擎改动：
- 处理 `UltInsertion`：校验施放者能量是否 `≥ ultThreshold`（从 `CharacterBattleConfig` 读取，默认等于 `max_sp`）
- 满足则在对应位置插入 `BattleEvent`（`actionChoice: 'ult'`），展开 ult 的 `InterventionTemplate[]`
- 施放后能量 `−= ultEnergyCost`（从 `CharacterBattleConfig` 读取，默认等于 `ultThreshold`）；支持云璃（双充）、Saber（部分保留）等特殊能量机制

UI 改动：
- 行动节点前后增加"插入大招"入口（按钮 / hover 区域）
- Timeline 空白处支持点击选择施放者并插入大招
- 能量不足时置灰 / 不显示

Store 改动：
- `useAVVisualTabStore` 新增 `ultInsertions` 字段
- `avVisualTabController` 新增 `addUltInsertion` / `removeUltInsertion` 方法

**验收**：藿藿能量满时，在某个行动节点后插入大招，全队能量上涨，Timeline 重新计算。

---

### Step 6.5 — 大招排序 & 插入位置修复 ✅ 已完成

**背景**：Step 6 完成后发现两个问题：
1. 同一触发点有多个大招时，无法控制执行顺序
2. 点击"行动后 +"插入新大招时，新大招始终追加到数组末尾，导致排在已有同 slot 大招之后（顺序错误）

---

**1. 大招排序**

在每个大招卡片下方新增 "+" 按钮，点击后弹出 `AddBranchPanel`，添加的大招会插入到该大招**之后**（而非末尾）。

引擎层面，同 slot 大招按 `ultInsertions` 数组顺序依次触发，因此数组位置即执行顺序。

- `useAVVisualTabStore` — 新增 `addUltInsertionAfter(afterId, insertion)`：在指定 ID 之后插入数组
- `avVisualTabController.addUltInsertion` — 新增可选参数 `insertAfterId?`
- `types.ts` — `add-branch` 加 `afterUltId?` 和 `ultTimingReference?`（保留被参考大招的 timing，确保新大招插入同一触发 slot）；`ult-caster` 加 `insertAfterId?`
- `AddBranchPanel` — `handleAddUlt` 优先用 `ultTimingReference` 构建 timing，并将 `afterUltId` 携带到 `ult-caster`
- `UltCasterPanel` / `AvVisualizerTab` — 透传 `insertAfterId`
- `ActionDisplayPanel` — structured 和 flat 视图中每个大招卡片下方渲染 "+" 按钮，携带 `afterUltId` 和 `ultTimingReference`；`activeAddKey` 支持 `after-ult:${id}` 格式

---

**2. 行动后 "+" 插入位置修复**

**正确语义**：

| 按钮位置 | 插入语义 |
|---|---|
| 角色行动卡片的「行动后 +」 | 插入到该 slot 所有已有大招的**最前面**（紧接行动后触发）|
| 大招卡片下方的 "+" | 插入到**该大招之后** |

**改动**：

- `useAVVisualTabStore` — 新增 `addUltInsertionBefore(beforeId, insertion)`：在指定 ID 之前插入数组
- `avVisualTabController.addUltInsertion` — 新增可选参数 `insertBeforeUltId?`
- `types.ts` — `add-branch` 和 `ult-caster` 各加 `insertBeforeUltId?`
- `ActionDisplayPanel` — after-zone 按钮打开 `add-branch` 时，查找该 `after_action` slot 里的第一个已有大招，将其 ID 作为 `insertBeforeUltId` 传入；若 slot 为空则正常追加
- `AddBranchPanel` / `UltCasterPanel` / `AvVisualizerTab` — 透传 `insertBeforeUltId`

> `during_action` slot 不受影响——多个 during-action 大招追加到末尾即"最后触发 = 紧贴行动前"，语义正确。

---

**3. TypeScript 修复**

`AvVisualizerTab` 中 `slot.characterId`（类型 `string`）传入严格类型 `t()` 飘红。改为 `slot.characterId as CharacterId`，与项目其他文件（`RelicInsightsPanel` 等）写法一致。

---

### Step 7 — BUFF 系统 ✅ 已完成

**目标**：引擎开始追踪 BUFF 状态，实现直接 BUFF 和光环 BUFF。

范围：
- `activeInterventions` 列表维护，`SpdBuff` 扩展 `id / buffKind / casterId` 字段
- 直接 BUFF（`direct`）：写在接受者的 `activeBuffsMap` 上，接受者回合结束 tick -1
- 光环 BUFF（`aura`）：单条注册在施放者的 `activeBuffsMap` 上，施放者回合结束 tick -1；目标 `spdBuffs` 使用 `MAX_SAFE_INTEGER` 哨兵，由施放者 tick 驱动到期移除
- SPD BUFF 到期时反向 gauge conservation（aura 到期时对所有受益目标补偿剩余行程）
- `stat_buff / stat_debuff` 只写入 `activeBuffsMap`，不影响 AV 队列（Phase 4 伤害计算时读取）
- `expandSpdTemplate` 补全 `buffKind / auraTargets`，新增 `expandStatTemplate`
- `snapshotStates` 浅拷贝 `activeInterventions`，保证历史快照不被后续 tick 污染

UI 改动：
- `CharacterStatePanel` 新增 `activeInterventions` prop，显示 BUFF 名称 + 剩余回合；光环 BUFF 带 ◈ 标注

**验收**：阮梅使用战技后，其他队友速度提升可见；阮梅行动 N 次后光环消失，队友速度恢复；CharacterStatePanel 实时显示 BUFF 列表。

---

### Step 7.5 — 战技点（SP）系统

**目标**：引擎追踪全队共享的战技点（SP）状态，`BattleEvent` 的 `teamStateBefore / teamStateAfter` 从占位值替换为真实数据。

**背景**：SP 是全队共享资源，默认上限 5，下限 0，初始值 3。普通攻击 +1，战技 -1（多数角色），部分角色技能有额外 SP 效果。`sp_gain / sp_loss / sp_cap_up / sp_cap_down` 类型和 `TeamBattleState` 已在 Step 1.5 中定义，本步完成引擎实现。

**引擎改动**：

- 在 `simulateBattle` 中新增 `teamState: { sp: number; spMax: number }` 可变对象（初始 `sp: 3, spMax: 5`）
- `applyIntervention` 新增 `sp_gain / sp_loss` 分支：`teamState.sp` 加减后 clamp 到 `[0, teamState.spMax]`
- `sp_cap_up / sp_cap_down` 有 `durationTurns`，需要类似 `activeBuffsMap` 的团队级别 duration 追踪（`spCapChanges: { delta: number; remainingTurns: number }[]`）；施放者行动时 tick，到期时恢复 `spMax`，同时 clamp `sp` 不超过新 `spMax`
- `applyIntervention` 新增 `teamState?` 可选参数（向后兼容），所有调用点补传
- `processUlt` 和主循环模板展开同步补传 `teamState`
- 主循环结束时 tick `spCapChanges`（在 Step B activeBuffsMap tick 之后执行）
- `snapshotStates` 或独立的 `snapshotTeamState` 填充 `teamStateBefore / teamStateAfter`

**BattleConfig 补充**（已有 BattleConfig 的角色）：

| 角色 | 普攻 | 战技 | 大招 |
|---|---|---|---|
| 花火 | `sp_gain +1` | `sp_loss -1` | `sp_gain +1`（E0 大招效果）|
| 藿藿 | `sp_gain +1` | `sp_loss -1` | — |
| 阮梅 | `sp_gain +1` | `sp_loss -1` | — |
| 希儿 | `sp_gain +1` | `sp_loss -1` | — |

SP 上限变更（`sp_cap_up / sp_cap_down`）在本 Step 暂按需添加，花火大招（+1 SP 即时）已由 `sp_gain` 覆盖，上限变更留至需要时再加。

**UI 改动**：

- `CharacterStatePanel`（或 `ActionDisplayPanel`）展示当前 SP / spMax（如 `● ● ● ○ ○`），从 `event.stateAfter` 的 `teamStateAfter` 读取
- Playhead 处显示的团队状态区新增 SP 条

**验收**：
- 花火普攻后 SP +1，战技后 SP -1，在 UI 可见
- SP 不会超过 spMax（5）或低于 0
- 多个角色连续行动，SP 数值正确累积和消耗
- `simulateBattle.test.ts` 新增测试：SP 初始值、gain/loss clamp、多角色 SP 交互

---

### Step 8 — 召唤物（景元 + 闪电主）

**目标**：支持召唤物进入行动队列，Timeline 行数动态化。

范围：
- 引擎处理 `CharacterBattleConfig.summon`，在角色入队时自动将召唤物也加入队列
- `extras.hpa` 叠层驱动神君有效速度（通过 `derivedSpd` 公式）
- HPA 叠层变化时引擎自动对神君注入 `spd_up`
- `BattleEntity.type: 'summon'` 的行动节点不支持 `ActionNodeOverride`

UI 改动：
- `CharacterSlotCard` 区域从固定 2×2 改为动态列表
- Timeline 行数动态计算（角色数 + 召唤物数）
- 召唤物行有视觉区分（图标 / 标签），行动节点只读

**验收**：加入景元后 Timeline 自动出现闪电主行；景元战技叠 HPA 后闪电主速度变化可见。

---

### Step 9 — 角色特殊机制收尾

**目标**：补全 Phase 1 五个角色各自的特殊交互。

希儿：
- 行动节点加"触发复苏"勾选框
- 勾选后引擎在该行动后插入额外行动节点（AV 不变）
- 复苏状态通过 `extras.resurgenceActive` 驱动 `stat_buff` 自动注入

景元：
- HPA 叠层显示在闪电主行动节点旁
- 景元技能 / 队友追加攻击触发 HPA 增加的逻辑完整实现

**验收**：完整模拟希儿 + 景元 + 藿藿 + 花火 + 阮梅的一段战斗流程，行为符合游戏实际。

---

### Phase 4 — 伤害计算（后续单独规划）

- 每个伤害性行动节点旁显示"计算"按钮
- 点击后调用 optimizer 计算管线，填入 `BattleEvent.damageResult`
- Timeline 变化时将受影响节点标记 `damageStale: true`
- 总伤害统计 UI：输入 AV 范围，自动触发范围内未计算节点的计算并求和

---

## 进度总览

```
Step 1    类型定义                         ✅ 已完成
Step 1.5  补全 SP 类型                     ✅ 已完成
Step 2    角色 BattleConfig（5 个角色）    ✅ 已完成
Step 3    模拟引擎扩展（AV 效果）          ✅ 已完成
Step 4    行动节点 UI 交互                 ✅ 第一个可视检查点
Step 4.5  UI 重构：右侧上下文面板         ✅ 已完成
Step 5    能量系统                         ✅ 已完成
Step 6    大招插入                         ✅ 第二个可视检查点
Step 6.5  大招排序 & 插入位置修复          ✅ 已完成
Step 7    BUFF 系统                         ✅ 已完成
Step 7.5  战技点（SP）系统
Step 8    召唤物（景元）
Step 9    特殊机制收尾
Phase 4   伤害计算（后续）
```
