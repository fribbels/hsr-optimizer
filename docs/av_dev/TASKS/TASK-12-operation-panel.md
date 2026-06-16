# TASK-12 — Operation Panel（操作配置面板）

## 目标

新建模态框组件，供用户配置并提交一个 `Operation`。由时间轴上的头像点击或标尺点击触发打开，提交后调用 Controller 写入 store。

---

## 需要新建的文件

### `src/lib/tabs/tabAvVisualizer/operationPanel/OperationPanel.tsx`

**Props：**
```tsx
type OperationPanelProps = {
  opened: boolean
  onClose: () => void
  initialAv: number              // 预填的触发 AV（点击头像/标尺时传入）
  initialSourceCharId?: string   // 预填的触发角色（点击头像时传入）
  characters: Array<{ id: string; name: string; color: string }>  // 当前已选角色，用于 target 下拉
  editTarget?: Operation         // 如果是编辑模式，传入现有 Operation
}
```

**组件结构：**

```tsx
import { Button, Modal, MultiSelect, NumberInput, SegmentedControl, Stack, Text } from '@mantine/core'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import type { Operation, OperationType, OperationUnit } from 'lib/tabs/tabAvVisualizer/types'
import { useState } from 'react'

const TYPE_OPTIONS = [
  { label: '加速', value: 'spd_up' },
  { label: '减速', value: 'spd_down' },
  { label: '拉条', value: 'av_advance' },
  { label: '推条', value: 'av_delay' },
]

const UNIT_OPTIONS = [
  { label: '固定值', value: 'flat' },
  { label: '百分比', value: 'percent' },
]

export function OperationPanel({ opened, onClose, initialAv, initialSourceCharId, characters, editTarget }: OperationPanelProps) {
  const [type, setType] = useState<OperationType>(editTarget?.type ?? 'spd_up')
  const [targets, setTargets] = useState<string[]>(editTarget?.targets ?? [])
  const [value, setValue] = useState<number>(editTarget?.value ?? 0)
  const [unit, setUnit] = useState<OperationUnit>(editTarget?.unit ?? 'flat')
  const [durationTurns, setDurationTurns] = useState<number>(editTarget?.durationTurns ?? 1)
  const [triggerAv, setTriggerAv] = useState<number>(editTarget?.triggerAv ?? initialAv)

  const isAvType = type === 'av_advance' || type === 'av_delay'
  const isSpdType = !isAvType

  function handleSubmit() {
    if (targets.length === 0 || value <= 0) return
    const op: Omit<Operation, 'id'> = {
      triggerAv,
      sourceCharId: initialSourceCharId,
      type,
      targets,
      value,
      unit,
      durationTurns: isAvType ? 0 : durationTurns,
    }
    if (editTarget) {
      AvVisualTabController.updateOperation(editTarget.id, op)
    } else {
      AvVisualTabController.addOperation(op)
    }
    onClose()
  }

  // 切换 type 时若在 AV 类和 SPD 类之间切换，重置 durationTurns
  function handleTypeChange(newType: string) {
    setType(newType as OperationType)
    if (newType === 'av_advance' || newType === 'av_delay') {
      setDurationTurns(0)
    } else if (durationTurns === 0) {
      setDurationTurns(1)
    }
  }

  const targetOptions = characters.map((c) => ({ label: c.name, value: c.id }))

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={editTarget ? '编辑操作' : '添加操作'}
      size='sm'
    >
      <Stack gap='sm'>
        <NumberInput
          label='触发 AV'
          value={triggerAv}
          onChange={(v) => setTriggerAv(typeof v === 'number' ? v : triggerAv)}
          min={0}
          decimalScale={2}
        />

        {initialSourceCharId && (
          <Text size='xs' c='dimmed'>
            触发来源：{characters.find((c) => c.id === initialSourceCharId)?.name ?? initialSourceCharId}
          </Text>
        )}

        <div>
          <Text size='sm' fw={500} mb={4}>效果类型</Text>
          <SegmentedControl
            fullWidth
            data={TYPE_OPTIONS}
            value={type}
            onChange={handleTypeChange}
          />
        </div>

        <MultiSelect
          label='作用对象'
          data={targetOptions}
          value={targets}
          onChange={setTargets}
          placeholder='选择角色'
        />

        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
          <NumberInput
            label='数值'
            value={value}
            onChange={(v) => setValue(typeof v === 'number' ? v : value)}
            min={0}
            style={{ flex: 1 }}
          />
          <SegmentedControl
            data={UNIT_OPTIONS}
            value={unit}
            onChange={(v) => setUnit(v as OperationUnit)}
            style={{ alignSelf: 'flex-end' }}
          />
        </div>

        {isSpdType && (
          <NumberInput
            label='持续回合数（目标角色行动次数）'
            value={durationTurns}
            onChange={(v) => setDurationTurns(typeof v === 'number' ? Math.max(1, v) : durationTurns)}
            min={1}
          />
        )}

        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <Button variant='default' onClick={onClose}>取消</Button>
          <Button onClick={handleSubmit} disabled={targets.length === 0 || value <= 0}>
            {editTarget ? '保存' : '添加'}
          </Button>
        </div>
      </Stack>
    </Modal>
  )
}
```

---

## 注意事项

- 本组件是**受控的无状态 Modal**：不订阅 store，由父组件传入 `opened` / `onClose`
- 提交时直接调用 `AvVisualTabController`，不需要 `onSubmit` 回调透传
- 编辑模式（`editTarget` 存在时）用 `updateOperation` 而非 `addOperation`
- `isAvType` 时隐藏 `durationTurns` 字段，并在提交时强制置为 0
- 触发 AV（`triggerAv`）显示为可修改的 NumberInput：用户点击头像时自动填入，但允许微调
- 组件 open 时不重置内部状态（`useState` 初始值由 `editTarget` / `initialAv` 决定）；若同一面板需要多次打开，由调用方负责销毁/重建（`key={opened ? triggerAv : 'closed'}`）

---

## 验收方法

TASK-14（Timeline 接线）完成后，通过以下路径手动测试：
1. 点击时间轴上的角色头像 → 面板打开，triggerAv 正确预填
2. 选择类型、对象、数值，点击"添加" → 面板关闭，操作出现在列表中
3. 重新点击操作标记 → 进入编辑模式，字段显示已有值
4. 取消 → 不修改 store

```bash
npm run typecheck:fast
```
