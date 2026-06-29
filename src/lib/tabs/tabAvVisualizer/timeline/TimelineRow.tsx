import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import {
  TIMELINE_AVATAR_SIZE,
  TIMELINE_AVATAR_STACK_GAP,
  TIMELINE_ROW_HEIGHT,
  TIMELINE_RULER_Y,
} from 'lib/tabs/tabAvVisualizer/constants'
import { ActionMarker } from 'lib/tabs/tabAvVisualizer/timeline/ActionMarker'
import { CutoffMarker } from 'lib/tabs/tabAvVisualizer/timeline/CutoffMarker'
import { InterventionMarker } from 'lib/tabs/tabAvVisualizer/timeline/InterventionMarker'
import { Playhead } from 'lib/tabs/tabAvVisualizer/timeline/Playhead'
import type { EnrichedSimEvent } from 'lib/tabs/tabAvVisualizer/timeline/Timeline'
import type { Intervention } from 'lib/tabs/tabAvVisualizer/types'
import { truncate100ths } from 'lib/utils/mathUtils'
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'

type TimelineRowProps = {
  rowStart: number                // This row's start AV (computed by the parent according to MoC mode and passed in)
  rowSize: number                 // This row's AV span (normal row = 100, MoC first row = 150)
  simEvents: EnrichedSimEvent[]   // Already filtered to this row's range by the parent (Timeline)
  companionEvents?: EnrichedSimEvent[]   // memosprite/summon/marker events; undefined when none exist in the whole battle
  interventions: Intervention[]   // Interventions within this row's range (filtered by the parent)
  onSeek: (av: number) => void    // Click/drag on the ruler, or click on a marker — moves the Playhead there
  topRightOverlay?: ReactNode     // Overlay (e.g. the MoC toggle), only passed for the first row
  playheadAv?: number             // Current Playhead AV; the Playhead line renders only when it falls within this row
  cutoffAv?: number               // Where this Wave was cut (see CutoffMarker), if at all — renders only within that row
}

const RULER_INSET = TIMELINE_AVATAR_SIZE / 2 + 4
const HOVER_DOT_SIZE = 7
const MAGNETIC_SNAP_PX = 14 // Drag-only magnetic snap radius to nearby character markers, in pixels

// Mouse X coordinate → continuous AV (no tick snapping). Used for click and hover preview.
function rawAvFromClientX(clientX: number, rect: DOMRect, rowStart: number, rowSize: number, rowEnd: number): number {
  const relativeX = clientX - rect.left
  const av = rowStart + (relativeX / rect.width) * rowSize
  return Math.max(rowStart, Math.min(rowEnd - 0.001, av))
}

// Snaps to the nearest character marker AV if one is within MAGNETIC_SNAP_PX, otherwise returns av unchanged.
// rectWidth is used to convert the pixel radius to an AV distance (so it works the same across row widths/sizes).
function magneticSnapToMarker(av: number, markerAvs: number[], rectWidth: number, rowSize: number): number {
  const thresholdAv = (MAGNETIC_SNAP_PX / rectWidth) * rowSize
  let closest = av
  let minDist = thresholdAv
  for (const markerAv of markerAvs) {
    const dist = Math.abs(markerAv - av)
    if (dist < minDist) {
      minDist = dist
      closest = markerAv
    }
  }
  return closest
}

