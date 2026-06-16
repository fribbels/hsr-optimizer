# TASK-14 — Timeline 接线

## 目标

将模拟引擎输出接入 Timeline 渲染层，处理两种操作触发入口（头像点击 / 标尺点击），渲染 `OperationMarker`。涉及 `Timeline.tsx`、`TimelineRow.tsx`、`ActionMarker.tsx` 三个文件的修改。

---

## 新增类型（在 `Timeline.tsx` 顶部定义）

```ts
// 已有 TimelineCharacter，新增：
export type EnrichedSimEvent = SimEvent & {
  color: string
  characterName: string
  slotIndex: number
}

// 操作面板触发上下文
export type MarkerClickContext = {
  triggerAv: number
  sourceCharId?: string
}
```

---

## 需要修改：`timeline/ActionMarker.tsx`

新增 `onMarkerClick` prop：

```tsx
type ActionMarkerProps = {
  av: number
  spd: number
  color: string
  characterName: string
  characterId: string
  leftPercent: number
  stackLevel: number
  onMarkerClick: (ctx: MarkerClickContext) => void  // 新增
}
```

在头像 `<div>` 的外层容器上：
```tsx
onClick={() => onMarkerClick({ triggerAv: av, sourceCharId: characterId })}
```

（原来已有 `cursor: 'pointer'`，仅添加 `onClick`）

---

## 需要修改：`timeline/TimelineRow.tsx`

**Props 变化：**

```tsx
type TimelineRowProps = {
  rowIndex: number
  simEvents: EnrichedSimEvent[]   // 替代原 characters: CharacterEntry[]
  operations: Operation[]          // 本行范围内的操作（由父组件过滤）
  onMarkerClick: (ctx: MarkerClickContext) => void
  onRulerClick: (av: number) => void
}
```

**标尺点击换算：**

在数轴主体 div 上添加 `onClick`：
```tsx
onClick={(e) => {
  const rect = e.currentTarget.getBoundingClientRect()
  const relativeX = e.clientX - rect.left
  const clickedAv = rowStart + (relativeX / rect.width) * ROW_SIZE
  onRulerClick(Math.max(rowStart, Math.min(rowEnd - 0.01, clickedAv)))
}}
```

**行动标记渲染变化：**

原来：
```tsx
const markers = useMemo(() =>
  characters.flatMap((char) =>
    char.actionPoints
      .filter((av) => av >= rowStart && av < rowEnd)
      .map((av) => ({ ... }))
  ),
[characters, ...])
```

改为：
```tsx
// simEvents 已由父组件（Timeline）过滤到本行范围
const markers = simEvents.map((event) => ({
  ...event,
  leftPercent: AvVisualTabController.avToRowPercent(event.av, rowStart, ROW_SIZE),
}))
```

**OperationMarker 渲染：**

在行动标记区域同级位置添加：
```tsx
{operations.map((op) => (
  <OperationMarker
    key={op.id}
    operation={op}
    leftPercent={AvVisualTabController.avToRowPercent(op.triggerAv, rowStart, ROW_SIZE)}
    onClick={(op) => onMarkerClick({ triggerAv: op.triggerAv, sourceCharId: op.sourceCharId })}
  />
))}
```

---

## 需要修改：`timeline/Timeline.tsx`

**完整更新：**

```tsx
import { Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { ROW_SIZE } from 'lib/tabs/tabAvVisualizer/constants'
import type { Operation } from 'lib/tabs/tabAvVisualizer/types'
import { OperationPanel } from 'lib/tabs/tabAvVisualizer/operationPanel/OperationPanel'
import { TimelineRow } from 'lib/tabs/tabAvVisualizer/timeline/TimelineRow'
import { useMemo, useState } from 'react'
import type { EnrichedSimEvent, MarkerClickContext, TimelineCharacter } from './Timeline'

type TimelineProps = {
  characters: TimelineCharacter[]
  operations: Operation[]
  rowCount: number
}

export function Timeline({ characters, rowCount, operations }: TimelineProps) {
  const totalAv = rowCount * ROW_SIZE
  const [panelCtx, setPanelCtx] = useState<MarkerClickContext | null>(null)

  // 调用模拟引擎，获取所有行动事件（替代原 computeActionPoints）
  const simEvents = useMemo(() => {
    const charMap = new Map(characters.map((c) => [c.id, c]))
    return AvVisualTabController.simulate(characters, operations, totalAv).map((e): EnrichedSimEvent => ({
      ...e,
      color: charMap.get(e.characterId)?.color ?? '#888',
      characterName: charMap.get(e.characterId)?.name ?? e.characterId,
      slotIndex: charMap.get(e.characterId)?.slotIndex ?? 0,
    }))
  }, [characters, operations, totalAv])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {Array.from({ length: rowCount }, (_, i) => {
        const rowStart = i * ROW_SIZE
        const rowEnd = rowStart + ROW_SIZE
        return (
          <TimelineRow
            key={i}
            rowIndex={i}
            simEvents={simEvents.filter((e) => e.av >= rowStart && e.av < rowEnd)}
            operations={operations.filter((op) => op.triggerAv >= rowStart && op.triggerAv < rowEnd)}
            onMarkerClick={setPanelCtx}
            onRulerClick={(av) => setPanelCtx({ triggerAv: av })}
          />
        )
      })}

      <Button
        variant='default'
        size='xs'
        leftSection={<IconPlus size={12} />}
        onClick={AvVisualTabController.addRow}
        style={{ marginTop: 4, alignSelf: 'flex-start' }}
      >
        Add 100 AV
      </Button>

      <OperationPanel
        key={panelCtx ? `${panelCtx.triggerAv}-${panelCtx.sourceCharId ?? ''}` : 'closed'}
        opened={panelCtx !== null}
        onClose={() => setPanelCtx(null)}
        initialAv={panelCtx?.triggerAv ?? 0}
        initialSourceCharId={panelCtx?.sourceCharId}
        characters={characters}
      />
    </div>
  )
}
```

---

## 注意事项

- **`CharacterEntry` 类型废弃**：`TimelineRow` 不再使用 `CharacterEntry`（含 `actionPoints`），全部改为消费 `EnrichedSimEvent[]`
- **`computeActionPoints` 废弃**：`Timeline.tsx` 中不再调用，可同步从 controller 中删除（或保留但标注 deprecated）
- **filter 在 Timeline 层完成**：`simEvents.filter(...)` 和 `operations.filter(...)` 在 Timeline 中按行过滤后传给 Row，Row 不做二次过滤
- **OperationPanel 的 key**：用 `triggerAv + sourceCharId` 拼接作为 key，确保每次打开时 state 重置
- **标尺点击区域**：`onClick` 添加在数轴主体 div（`.rulerBody`）而非整个行容器，避免左侧标签区误触

---

## 验收方法

1. 无 operations 时，时间轴行为与第一阶段完全一致（回归验证）
2. 点击头像 → OperationPanel 打开，triggerAv 和 sourceCharId 正确预填
3. 点击标尺空白处 → OperationPanel 打开，triggerAv 为点击位置对应的 AV 值
4. 添加加速操作后，目标角色后续头像位置明显前移
5. OperationMarker 出现在数轴正确位置，Tooltip 显示操作摘要

```bash
npm run lint
npm run typecheck:fast
```
