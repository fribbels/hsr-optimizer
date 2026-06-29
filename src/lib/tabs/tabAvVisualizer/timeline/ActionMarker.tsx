import { Tooltip } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import { TIMELINE_AVATAR_SIZE, TIMELINE_AVATAR_STACK_GAP, TIMELINE_RULER_Y } from 'lib/tabs/tabAvVisualizer/constants'
import type { TurnKind } from 'lib/tabs/tabAvVisualizer/types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const TRIANGLE_H = 7
const TRIANGLE_W = 6
const AVATAR_TRI_GAP = 2
const RULER_TRI_GAP = 1
// A standalone Ult/Extra-attack marker (not overlapping its own caster's action at the same AV — see
// hasUltOverlay/hasExtraOverlay) renders at half the radius of a normal avatar, recentered on the same
// point the full-size slot would occupy, so it's less likely to obscure other markers while everything
// else's positioning (avatarTop/avatarBottom, triangle, badges) still uses the full slot's own geometry.
const SPECIAL_ICON_SIZE = Math.round(TIMELINE_AVATAR_SIZE / 2)

const ABOVE_CLOSE_TOP = TIMELINE_RULER_Y - RULER_TRI_GAP - TRIANGLE_H - AVATAR_TRI_GAP - TIMELINE_AVATAR_SIZE
const ABOVE_FAR_TOP = ABOVE_CLOSE_TOP - TIMELINE_AVATAR_STACK_GAP - TIMELINE_AVATAR_SIZE
const BELOW_CLOSE_TOP = TIMELINE_RULER_Y + RULER_TRI_GAP + TRIANGLE_H + AVATAR_TRI_GAP
const BELOW_FAR_TOP = BELOW_CLOSE_TOP + TIMELINE_AVATAR_SIZE + TIMELINE_AVATAR_STACK_GAP

const POSITIONS = [
  { avatarTop: ABOVE_CLOSE_TOP, isAbove: true,  isFar: false },
  { avatarTop: BELOW_CLOSE_TOP, isAbove: false, isFar: false },
  { avatarTop: ABOVE_FAR_TOP,   isAbove: true,  isFar: true  },
  { avatarTop: BELOW_FAR_TOP,   isAbove: false, isFar: true  },
] as const

type ActionMarkerProps = {
  av: number
  spd: number
  color: string
  characterName: string
  characterId: string
  leftPercent: number
  stackLevel: number
  // How many extra avatar-increments to push this marker further from the ruler, beyond stackLevel's
  // own base position, in the same above/below direction — used to attach a companion entity (e.g. a
  // memosprite/summon) right outside its owner's marker without renumbering anyone else's stackLevel.
  extraOffset?: number
  actionCount?: number
  turnKind: TurnKind
  // This character's own Ult/extraAttack lands at this exact same AV — instead of that event getting its
  // own independent marker (see TimelineRow's grouping), it's skipped there and shown here instead, as a
  // small badge layered onto this avatar's own corner (a circular-segment sliver, not a full circle).
  // Ult's sliver sits on the bottom edge, extraAttack's on the top — so a character with both Ult and an
  // extraAttack landing on the same AV doesn't have the two overlap each other.
  hasUltOverlay?: boolean
  hasExtraOverlay?: boolean
  onMarkerClick: (av: number) => void
}

