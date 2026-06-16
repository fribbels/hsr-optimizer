# TASK-07 — Timeline 组件

## 目标
组合多个 TimelineRow，渲染完整的行动值时间轴，底部提供"添加行"按钮。

---

## 需要新建的文件

### `src/lib/tabs/tabAvVisualizer/timeline/Timeline.tsx`

**职责：**
- 接收角色数据和行数，渲染所有 `TimelineRow`
- 为每个角色预计算全轴行动点（避免在每个 Row 内重复计算）
- 底部渲染"+"按钮，点击调用 `AvVisualTabController.addRow()`

**Props：**
```tsx
type TimelineCharacter = {
  id: string
  name: string
  spd: number
  color: string
  slotIndex: number  // 传给 CharacterEntry，决定泳道位置（0=上近,1=下近,2=上远,3=下远）
}

type TimelineProps = {
  characters: TimelineCharacter[]
  rowCount: number
}
```

**实现要点：**

```tsx
import { Button } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'

export function Timeline({ characters, rowCount }: TimelineProps) {
  const totalAv = rowCount * 100

  // 在此集中预计算每个角色的全轴行动点，TimelineRow 只负责过滤和渲染
  const characterEntries = useMemo(() =>
    characters.map((char) => ({
      ...char,
      actionPoints: AvVisualTabController.computeActionPoints(char.spd, totalAv),
    })),
    [characters, totalAv]
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>

      {/* 时间轴主体 */}
      <div style={{
        border: '1px solid var(--border-default)',
        borderRadius: 6,
        overflow: 'hidden',
        backgroundColor: 'var(--layer-1)',
      }}>
        {Array.from({ length: rowCount }, (_, i) => (
          <TimelineRow
            key={i}
            rowIndex={i}
            characters={characterEntries}
          />
        ))}
      </div>

      {/* 添加行按钮 */}
      <Button
        variant='default'
        size='xs'
        leftSection={<IconPlus size={12} />}
        onClick={AvVisualTabController.addRow}
        style={{ marginTop: 4, alignSelf: 'stretch' }}
      >
        Add 100 AV
      </Button>
    </div>
  )
}
```

---

## 注意事项

- **行动点预计算在 `Timeline` 中统一完成**，不要在 `TimelineRow` 内部调用 `computeActionPoints`，避免重复计算
- `useMemo` 的依赖是 `[characters, totalAv]`，`characters` 数组引用由父组件的 `useMemo` 保证稳定
- 时间轴容器用 `border-radius: 6` + `overflow: hidden` 使边缘圆角生效（内部 Row 不需要各自设置圆角）
- 最后一行没有下边框分隔线（可在 `TimelineRow` 中通过 CSS 处理，或在此处为最后一行传 `isLast` prop）
- "Add 100 AV" 按钮文字可以考虑 i18n，第一阶段直接写死英文即可
- `onClick={AvVisualTabController.addRow}` 直接传方法引用，不需要包裹箭头函数（方法内部不依赖 `this`）

---

## 验收方法

在 `AvVisualizerTab` 中（TASK-08 之前可临时引入）传入 mock 数据渲染 `Timeline`，确认：
1. 默认显示 3 行（0~100，100~200，200~300）
2. 点击"+"按钮后增加第 4 行（300~400）
3. 行动标记在正确位置显示，跨行连续
4. 整体外框有圆角边框，视觉与项目风格一致

`npm run typecheck:fast` 无报错。

---

## Lint 检查

```bash
npm run lint
npm run typecheck:fast
```

两条命令均通过后，本 TASK 完成。
