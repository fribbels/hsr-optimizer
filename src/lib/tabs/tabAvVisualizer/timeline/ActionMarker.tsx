import { Tooltip } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import { ActionOverlayBadge, SpecialActionIcon } from 'lib/tabs/tabAvVisualizer/SpecialActionIcon'
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
        {/* Avatar / Ult / Extra-attack icon — explicit size (not shrink-to-fit) so ActionOverlayBadge
            below can anchor itself to this same container's own top/bottom edge. */}
        <div style={{
          position: 'absolute', top: avatarTop, left: '50%', transform: 'translateX(-50%)',
          width: TIMELINE_AVATAR_SIZE, height: TIMELINE_AVATAR_SIZE,
        }}>
          {(turnKind === 'ult' || turnKind === 'extra') ? (
            // Half-size circle, recentered on the same point the full-size avatar slot would occupy
            // (avatarTop/avatarBottom — used elsewhere for the triangle/badge positions — stay as the
            // full slot's geometry; only this icon's own rendered size shrinks, flex-centered within the
            // unchanged full-size container so its center doesn't move).
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <SpecialActionIcon turnKind={turnKind} color={color} size={SPECIAL_ICON_SIZE} />
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

          {/* This character's own Ult/extraAttack lands at the exact same AV — see ActionOverlayBadge. */}
          {hasUltOverlay && <ActionOverlayBadge edge='bottom' color={color} size={TIMELINE_AVATAR_SIZE} />}
          {hasExtraOverlay && <ActionOverlayBadge edge='top' color={color} size={TIMELINE_AVATAR_SIZE} />}
        </div>

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
