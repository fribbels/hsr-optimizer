# TASK-06 — TimelineRow 组件

## 目标
实现时间轴的单行组件，负责渲染一段 100 AV 范围内的水平数轴、刻度和所有行动标记。

---

## 文件

### `src/lib/tabs/tabAvVisualizer/timeline/TimelineRow.tsx`

**职责：**
- 渲染独立卡片（`var(--layer-2)` 背景，`var(--shadow-card)`，`border-radius: 6px`）
- 左侧 56px 标签区（`var(--layer-1)` 背景）显示本行起始 AV 值
- 渲染水平数轴及刻度（小刻度 1 AV，大刻度 10 AV + 标签）
- 筛选落在本行 AV 范围内的行动点，以 `char.slotIndex` 直接作为 `stackLevel` 渲染 `ActionMarker`

**类型定义：**
```tsx
export type CharacterEntry = {
  id: string
  name: string
  spd: number
  color: string
  slotIndex: number     // 决定泳道位置，直接传给 ActionMarker 作为 stackLevel
  actionPoints: number[]
}

type TimelineRowProps = {
  rowIndex: number
  characters: CharacterEntry[]
}
```

**关键常量：**
```ts
const SMALL_TICKS = Array.from({ length: 99 }, (_, i) => i + 1).filter((t) => t % 10 !== 0)
const LARGE_TICKS = [10, 20, 30, 40, 50, 60, 70, 80, 90]
const RULER_INSET = TIMELINE_AVATAR_SIZE / 2 + 4  // 数轴两侧缓冲，防边缘头像被裁剪
```

**数轴刻度规格：**
- 数轴主线：`left: 0, right: 0, top: TIMELINE_RULER_Y, height: 1`
- 小刻度：`top: TIMELINE_RULER_Y - 2, height: 4`（上下各 2px，以数轴为中心）
- 大刻度：`top: TIMELINE_RULER_Y - 5, height: 10`（上下各 5px）
- 标签：大刻度下方 `top: TIMELINE_RULER_Y + 8`，`transform: translateX(-50%)`
- 颜色均使用 `var(--mantine-color-dimmed)`

**布局结构：**
```
┌──────────────────────────────────────────┐
│ [56px 标签区] │ [flex:1 行主体]          │
│  var(--layer-1) │  RULER_INSET 两侧留白   │
│     rowStart  │  ─── 数轴（RULER_Y）──── │
│               │  头像在数轴上下 4 条泳道  │
└──────────────────────────────────────────┘
```

**标记渲染（无冲突检测）：**
```tsx
const markers = useMemo(() =>
  characters.flatMap((char) =>
    char.actionPoints
      .filter((av) => av >= rowStart && av < rowEnd)
      .map((av) => ({
        char,
        av,
        leftPercent: AvVisualTabController.avToRowPercent(av, rowStart, ROW_SIZE),
        stackLevel: char.slotIndex,
      }))
  ),
[characters, rowStart, rowEnd])
```

---

## 注意事项

- `overflow: hidden` 保留在最外层卡片上（维持圆角效果）；`RULER_INSET` 缓冲确保边缘头像不被裁剪
- 数轴和刻度渲染在一个 `position: absolute, left: RULER_INSET, right: RULER_INSET` 的内缩 div 中
- `key` 用 `${char.id}-${av}`，防止 React diff 错误
- `avToRowPercent(av, rowStart, ROW_SIZE)` 传入 `rowStart` 和 `ROW_SIZE`，支持未来非均匀行宽

---

## Lint 检查

```bash
npm run lint
npm run typecheck:fast
```
