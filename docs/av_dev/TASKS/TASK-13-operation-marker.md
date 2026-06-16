# TASK-13 — Operation Marker（标尺上的操作标注点）

## 目标

在 `TimelineRow` 的数轴上渲染每个已添加操作的视觉标注，用户可点击它进入编辑模式。

---

## 需要新建的文件

### `src/lib/tabs/tabAvVisualizer/timeline/OperationMarker.tsx`

**Props：**
```tsx
type OperationMarkerProps = {
  operation: Operation
  leftPercent: number    // 已由父组件换算好的水平位置
  onClick: (operation: Operation) => void
}
```

**完整实现：**

```tsx
import { Tooltip } from '@mantine/core'
import { IconArrowDown, IconArrowUp, IconArrowLeft, IconArrowRight } from '@tabler/icons-react'
import { TIMELINE_RULER_Y } from 'lib/tabs/tabAvVisualizer/constants'
import type { Operation } from 'lib/tabs/tabAvVisualizer/types'

const MARKER_SIZE = 16

const TYPE_CONFIG = {
  spd_up:     { icon: IconArrowUp,    color: '#69db7c', label: '加速' },
  spd_down:   { icon: IconArrowDown,  color: '#ff6b6b', label: '减速' },
  av_advance: { icon: IconArrowLeft,  color: '#4dabf7', label: '拉条' },
  av_delay:   { icon: IconArrowRight, color: '#ff922b', label: '推条' },
} as const

function formatOperationLabel(op: Operation): string {
  const config = TYPE_CONFIG[op.type]
  const unitStr = op.unit === 'percent' ? '%' : ''
  const durationStr = op.durationTurns > 0 ? ` ×${op.durationTurns}回合` : ''
  return `${config.label} ${op.value}${unitStr}${durationStr}  @AV ${op.triggerAv.toFixed(1)}`
}

export function OperationMarker({ operation, leftPercent, onClick }: OperationMarkerProps) {
  const config = TYPE_CONFIG[operation.type]
  const Icon = config.icon

  return (
    <Tooltip label={formatOperationLabel(operation)} position='top' withArrow openDelay={100}>
      <div
        onClick={() => onClick(operation)}
        style={{
          position: 'absolute',
          left: `${leftPercent}%`,
          top: TIMELINE_RULER_Y - MARKER_SIZE / 2,
          transform: 'translateX(-50%)',
          width: MARKER_SIZE,
          height: MARKER_SIZE,
          borderRadius: '50%',
          backgroundColor: config.color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
          boxShadow: '0 0 0 2px rgba(0,0,0,0.4)',
        }}
      >
        <Icon size={10} color='#000' />
      </div>
    </Tooltip>
  )
}
```

---

## 注意事项

- 标记渲染在数轴线上（`TIMELINE_RULER_Y` 垂直居中），水平位置由父组件换算并传入 `leftPercent`
- `zIndex: 10` 确保标记显示在 `ActionMarker`（zIndex 1-4）上方，Tooltip 可正常触发
- 颜色方案：加速=绿，减速=红，拉条=蓝，推条=橙 — 与 slot 颜色系统无关，代表效果类型
- 图标选择：上下箭头代表速度变化，左右箭头代表 AV 前后移动，语义直观
- 点击 OperationMarker → 触发 `onClick(operation)` → 父组件决定如何打开编辑面板
- 本组件不负责删除逻辑，删除入口在操作列表面板（TASK-15）

---

## 验收方法

TASK-14 接线完成后，手动验证：
1. 添加操作后，数轴上出现对应颜色的圆点
2. Tooltip 显示类型、数值、触发 AV
3. 点击圆点可打开编辑面板

```bash
npm run typecheck:fast
```
