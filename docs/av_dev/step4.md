# Step 4 — UI：行动节点点击交互

## 目标

点击 Timeline 上的行动节点（ActionMarker），弹出一个轻量 Popover，用户可选择"普攻 / 战技"，若战技包含 `single_ally` 效果则同时选目标。确认后 Timeline 立刻重新渲染，AV 位置发生变化——**这是 Step 3 引擎改动第一次产生可见效果**。

---

## 范围边界

| 本步骤做 | 本步骤跳过 |
|---|---|
| ActionMarker 点击弹出 Popover | 大招插入（Step 6）|
| basic / skill 切换 + 立刻生效 | 能量显示（Step 5）|
| single_ally 目标选择 | follow_up 选择（游戏中由引擎决定，不需要用户选）|
| 当前选择的视觉标记（badge "S"） | 行迹 / 星魂对技能效果的影响 |
| i18n 新增字符串 | 撤销 / 历史记录 |

---

## 设计决策

### D1：Popover 内联在 ActionMarker，不用侧边面板

`EditPanel` 已经负责 Intervention 的增删改。行动节点选择是不同的交互维度（what the character does，不是 what happens to AV around the action），放在 Popover 更直观，也不和 EditPanel 产生概念冲突。

### D2：只有存在 CharacterBattleConfig 的角色才弹出 Popover

没有 config 的角色（未在 `battleConfigs/` 写入配置），点击依然只移动 Playhead，行为与现在一致，不弹出任何内容。

### D3：`currentTargets` 通过 `EnrichedSimEvent` 流入，不在组件内读 store

`EnrichedSimEvent` 已经是父链计算好再传下来的数据包。把 `currentTargets` 也放进去，`ActionMarker` 不直接读 store，和 `TimelineRow`、`Timeline` 保持同一模式。

### D4：选择立即生效，无 Apply 按钮

`SegmentedControl` 切换 / 目标 `Select` 改变时立即调 `AvVisualTabController.setActionOverride()`，引擎重算，Timeline 重渲。选回"普攻"时调 `removeActionOverride()` 保持 store 干净。

### D5：Popover 打开时 Tooltip 自动隐藏

通过 Mantine `Tooltip` 的 `opened` prop（`opened={!popoverOpen}`）实现——Popover 打开时 Tooltip 关掉，避免两者同时出现。

---

## 各模块详细设计

### 5.1 i18n

**文件**：`public/locales/en_US/avVisualizerTab.yaml`

在文件末尾追加：

```yaml
ActionNode:
  Basic: Basic Attack
  Skill: Skill
  Target: Target
  ChoiceLabel: Action
```

修改后必须执行 `npm run update-resources`。

---

### 5.2 `EnrichedSimEvent`（Timeline.tsx）

追加一个可选字段：

```typescript
export type EnrichedSimEvent = BattleEvent & {
  color: string
  characterName: string
  slotIndex: number
  currentTargets?: string[]   // Selected single_ally targets for this action's override (if any)
}
```

---

### 5.3 `AvVisualizerTab.tsx`

新增两处改动：

1. 从 store 读 `actionOverrides`：
   ```typescript
   const actionOverrides = useAVVisualTabStore((s) => s.savedSession.actionOverrides)
   ```

2. 在 `simEvents` 的 `useMemo` 里，构建 `overrideMap` 并在每个事件上挂 `currentTargets`：
   ```typescript
   const simEvents = useMemo(() => {
     const charMap = new Map(timelineCharacters.map((c) => [c.id, c]))
     const overrideMap = new Map(
       actionOverrides.map((o) => [`${o.characterId}:${o.actionIndex}`, o]),
     )
     return AvVisualTabController.simulate(timelineCharacters, interventions, totalAv)
       .map((e): EnrichedSimEvent => ({
         ...e,
         color:         charMap.get(e.characterId)?.color        ?? '#888',
         characterName: charMap.get(e.characterId)?.name         ?? e.characterId,
         slotIndex:     charMap.get(e.characterId)?.slotIndex    ?? 0,
         currentTargets: overrideMap.get(`${e.characterId}:${e.actionIndex}`)?.targets,
       }))
   }, [timelineCharacters, interventions, totalAv, actionOverrides])
   ```

   **注意**：`actionOverrides` 需加入 `useMemo` 依赖数组，否则 store 更新后 `simEvents` 不重算。

---

### 5.4 `Timeline.tsx`

从 `simEvents` 派生 `allCharacters`，传给每个 `TimelineRow`：

```typescript
// Characters present in this timeline (derived from simEvents to avoid a new prop from AvVisualizerTab)
const allCharacters = useMemo(() => {
  const seen = new Map<string, { id: string; name: string }>()
  for (const e of simEvents) {
    if (!seen.has(e.characterId)) seen.set(e.characterId, { id: e.characterId, name: e.characterName })
  }
  return Array.from(seen.values())
}, [simEvents])
```

`TimelineRow` 追加 prop：

```typescript
type TimelineProps = {
  interventions: Intervention[]
  rowCount: number
  simEvents: EnrichedSimEvent[]
}

// → 加入：
  allCharacters: Array<{ id: string; name: string }>
```

`Timeline` 向 `TimelineRow` 传：`allCharacters={allCharacters}`

---

### 5.5 `TimelineRow.tsx`

**新增 prop**：`allCharacters: Array<{ id: string; name: string }>`

在渲染 `ActionMarker` 时补充三个新 prop：

