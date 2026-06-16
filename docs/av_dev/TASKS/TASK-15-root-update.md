# TASK-15 — 根组件更新（AvVisualizerTab.tsx）

> **状态：已完成。** 第二阶段（TASK-09 ~ TASK-15）全部完成。

## 目标

将 `operations` 从 store 接入 `Timeline`，并将右侧"Reserved for future controls"区域改为操作列表面板，支持查看和删除已添加的操作。

---

## 需要修改的文件

### `src/lib/tabs/tabAvVisualizer/AvVisualizerTab.tsx`

**新增 import：**
```ts
import { ActionIcon, Text, Tooltip } from '@mantine/core'
import { IconTrash, IconX } from '@tabler/icons-react'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import type { Operation } from 'lib/tabs/tabAvVisualizer/types'
```

**新增 store 订阅：**
```ts
const operations = useAVVisualTabStore((s) => s.operations)
```

**Timeline 传 operations：**
```tsx
<Timeline characters={timelineCharacters} rowCount={rowCount} operations={operations} />
```

**右侧面板改为操作列表：**

```tsx
<div style={{
  flex: 1,
  alignSelf: 'stretch',
  background: 'var(--layer-1)',
  borderRadius: 6,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}}>
  {/* 标题栏 */}
  <div style={{
    padding: '8px 12px',
    borderBottom: '1px solid var(--border-default)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  }}>
    <Text size='xs' fw={600} c='dimmed'>操作列表</Text>
    {operations.length > 0 && (
      <Tooltip label='清除全部' withArrow>
        <ActionIcon
          variant='subtle'
          color='gray'
          size='xs'
          onClick={AvVisualTabController.clearOperations}
        >
          <IconX size={12} />
        </ActionIcon>
      </Tooltip>
    )}
  </div>

  {/* 操作条目 */}
  <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
    {operations.length === 0 ? (
      <div style={{
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 12,
        color: 'var(--mantine-color-dimmed)',
        userSelect: 'none',
      }}>
        点击时间轴添加操作
      </div>
    ) : (
      operations.map((op) => (
        <OperationListItem key={op.id} operation={op} characterNames={characterNameMap} />
      ))
    )}
  </div>
</div>
```

**`OperationListItem` 子组件（定义在同文件底部）：**

```tsx
const TYPE_LABELS: Record<Operation['type'], string> = {
  spd_up: '加速', spd_down: '减速', av_advance: '拉条', av_delay: '推条',
}

function OperationListItem({
  operation,
  characterNames,
}: {
  operation: Operation
  characterNames: Map<string, string>
}) {
  const unitStr = operation.unit === 'percent' ? '%' : ''
  const durationStr = operation.durationTurns > 0 ? ` ×${operation.durationTurns}回合` : ''
  const targetStr = operation.targets
    .map((id) => characterNames.get(id) ?? id)
    .join('、')

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '4px 12px',
      fontSize: 11,
      gap: 8,
    }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <Text size='xs' c='dimmed' truncate>
          AV {operation.triggerAv.toFixed(1)}
          {' · '}
          {TYPE_LABELS[operation.type]} {operation.value}{unitStr}{durationStr}
          {' → '}
          {targetStr}
        </Text>
      </div>
      <ActionIcon
        variant='subtle'
        color='gray'
        size='xs'
        onClick={() => AvVisualTabController.removeOperation(operation.id)}
      >
        <IconTrash size={11} />
      </ActionIcon>
    </div>
  )
}
```

**`characterNameMap` 的构建（在组件内 useMemo）：**

```ts
const characterNameMap = useMemo(() => {
  const map = new Map<string, string>()
  slots.forEach((slot, i) => {
    if (slot.characterId) {
      map.set(slot.characterId, t(`${slot.characterId}.Name`))
    }
  })
  return map
}, [slots, t])
```

---

## 注意事项

- 操作列表面板高度由 `alignSelf: 'stretch'` 与左侧槽位卡片等高
- 条目过多时列表区域独立滚动（`overflowY: 'auto'`），不撑开整个布局
- `OperationListItem` 只提供删除入口；编辑入口在时间轴的 `OperationMarker` 点击
- 清除全部按钮（`clearOperations`）仅在有操作时显示
- `characterNameMap` 用 `useMemo` 避免 `OperationListItem` 渲染时重复计算

---

## 验收方法（端到端 Phase 2 验收）

1. 选 4 个角色，查看初始排轴（应与 Phase 1 一致）
2. 点击某角色头像 → 面板打开，triggerAv 对应该行动 AV
3. 添加加速操作 → 右侧列表出现该条目，时间轴头像位置更新
4. 点击标尺空白处 → 面板打开，triggerAv 为点击位置
5. 点击 OperationMarker → 进入编辑模式，修改后保存生效
6. 点击列表条目旁的删除图标 → 条目消失，时间轴恢复
7. 点击"清除全部" → 列表清空，时间轴恢复初始状态

```bash
npm run lint
npm run typecheck:fast
npx vitest run src/lib/tabs/tabAvVisualizer/
```

三条命令均通过，功能验收通过后，**第二阶段开发完成**。
