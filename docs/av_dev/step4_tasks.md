# Step 4 — 实现子任务清单

依赖关系：4.1（i18n）和 4.2（类型）相互独立可同时进行；4.3 和 4.4 均依赖 4.2，但彼此独立；4.5 依赖 4.4；4.6 依赖 4.1 和 4.5。每个子任务结束后应能编译通过。

---

## Task 4.1 — i18n：新增 ActionNode 翻译键

**文件**：`public/locales/en_US/avVisualizerTab.yaml`

**改动**：在文件末尾追加：

```yaml
ActionNode:
  Basic: Basic Attack
  Skill: Skill
  Target: Target
  ChoiceLabel: Action
```

**改动后立即执行**：

```bash
npm run update-resources
```

**注意事项**：
- yaml 中 key 不加引号，字符串均不含特殊字符，直接写不加引号
- `npm run update-resources` 必须在写组件代码之前跑，否则 `tAv('ActionNode.Basic')` 的类型会报错
- 该命令仅修改自动生成的类型定义文件，不修改 yaml 本身

**验收标准**：
- `tsc --noEmit` 无报错
- `tAv('ActionNode.Basic')` 等四个 key 在 TypeScript 中有类型提示（不报"key does not exist"错误）

---

## Task 4.2 — `EnrichedSimEvent` 新增 `currentTargets` 字段

**文件**：`timeline/Timeline.tsx`

**改动**：在 `EnrichedSimEvent` 类型定义中追加一个可选字段：

```typescript
export type EnrichedSimEvent = BattleEvent & {
  color: string
  characterName: string
  slotIndex: number
  currentTargets?: string[]   // Selected single_ally targets for this action's override (if any)
}
```

**注意事项**：
- 字段为可选（`?`）——无 override 的行动节点不设此字段，消费方需处理 `undefined`
- 该文件只改类型定义，不改任何运行时逻辑——编译通过后行为与改动前完全一致
- `ActionDisplayPanel.tsx` 定义了本地 `ActionEvent` 类型（`EnrichedSimEvent` 的子集），**不** import `EnrichedSimEvent`，无需同步修改

**验收标准**：
- `tsc --noEmit` 无新增错误
- 任何消费 `EnrichedSimEvent` 的地方不报类型错误（因为字段可选，存量代码无需更改）

---

## Task 4.3 — `AvVisualizerTab.tsx`：读 `actionOverrides`，为 simEvents 挂 `currentTargets`

**文件**：`AvVisualizerTab.tsx`

**前置条件**：Task 4.2 完成（`EnrichedSimEvent` 有 `currentTargets` 字段）

**改动**：

1. 在其他 store 读取之后，追加一行读取 `actionOverrides`：
   ```typescript
   const actionOverrides = useAVVisualTabStore((s) => s.savedSession.actionOverrides)
   ```

2. 修改 `simEvents` 的 `useMemo`：

   原来：
   ```typescript
   const simEvents = useMemo(() => {
     const charMap = new Map(timelineCharacters.map((c) => [c.id, c]))
     return AvVisualTabController.simulate(timelineCharacters, interventions, totalAv).map((e): EnrichedSimEvent => ({
       ...e,
       color:         charMap.get(e.characterId)?.color     ?? '#888',
       characterName: charMap.get(e.characterId)?.name      ?? e.characterId,
       slotIndex:     charMap.get(e.characterId)?.slotIndex ?? 0,
     }))
   }, [timelineCharacters, interventions, totalAv])
   ```

   改为：
   ```typescript
   const simEvents = useMemo(() => {
     const charMap = new Map(timelineCharacters.map((c) => [c.id, c]))
     const overrideMap = new Map(
       actionOverrides.map((o) => [`${o.characterId}:${o.actionIndex}`, o]),
     )
     return AvVisualTabController.simulate(timelineCharacters, interventions, totalAv).map((e): EnrichedSimEvent => ({
       ...e,
       color:          charMap.get(e.characterId)?.color     ?? '#888',
       characterName:  charMap.get(e.characterId)?.name      ?? e.characterId,
       slotIndex:      charMap.get(e.characterId)?.slotIndex ?? 0,
       currentTargets: overrideMap.get(`${e.characterId}:${e.actionIndex}`)?.targets,
     }))
   }, [timelineCharacters, interventions, totalAv, actionOverrides])
   ```

