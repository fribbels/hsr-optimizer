# TASK-11 — Controller 更新

## 目标

在 `avVisualTabController.ts` 中新增 `simulate()` 包装方法和 operation CRUD 方法；同时废弃 `computeActionPoints`（在 TASK-14 完成后移除）。

---

## 需要修改的文件

### `src/lib/tabs/tabAvVisualizer/avVisualTabController.ts`

**完整新版本：**

```ts
import { simulateTimeline } from 'lib/tabs/tabAvVisualizer/simulation/simulateTimeline'
import type { Operation, SimEvent } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'

// TimelineCharacter 在 Timeline.tsx 中定义，此处只需要 id + spd + baseSpd 三个字段
// baseSpd（白值，不含遗器）是 simulateTimeline 计算百分比速度 buff 的必需输入
type SimInput = {
  id: string
  spd: number
  baseSpd: number
}

export const AvVisualTabController = {

  // ---- 槽位操作（不变）----

  setSlotCharacter(slotIndex: number, characterId: string | null) {
    useAVVisualTabStore.getState().setSlotCharacter(slotIndex, characterId)
  },

  setSlotSpdOverride(slotIndex: number, spd: number) {
    useAVVisualTabStore.getState().setSlotSpdOverride(slotIndex, spd)
  },

  resetSlotSpdOverride(slotIndex: number) {
    useAVVisualTabStore.getState().resetSlotSpdOverride(slotIndex)
  },

  addRow() {
    useAVVisualTabStore.getState().addRow()
  },

  // ---- 操作 CRUD（新增）----

  addOperation(op: Omit<Operation, 'id'>) {
    useAVVisualTabStore.getState().addOperation(op)
  },

  removeOperation(id: string) {
    useAVVisualTabStore.getState().removeOperation(id)
  },

  updateOperation(id: string, patch: Partial<Omit<Operation, 'id'>>) {
    useAVVisualTabStore.getState().updateOperation(id, patch)
  },

  clearOperations() {
    useAVVisualTabStore.getState().clearOperations()
  },

  // ---- 模拟引擎包装（新增）----

  simulate(characters: SimInput[], operations: Operation[], totalAv: number): SimEvent[] {
    return simulateTimeline(characters, operations, totalAv)
  },

  // ---- 辅助计算（保留，TASK-14 完成后可移除 computeActionPoints）----

  avToRowPercent(av: number, rowStart: number, rowSize: number): number {
    return ((av - rowStart) / rowSize) * 100
  },

  // @deprecated 将在 TASK-14 中被 simulate() 替代
  computeActionPoints(spd: number, totalAv: number): number[] {
    if (spd <= 0) return []
    const interval = 10000 / spd
    const points: number[] = []
    let current = interval
    while (current < totalAv) {
      points.push(current)
      current += interval
    }
    return points
  },
}
```

---

## 注意事项

- `simulate()` 是 `simulateTimeline()` 的薄包装，不做任何额外逻辑，便于日后在此层加日志或缓存
- `computeActionPoints` 标注 `@deprecated` 但暂时保留，确保 TASK-14 前 Timeline 仍能运行
- `SimInput` 类型在本文件内部定义即可（只需 id + spd + baseSpd），不需要从 `types.ts` 导出
- `TimelineCharacter`（`Timeline.tsx`）已包含 `baseSpd` 字段，结构上兼容 `SimInput[]`，调用 `simulate()` 时无需额外映射

---

## 验收方法

```bash
npm run typecheck:fast
```

通过后，本 TASK 完成。
