import { Assets } from 'lib/rendering/assets'

// Standalone Ult/extraAttack icon — a solid-color circle (no transparency) with the matching white
// line-art icon inside. Shared between the timeline's ActionMarker (size = TIMELINE_AVATAR_SIZE/2) and
// the action-order preview's ActionOrderAvatar (size = its own avatar size/2), so both read as the same
// visual language at whatever size their own context calls for.
export function SpecialActionIcon({ turnKind, color, size }: { turnKind: 'ult' | 'extra'; color: string; size: number }) {
  return (
    <div style={{
      width: size,
      height: size,
      borderRadius: '50%',
      border: `2px solid ${color}`,
      backgroundColor: color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <img
        src={turnKind === 'ult' ? Assets.getUltIcon() : Assets.getExtraAttackIcon()}
        draggable={false}
        style={{ width: Math.round(size * 0.65), height: Math.round(size * 0.65), userSelect: 'none' }}
      />
    </div>
  )
}

// Ult/extraAttack overlay badge — this character's own Ult/extraAttack lands at the exact same moment as
// the avatar it's rendered onto, so instead of a second independent icon, a small sliver sits on that
// avatar's own edge (Ult on the bottom, extraAttack on the top, so the two don't overlap if both apply at
// once). The shape is a circular segment: a circle cut by a single horizontal chord positioned a quarter
// of the way in from that edge, keeping only the (smaller) piece beyond that chord — not a quarter-pie
// wedge with two straight radius cuts. Built as an outer div sized to exactly that visible sliver,
// clipping (overflow:hidden) an inner full circle positioned so only its outer quarter peeks out —
// simpler than clip-path math for getting the icon centered inside the sliver itself rather than the
// full (mostly hidden) circle.
//
// Must be rendered as a child of a `position: relative` (or absolute) container sized exactly
// `size` x `size` (the avatar it's overlaying) — it anchors itself to that container's own top/bottom
// edge, not to any ancestor further up.
export function ActionOverlayBadge({ edge, color, size }: { edge: 'top' | 'bottom'; color: string; size: number }) {
  const circleSize = Math.round(size * 0.9)
  const sliverHeight = Math.round(circleSize * 0.25)
  const isBottom = edge === 'bottom'
  const iconSrc = isBottom ? Assets.getUltIcon() : Assets.getExtraAttackIcon()
  return (
    <div style={{
      position: 'absolute',
      ...(isBottom ? { bottom: 0 } : { top: 0 }),
      left: '50%',
      transform: 'translateX(-50%)',
      width: size,
      height: sliverHeight,
      overflow: 'hidden',
      zIndex: 3,
    }}>
      <div style={{
        position: 'absolute',
        ...(isBottom ? { bottom: 0 } : { top: 0 }),
        left: (size - circleSize) / 2,
        width: circleSize,
        height: circleSize,
        borderRadius: '50%',
        border: `1.5px solid ${color}`,
        backgroundColor: color,
        display: 'flex',
        alignItems: isBottom ? 'flex-end' : 'flex-start',
        justifyContent: 'center',
      }}>
        <img
          src={iconSrc}
          draggable={false}
          style={{
            width: Math.round(sliverHeight * 0.85),
            height: Math.round(sliverHeight * 0.85),
            userSelect: 'none',
            ...(isBottom ? { marginBottom: Math.round(sliverHeight * 0.05) } : { marginTop: Math.round(sliverHeight * 0.05) }),
          }}
        />
      </div>
    </div>
  )
}