**注意事项**：
- `actionOverrides` **必须**加入 `useMemo` 依赖数组——否则 store 更新后 `simEvents` 不重算，AV 变化不反映在 Timeline 上（这是此 step 最容易遗漏的 bug）
- `overrideMap` 用 `"${characterId}:${actionIndex}"` 作为 key，与 `simulateBattle.ts` 内部查找逻辑一致（便于心算验证）
- `?.targets` 返回 `string[] | undefined`，和 `currentTargets?: string[]` 类型完全匹配，不需要类型断言

**验收标准**：
- `tsc --noEmit` 无新增错误
- 在浏览器控制台调用 `AvVisualTabController.setActionOverride({ characterId: '1306b1', actionIndex: 0, choice: 'skill', targets: [] })`，Timeline 立刻重算（行动节点位置可能变化，取决于是否有 `single_ally` 目标）

---

## Task 4.4 — `Timeline.tsx`：派生 `allCharacters`，向 `TimelineRow` 传递

**文件**：`timeline/Timeline.tsx`

**前置条件**：Task 4.2 完成

**改动**：

1. 在 `TimelineProps` 类型中新增一个 prop：
   ```typescript
   type TimelineProps = {
     interventions: Intervention[]
     rowCount: number
     simEvents: EnrichedSimEvent[]
     allCharacters: Array<{ id: string; name: string }>   // ← 新增
   }
   ```

2. 在函数体内，从 `simEvents` 派生 `allCharacters`（每个 characterId 只取第一次出现的 name）：
   ```typescript
   const allCharacters = useMemo(() => {
     const seen = new Map<string, { id: string; name: string }>()
     for (const e of simEvents) {
       if (!seen.has(e.characterId)) {
         seen.set(e.characterId, { id: e.characterId, name: e.characterName })
       }
     }
     return Array.from(seen.values())
   }, [simEvents])
   ```

3. 将 `allCharacters` 传给每个 `TimelineRow`：
   ```tsx
   <TimelineRow
     key={i}
     rowStart={rowStart}
     rowSize={rowSize}
     simEvents={simEvents.filter(...)}
     interventions={interventions.filter(...)}
     onSeek={AvVisualTabController.setPlayheadAv}
     playheadAv={playheadAv}
     allCharacters={allCharacters}   // ← 新增
     topRightOverlay={...}
   />
   ```

4. 在 `AvVisualizerTab.tsx` 的 `<Timeline>` 调用处补上 `allCharacters` prop：
   ```tsx
   <Timeline
     interventions={interventions}
     rowCount={rowCount}
     simEvents={simEvents}
     allCharacters={allCharacters}   // ← 新增
   />
   ```

   其中 `allCharacters` 在 `AvVisualizerTab.tsx` 中计算：
   ```typescript
   const allCharacters = useMemo(
     () => timelineCharacters.map((c) => ({ id: c.id, name: c.name })),
     [timelineCharacters],
   )
   ```

   **注意**：`Timeline` 也可以自行从 `simEvents` 派生 `allCharacters`（如上面第 2 步），这样就不需要从 `AvVisualizerTab` 传入。两种方式均可——如果选择由 `Timeline` 自行计算，则 `TimelineProps` 不需要新增 `allCharacters`，`AvVisualizerTab.tsx` 也不需要改。**推荐由 `Timeline` 自行派生**：`AvVisualizerTab.tsx` 改动更少，且 `simEvents` 已经是 `Timeline` 的 prop。

