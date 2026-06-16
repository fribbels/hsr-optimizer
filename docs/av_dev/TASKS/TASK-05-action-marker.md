# TASK-05 — ActionMarker 组件（叶节点）

## 目标
实现时间轴上的单个行动标记。叶节点组件，只接受 props，无任何 store 依赖。

---

## 文件

### `src/lib/tabs/tabAvVisualizer/timeline/ActionMarker.tsx`

**职责：**
- 根据 `stackLevel(0-3)` 映射到 4 条固定泳道位置渲染头像
- 近端泳道（level 0/1）直接以三角指向数轴
- 远端泳道（level 2/3）三角尖到数轴之间渲染虚线连接
- 头像加载失败时显示槽位色圆 + 角色名首字母占位
- hover 显示 Tooltip

**Props：**
```tsx
type ActionMarkerProps = {
  av: number           // 精确 AV 值，用于 Tooltip
  spd: number          // 速度值，用于 Tooltip
  color: string        // 槽位颜色
  characterName: string
  characterId: string  // 用于 Assets.getCharacterAvatarById
  leftPercent: number  // 在行内的百分比位置（0~100），父组件用 avToRowPercent 计算后传入
  stackLevel: number   // 0=上近, 1=下近, 2=上远, 3=下远（直接来自 char.slotIndex）
}
```

**泳道位置计算（模块顶部常量）：**
```ts
const TRIANGLE_H = 7
const TRIANGLE_W = 6
const AVATAR_TRI_GAP = 2   // 头像与三角之间的间距
const RULER_TRI_GAP = 1    // 数轴线与最近三角尖端的间距
const AVATAR_STACK_GAP = 8 // 上下两层头像之间的间距

const ABOVE_CLOSE_TOP = TIMELINE_RULER_Y - RULER_TRI_GAP - TRIANGLE_H - AVATAR_TRI_GAP - TIMELINE_AVATAR_SIZE
const ABOVE_FAR_TOP   = ABOVE_CLOSE_TOP - AVATAR_STACK_GAP - TIMELINE_AVATAR_SIZE
const BELOW_CLOSE_TOP = TIMELINE_RULER_Y + RULER_TRI_GAP + TRIANGLE_H + AVATAR_TRI_GAP
const BELOW_FAR_TOP   = BELOW_CLOSE_TOP + TIMELINE_AVATAR_SIZE + AVATAR_STACK_GAP

const POSITIONS = [
  { avatarTop: ABOVE_CLOSE_TOP, isAbove: true,  isFar: false },  // level 0
  { avatarTop: BELOW_CLOSE_TOP, isAbove: false, isFar: false },  // level 1
  { avatarTop: ABOVE_FAR_TOP,   isAbove: true,  isFar: true  },  // level 2
  { avatarTop: BELOW_FAR_TOP,   isAbove: false, isFar: true  },  // level 3
] as const
```

**渲染结构：**
- 外层容器：`position: absolute, left: leftPercent%, top: 0, height: '100%', transform: translateX(-50%)`
- 头像：`position: absolute, top: avatarTop`，50px 圆形，`border: 2px solid color`
- 三角：上方泳道朝下（▼），下方泳道朝上（▲），CSS border trick
- 虚线（仅 isFar）：`borderLeft: 1px dashed color, opacity: 0.5`，从三角尖连到数轴

---

## 注意事项

- `leftPercent` 由 `TimelineRow` 传入，`ActionMarker` 本身不调用 `avToRowPercent`
- `stackLevel` 直接来自 `char.slotIndex`，不做冲突检测，每个槽位固定一条泳道
- `imgError` 用 `useState(false)` + `onError` 回调控制，触发后显示首字母占位
- 外层容器高度为 `100%`，Tooltip 触发区域覆盖整列（包含虚线），符合预期

---

## Lint 检查

```bash
npm run lint
npm run typecheck:fast
```
