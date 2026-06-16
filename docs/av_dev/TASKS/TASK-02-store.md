# TASK-02 — Store（useAVVisualTabStore.ts）

## 目标
创建 AV Visualizer Tab 的 Zustand store，存储所有 UI 状态，并编写单元测试覆盖核心操作。

---

## 需要新建的文件

### `src/lib/tabs/tabAvVisualizer/useAVVisualTabStore.ts`

```ts
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'

export type Slot = {
  characterId: string | null
  spdOverride: number | null  // null = 使用角色实际速度
}

interface AVVisualTabStateValues {
  slots: [Slot, Slot, Slot, Slot]  // 固定 4 个槽位，顺序即显示顺序
  rowCount: number                 // 时间轴行数，默认 3
}

interface AVVisualTabStateActions {
  setSlotCharacter: (slotIndex: number, characterId: string | null) => void
  setSlotSpdOverride: (slotIndex: number, spd: number) => void
  resetSlotSpdOverride: (slotIndex: number) => void
  addRow: () => void
}

type AVVisualTabState = AVVisualTabStateValues & AVVisualTabStateActions

const emptySlot = (): Slot => ({ characterId: null, spdOverride: null })

const defaultState: AVVisualTabStateValues = {
  slots: [emptySlot(), emptySlot(), emptySlot(), emptySlot()],
  rowCount: 3,
}

function updateSlot(slots: [Slot, Slot, Slot, Slot], index: number, patch: Partial<Slot>): [Slot, Slot, Slot, Slot] {
  const next = slots.map((s, i) => i === index ? { ...s, ...patch } : s)
  return next as [Slot, Slot, Slot, Slot]
}

const useAVVisualTabStore = createTabAwareStore<AVVisualTabState>((set, get) => ({
  ...defaultState,

  setSlotCharacter: (slotIndex, characterId) => {
    // 换角色时同步清除速度覆盖
    set({ slots: updateSlot(get().slots, slotIndex, { characterId, spdOverride: null }) })
  },

  setSlotSpdOverride: (slotIndex, spd) => {
    set({ slots: updateSlot(get().slots, slotIndex, { spdOverride: spd }) })
  },

  resetSlotSpdOverride: (slotIndex) => {
    set({ slots: updateSlot(get().slots, slotIndex, { spdOverride: null }) })
  },

  addRow: () => set((s) => ({ rowCount: s.rowCount + 1 })),
}))

export { useAVVisualTabStore }
export type { AVVisualTabStateValues, AVVisualTabStateActions }
```

---

### `src/lib/tabs/tabAvVisualizer/useAVVisualTabStore.test.ts`

```ts
// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useAVVisualTabStore } from './useAVVisualTabStore'

function state() { return useAVVisualTabStore.getState() }

beforeEach(() => {
  useAVVisualTabStore.setState(useAVVisualTabStore.getInitialState())
})

describe('initial state', () => {
  it('starts with 4 empty slots', () => {
    expect(state().slots).toHaveLength(4)
    state().slots.forEach((slot) => {
      expect(slot.characterId).toBeNull()
      expect(slot.spdOverride).toBeNull()
    })
  })
  it('starts with 3 rows', () => { expect(state().rowCount).toBe(3) })
})

describe('setSlotCharacter', () => {
  it('sets a character in the target slot', ...)
  it('does not affect other slots', ...)
  it('clears the slot when passed null', ...)
  it('resets spdOverride when a new character is set', ...)
  it('allows all 4 slots to be filled independently', ...)
})

describe('setSlotSpdOverride / resetSlotSpdOverride', () => {
  it('sets the speed override for the target slot', ...)
  it('does not affect other slots', ...)
  it('clears the speed override on reset', ...)
})

describe('addRow', () => {
  it('increments rowCount by 1', ...)
  it('can be called multiple times', ...)
})
```

---

## 注意事项

- 使用 `createTabAwareStore` 而不是普通 `create`，与项目其他 tab store 保持一致
- `slots` 是固定长度 4 的 tuple，用下标（0~3）访问对应槽位
- `updateSlot` 是模块内工具函数，用 `map` 生成新数组再类型断言，保证 tuple 类型不丢失
- `setSlotCharacter` 在换角色时同步清除 `spdOverride`，避免遗留上一个角色的覆盖值
- 数组更新必须生成新引用（`map` 返回新数组），直接 `push` / 直接修改不触发 React 重渲染
- 测试文件顶部必须加 `// @vitest-environment jsdom`
- `beforeEach` 用 `getInitialState()` 重置，比手动传 state 字面量更安全（自动跟随 store 结构变化）

---

## 验收方法

1. `npx vitest run src/lib/tabs/tabAvVisualizer/useAVVisualTabStore.test.ts` 全部通过（13 条）
2. `npm run typecheck:fast` 无报错

---

## Lint 检查

```bash
npm run lint
npm run typecheck:fast
npx vitest run src/lib/tabs/tabAvVisualizer/useAVVisualTabStore.test.ts
```

三条命令均通过后，本 TASK 完成。