export function ActionMarker({ av, spd, color, characterName, characterId, leftPercent, stackLevel, extraOffset = 0, actionCount, turnKind, hasUltOverlay, hasExtraOverlay, onMarkerClick }: ActionMarkerProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const [imgError, setImgError] = useState(false)

  const base = POSITIONS[Math.min(stackLevel, 3)]
  const offsetDelta = extraOffset * (TIMELINE_AVATAR_SIZE + TIMELINE_AVATAR_STACK_GAP)
  const avatarTop = base.isAbove ? base.avatarTop - offsetDelta : base.avatarTop + offsetDelta
  const isAbove = base.isAbove
  const isFar = base.isFar || extraOffset > 0
  const avatarBottom = avatarTop + TIMELINE_AVATAR_SIZE

  // Ult/extraAttack markers render their circle at half size (see SPECIAL_ICON_SIZE) — the triangle and
  // dashed connector below need to track that smaller circle's *actual* visible edge (and shrink to
  // match), not the full slot's edge, or they'd float with a gap instead of touching it.
  const isSpecial = turnKind === 'ult' || turnKind === 'extra'
  const specialMargin = (TIMELINE_AVATAR_SIZE - SPECIAL_ICON_SIZE) / 2
  const triangleH = isSpecial ? Math.round(TRIANGLE_H / 2) : TRIANGLE_H
  const triangleW = isSpecial ? Math.round(TRIANGLE_W / 2) : TRIANGLE_W
  const visualBottom = isSpecial ? avatarBottom - specialMargin : avatarBottom
  const visualTop = isSpecial ? avatarTop + specialMargin : avatarTop

  const triangleTop = isAbove
    ? visualBottom + AVATAR_TRI_GAP
    : visualTop - AVATAR_TRI_GAP - triangleH

  let dashTop = 0
  let dashHeight = 0
  if (isFar) {
    if (isAbove) {
      dashTop = triangleTop + triangleH + 1
      dashHeight = TIMELINE_RULER_Y - RULER_TRI_GAP - dashTop
    } else {
      dashTop = TIMELINE_RULER_Y + RULER_TRI_GAP + 1
      dashHeight = triangleTop - dashTop - 1
    }
  }

  return (
    <Tooltip
      label={turnKind === 'ult'
        ? tAv('Marker.UltTooltip', { name: characterName, av: av.toFixed(2) })
        : turnKind === 'extra'
          ? tAv('Marker.ExtraTooltip', { name: characterName, av: av.toFixed(2) })
          : tAv('Marker.ActionTooltip', { name: characterName, spd: spd.toFixed(1), av: av.toFixed(2) })}
      position='top'
      withArrow
      openDelay={100}
    >
      <div
        onClick={(e) => { e.stopPropagation(); onMarkerClick(av) }}
        style={{
          position: 'absolute',
          left: `${leftPercent}%`,
          top: 0,
          height: '100%',
          transform: 'translateX(-50%)',
          cursor: 'pointer',
          zIndex: 1 + stackLevel,
        }}
      >
        {/* Avatar / Ult / Extra-attack icon */}
        <div style={{ position: 'absolute', top: avatarTop, left: '50%', transform: 'translateX(-50%)' }}>
          {(turnKind === 'ult' || turnKind === 'extra') ? (
            // Half-size circle, recentered on the same point the full-size avatar slot would occupy
            // (avatarTop/avatarBottom — used elsewhere for the triangle/badge positions — stay as the
            // full slot's geometry; only this circle's own rendered size+offset shrinks, via the same
            // amount of margin on every side so its center doesn't move).
            <div style={{
              width: SPECIAL_ICON_SIZE,
              height: SPECIAL_ICON_SIZE,
              margin: (TIMELINE_AVATAR_SIZE - SPECIAL_ICON_SIZE) / 2,
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
                style={{ width: Math.round(SPECIAL_ICON_SIZE * 0.65), height: Math.round(SPECIAL_ICON_SIZE * 0.65), userSelect: 'none' }}
              />
            </div>
          ) : imgError ? (
            <div style={{
              width: TIMELINE_AVATAR_SIZE,
              height: TIMELINE_AVATAR_SIZE,
              borderRadius: '50%',
              border: `2px solid ${color}`,
              backgroundColor: `${color}33`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: Math.round(TIMELINE_AVATAR_SIZE * 0.4),
              fontWeight: 700,
              color,
            }}>
              {characterName.charAt(0)}
            </div>
          ) : (
            <img
              src={Assets.getCharacterAvatarById(characterId)}
              onError={() => setImgError(true)}
              draggable={false}
              style={{
                width: TIMELINE_AVATAR_SIZE,
                height: TIMELINE_AVATAR_SIZE,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${color}`,
                display: 'block',
                userSelect: 'none',
              }}
            />
          )}
        </div>

        {/* Ult/Extra-overlay badge: this character's own Ult or extraAttack lands at the exact same AV —
            instead of a second independent marker, a small sliver sits on this avatar's own edge (Ult on
            the bottom, extraAttack on the top, so the two don't overlap if both land here). The shape is
            a circular segment: a circle cut by a single horizontal chord positioned a quarter of the way
            in from that edge, keeping only the (smaller) piece beyond that chord — not a quarter-pie
            wedge with two straight radius cuts. Built as an outer div sized to exactly that visible
            sliver, clipping (overflow:hidden) an inner full circle positioned so only its outer quarter
            peeks out — simpler than clip-path math for getting the icon centered inside the sliver itself
            rather than the full (mostly hidden) circle. */}
        {[
          hasUltOverlay && { edge: 'bottom' as const, iconSrc: Assets.getUltIcon() },
          hasExtraOverlay && { edge: 'top' as const, iconSrc: Assets.getExtraAttackIcon() },
        ].filter((v): v is { edge: 'top' | 'bottom'; iconSrc: string } => !!v).map(({ edge, iconSrc }) => {
          const circleSize = Math.round(TIMELINE_AVATAR_SIZE * 0.9)
          const sliverHeight = Math.round(circleSize * 0.25)
          const isBottom = edge === 'bottom'
          return (
            // Outer container is exactly TIMELINE_AVATAR_SIZE wide, centered with the *same* left:50% +
            // translateX(-50%) formula the avatar itself uses — guarantees their centerlines actually
            // match. The inner circle is centered within it too — no horizontal bias.
            <div key={edge} style={{
              position: 'absolute',
              top: isBottom ? avatarBottom - sliverHeight : avatarTop,
              left: '50%',
              transform: 'translateX(-50%)',
              width: TIMELINE_AVATAR_SIZE,
              height: sliverHeight,
              overflow: 'hidden',
              zIndex: 3,
            }}>
              <div style={{
                position: 'absolute',
                ...(isBottom ? { bottom: 0 } : { top: 0 }),
                left: (TIMELINE_AVATAR_SIZE - circleSize) / 2,
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
        })}

        {/* Multi-action badge (ult/extra markers are always single events) */}
        {turnKind === 'normal' && actionCount !== undefined && actionCount > 1 && (
          <div style={{
            position: 'absolute',
            top: avatarBottom - 14,
            left: '50%',
            transform: 'translateX(-50%)',
            minWidth: 13,
            height: 13,
            borderRadius: 7,
            backgroundColor: color,
            border: '1.5px solid rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 9,
            fontWeight: 700,
            color: '#000',
            zIndex: 2,
            padding: '0 3px',
            userSelect: 'none',
          }}>
            {actionCount}
          </div>
        )}

        {/* Triangle */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: triangleTop,
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: `${triangleW}px solid transparent`,
          borderRight: `${triangleW}px solid transparent`,
          ...(isAbove
            ? { borderTop: `${triangleH}px solid ${color}` }
            : { borderBottom: `${triangleH}px solid ${color}` }
          ),
        }} />

        {/* Dashed connector (far-layer markers only) */}
        {isFar && dashHeight > 0 && (
          <div style={{
            position: 'absolute',
            left: '50%',
            top: dashTop,
            transform: 'translateX(-50%)',
            width: 1,
            height: dashHeight,
            borderLeft: `1px dashed ${color}`,
            opacity: 0.5,
          }} />
        )}
      </div>
    </Tooltip>
  )
}