**注意事项**（选择"Timeline 自行派生"路线时）：
- `useMemo` 的依赖是 `[simEvents]`——`simEvents` 引用变化时（角色上下阵、AV 位置变化）会自动更新
- 当 `simEvents` 为空数组时 `allCharacters` 为 `[]`，`TimelineRow` 收到空 `allCharacters`，`ActionMarker` 的 `availableTargets` 为 `[]`——目标下拉框为空，但不报错

**验收标准**：
- `tsc --noEmit` 无新增错误（`TimelineRow` 的新 prop 还未加，所以此时 TS 可能报 `TimelineRow` 缺 prop 错误——这是预期的中间状态，Task 4.5 完成后消除）
- 若选择 AvVisualizerTab 传入路线，`Timeline` 的 `allCharacters` prop 在 AvVisualizerTab 处正确计算

---

## Task 4.5 — `TimelineRow.tsx`：接收 `allCharacters`，向 `ActionMarker` 传递新 prop

**文件**：`timeline/TimelineRow.tsx`

**前置条件**：Task 4.4 完成（Timeline 开始传 `allCharacters`）

**改动**：

1. `TimelineRowProps` 新增：
   ```typescript
   allCharacters: Array<{ id: string; name: string }>
   ```

2. 函数签名解构中加入 `allCharacters`。

3. 在渲染 `ActionMarker` 处，补充三个新 prop：

   原来（精简）：
   ```tsx
   <ActionMarker
     key={`${m.event.characterId}:${m.event.av}`}
     av={m.event.av}
     spd={m.event.effectiveSpd}
     color={m.event.color}
     characterName={m.event.characterName}
     characterId={m.event.characterId}
     leftPercent={m.event.leftPercent}
     stackLevel={m.event.slotIndex}
     actionCount={actionCount}
     onMarkerClick={onSeek}
   />
   ```

   改为（加三行）：
   ```tsx
   <ActionMarker
     key={`${m.event.characterId}:${m.event.av}`}
     av={m.event.av}
     spd={m.event.effectiveSpd}
     color={m.event.color}
     characterName={m.event.characterName}
     characterId={m.event.characterId}
     leftPercent={m.event.leftPercent}
     stackLevel={m.event.slotIndex}
     actionCount={actionCount}
     onMarkerClick={onSeek}
     actionIndex={m.event.actionIndex}
     currentChoice={(m.event.actionChoice === 'ult' ? 'basic' : m.event.actionChoice)}
     currentTargets={m.event.currentTargets}
     availableTargets={allCharacters.filter((c) => c.id !== m.event.characterId)}
   />
   ```

**注意事项**：
- `m.event.actionChoice` 的类型是 `ActionChoice | 'ult'`。Step 4 的 Popover 只处理 `ActionChoice`（basic / skill），大招节点由 `UltInsertion` 产生（Step 6 实现），正常行动节点永远不会是 `'ult'`。写 `=== 'ult' ? 'basic' : m.event.actionChoice` 是防御性处理，确保类型兼容
- `availableTargets` 的过滤在 `TimelineRow` 做（而不是 `Timeline` 或 `AvVisualizerTab`），因为过滤条件（排除自身）需要知道当前 marker 的 `characterId`，只有在渲染循环里才能拿到
- `markers` 数组里每个 group 的 `m.event` 是该 (characterId, av) 组中的**第一个** `EnrichedSimEvent`。同角色同 AV 极少出现多个 actionIndex，当前 Step 4 只处理第一个

**验收标准**：
- `tsc --noEmit` 无新增错误（`ActionMarker` 的新 prop 还未加，所以此时 TS 可能报缺 prop 错误——Task 4.6 完成后消除）
- `allCharacters` 正确过滤自身：角色 A 的 marker 收到的 `availableTargets` 不含 A 自己

---

## Task 4.6 — `ActionMarker.tsx`：Popover + 选择 UI（核心）

**文件**：`timeline/ActionMarker.tsx`

