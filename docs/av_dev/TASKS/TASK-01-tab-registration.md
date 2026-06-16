# TASK-01 — Tab 注册与空页面骨架

## 目标
在项目中注册新的 AV Visualizer Tab，使其可以通过导航菜单访问，页面显示占位内容即可。

---

## 需要修改的文件

### 1. `src/lib/constants/appPages.ts`

在 `AppPages` enum 中新增：
```ts
AV_VISUALIZER = 'AV_VISUALIZER',
```

在 `PageToRoute` 中新增（RouteSuffix 也需同步新增 `'#av'`）：
```ts
[AppPages.AV_VISUALIZER]: `${BASE_PATH}#av`,
```

### 2. `src/lib/tabs/Tabs.tsx`

- import `AvVisualizerTab`
- 在 `TAB_COMPONENTS` 末尾添加：
  ```ts
  [AppPages.AV_VISUALIZER, AvVisualizerTab],
  ```
- 在 `MOUNT_PRIORITY` 末尾添加：
  ```ts
  AppPages.AV_VISUALIZER,
  ```

### 3. `src/lib/overlays/drawers/MenuDrawer.tsx`

在 `Tools` 分组（`t('Tools.Title')` 那一组）添加菜单项：
```ts
{ key: AppPages.AV_VISUALIZER, label: t('Tools.AVVisualizer'), icon: <IconTimeline size={16} /> },
```
图标从 `@tabler/icons-react` 中选择合适的（如 `IconTimeline`、`IconChartLine`），查阅 https://tabler.io/icons 选择。

### 4. `public/locales/en_US/sidebar.yaml`

在 `Tools:` 下添加：
```yaml
  AVVisualizer: AV Visualizer
```

### 5. 新建 `src/lib/tabs/tabAvVisualizer/AvVisualizerTab.tsx`

内容为最小占位组件，确保注册流程通：
```tsx
export function AvVisualizerTab() {
  return (
    <div style={{ padding: 24 }}>
      AV Visualizer — Phase 1 (WIP)
    </div>
  )
}
```

---

## 注意事项

- `RouteSuffix` 是 `appPages.ts` 中的联合类型，必须把 `'#av'` 加进去，否则 TypeScript 报错
- `PageToRoute` 使用 `satisfies Record<AppPages, Route>` 做类型校验，漏掉任何一个 AppPages 都会报错
- `MenuDrawer` 使用 i18n，label 必须通过 `t('Tools.AVVisualizer')` 读取，不能写死字符串；同时所有语言的 yaml 文件理论上都要加，但开发阶段只加 `en_US` 即可，其他语言缺 key 会 fallback 到 en_US
- 根组件文件名 `AvVisualizerTab.tsx` 需与 import 名称一致

---

## 验收方法

1. `npm run typecheck:fast` — 无报错
2. 启动开发服务器 `npm run start`，打开侧边栏，能看到 **AV Visualizer** 菜单项
3. 点击菜单项，页面跳转并显示占位文字
4. 浏览器地址栏 hash 变为 `#av`

---

## Lint 检查

```bash
npm run update-resources
npm run lint
npm run typecheck:fast
```

**注意**：每次修改 `.yaml` 翻译文件后，必须先运行 `npm run update-resources` 重新生成 `src/types/resources.d.ts`，否则 `t()` 的新 key 会导致 TypeScript 类型报错。

三条命令均无报错后，本 TASK 完成。
