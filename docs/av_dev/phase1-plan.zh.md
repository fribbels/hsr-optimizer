# AV 可视化 Tab — 第一阶段实现方案

## 目标

新增一个 Tab，用户可在 4 个固定槽位中选择角色，程序根据各角色的最终速度（支持手动覆盖）在横向行动值时间轴上绘制行动标记。第一阶段不考虑任何技能、遗器套装效果、buff/debuff，仅基于纯速度排轴。

---

## 架构分层

参考 `tabRelics` 的模式，分为四层：

```
AvVisualizerTab.tsx          ← 极薄的根组件，只管布局和派生数据计算
avVisualTabController.ts     ← 纯对象，处理用户交互，调用 store / service
useAVVisualTabStore.ts       ← 该 Tab 的所有 UI 状态
useAVVisualTabStore.test.ts  ← store 单元测试
子组件文件夹/                 ← 各区域独立文件夹
```

**原则：**
- `useAVVisualTabStore` 只存 UI 状态（槽位选角、速度覆盖、行数），不重复存储角色实体
- 角色实体仍在全局 `characterStore`，速度是派生值，按需计算后以 props 传入子组件
- Controller 负责所有业务逻辑，组件不直接处理数据

---

## 数据流

```
全局 characterStore（用户导入存档后自动填充）
    ↓
useAVVisualTabStore.slots[i].characterId   ← UI 状态：各槽位选中的角色
    ↓
AvVisualizerTab（useMemo）：
  getCharacterById(id)                      ← 从 characterStore 读角色 + 遗器
  getShowcaseStats(character, relics, null) ← 计算最终面板（含遗器速度词条）
  → BasicStatsObject.spd                   ← 角色实际速度（baseSpd）
  → 若 slot.spdOverride !== null，用覆盖值替代 baseSpd
  → AV = 10000 / effectiveSpd             ← 行动间隔
    ↓
baseSpd 传给 CharacterSlotCard（显示 + 允许手动覆盖）
effectiveSpd 传给 Timeline（计算行动标记位置）
```

速度是**派生数据**，不进 store。`getShowcaseStats` 位于
`src/lib/characterPreview/characterPreviewController.tsx`，已包含完整计算逻辑，直接复用。

---

## 文件结构

```
src/lib/tabs/tabAvVisualizer/
├── AvVisualizerTab.tsx              # 根组件，布局骨架 + 派生数据计算
├── avVisualTabController.ts         # 业务逻辑（槽位操作、加行、纯计算函数）
├── constants.ts                     # 共享常量：SLOT_COLORS、ROW_SIZE
├── useAVVisualTabStore.ts           # Zustand store（UI 状态）
├── useAVVisualTabStore.test.ts      # store 单元测试
├── characterSlotCard/
│   ├── CharacterSlotCard.tsx        # 单个角色槽位卡片（含选角 Modal + 速度编辑）
│   └── CharacterSlotCard.module.css
└── timeline/
    ├── Timeline.tsx                  # 时间轴整体（多行 + 加号按钮）
    ├── TimelineRow.tsx               # 单行（100 AV 范围）
    └── ActionMarker.tsx              # 单个行动标记点
```

---

## 各层职责

### `useAVVisualTabStore.ts`

只存 UI 状态，参考 `useRelicsTabStore` 的 `StateValues / StateActions` 拆分方式：

```ts
type Slot = {
  characterId: string | null
  spdOverride: number | null  // null = 使用角色实际速度
}

interface AVVisualTabStateValues {
  slots: [Slot, Slot, Slot, Slot]  // 固定 4 个槽位
  rowCount: number                 // 默认 3
}

interface AVVisualTabStateActions {
  setSlotCharacter: (slotIndex: number, characterId: string | null) => void
  setSlotSpdOverride: (slotIndex: number, spd: number) => void
  resetSlotSpdOverride: (slotIndex: number) => void
  addRow: () => void
}
```

使用 `createTabAwareStore`（与 Relics tab 保持一致）。

---

### `avVisualTabController.ts`

