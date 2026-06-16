# AV 可视化 Tab — 第二阶段实现方案

## 目标

在第一阶段纯速度排轴的基础上，支持用户在时间轴上手动添加**操作**（加速 / 减速 / 拉条 / 推条），引擎根据操作动态重新计算后续所有行动位置。

不自动解析角色技能或遗器数据。所有操作由用户手动配置，引擎只负责执行。

---

## 核心概念

### 操作（Operation）

用户在时间轴上指定的一次效果，包含：
- **触发时机**：操作在哪个 AV 生效（`triggerAv`）
- **效果类型**：加速 / 减速 / 拉条 / 推条
- **作用对象**：对哪个（些）角色生效
- **数值与单位**：效果大小（flat = 固定值，percent = 百分比）
- **持续回合**：SPD 类效果持续目标角色的行动次数；AV 类效果为瞬间（0）

### 两种添加操作的方式

| 方式 | 触发入口 | triggerAv 填充 | sourceCharId 填充 |
|------|----------|----------------|-------------------|
| 点击头像 | 点击时间轴上某角色的头像 | 该头像对应的 AV 值（自动） | 该角色 ID（自动） |
| 点击标尺 | 点击时间轴主体的空白处 | 鼠标点击位置换算的 AV 值 | 无 |

两种方式产生相同结构的 `Operation` 对象，引擎不区分来源。

### 模拟引擎

第一阶段的 `computeActionPoints`（静态预算）替换为**统一离散事件循环**：角色行动和操作触发都是时间轴上的事件，按真实 AV 严格排序、归并处理（而不是"等某次行动事件路过时顺便检查触发"）：

```
初始化：每个角色的首次行动入队，AV = 10000 / spd；操作按 triggerAv 排序
循环：
  比较"队列里最近的行动 AV" 与 "下一个待执行操作的 triggerAv"
  若操作更早（或相等）：
    用操作自己的 triggerAv 当"现在"，对所有目标做重算 / 拉推条
  否则：
    取出该行动事件，记录结果
    计算角色下次行动 AV = 当前 AV + 10000 / 当前有效速度，入队
  直到两者都 ≥ totalAv
```

> 这个设计上的区别很关键：操作永远用**自己的 `triggerAv`** 计算，不会借用"凑巧触发检查的那次行动"的 AV。早期实现里两者被混用，导致"目标恰好是即将行动的角色"时拉条/推条完全失效，以及触发位置之前没有任何角色行动时，重算基准算错（详见 TASK-10 "关键机制"第5点）。

---

## 数据模型

### `Operation` 类型（新增，定义在 `types.ts`）

```ts
export type OperationType = 'spd_up' | 'spd_down' | 'av_advance' | 'av_delay'
export type OperationUnit = 'flat' | 'percent'

export type Operation = {
  id: string               // nanoid，用作 React key 和 CRUD 定位
  triggerAv: number        // 触发时机（AV 值）
  sourceCharId?: string    // 触发者（点击头像时自动填入）；仅用于 UI 标注，不影响模拟
  type: OperationType
  targets: string[]        // 受影响的 characterId 列表
  value: number            // 效果大小
  unit: OperationUnit      // flat = 固定值；percent = 百分比
  durationTurns: number    // SPD 效果持续目标角色的行动次数；AV 效果填 0
}
```

### `SimEvent` 类型（模拟引擎输出，定义在 `types.ts`）

```ts
export type SimEvent = {
  av: number
  characterId: string
  actionIndex: number    // 该角色的第几次行动（0-based）
  effectiveSpd: number   // 行动时刻的有效速度（用于 Tooltip 显示）
}
```

### Store 扩展（`useAVVisualTabStore.ts`）

新增状态字段和操作：

```ts
interface AVVisualTabStateValues {
  slots: [Slot, Slot, Slot, Slot]
  rowCount: number
  operations: Operation[]   // 新增
}

interface AVVisualTabStateActions {
  // 已有...
  addOperation: (op: Omit<Operation, 'id'>) => void
  removeOperation: (id: string) => void
  updateOperation: (id: string, patch: Partial<Omit<Operation, 'id'>>) => void
  clearOperations: () => void
}
```

---

## 模拟引擎（`simulation/simulateTimeline.ts`）

纯函数，无副作用，无 React 依赖：

```ts
function simulateTimeline(
  characters: Array<{ id: string; spd: number; baseSpd: number }>,
  operations: Operation[],
  totalAv: number
): SimEvent[]
```