export function TimelineRow({
  rowStart,
  rowSize,
  simEvents,
  companionEvents,
  interventions,
  onSeek,
  topRightOverlay,
  playheadAv,
  cutoffAv,
}: TimelineRowProps) {
  const rowEnd = rowStart + rowSize
  const rulerRef = useRef<HTMLDivElement>(null)

  // Hover preview: recompute the continuous AV live as the mouse moves, used to draw the preview dot
  // (suppressed while actively dragging the Playhead, since the Playhead line itself already tracks the cursor)
  const [hoverAv, setHoverAv] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Distinct character marker AVs in this row, used for drag-only magnetic snapping
  const markerAvs = useMemo(() => Array.from(new Set(simEvents.map((e) => e.av))), [simEvents])

  // Drag-to-scrub: once started (mousedown on the ruler), keep tracking the mouse across the whole window so the
  // Playhead follows even if the cursor leaves this row's bounds, until mouseup. Snaps magnetically to nearby
  // character markers, but never to integer ticks.
  useEffect(() => {
    if (!isDragging) return

    function handleMove(e: MouseEvent) {
      const rect = rulerRef.current?.getBoundingClientRect()
      if (!rect) return
      const raw = rawAvFromClientX(e.clientX, rect, rowStart, rowSize, rowEnd)
      onSeek(magneticSnapToMarker(raw, markerAvs, rect.width, rowSize))
    }
    function handleUp() {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMove)
    window.addEventListener('mouseup', handleUp)
    return () => {
      window.removeEventListener('mousemove', handleMove)
      window.removeEventListener('mouseup', handleUp)
    }
  }, [isDragging, onSeek, rowStart, rowSize, rowEnd, markerAvs])

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

  // Grouped by (characterId, av, turnKind): normal, ult, and extra events at the same AV are separate
  // groups, but when a character's own Ult or extraAttack lands at the exact same AV as their own normal
  // action, that group is dropped here and surfaces instead as a `hasUltOverlay`/`hasExtraOverlay` flag
  // on the matching normal group — rendered as a small badge on that avatar (see ActionMarker) instead of
  // a second independent marker.
  const markers = useMemo(() => {
    type MarkerGroup = {
      event: EnrichedSimEvent & { leftPercent: number }
      actionCount: number
      hasUltOverlay?: boolean
      hasExtraOverlay?: boolean
    }
    const groups = new Map<string, MarkerGroup>()
    for (const event of simEvents) {
      const key = `${event.characterId}:${event.av}:${event.turnKind}`
      if (!groups.has(key)) {
        groups.set(key, {
          event: { ...event, leftPercent: AvVisualTabController.avToRowPercent(event.av, rowStart, rowSize) },
          actionCount: 0,
        })
      }
      groups.get(key)!.actionCount++
    }
    for (const [key, group] of groups) {
      if (group.event.turnKind !== 'ult' && group.event.turnKind !== 'extra') continue
      const normalKey = `${group.event.characterId}:${group.event.av}:normal`
      const normalGroup = groups.get(normalKey)
      if (!normalGroup) continue
      if (group.event.turnKind === 'ult') normalGroup.hasUltOverlay = true
      else normalGroup.hasExtraOverlay = true
      groups.delete(key)
    }
    return Array.from(groups.values())
  }, [simEvents, rowStart, rowSize])

  // Grouped by (characterId, av): one dot per distinct companion position, same dedup approach as `markers`
  const companionMarkers = useMemo(() => {
    type CompanionGroup = {
      event: EnrichedSimEvent & { leftPercent: number }
      actionCount: number
    }
    const groups = new Map<string, CompanionGroup>()
    for (const event of (companionEvents ?? [])) {
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
  }, [companionEvents, rowStart, rowSize])

  // Grouped by triggerAv truncated to 2 decimals (not the raw stored value) — interventions created by
  // dragging/clicking the ruler land on continuous floating-point AVs (e.g. 9.9999997), so grouping by
  // exact equality would split visually-identical positions into separate markers. Every intervention
  // within the same 0.01 AV bucket renders as one marker, positioned/clickable at that bucket's value.
  const interventionGroups = useMemo(() => {
    const map = new Map<number, number>()
    for (const iv of interventions) {
      const bucket = truncate100ths(iv.triggerAv)
      map.set(bucket, (map.get(bucket) ?? 0) + 1)
    }
    return Array.from(map.entries()).map(([av, count]) => ({
      triggerAv: av,
      count,
      leftPercent: AvVisualTabController.avToRowPercent(av, rowStart, rowSize),
    }))
  }, [interventions, rowStart, rowSize])

  // Companions attach directly outside their owner's existing avatar (ActionMarker's extraOffset=1),
  // one avatar-increment further from the ruler than the owner's own base position. That can push a
  // marker beyond the box's normal close+far headroom, so when any companion exists, pad the box with
  // one extra increment on both sides (and shift the ruler container down by the same amount) so nothing
  // gets clipped by the box's overflow:hidden.
  const hasCompanions = companionEvents !== undefined
  const extraLevelHeight = TIMELINE_AVATAR_SIZE + TIMELINE_AVATAR_STACK_GAP
  const rulerTop = hasCompanions ? extraLevelHeight : 0
  const rowBodyHeight = TIMELINE_ROW_HEIGHT + (hasCompanions ? extraLevelHeight * 2 : 0)

  return (
    <div style={{
      display: 'flex',
      alignItems: 'stretch',
      gap: 8,
      width: '100%',
      position: 'relative',
    }}>

      {/* Left-hand row label: its own box now, same styling as the row body box below */}
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
        background: 'var(--layer-2)',
        boxShadow: 'var(--shadow-card)',
        borderRadius: 6,
      }}>
        {rowStart}
      </div>

      {/* Row body */}
      <div style={{
        flex: 1,
        height: rowBodyHeight,
        position: 'relative',
        background: 'var(--layer-2)',
        boxShadow: 'var(--shadow-card)',
        borderRadius: 6,
        overflow: 'hidden',
      }}>
        {/* Ruler area: inset by RULER_INSET on both sides to avoid clipping edge avatars; click/drag moves the Playhead */}
        <div
          ref={rulerRef}
          onMouseDown={(e) => {
            e.preventDefault() // Stops the browser's native drag-to-select gesture before it starts
            const rect = e.currentTarget.getBoundingClientRect()
            onSeek(rawAvFromClientX(e.clientX, rect, rowStart, rowSize, rowEnd))
            setIsDragging(true)
            setHoverAv(null)
          }}
          onMouseMove={(e) => {
            if (isDragging) return
            const rect = e.currentTarget.getBoundingClientRect()
            setHoverAv(rawAvFromClientX(e.clientX, rect, rowStart, rowSize, rowEnd))
          }}
          onMouseLeave={() => setHoverAv(null)}
          style={{
            position: 'absolute',
            left: RULER_INSET,
            right: RULER_INSET,
            top: rulerTop,
            height: TIMELINE_ROW_HEIGHT,
            userSelect: 'none',
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

          {/* Hover preview dot: continuous position, previews exactly where a click would land (no tick snapping) */}
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

          {/* Action markers (grouped by characterId+av+turnKind; ult and normal events render separately) */}
          {markers.map(({ event: m, actionCount, hasUltOverlay, hasExtraOverlay }) => (
            <ActionMarker
              key={`${m.characterId}:${m.av}:${m.turnKind}`}
              av={m.av}
              spd={m.effectiveSpd}
              color={m.color}
              characterName={m.characterName}
              characterId={m.characterId}
              leftPercent={m.leftPercent}
              stackLevel={m.slotIndex}
              actionCount={actionCount}
              turnKind={m.turnKind}
              hasUltOverlay={hasUltOverlay}
              hasExtraOverlay={hasExtraOverlay}
              onMarkerClick={onSeek}
            />
          ))}

          {/* Companion markers (memosprite/summon/marker): same ActionMarker, anchored to the owner's
              own slotIndex/stackLevel with extraOffset=1 so they attach right outside the owner's avatar
              on the same side, instead of getting their own stackLevel/numbering. */}
          {companionMarkers.map(({ event: m, actionCount }) => (
            <ActionMarker
              key={`${m.characterId}:${m.av}`}
              av={m.av}
              spd={m.effectiveSpd}
              color={m.color}
              characterName={m.characterName}
              characterId={m.characterId}
              leftPercent={m.leftPercent}
              stackLevel={m.slotIndex}
              extraOffset={1}
              actionCount={actionCount}
              turnKind={m.turnKind}
              onMarkerClick={onSeek}
            />
          ))}

          {/* Intervention markers (grouped by AV, one circle per group showing the count) */}
          {interventionGroups.map(({ triggerAv, count, leftPercent }) => (
            <InterventionMarker
              key={triggerAv}
              triggerAv={triggerAv}
              count={count}
              leftPercent={leftPercent}
              onClick={onSeek}
            />
          ))}

          {/* Playhead: only rendered in the row it currently falls within. topOffset/totalHeight let it
              span the row's actual height (taller when companion avatars need extra stacking levels)
              instead of stopping at the ruler's own fixed band. */}
          {playheadAv !== undefined && playheadAv >= rowStart && playheadAv < rowEnd && (
            <Playhead av={playheadAv} rowStart={rowStart} rowSize={rowSize} topOffset={rulerTop} totalHeight={rowBodyHeight} />
          )}

          {/* Where this Wave was cut, if it falls within this row — fixed marker + greyed-out overlay
              for everything after it (see CutoffMarker's own doc comment). */}
          {cutoffAv !== undefined && cutoffAv >= rowStart && cutoffAv < rowEnd && (
            <CutoffMarker av={cutoffAv} rowStart={rowStart} rowSize={rowSize} topOffset={rulerTop} totalHeight={rowBodyHeight} />
          )}
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
