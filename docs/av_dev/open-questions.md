# 待讨论问题

每个问题都会影响类型设计或引擎逻辑，需要在开发前明确。

---

## Q1：CharacterBattleConfig 数据组织 ✅ 已决定

**结论**
- 角色效果数据以 `InterventionTemplate[]` 的形式绑定到每个技能，复用现有 Intervention 机制
- `max_sp`（最大能量）直接从 `game_data.json` 读取，无需手写
- 能量回复量、AV 效果、属性 BUFF 内容等手写在各角色的 `CharacterBattleConfig` 中
- 配置文件放在 `tabAvVisualizer/battleConfigs/`，每角色一个文件
- Phase 1 先实现少量 AV 相关角色：花火、布洛妮娅、银狼等
- 不复用现有 `conditionals/`（目的不同，强行复用工程量大）

---

## Q2：能量系统的细节 ✅ 已决定

**结论**
- 受击回能通过现有 Intervention 机制手动添加（`energy_gain` 类型）
- `max_sp` 直接读取 `game_data.json`
- **开局初始能量**：默认 `max_sp × 50%`（对应高难副本标准配置），`CharacterBattleConfig` 不需要 `startEnergy` 字段
- **角色天赋 / 光锥 / 遗器的开局加能**：作为 `AV=0` 的 `energy_gain` Intervention 配置在对应角色/光锥/遗器的数据里，引擎在首次行动**之前**统一处理 AV=0 的所有 Intervention，之后角色初始能量状态已正确
- **队友行动回能**（如知更鸟大招期间队友回能）：Phase 2 再处理，建模方式待定
- **特殊能量条**（黄泉、嘉乃等）：Phase 1-2 先跳过

---

## Q3：BUFF 回合计时 ✅ 已决定

**结论：两类 BUFF，各自独立计时**

**直接 BUFF（接受者基准）**
- 写在接受者身上，带 `remainingTurns`
- 每次**接受者**自己行动结束时 tick -1
- 显示：接受者状态栏显示 BUFF 名称和剩余回合数

**光环 BUFF（释放者基准）**
- 写在**释放者**身上，带 `remainingTurns`
- 每次**释放者**自己行动结束时 tick -1
- 引擎处理任意角色行动时，检查队伍中是否有激活的光环 BUFF，有则将光环效果临时叠加给该角色
- 显示：释放者身上显示光环和剩余回合数；受益角色行动时标注"受 XXX 光环影响"，自身不建独立计数条目

**区分方式**：`InterventionTemplate` 和 `ActiveIntervention` 上加 `buffKind: 'direct' | 'aura'` 字段。光环类额外带 `auraTargets: 'all_allies' | 'all_enemies'` 和 `auraEffect`。

**tick 时机**：回合**结束时**，BUFF 在获得的当回合完整生效，第 N 次行动结束后消失。

**示例（阮梅战技）**
阮梅释放战技后，在阮梅身上挂：
```
buffKind: 'aura'
remainingTurns: 3        // 阮梅自己行动 3 次后消失
auraTargets: 'all_allies'
auraEffect: { stat: 'BREAK_EFFICIENCY', value: 0.5, unit: 'percent' }
```
之后每个队友行动时，引擎检测到阮梅有激活光环，自动将效果叠入该队友当次行动，不在队友身上单独建条目。

---

## Q4：大招触发时机 ✅ 已决定

**结论**
采用简化方案：大招作为行动节点的一种 `ActionChoice`，替换该节点的行为。不做"大招插入行动节点之间"的复杂方案。

崩铁的实际机制（大招在行动前发动）和简化方案的主要差异是：大招不消耗行动值。如有需要，后续可扩展。

---

## Q5：SPD BUFF 的精确时机 ✅ 已基本确定

**结论**
现有 `simulateTimeline.ts` 的 `applyIntervention` 里已实现 gauge conservation 数学（SPD BUFF 施加时对剩余距离按旧速/新速重算），该逻辑可直接复用。

BUFF 到期后速度恢复的时机：跟 BUFF tick 方案绑定，等 Q3 确定后一并处理。

---

## Q6：重算的粒度和性能 ✅ 已决定

**结论**
每个 `BattleEvent` 自带 `stateBefore`（含所有角色的能量、速度、激活 BUFF 快照）。用户修改节点 N 时，从 `events[N].stateBefore` 出发重算，节点 0 到 N-1 的结果不变。

节点数量通常几十个，全量快照的内存开销可以接受。

---

## Q7：单体目标选择的 UI 交互 ✅ 已决定

**结论**
- 选好的目标存在 `ActionNodeOverride.targets: string[]` 字段里（characterId 列表）
- 如果技能有多个 `single_ally` 效果，共用同一个目标
- UI 形式：行动节点选择战技后，若该技能含单体目标效果，在行动节点处额外显示一个目标选择下拉框，列出当前队伍中的可选队友

---

## Q8：希儿复苏（额外回合）的触发方式 ✅ 已决定

**结论：方案 A，手动触发**
用户在希儿的行动节点上勾选"触发复苏"，系统在该行动后立即为希儿插入一个额外的行动节点（AV 不变，紧接在当前行动之后）。

复苏状态期间的 SPD / DMG 提升通过 `extras.resurgenceActive` + `extrasOnAction` 驱动对应 `stat_buff` Intervention 自动注入。

---

## Q9：伤害计算的范围（Phase 4）✅ 已决定

**结论**

**计算管线**：直接调用现有 optimizer 计算管线。每个 `BattleEvent` 已带 `stateBefore`（激活 BUFF 快照），可据此构造 optimizer 所需的属性上下文。

**懒计算（按需触发）**：不在 Timeline 重算时自动计算伤害，而是在每个伤害性行动节点旁显示一个计算按钮，用户点击后计算并展示该节点的伤害数值。Timeline 发生变化（用户修改节点 N 的行动）时，N 之后的所有伤害结果自动标记为失效，等待用户重新点击。

**总伤害统计**：提供独立 UI，用户输入 AV 范围（`fromAv` / `toAv`），系统统计该范围内所有行动的伤害总量。范围内若有未计算的节点，统计时自动触发这些节点的计算，确保结果完整。
