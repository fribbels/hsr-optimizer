import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import {
  TIMELINE_AVATAR_SIZE,
  TIMELINE_ROW_HEIGHT,
  TIMELINE_RULER_Y,
} from 'lib/tabs/tabAvVisualizer/constants'
import { ActionMarker } from 'lib/tabs/tabAvVisualizer/timeline/ActionMarker'
import { InterventionMarker } from 'lib/tabs/tabAvVisualizer/timeline/InterventionMarker'
import type { EnrichedSimEvent, MarkerClickContext } from 'lib/tabs/tabAvVisualizer/timeline/Timeline'
import type { Intervention } from 'lib/tabs/tabAvVisualizer/types'
import { Fragment, useMemo, useState, type ReactNode } from 'react'

type TimelineRowProps = {
  rowStart: number                // 本行起始 AV（由父组件按混沌回忆模式计算好传入）
  rowSize: number                 // 本行 AV 跨度（普通行=100，混沌回忆首行=150）
  simEvents: EnrichedSimEvent[]   // 已由父组件（Timeline）过滤到本行范围
  interventions: Intervention[]   // 本行范围内的干预（由父组件过滤）
  onMarkerClick: (ctx: MarkerClickContext) => void
  onRulerClick: (av: number) => void
  topRightOverlay?: ReactNode     // 浮层（如混沌回忆开关），仅首行传入
}

const RULER_INSET = TIMELINE_AVATAR_SIZE / 2 + 4
const HOVER_DOT_SIZE = 7

// 鼠标 X 坐标 → 吸附到最近整数 AV（点击和悬停预览共用，保证两者行为一致）
function snapAvFromClientX(clientX: number, rect: DOMRect, rowStart: number, rowSize: number, rowEnd: number): number {
  const relativeX = clientX - rect.left
  const rawAv = rowStart + (relativeX / rect.width) * rowSize
  const snapped = Math.round(rawAv)
  return Math.max(rowStart, Math.min(rowEnd - 1, snapped))
}