**前置条件**：Task 4.1（翻译 key 可用）和 Task 4.5（新 prop 由 TimelineRow 传入）均完成

**改动概览**：新增 4 个 prop，加入 Popover 逻辑，调整 onClick，添加"S"角标。

### 4.6.1 新增 imports

```typescript
import { Popover, SegmentedControl, Select, Stack, Text, Tooltip } from '@mantine/core'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { getBattleConfig } from 'lib/tabs/tabAvVisualizer/battleConfigs'
import type { ActionChoice } from 'lib/tabs/tabAvVisualizer/types'
```

（原有 `Tooltip` import 保留，`useState` 已有）

### 4.6.2 新增 props

```typescript
type ActionMarkerProps = {
  av: number
  spd: number
  color: string
  characterName: string
  characterId: string
  leftPercent: number
  stackLevel: number
  actionCount?: number
  onMarkerClick: (av: number) => void
  // ---- Step 4 新增 ----
  actionIndex: number
  currentChoice: ActionChoice
  currentTargets?: string[]
  availableTargets: Array<{ id: string; name: string }>
}
```

### 4.6.3 函数体头部：派生 config 信息

在 `useState` 声明之后、渲染之前加入（三行）：

```typescript
const config = getBattleConfig(characterId)
const hasSkill      = (config?.abilities.skill.length ?? 0) > 0
const skillNeedTarget = config?.abilities.skill.some((t) => t.targets === 'single_ally') ?? false
```

### 4.6.4 新增 state

```typescript
const [popoverOpen, setPopoverOpen] = useState(false)
```

（与现有 `imgError` state 并列）

### 4.6.5 onClick 改动

原来（在 `<div onClick={...}>` 上）：
```typescript
onClick={(e) => {
  e.stopPropagation()
  onMarkerClick(av)
}}
```

改为：
```typescript
onClick={(e) => {
  e.stopPropagation()
  onMarkerClick(av)
  if (hasSkill) setPopoverOpen((prev) => !prev)
}}
```

### 4.6.6 "S" 角标

在 multi-action badge（`actionCount > 1`）的 `<div>` **之后**，追加：

```tsx
{/* Skill-choice indicator: shown when user has overridden this action to use a skill */}
{currentChoice !== 'basic' && (
  <div style={{
    position: 'absolute',
    top: avatarBottom - 14,
    left: '50%',
    transform: 'translateX(-50%)',
    minWidth: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: 'var(--mantine-color-yellow-6)',
    border: '1.5px solid rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 9,
    fontWeight: 700,
    color: '#000',
    zIndex: 3,
    padding: '0 3px',
    userSelect: 'none',
  }}>
    S
  </div>
)}
```

**注意**：当 `actionCount > 1` 且 `currentChoice !== 'basic'` 同时成立时，两个 badge 会重叠（都用 `top: avatarBottom - 14`）。Step 4 暂不处理此边缘情况（可将 "S" badge 的 `top` 调整为 `avatarBottom - 28` 避免重叠，但同角色同 AV 多次行动在 Phase 1 不常见）。

### 4.6.7 Popover 结构

将当前的最外层 `<Tooltip>` 改为以下结构：