`spd` 是角色面板总速度（含遗器），`baseSpd` 是角色白值（不含遗器，来自 `getGameMetadata().characters[id].stats[Stats.SPD]`），用于百分比速度 buff 的换算基准。

**速度 buff 语义（按崩铁实际机制）：**
- 百分比速度 buff/debuff 按**白值**换算为固定值：`flatDelta = whiteSpd × (value / 100)`，不是按当前面板速度的百分比。例：白值100，遗器+30（面板130），50%加速 → `+50`（不是 `130×50%=65`）
- `durationTurns = N` 表示该 buff 总共提供 N 个加速区间。若 buff 生效时该角色还没行动（需用**行动条守恒公式**重算其排在队列中的下次行动 AV：`新剩余AV = (剩余AV × 旧速度) / 新速度`，剩余AV 以**操作自己的 `triggerAv`** 为基准，不是凑巧触发检查的某次行动的 AV），且 `剩余AV > 0`（真正跨越了一段尚未发生的距离），这段被重算的区间本身也消耗 1 个回合，保证与"恰好在角色自己回合生效"时提供的总加速区间数一致；`剩余AV === 0`（触发点正好与目标下次行动重合）则不额外消耗，避免误判

**AV 拉条语义（percent）：** 减少目标角色**当前最大行动间隔**（`10000 / effectiveSpd`）的 value%，即 `delta = maxInterval * (value / 100)`，目标 AV 减少 `delta`，但不会拉到触发点之前（clamp）。**不是**按"剩余 AV"的百分比。

**AV 推条语义（percent）：** 同理，增加最大行动间隔的 value%。

**flat 单位：** 直接加减固定 AV 值。

---

## 架构变化总览

| 组件 | Phase 1 | Phase 2 变化 |
|------|---------|-------------|
| `useAVVisualTabStore` | `slots`, `rowCount` | 新增 `operations[]` + CRUD |
| `avVisualTabController` | `computeActionPoints` | 替换为 `simulate()`，新增 operation CRUD 方法 |
| `Timeline.tsx` | 调用 `computeActionPoints` 逐角色计算 | 调用 `simulate()` 获取 `SimEvent[]`，接受 `operations` prop |
| `TimelineRow.tsx` | 接收 `CharacterEntry[]` | 接收 `SimEvent[]` + `characters map`，处理标尺点击 |
| `ActionMarker.tsx` | 无 onClick | 新增 `onClick` prop，点击时上报 AV 给父组件 |
| `AvVisualizerTab.tsx` | 不感知 operations | 从 store 读 operations，右侧面板显示操作列表 |

---

## 文件结构

```
src/lib/tabs/tabAvVisualizer/
├── types.ts                              # 新增：Operation、SimEvent 等共享纯类型
├── AvVisualizerTab.tsx                   # 修改：传 operations 给 Timeline，右侧面板改为操作列表
├── avVisualTabController.ts              # 修改：新增 simulate()、addOperation 等
├── constants.ts                          # 不变
├── useAVVisualTabStore.ts                # 修改：新增 operations 状态和 CRUD
├── useAVVisualTabStore.test.ts           # 修改：新增 operations CRUD 测试
├── characterSlotCard/                    # 不变
├── operationPanel/                       # 新增文件夹
│   └── OperationPanel.tsx               # 新增：添加 / 编辑操作的模态框
├── simulation/                           # 新增文件夹
│   ├── simulateTimeline.ts              # 新增：纯模拟引擎函数
│   └── simulateTimeline.test.ts         # 新增：引擎单元测试
└── timeline/
    ├── Timeline.tsx                      # 修改：调用 simulate()，处理标尺点击委托
    ├── TimelineRow.tsx                   # 修改：接收 SimEvent[]，渲染 OperationMarker，处理点击
    ├── ActionMarker.tsx                  # 修改：新增 onClick prop
    └── OperationMarker.tsx              # 新增：标尺上的操作标注点
```

---

## 各层职责（重点变化）

### `types.ts`

只含纯类型定义（`Operation`, `OperationType`, `OperationUnit`, `SimEvent`），无逻辑。供 store、simulation、UI 统一 import。

### `simulation/simulateTimeline.ts`

只导入 `types.ts` 中的类型，其余无外部依赖。以函数形式导出，便于 vitest 直接测试。

### `avVisualTabController.ts`

