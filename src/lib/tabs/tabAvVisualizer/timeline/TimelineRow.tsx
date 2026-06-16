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
  rowStart: number                // This row's start AV (computed by the parent according to MoC mode and passed in)
  rowSize: number                 // This row's AV span (normal row = 100, MoC first row = 150)
  simEvents: EnrichedSimEvent[]   // Already filtered to this row's range by the parent (Timeline)
  interventions: Intervention[]   // Interventions within this row's range (filtered by the parent)
  onMarkerClick: (ctx: MarkerClickContext) => void
  onRulerClick: (av: number) => void
  topRightOverlay?: ReactNode     // Overlay (e.g. the MoC toggle), only passed for the first row
}

const RULER_INSET = TIMELINE_AVATAR_SIZE / 2 + 4
const HOVER_DOT_SIZE = 7

// Mouse X coordinate → snapped to the nearest integer AV (shared by click and hover preview to keep both consistent)
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

  // Hover preview: recompute the snapped integer AV live as the mouse moves, used to draw the preview dot
  const [hoverAv, setHoverAv] = useState<number | null>(null)

  // Ticks: one large tick (with a number label) every 10 AV, one small tick every other 1 AV; generated dynamically from rowSize
  // (rowSize can be 100 or 150, so the tick number can't be assumed to equal the percentage value)
  const { smallTicks, largeTicks } = useMemo(() => {
    const small: number[] = []
    const large: number[] = []
    for (let av = 1; av < rowSize; av++) {
      if (av % 10 === 0) large.push(av)
      else small.push(av)
    }
    return { smallTicks: small, largeTicks: large }
  }, [rowSize])

  // Grouped by (characterId, av): when the same character acts multiple times at the same AV, render a single
  // avatar with a count badge
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

  // Grouped by triggerAv: render a single marker per unique AV position, showing the total intervention count there
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

      {/* Left-hand row label */}
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

      {/* Row body */}
      <div style={{
        flex: 1,
        height: TIMELINE_ROW_HEIGHT,
        position: 'relative',
      }}>
        {/* Ruler area: inset by RULER_INSET on both sides to avoid clipping edge avatars; clicking empty space opens the intervention list */}
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
          {/* Main ruler line */}
          <div style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: TIMELINE_RULER_Y,
            height: 1,
            backgroundColor: 'var(--mantine-color-dimmed)',
            opacity: 0.6,
          }} />

          {/* Hover preview dot: snapped to the nearest integer tick, previews where a click would land */}
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

          {/* Small ticks: centered on the ruler line, 2px above and below */}
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

          {/* Large ticks: centered on the ruler line, 5px above and below + number label */}
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

          {/* Action markers (already grouped by characterId+av; multiple actions show a count badge) */}
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

          {/* Intervention markers (grouped by AV, one circle per group showing the count) */}
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

      {/* Overlay (e.g. the MoC toggle), layered on top of the row's top-right corner, above all in-row markers */}
      {topRightOverlay && (
        <div style={{ position: 'absolute', top: 6, right: 8, zIndex: 20 }}>
          {topRightOverlay}
        </div>
      )}
    </div>
  )
}