```tsx
<ActionMarker
  key={`${m.event.characterId}:${m.event.av}`}
  // ... 现有 props 不变 ...
  actionIndex={m.event.actionIndex}
  currentChoice={(m.event.actionChoice as ActionChoice) ?? 'basic'}
  currentTargets={m.event.currentTargets}
  availableTargets={allCharacters.filter((c) => c.id !== m.event.characterId)}
/>
```

**注意**：`m.event.actionChoice` 类型是 `ActionChoice | 'ult'`，Step 4 的 Popover 仅处理 `ActionChoice`（basic / skill）；若将来出现 `'ult'` 值（Step 6），Popover 应仅只读展示，不提供切换——这里 cast 为 `ActionChoice` 是安全的，因为大招由 `UltInsertion` 产生，不会出现在正常行动节点上。

---

### 5.6 `ActionMarker.tsx`（核心改动）

**新增 props**：

```typescript
actionIndex: number
currentChoice: ActionChoice                         // 来自 BattleEvent.actionChoice（已反映 override）
currentTargets?: string[]                           // 当前已选目标
availableTargets: Array<{ id: string; name: string }> // 可供选择的目标（不含自身）
```

**Popover 判断条件**：

```typescript
const config = getBattleConfig(characterId)
// 是否有值得选择的技能：config 存在且 skill 不为空数组
const hasSkill = (config?.abilities.skill.length ?? 0) > 0
// 技能是否需要选目标（含 single_ally 模板）
const skillNeedTarget = config?.abilities.skill.some((t) => t.targets === 'single_ally') ?? false
```

仅当 `hasSkill` 时才渲染 Popover 逻辑（否则点击行为与 Step 3 之前完全相同）。

**onClick 改动**：

```typescript
// 原有 Playhead seek 保留；同时切换 Popover 开关
onClick={(e) => {
  e.stopPropagation()
  onMarkerClick(av)
  if (hasSkill) setPopoverOpen((prev) => !prev)
}}
```

**Popover 结构**：

```tsx
<Tooltip
  label={tAv('Marker.ActionTooltip', { name: characterName, spd: spd.toFixed(1), av: av.toFixed(2) })}
  position='top'
  withArrow
  openDelay={100}
  opened={!popoverOpen}   // 隐藏 Tooltip 当 Popover 打开
>
  <Popover
    opened={popoverOpen}
    onClose={() => setPopoverOpen(false)}
    position='top'
    withArrow
    shadow='md'
    trapFocus
  >
    <Popover.Target>
      <div onClick={...} style={{ ... }}>
        {/* 现有 Avatar / badge / triangle 渲染不变 */}

        {/* 新增：选择了 skill 时在 badge 位置显示 "S" 标记 */}
        {currentChoice !== 'basic' && (
          <div style={{
            position: 'absolute',
            top: avatarBottom - 14,
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: 13, height: 13,
            borderRadius: 7,
            backgroundColor: 'var(--mantine-color-yellow-6)',
            border: '1.5px solid rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 9, fontWeight: 700, color: '#000',
            zIndex: 3, padding: '0 3px',
            userSelect: 'none',
          }}>
            S
          </div>
        )}
      </div>
    </Popover.Target>

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

        {/* 目标选择：仅当 skill 选中且需要 single_ally 时显示 */}
        {currentChoice === 'skill' && skillNeedTarget && (
          <>
            <Text size='xs' fw={600} c='dimmed'>{tAv('ActionNode.Target')}</Text>
            <Select
              size='xs'
              placeholder='—'
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
  </Popover>
</Tooltip>
```

**注意**：`Popover.Target` 内的元素需能接受 `ref`（Mantine 要求），`<div>` 满足条件，无需更改。`trapFocus` 让键盘用户可以用 Tab 在 Popover 内导航并用 Escape 关闭。

---

## 文件清单

| 操作 | 文件 |
|---|---|
| 修改 | `public/locales/en_US/avVisualizerTab.yaml`（新增 ActionNode 节）|
| 执行 | `npm run update-resources`（yaml 修改后必须）|
| 修改 | `timeline/Timeline.tsx`（`EnrichedSimEvent` 加字段；计算并传 `allCharacters`）|
| 修改 | `AvVisualizerTab.tsx`（读 `actionOverrides`；在 `simEvents` 里挂 `currentTargets`）|
| 修改 | `timeline/TimelineRow.tsx`（接收并向下传 `allCharacters`；向 `ActionMarker` 传 3 个新 prop）|
| 修改 | `timeline/ActionMarker.tsx`（核心：新 props + Popover + badge + `getBattleConfig` 调用）|

---

## 手动验收流程

1. 打开 AV Visualizer Tab，选 4 个角色（确保花火 `1306b1` 在其中）
2. 点击 Timeline 上花火的第一个行动节点
3. Popover 弹出，显示"普攻 / 战技"选择器
4. 切换到"战技"：立刻出现目标选择下拉框；花火头像出现黄色"S"标记
5. 在目标下拉框中选择任意一个队友
6. 关闭 Popover（点击外部或按 Escape）
7. 被选择的队友的行动节点明显向左移动（AV 提前）
8. 再次点击花火节点，切换回"普攻"：队友节点恢复原位，"S"标记消失
9. 刷新页面，选择保留（通过 `savedSession.actionOverrides` 持久化）

---

## 验收标准

- `tsc --noEmit` 无新增错误
- `npm run update-resources` 运行后无类型错误
- 步骤 4–8 浏览器可实际操作
- 点击没有 `CharacterBattleConfig` 的角色节点不弹 Popover，只移动 Playhead
- `currentTargets` 为空时（skill 选中但未选目标）Timeline 不报错，AV 不变化（与引擎处理一致）
