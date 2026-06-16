import { Tooltip } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import { TIMELINE_AVATAR_SIZE, TIMELINE_RULER_Y } from 'lib/tabs/tabAvVisualizer/constants'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const TRIANGLE_H = 7
const TRIANGLE_W = 6
const AVATAR_TRI_GAP = 2   // Gap between the avatar and the triangle
const RULER_TRI_GAP = 1    // Gap between the ruler line and the nearest triangle tip
const AVATAR_STACK_GAP = 8 // Gap between the upper and lower avatar layers

// Four fixed positions (top values computed from the top of the row)
const ABOVE_CLOSE_TOP = TIMELINE_RULER_Y - RULER_TRI_GAP - TRIANGLE_H - AVATAR_TRI_GAP - TIMELINE_AVATAR_SIZE
const ABOVE_FAR_TOP = ABOVE_CLOSE_TOP - AVATAR_STACK_GAP - TIMELINE_AVATAR_SIZE
const BELOW_CLOSE_TOP = TIMELINE_RULER_Y + RULER_TRI_GAP + TRIANGLE_H + AVATAR_TRI_GAP
const BELOW_FAR_TOP = BELOW_CLOSE_TOP + TIMELINE_AVATAR_SIZE + AVATAR_STACK_GAP

// stackLevel → position mapping: 0=above-near, 1=below-near, 2=above-far, 3=below-far
const POSITIONS = [
  { avatarTop: ABOVE_CLOSE_TOP, isAbove: true, isFar: false },
  { avatarTop: BELOW_CLOSE_TOP, isAbove: false, isFar: false },
  { avatarTop: ABOVE_FAR_TOP, isAbove: true, isFar: true },
  { avatarTop: BELOW_FAR_TOP, isAbove: false, isFar: true },
] as const

type ActionMarkerProps = {
  av: number
  spd: number
  color: string
  characterName: string
  characterId: string
  leftPercent: number
  stackLevel: number
  actionCount?: number   // Total number of times this character acts at this AV (badge shown when > 1)
  onMarkerClick: (av: number) => void   // Moves the Playhead to this marker's AV
}

export function ActionMarker({ av, spd, color, characterName, characterId, leftPercent, stackLevel, actionCount, onMarkerClick }: ActionMarkerProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const [imgError, setImgError] = useState(false)

  const { avatarTop, isAbove, isFar } = POSITIONS[Math.min(stackLevel, 3)]
  const avatarBottom = avatarTop + TIMELINE_AVATAR_SIZE

  // Triangle tip position (pointing up/down)
  const triangleTop = isAbove
    ? avatarBottom + AVATAR_TRI_GAP          // Avatar above the ruler, triangle points down ▼
    : avatarTop - AVATAR_TRI_GAP - TRIANGLE_H // Avatar below the ruler, triangle points up ▲

  // Dashed connector for far-layer markers (triangle tip to the ruler line)
  let dashTop = 0
  let dashHeight = 0
  if (isFar) {
    if (isAbove) {
      dashTop = triangleTop + TRIANGLE_H + 1
      dashHeight = TIMELINE_RULER_Y - RULER_TRI_GAP - dashTop
    } else {
      dashTop = TIMELINE_RULER_Y + RULER_TRI_GAP + 1
      dashHeight = triangleTop - dashTop - 1
    }
  }

  return (
    <Tooltip
      label={tAv('Marker.ActionTooltip', { name: characterName, spd: spd.toFixed(1), av: av.toFixed(2) })}
      position='top'
      withArrow
      openDelay={100}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
          onMarkerClick(av)
        }}
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
        {/* Avatar */}
        <div style={{ position: 'absolute', top: avatarTop, left: '50%', transform: 'translateX(-50%)' }}>
          {imgError ? (
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
              color: color,
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

        {/* Multi-action badge: shown when this character acts more than once at this AV, inset at the bottom of
        the avatar (stays within the avatar's bounds so it doesn't cover neighboring avatars) */}
        {actionCount !== undefined && actionCount > 1 && (
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

        {/* Triangle arrow (near layer points toward the ruler, far layer points away from it) */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: triangleTop,
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: `${TRIANGLE_W}px solid transparent`,
          borderRight: `${TRIANGLE_W}px solid transparent`,
          ...(isAbove
            ? { borderTop: `${TRIANGLE_H}px solid ${color}` }
            : { borderBottom: `${TRIANGLE_H}px solid ${color}` }
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