纯对象，方法直接调用 store 的 `getState()`，不使用任何 React hook。同时承载所有纯计算函数：

```ts
export const AvVisualTabController = {
  // 用户交互（透传到 store）
  setSlotCharacter(slotIndex: number, characterId: string | null),
  setSlotSpdOverride(slotIndex: number, spd: number),
  resetSlotSpdOverride(slotIndex: number),
  addRow(),

  // 纯计算：某速度在指定 AV 总范围内的所有行动时间点
  computeActionPoints(spd: number, totalAv: number): number[],

  // 纯计算：AV 值在某一行内的百分比位置（调用方传入 rowStart 和 rowSize，支持非均匀行宽）
  avToRowPercent(av: number, rowStart: number, rowSize: number): number,
}
```

---

### `AvVisualizerTab.tsx`

极薄，负责布局和派生数据计算，不处理交互逻辑：

**页面布局（两行）：**
```
┌──────────────────────────────┬──────────────────┐
│  4 个 CharacterSlotCard 并排  │  操作区（预留）   │
└──────────────────────────────┴──────────────────┘
│  Timeline（多行时间轴）                           │
```

```tsx
export function AvVisualizerTab() {
  const slots = useAVVisualTabStore((s) => s.slots)
  const rowCount = useAVVisualTabStore((s) => s.rowCount)
  const { t } = useTranslation('gameData', { keyPrefix: 'Characters' })

  // 计算每个已选角色的 baseSpd（useMemo 依赖 slots）
  const baseSpdMap = useMemo(() => { ... }, [slots])

  // 传给 Timeline 的有效速度（spdOverride ?? baseSpd）
  const timelineCharacters = useMemo(() => { ... }, [slots, baseSpdMap])

  return (
    <div style={{ flexDirection: 'column', padding: 24, gap: 16 }}>
      <div style={{ display: 'flex', gap: 16 }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {slots.map((slot, i) => (
            <CharacterSlotCard
              key={i}
              slotIndex={i}
              slot={slot}
              characterName={slot.characterId ? t(`${slot.characterId}.Name`) : null}
              baseSpd={baseSpdMap[i] ?? null}
            />
          ))}
        </div>
        <div style={{ flex: 1 }} /> {/* 操作区预留 */}
      </div>
      <Timeline characters={timelineCharacters} rowCount={rowCount} />
    </div>
  )
}
```

---

### `CharacterSlotCard.tsx`

- 4 个槽位并排，每个槽位一个实例
- 空槽：`var(--layer-2)` 矩形卡片，点击打开 `CharacterSelect` Modal
- 已选中：顶部 3px 槽位色条 + 竖版立绘（点击重新选角）+ 角色名 + 速度行
- 速度行：文本显示 → 铅笔图标进入编辑模式（`NumberInput`）→ 重置图标还原实际速度
- `CharacterSelect` 传 `selectStyle={{ display: 'none' }}` 隐藏内置 TextInput

### `Timeline.tsx`

- 接收 `characters`（含有效速度）和 `rowCount`
- 在此集中预计算全轴行动点（`useMemo`）
- 渲染 `rowCount` 个 `TimelineRow`
- 底部"+"按钮调用 `AvVisualTabController.addRow()`

### `TimelineRow.tsx`

- 接收 `rowIndex`、`characters`（含预计算的 `actionPoints` 和 `slotIndex`）
- 渲染水平数轴（小刻度 1 AV、大刻度 10 AV + 标签，上下对称）
- 左侧 56px 标签区显示 `rowStart`（背景略深）
- 筛选落在本行范围内的行动点，直接以 `char.slotIndex` 作为 `stackLevel` 传给 `ActionMarker`
- `RULER_INSET` 两侧留白，防止边缘头像被 `overflow: hidden` 裁剪

### `ActionMarker.tsx`

- 接收 `av`、`spd`、`color`、`characterName`、`characterId`、`leftPercent`、`stackLevel`
- 根据 `stackLevel(0-3)` 映射到 4 条固定泳道位置（上近/下近/上远/下远）
- 渲染 50px 圆形头像，头像加载失败时显示首字母占位圆
- 近端（level 0/1）：三角箭头直接指向数轴
- 远端（level 2/3）：三角箭头 + 虚线从三角尖连接至数轴
- hover 时显示 Tooltip：角色名 + 速度 + 精确 AV 值