新增：
```ts
simulate(
  characters: TimelineCharacter[],
  operations: Operation[],
  totalAv: number
): SimEvent[]  // 薄包装，映射类型后调用 simulateTimeline

addOperation(op: Omit<Operation, 'id'>): void
removeOperation(id: string): void
updateOperation(id: string, patch: Partial<Omit<Operation, 'id'>>): void
clearOperations(): void
```

`computeActionPoints` 可在 TASK-13 后废弃。

### `OperationPanel.tsx`

Mantine `Modal`，包含：
- triggerAv 显示（只读预填，可调整）
- type 选择：SegmentedControl（加速 / 减速 / 拉条 / 推条）
- targets 多选：MultiSelect，选项来自当前已选角色
- value + unit：NumberInput + SegmentedControl（固定值 / 百分比）
- durationTurns：仅 spd_up / spd_down 时显示，min=1
- 确认 / 取消按钮

### `OperationMarker.tsx`

渲染在 `TimelineRow` 数轴上，位置由 `triggerAv` 计算。
- 小图标区分类型（上箭头 = 加速/拉条，下箭头 = 减速/推条，或用颜色区分）
- Tooltip 显示操作摘要
- 点击触发编辑，右键或 hover 显示删除按钮

### `TimelineRow.tsx`

- 接收 `simEvents: EnrichedSimEvent[]`（含 color、name、slotIndex 等展示字段，由 Timeline 负责丰化）
- 接收 `operations: Operation[]`（过滤本行 triggerAv 范围内的操作，渲染 `OperationMarker`）
- 标尺主体区 `onClick`：根据 `e.clientX` 换算 AV，触发 `onRulerClick(av)` 回调

---

## UI 交互流程

```
用户点击头像 →
  ActionMarker.onClick(av, characterId)
  → TimelineRow → Timeline → AvVisualizerTab
  → 打开 OperationPanel（triggerAv 预填，sourceCharId 预填）
  → 用户填写参数 → 确认
  → AvVisualTabController.addOperation()
  → store 更新 → Timeline useMemo 重算 simulate() → 头像位置更新

用户点击标尺 →
  TimelineRow.onRulerClick(av)
  → Timeline → AvVisualizerTab
  → 打开 OperationPanel（triggerAv 预填，无 sourceCharId）
  → 同上流程
```

---

## 代码规范（与第一阶段一致）

- 布局用原生 `<div style={{ ... }}`，交互效果用 CSS Modules
- UI 组件用 `@mantine/core`，图标用 `@tabler/icons-react`
- Controller 方法直接调用 `useAVVisualTabStore.getState()`，不在 React 上下文内
- 纯计算函数放 controller 或 simulation 文件，不放组件
- Store 分 `StateValues` / `StateActions` interface，用 `createTabAwareStore`
- 类型定义：`interface` 用于对象结构，`type` 用于联合类型

---

## 开发顺序

| TASK | 内容 | 关键依赖 | 状态 |
|------|------|----------|------|
| TASK-09 | `types.ts` + Store 扩展 + 测试更新 | — | 已完成 |
| TASK-10 | `simulation/simulateTimeline.ts` + 单元测试 | TASK-09 | 已完成（含白值/行动条守恒/AV百分比基准修正，以及统一事件队列架构重写） |
| TASK-11 | Controller 更新（simulate + CRUD） | TASK-10 | 已完成 |
| TASK-12 | `OperationPanel.tsx` | TASK-09 | 已完成 |
| TASK-13 | `OperationMarker.tsx` | TASK-09 | 已完成 |
| TASK-14 | Timeline 接线（Timeline + TimelineRow + ActionMarker 修改） | TASK-11、12、13 | 已完成 |
| TASK-15 | `AvVisualizerTab.tsx` 根组件更新 | TASK-14 | 已完成 |

**第二阶段（TASK-09 ~ TASK-15）已全部完成。**

> TASK-09/10 完成过程中额外做了一处提前实现：`Timeline.tsx` 的 `TimelineCharacter` 类型和 `AvVisualizerTab.tsx` 已经提前加上了 `baseSpd`（白值）字段并从 `getGameMetadata()` 读取，为 TASK-11/14 接入 `simulate()` 做好了准备（详见 TASK-11 的 `SimInput` 类型）。
>
> TASK-14 接线完成后，实际使用中发现拉条/推条对"即将行动角色"失效、且操作触发位置计算错误两个问题，根源是模拟引擎把"操作触发"和"角色行动"建模成了不对等的两种东西。修复方式是把 `simulateTimeline.ts` 重构为统一离散事件队列（操作和行动按真实 AV 归并处理），详见 TASK-10 文档"关键机制"第5点。
