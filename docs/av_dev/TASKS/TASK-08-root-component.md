# TASK-08 — 根组件整合（AvVisualizerTab.tsx）

## 目标
组装所有子组件，实现数据层到 UI 层的完整串联，完成第一阶段端到端联调。

---

## 需要修改的文件

### `src/lib/tabs/tabAvVisualizer/AvVisualizerTab.tsx`

**职责：**
- 订阅 `useAVVisualTabStore` 的 `slots` 和 `rowCount`
- 为每个已选槽位计算 `baseSpd`（从 characterStore + getShowcaseStats 派生）
- 将 `baseSpd` 传给 `CharacterSlotCard`，将有效速度传给 `Timeline`
- 根组件自身不处理任何交互逻辑

**完整实现：**

```tsx
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { getShowcaseStats } from 'lib/characterPreview/characterPreviewController'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { SLOT_COLORS } from 'lib/tabs/tabAvVisualizer/constants'
import { CharacterSlotCard } from 'lib/tabs/tabAvVisualizer/characterSlotCard/CharacterSlotCard'
import { Timeline } from 'lib/tabs/tabAvVisualizer/timeline/Timeline'

export function AvVisualizerTab() {
  const slots = useAVVisualTabStore((s) => s.slots)
  const rowCount = useAVVisualTabStore((s) => s.rowCount)
  const characters = useCharacterStore((s) => s.characters)
  const { t } = useTranslation('gameData', { keyPrefix: 'Characters' })

  // 为每个槽位计算角色实际速度（baseSpd）
  // baseSpdMap[i] 对应 slots[i] 的实际速度，槽位为空时为 null
  const baseSpdMap = useMemo(() => {
    return slots.map((slot) => {
      if (!slot.characterId) return null
      const character = characters.find((c) => c.id === slot.characterId)
      if (!character) return null
      const relics = getRelicsForCharacter(character)  // 见"注意事项"获取方式
      return getShowcaseStats(character, relics, null).spd
    })
  }, [slots, characters])

  // 传给 Timeline 的有效速度：spdOverride 优先，其次 baseSpd
  // 只包含有角色的槽位
  const timelineCharacters = useMemo(() => {
    return slots
      .map((slot, i) => {
        if (!slot.characterId) return null
        const baseSpd = baseSpdMap[i]
        const effectiveSpd = slot.spdOverride ?? baseSpd
        if (!effectiveSpd) return null
        return {
          id: slot.characterId,
          name: t(`${slot.characterId}.Name`),
          spd: effectiveSpd,
          color: SLOT_COLORS[i],
          slotIndex: i,
        }
      })
      .filter(Boolean)
  }, [slots, baseSpdMap, t])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: 24, width: '100%' }}>

      {/* 顶部：槽位选择区 + 操作区预留 */}
      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', gap: 12 }}>
          {slots.map((slot, i) => (
            <CharacterSlotCard
              key={i}
              slotIndex={i}
              slot={slot}
              characterName={slot.characterId ? t(`${slot.characterId}.Name`) : null}
              baseSpd={baseSpdMap[i]}
            />
          ))}
        </div>
        {/* 操作区预留，后续添加按钮 */}
        <div style={{ flex: 1 }} />
      </div>

      {/* 时间轴 */}
      <Timeline characters={timelineCharacters} rowCount={rowCount} />
    </div>
  )
}
```

---

## 注意事项

**`getRelicsForCharacter` 的获取方式：**
- 参考 `characterPreviewController.tsx` 中 `getShowcaseStats` 的调用上下文
- 遗器通常通过 `character.equipped` 中的 relic ID 列表 + `getRelicById` 组合获取
- 也可能有 `getRelicsByCharacterId(character.id)` 这样的工具函数，开发时搜索项目中现有调用确认

**速度计算成本：**
- `getShowcaseStats(character, relics, null)` 有一定计算成本
- `baseSpdMap` 的 `useMemo` 依赖 `[slots, characters]`，仅在角色数据或槽位变化时重新计算
- Phase 1 先按此实现；如角色数量多且卡顿，可改为只计算已选槽位

**`timelineCharacters` 的 `filter(Boolean)`：**
- 过滤掉空槽（`null`），Timeline 只接收有完整数据的角色
- TypeScript 可能需要 `.filter((c): c is NonNullable<typeof c> => c !== null)` 来正确收窄类型

**角色名：**
- 用 `useTranslation('gameData', { keyPrefix: 'Characters' })` + `t(\`${id}.Name\`)` 获取
- 与 `CharacterSlotCard` 中的调用方式保持一致，父组件统一处理 i18n

---

## 验收方法（端到端）

1. 启动 `npm run start`，导航到 AV Visualizer Tab
2. 导入存档后，点击空槽选择角色，`CharacterSlotCard` 显示立绘、名字、实际速度
3. 时间轴上出现对应颜色的行动标记，位置符合 `10000 / spd` 的间隔
4. 点击铅笔图标手动修改速度，时间轴标记位置实时更新
5. 点击重置图标，时间轴恢复实际速度对应的标记位置
6. 点击"+"按钮，时间轴增加一行，标记正确延续
7. Tooltip 显示正确的角色名、速度、AV 值

---

## Lint 检查

```bash
npm run lint
npm run typecheck:fast
npx vitest run src/lib/tabs/tabAvVisualizer/useAVVisualTabStore.test.ts
```

三条命令均通过，功能验收通过后，**第一阶段开发完成**。