---

## Tab 注册（修改现有文件）

- `src/lib/constants/appPages.ts`：`AppPages.AV_VISUALIZER = 'AV_VISUALIZER'`，路由 `#av`
- `src/lib/tabs/Tabs.tsx`：`TAB_COMPONENTS` + `MOUNT_PRIORITY`
- `src/lib/overlays/drawers/MenuDrawer.tsx`：Tools 组添加菜单项，图标 `IconTimeline`
- `public/locales/en_US/sidebar.yaml`：`AVVisualizer: AV Visualizer`

---

## UI 偏好

### 组件库
- UI 组件统一使用 `@mantine/core`，图标统一使用 `@tabler/icons-react`

### 布局
- 布局用 `<div style={{ display: 'flex', ... }}>`，不强制用 Mantine `Flex`/`Stack`
- 时间轴本体（刻度线、标记定位）全部用原生 `<div>` + inline style

### 样式
| 场景 | 写法 |
|------|------|
| 布局、定位、尺寸 | inline style |
| hover 效果、动画 | CSS Modules（`.module.css`）|

### 卡片风格（与优化器统一）
- 背景：`var(--layer-2)`
- 阴影：`var(--shadow-card)`
- 圆角：`border-radius: 6px`
- 槽位色条：卡片顶部 3px 实色条

---

## 颜色方案

| 槽位 | 颜色 |
|------|------|
| 0 | `#4dabf7`（蓝） |
| 1 | `#ff922b`（橙） |
| 2 | `#69db7c`（绿） |
| 3 | `#cc5de8`（紫） |

---

## 时间轴视觉规格

- 行高：`TIMELINE_ROW_HEIGHT = 260px`，每行独立卡片（`var(--layer-2)` 背景 + `var(--shadow-card)`）
- 左侧行标签区：56px 宽，背景 `var(--layer-1)`（略深于主体），显示该行起始 AV 值
- 数轴：水平线居中（`TIMELINE_RULER_Y = 130px`），颜色 `var(--mantine-color-dimmed)`
  - 小刻度：每 1 AV 一个，上下各 2px（以数轴为中心）
  - 大刻度：每 10 AV 一个，上下各 5px，下方附 AV 数字标签
  - 数轴两侧留 `RULER_INSET`（= 头像半径 + 4px）缓冲，防边缘裁剪
- 行动标记：50px 圆形头像（`TIMELINE_AVATAR_SIZE = 50`），有槽位色边框
  - 4 条固定泳道，由槽位索引决定（不依赖冲突检测）：
    - slotIndex 0 → 上近（▼ 三角直接指向数轴）
    - slotIndex 1 → 下近（▲ 三角直接指向数轴）
    - slotIndex 2 → 上远（▼ 三角 + 虚线连接到数轴）
    - slotIndex 3 → 下远（▲ 三角 + 虚线连接到数轴）
  - 头像加载失败时显示槽位色圆圈 + 角色名首字母占位
- 行与行之间有 8px 间距，每行独立圆角卡片

---

## 不在本阶段范围内

- 技能拉条 / 加速 / 减速
- 遗器套装速度加成
- 敌人行动
- 追加攻击
- 混沌回忆非均匀行宽（`avToRowPercent` 已预留接口，Phase 2 实现）

---

## 开发顺序

1. `appPages.ts` + `Tabs.tsx` 注册 Tab（TASK-01）
2. `useAVVisualTabStore.ts` + 单元测试（TASK-02）
3. `avVisualTabController.ts`（TASK-03）
4. `CharacterSlotCard.tsx` + `constants.ts`（TASK-04）
5. `ActionMarker.tsx`（TASK-05）
6. `TimelineRow.tsx`（TASK-06）
7. `Timeline.tsx`（TASK-07）
8. `AvVisualizerTab.tsx` 整合联调（TASK-08）
