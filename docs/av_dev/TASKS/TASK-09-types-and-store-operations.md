# TASK-09 — 类型定义 + Store 操作扩展

## 目标

新建 `types.ts` 定义共享纯类型；在 `useAVVisualTabStore.ts` 中新增 `operations` 状态和 CRUD actions；更新测试文件。

---

## 需要新建的文件

### `src/lib/tabs/tabAvVisualizer/types.ts`

```ts
export type OperationType = 'spd_up' | 'spd_down' | 'av_advance' | 'av_delay'
export type OperationUnit = 'flat' | 'percent'

export type Operation = {
  id: string
  triggerAv: number
  sourceCharId?: string
  type: OperationType
  targets: string[]
  value: number
  unit: OperationUnit
  durationTurns: number
}

export type SimEvent = {
  av: number
  characterId: string
  actionIndex: number
  effectiveSpd: number
}
```

---

## 需要修改的文件

### `src/lib/tabs/tabAvVisualizer/useAVVisualTabStore.ts`

**新增 import：**
```ts
import { nanoid } from 'nanoid'
import type { Operation } from 'lib/tabs/tabAvVisualizer/types'
```

**扩展 `AVVisualTabStateValues`：**
```ts
interface AVVisualTabStateValues {
  slots: [Slot, Slot, Slot, Slot]
  rowCount: number
  operations: Operation[]   // 新增
}
```

**扩展 `AVVisualTabStateActions`：**
```ts
interface AVVisualTabStateActions {
  // 已有 4 个...
  addOperation: (op: Omit<Operation, 'id'>) => void
  removeOperation: (id: string) => void
  updateOperation: (id: string, patch: Partial<Omit<Operation, 'id'>>) => void
  clearOperations: () => void
}
```

**扩展 `defaultState`：**
```ts
const defaultState: AVVisualTabStateValues = {
  slots: [emptySlot(), emptySlot(), emptySlot(), emptySlot()],
  rowCount: 3,
  operations: [],   // 新增
}
```

**新增 store 实现：**
```ts
addOperation: (op) => {
  set((s) => ({ operations: [...s.operations, { ...op, id: nanoid() }] }))
},

removeOperation: (id) => {
  set((s) => ({ operations: s.operations.filter((o) => o.id !== id) }))
},

updateOperation: (id, patch) => {
  set((s) => ({
    operations: s.operations.map((o) => o.id === id ? { ...o, ...patch } : o),
  }))
},

clearOperations: () => set({ operations: [] }),
```

---

## 需要修改的文件

### `src/lib/tabs/tabAvVisualizer/useAVVisualTabStore.test.ts`

在 `describe('useAVVisualTabStore')` 末尾新增：

```ts
describe('operations', () => {
  it('starts with no operations', () => {
    expect(state().operations).toEqual([])
  })

  it('addOperation appends an operation with a generated id', () => {
    state().addOperation({
      triggerAv: 100,
      type: 'spd_up',
      targets: ['1001'],
      value: 20,
      unit: 'flat',
      durationTurns: 2,
    })
    expect(state().operations).toHaveLength(1)
    expect(state().operations[0].id).toBeTruthy()
    expect(state().operations[0].triggerAv).toBe(100)
  })

  it('addOperation generates unique ids for each operation', () => {
    state().addOperation({ triggerAv: 50, type: 'av_advance', targets: ['1001'], value: 25, unit: 'percent', durationTurns: 0 })
    state().addOperation({ triggerAv: 50, type: 'av_advance', targets: ['1001'], value: 25, unit: 'percent', durationTurns: 0 })
    const ids = state().operations.map((o) => o.id)
    expect(new Set(ids).size).toBe(2)
  })

  it('removeOperation deletes the matching operation', () => {
    state().addOperation({ triggerAv: 100, type: 'spd_up', targets: [], value: 10, unit: 'flat', durationTurns: 1 })
    const id = state().operations[0].id
    state().removeOperation(id)
    expect(state().operations).toHaveLength(0)
  })

  it('removeOperation does not affect other operations', () => {
    state().addOperation({ triggerAv: 50, type: 'spd_up', targets: [], value: 10, unit: 'flat', durationTurns: 1 })
    state().addOperation({ triggerAv: 100, type: 'spd_down', targets: [], value: 5, unit: 'flat', durationTurns: 1 })
    const idToRemove = state().operations[0].id
    state().removeOperation(idToRemove)
    expect(state().operations).toHaveLength(1)
    expect(state().operations[0].triggerAv).toBe(100)
  })

  it('updateOperation patches only the specified fields', () => {
    state().addOperation({ triggerAv: 100, type: 'spd_up', targets: ['1001'], value: 10, unit: 'flat', durationTurns: 2 })
    const id = state().operations[0].id
    state().updateOperation(id, { value: 20, durationTurns: 3 })
    expect(state().operations[0].value).toBe(20)
    expect(state().operations[0].durationTurns).toBe(3)
    expect(state().operations[0].type).toBe('spd_up')
  })

  it('clearOperations removes all operations', () => {
    state().addOperation({ triggerAv: 50, type: 'spd_up', targets: [], value: 10, unit: 'flat', durationTurns: 1 })
    state().addOperation({ triggerAv: 100, type: 'spd_up', targets: [], value: 10, unit: 'flat', durationTurns: 1 })
    state().clearOperations()
    expect(state().operations).toEqual([])
  })
})
```

---

## 注意事项

- `nanoid` 在项目中已有使用，不需要额外安装
- `types.ts` 只含类型，不含逻辑，不导入 React 或 store
- `SimEvent` 虽然在本 TASK 中不被使用，但一并定义，避免后续各 TASK 各自定义
- `export type { AVVisualTabStateValues, AVVisualTabStateActions }` 的 export 保持不变

---

## 验收方法

```bash
npx vitest run src/lib/tabs/tabAvVisualizer/useAVVisualTabStore.test.ts
npm run typecheck:fast
```

两条命令均通过后，本 TASK 完成。