```tsx
<Popover
  opened={popoverOpen}
  onClose={() => setPopoverOpen(false)}
  position='top'
  withArrow
  shadow='md'
  trapFocus
  withinPortal
>
  <Popover.Target>
    <Tooltip
      label={tAv('Marker.ActionTooltip', { name: characterName, spd: spd.toFixed(1), av: av.toFixed(2) })}
      position='top'
      withArrow
      openDelay={100}
      disabled={popoverOpen}   // Tooltip 在 Popover 打开时隐藏，避免两者同时出现
    >
      <div
        onClick={...}   // 已改好的 onClick
        style={{ ... }} // 现有 style 不变
      >
        {/* 现有 Avatar / multi-action badge / "S" badge / triangle / dashed connector 渲染 */}
      </div>
    </Tooltip>
  </Popover.Target>

  {hasSkill && (
    <Popover.Dropdown>
      <Stack gap='xs' style={{ minWidth: 140 }}>
        <Text size='xs' fw={600} c='dimmed'>{tAv('ActionNode.ChoiceLabel')}</Text>
        <SegmentedControl
          size='xs'
          value={currentChoice}
          data={[
            { label: tAv('ActionNode.Basic'), value: 'basic' },
            { label: tAv('ActionNode.Skill'), value: 'skill' },
          ]}
          onChange={(v) => {
            const choice = v as ActionChoice
            if (choice === 'basic') {
              AvVisualTabController.removeActionOverride(characterId, actionIndex)
            } else {
              AvVisualTabController.setActionOverride({
                characterId,
                actionIndex,
                choice,
                targets: currentTargets ?? [],
              })
            }
          }}
        />

        {currentChoice === 'skill' && skillNeedTarget && (
          <>
            <Text size='xs' fw={600} c='dimmed'>{tAv('ActionNode.Target')}</Text>
            <Select
              size='xs'
              placeholder='—'
              clearable
              value={currentTargets?.[0] ?? null}
              data={availableTargets.map((t) => ({ value: t.id, label: t.name }))}
              onChange={(v) => {
                AvVisualTabController.setActionOverride({
                  characterId,
                  actionIndex,
                  choice: 'skill',
                  targets: v ? [v] : [],
                })
              }}
            />
          </>
        )}
      </Stack>
    </Popover.Dropdown>
  )}
</Popover>
```

**注意事项**：

- `withinPortal`：Popover 内容渲染到 body 层级，避免被父层 `overflow: hidden` 裁切（TimelineRow 的 row body 设有 `overflow: hidden`）
- `trapFocus`：Popover 打开后 Tab 键在 Dropdown 内导航，Escape 键关闭 Popover
- `Tooltip` 的 `disabled={popoverOpen}` 用于隐藏 Tooltip，不是 `opened`——因为 `opened` 是受控模式，会与内部的悬停行为冲突；`disabled` 更简单
- 当 `hasSkill` 为 false（角色没有 config 或 skill 为空数组）时：`onClick` 里的 `if (hasSkill)` 保证 Popover 不打开，`<Popover.Dropdown>` 也不渲染——整体行为与 Step 3 之前完全一致
- `SegmentedControl` 的 `onChange` 必须处理切回 `'basic'` 的情况（调 `removeActionOverride`），否则 store 会保留 `choice: 'basic'` 的 override，语义上正确但会累积脏数据
- `Select` 的 `clearable` 允许用户清空目标选择，此时 `onChange` 收到 `null` → 传 `targets: []`，引擎跳过 `single_ally` 效果

**验收标准**：
- `tsc --noEmit` 无新增错误
- 浏览器操作（见下方整体验收）

---

## 整体验收

完成全部子任务后：

- [ ] `tsc --noEmit` 无新增错误（仅保留 `AvVisualizerTab.tsx` 预存的 2 条 i18n 错误）
- [ ] 点击有 `CharacterBattleConfig` 的角色（如花火 `1306b1`）的行动节点，弹出 Popover，显示"普攻 / 战技"切换
- [ ] 切换到"战技"后，出现目标选择下拉框（花火战技含 `single_ally` av_advance）
- [ ] 选择目标后，被选目标的行动节点在 Timeline 上立刻向左移动（AV 提前 50%）
- [ ] 花火头像出现黄色"S"角标；切回"普攻"后角标消失，目标节点恢复原位
- [ ] 点击没有 `CharacterBattleConfig` 的角色节点，不弹 Popover，只移动 Playhead
- [ ] 刷新页面后，之前的战技 + 目标选择仍然保留（`savedSession.actionOverrides` 持久化验证）
- [ ] 按 Escape 可关闭 Popover；Tab 键可在 Popover 内的控件间导航（trapFocus 工作正常）
