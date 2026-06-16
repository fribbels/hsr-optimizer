# TASK-03 — Controller（avVisualTabController.ts）

## 目标
创建 Controller，集中处理所有用户交互逻辑和纯计算函数。Controller 是纯对象，不包含任何 React hook 或 JSX。

---

## 需要新建的文件

### `src/lib/tabs/tabAvVisualizer/avVisualTabController.ts`

```ts
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'

export const AvVisualTabController = {

  // ---- 用户交互（透传到 store）----

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

  // ---- 纯计算 ----

  /**
   * 计算某速度在 [0, totalAv) 范围内的所有行动时间点。
   * 第一次行动 = 10000 / spd，之后每隔相同间距触发一次。
   * 例: spd=134, totalAv=300 → [74.63, 149.25, 223.88, 298.51]
   */
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

  /**
   * 将 AV 值转换为在指定行内的百分比位置（0~100）。
   * 调用方负责传入该行的起始 AV 和行宽，支持非均匀行宽（如混沌回忆第一行 150 AV）。
   * 例: av=74.63, rowStart=0, rowSize=100 → 74.63
   *     av=149.25, rowStart=100, rowSize=100 → 49.25
   */
  avToRowPercent(av: number, rowStart: number, rowSize: number): number {
    return ((av - rowStart) / rowSize) * 100
  },
}
```

---

## 注意事项

- **不引入任何 React hook**（`useState`、`useMemo`、`useEffect` 等），Controller 是纯 JS 对象
- 交互方法都是透传，上限/校验逻辑在 store 内处理，controller 不重复判断
- `computeActionPoints` 的边界：`spd <= 0` 时返回空数组，防止除以零
- `avToRowPercent` 接受 `rowStart` 和 `rowSize` 参数，而非 `rowIndex`，支持未来混沌回忆的非均匀行宽
- 返回值可能略超出 0~100（浮点精度），调用方需处理越界（通常不影响渲染）
- 计算函数命名用动词开头（`compute`、`avTo`）
- `ROW_SIZE = 100` 常量在 `constants.ts` 中统一定义，controller 不持有

---

## 验收方法

```ts
AvVisualTabController.computeActionPoints(134, 300)
// 期望: [74.627..., 149.254..., 223.880..., 298.507...]

AvVisualTabController.computeActionPoints(160, 300)
// 期望: [62.5, 125, 187.5, 250]（310.56 >= 300 不包含）

AvVisualTabController.avToRowPercent(74.63, 0, 100)    // → 74.63
AvVisualTabController.avToRowPercent(149.25, 100, 100) // → 49.25
AvVisualTabController.avToRowPercent(223.88, 200, 100) // → 23.88
// 混沌回忆示例（第一行 150 AV）
AvVisualTabController.avToRowPercent(74.63, 0, 150)    // → 49.75
```

`npm run typecheck:fast` 无报错。

---

## Lint 检查

```bash
npm run lint
npm run typecheck:fast
```

两条命令均通过后，本 TASK 完成。