export function TimelineRow({
  rowStart,
  rowSize,
  simEvents,
  interventions,
  onMarkerClick,
  onRulerClick,
  topRightOverlay,
}: TimelineRowProps) {
  const rowEnd = rowStart + rowSize

  // 悬停预览：鼠标移动时实时计算吸附后的整数 AV，用于绘制预览圆点
  const [hoverAv, setHoverAv] = useState<number | null>(null)

  // 刻度：每 10 AV 一个大刻度（带数字标签），其余每 1 AV 一个小刻度；按 rowSize 动态生成
  // （rowSize 可能是 100 或 150，故不能假设刻度数字与百分比数值相等）
  const { smallTicks, largeTicks } = useMemo(() => {
    const small: number[] = []
    const large: number[] = []
    for (let av = 1; av < rowSize; av++) {
      if (av % 10 === 0) large.push(av)
      else small.push(av)
    }
    return { smallTicks: small, largeTicks: large }
  }, [rowSize])

  // 按 (characterId, av) 分组：同一角色在同一 AV 多次行动时只渲染一个头像，徽章显示次数
  const markers = useMemo(() => {
    type MarkerGroup = {
      event: EnrichedSimEvent & { leftPercent: number }
      actionCount: number
    }
    const groups = new Map<string, MarkerGroup>()
    for (const event of simEvents) {
      const key = `${event.characterId}:${event.av}`
      if (!groups.has(key)) {
        groups.set(key, {
          event: { ...event, leftPercent: AvVisualTabController.avToRowPercent(event.av, rowStart, rowSize) },
          actionCount: 0,
        })
      }
      groups.get(key)!.actionCount++
    }
    return Array.from(groups.values())
  }, [simEvents, rowStart, rowSize])

  // 按 triggerAv 分组：每个唯一 AV 位置只渲染一个标记，显示该位置的干预总数
  const interventionGroups = useMemo(() => {
    const map = new Map<number, number>()
    for (const iv of interventions) {
      map.set(iv.triggerAv, (map.get(iv.triggerAv) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([av, count]) => ({
      triggerAv: av,
      count,
      leftPercent: AvVisualTabController.avToRowPercent(av, rowStart, rowSize),
    }))
  }, [interventions, rowStart, rowSize])

  return (
    <div style={{
      background: 'var(--layer-2)',
      boxShadow: 'var(--shadow-card)',
      borderRadius: 6,
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'stretch',
      width: '100%',
      position: 'relative',
    }}>

      {/* 左侧行标签 */}
      <div style={{
        width: 56,
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        fontWeight: 600,
        color: 'var(--mantine-color-dimmed)',
        userSelect: 'none',
        background: 'var(--layer-1)',
      }}>
        {rowStart}
      </div>

      {/* 行主体 */}
      <div style={{
        flex: 1,
        height: TIMELINE_ROW_HEIGHT,
        position: 'relative',
      }}>
        {/* 数轴区域：左右各缩进 RULER_INSET，避免边缘头像被裁剪；点击空白处打开干预列表 */}
        <div
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            onRulerClick(snapAvFromClientX(e.clientX, rect, rowStart, rowSize, rowEnd))
          }}
          onMouseMove={(e) => {
            const rect = e.currentTarget.getBoundingClientRect()
            setHoverAv(snapAvFromClientX(e.clientX, rect, rowStart, rowSize, rowEnd))
          }}
          onMouseLeave={() => setHoverAv(null)}
          style={{
            position: 'absolute',
            left: RULER_INSET,
            right: RULER_INSET,
            top: 0,
            bottom: 0,
          }}
        >
          {/* 数轴主线 */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: TIMELINE_RULER_Y,
            height: 1,
            backgroundColor: 'var(--mantine-color-dimmed)',
            opacity: 0.6,
          }} />

          {/* 悬停预览圆点：吸附到最近整数刻度，提示点击会选中的位置 */}
          {hoverAv !== null && (
            <div style={{
              position: 'absolute',
              left: `${(AvVisualTabController.avToRowPercent(hoverAv, rowStart, rowSize))}%`,
              top: TIMELINE_RULER_Y,
              width: HOVER_DOT_SIZE,
              height: HOVER_DOT_SIZE,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: 'rgba(255,255,255,0.35)',
              border: '1px solid rgba(255,255,255,0.6)',
              pointerEvents: 'none',
            }} />
          )}

          {/* 小刻度：以数轴为中心，上下各 2px */}
          {smallTicks.map((tick) => (
            <div
              key={tick}
              style={{
                position: 'absolute',
                left: `${(tick / rowSize) * 100}%`,
                top: TIMELINE_RULER_Y - 2,
                width: 1,
                height: 4,
                backgroundColor: 'var(--mantine-color-dimmed)',
                opacity: 0.3,
              }}
            />
          ))}

          {/* 大刻度：以数轴为中心，上下各 5px + 数字标签 */}
          {largeTicks.map((tick) => (
            <Fragment key={tick}>
              <div style={{
                position: 'absolute',
                left: `${(tick / rowSize) * 100}%`,
                top: TIMELINE_RULER_Y - 5,
                width: 1,
                height: 10,
                backgroundColor: 'var(--mantine-color-dimmed)',
                opacity: 0.55,
              }} />
              <div style={{
                position: 'absolute',
                left: `${(tick / rowSize) * 100}%`,
                top: TIMELINE_RULER_Y + 8,
                transform: 'translateX(-50%)',
                fontSize: 10,
                color: 'var(--mantine-color-dimmed)',
                userSelect: 'none',
              }}>
                {rowStart + tick}
              </div>
            </Fragment>
          ))}

          {/* 行动标记（已按 characterId+av 分组，多次行动显示次数徽章） */}
          {markers.map(({ event: m, actionCount }) => (
            <ActionMarker
              key={`${m.characterId}:${m.av}`}
              av={m.av}
              spd={m.effectiveSpd}
              color={m.color}
              characterName={m.characterName}
              characterId={m.characterId}
              leftPercent={m.leftPercent}
              stackLevel={m.slotIndex}
              actionCount={actionCount}
              onMarkerClick={onMarkerClick}
            />
          ))}

          {/* 干预标记（按 AV 分组，每组一个圆圈显示数量） */}
          {interventionGroups.map(({ triggerAv, count, leftPercent }) => (
            <InterventionMarker
              key={triggerAv}
              triggerAv={triggerAv}
              count={count}
              leftPercent={leftPercent}
              onClick={(av) => onMarkerClick({ triggerAv: av })}
            />
          ))}
        </div>
      </div>

      {/* 浮层（如混沌回忆开关），叠加在行的右上角，层级高于行内所有标记 */}
      {topRightOverlay && (
        <div style={{ position: 'absolute', top: 6, right: 8, zIndex: 20 }}>
          {topRightOverlay}
        </div>
      )}
    </div>
  )
}
