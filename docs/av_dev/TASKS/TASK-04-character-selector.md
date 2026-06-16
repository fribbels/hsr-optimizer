# TASK-04 — CharacterSlotCard 组件

## 目标
实现角色选择区域：4 个固定槽位并排，每个槽位可独立选择角色，显示立绘、角色名、速度（含编辑与重置）。

---

## 需要新建的文件

### `src/lib/tabs/tabAvVisualizer/constants.ts`

供多个子组件复用的共享常量：

```ts
export const SLOT_COLORS = ['#4dabf7', '#ff922b', '#69db7c', '#cc5de8'] as const
export const ROW_SIZE = 100
```

---

### `src/lib/tabs/tabAvVisualizer/characterSlotCard/CharacterSlotCard.tsx`

**Props：**
```tsx
type CharacterSlotCardProps = {
  slotIndex: number       // 0~3，决定槽位颜色
  slot: Slot              // 来自 store（characterId + spdOverride）
  characterName: string | null  // 由父组件从 i18n 读取后传入
  baseSpd: number | null        // 角色实际速度，由父组件计算后传入；null = 槽位为空或数据未就绪
}
```

**两种状态：**

- **空槽**：`var(--layer-2)` 背景 + `var(--shadow-card)` 阴影的矩形卡片，`border: 1px solid var(--border-subtle)`，居中显示 `IconPlus` + "Slot N" 文字，点击打开 `CharacterSelect` Modal
- **已选中**：
  - 顶部 3px 槽位色条
  - 图片区（150px 高，`overflow: hidden`）：`Assets.getCharacterPreviewById`，点击重新打开选角 Modal
  - 底部：角色名（单行截断）+ 速度行

**速度行交互：**
- 默认：文本显示速度（`spdOverride ?? baseSpd ?? '—'`），有覆盖时文字变为槽位色
- `IconPencil`：点击进入编辑模式（Mantine `NumberInput`，`autoFocus`，回车/失焦/Escape 退出）
- `IconRefresh`：有 `spdOverride` 时亮起，点击调用 `AvVisualTabController.resetSlotSpdOverride`

**关键实现细节：**
- `CharacterSelect` 始终传 `selectStyle={{ display: 'none' }}`，隐藏自带的 TextInput，仅保留 Modal 功能，通过外部 `opened` / `onOpenChange` 控制开关
- 编辑模式用本地 `isEditing` state，不进 store
- 换角色时 `spdOverride` 会在 store 的 `setSlotCharacter` 内自动清除

---

### `src/lib/tabs/tabAvVisualizer/characterSlotCard/CharacterSlotCard.module.css`

```css
.card { /* var(--layer-2) 背景，var(--shadow-card) 阴影，overflow: hidden */ }
.colorStrip { /* height: 3px，颜色由 inline style 传入 */ }
.imageArea { /* height: 150px，position: relative，overflow: hidden，cursor: pointer */ }
.imageArea:hover .portrait { /* filter: brightness(1.1) saturate(1.1) */ }
.portrait { /* width: 200px，position: absolute，left: 50%，transform: translateX(-50%) */ }
.footer { /* padding: 8px，flex column，align-items: center */ }
.speedRow { /* display: flex，align-items: center，width: 100% */ }
.emptyCard { /* 同背景，border: 1px solid var(--border-subtle)，cursor: pointer */ }
.emptyCard:hover { /* border-color 变亮，background: var(--layer-1) */ }
```

---

## 注意事项

- 不直接读 store，store 状态由父组件（`AvVisualizerTab`）读取后以 props 传入
- `characterName` 和 `baseSpd` 由父组件负责提供，组件本身不做 i18n 或速度计算
- 4 个槽位在 `AvVisualizerTab` 中用 `slots.map` 渲染，`key={slotIndex}`
- 图标用 `@tabler/icons-react`：`IconPlus`、`IconPencil`、`IconRefresh`
- Tooltip 使用 Mantine `Tooltip`，label 为 `'Edit SPD'` / `'Reset SPD'`

---

## 验收方法

1. 启动 `npm run start`，导航到 AV Visualizer Tab
2. 看到 4 个空槽，点击任意一个打开角色选择 Modal
3. 选好角色后：立绘正确显示，角色名正确，速度显示 `—`（baseSpd 未接入时）
4. 点击铅笔图标 → 进入编辑模式，输入数值后回车保存，速度文字变为槽位色
5. 点击重置图标 → 速度恢复
6. 点击立绘可重新选角

---

## Lint 检查

```bash
npm run lint
npm run typecheck:fast
```

两条命令均通过后，本 TASK 完成。
