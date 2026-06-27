import { Tooltip } from '@mantine/core'
import { IconBolt } from '@tabler/icons-react'
import { Assets } from 'lib/rendering/assets'
import { TIMELINE_AVATAR_SIZE, TIMELINE_RULER_Y } from 'lib/tabs/tabAvVisualizer/constants'
import type { TurnKind } from 'lib/tabs/tabAvVisualizer/types'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const TRIANGLE_H = 7
const TRIANGLE_W = 6
const AVATAR_TRI_GAP = 2
const RULER_TRI_GAP = 1
const AVATAR_STACK_GAP = 8

const ABOVE_CLOSE_TOP = TIMELINE_RULER_Y - RULER_TRI_GAP - TRIANGLE_H - AVATAR_TRI_GAP - TIMELINE_AVATAR_SIZE
const ABOVE_FAR_TOP = ABOVE_CLOSE_TOP - AVATAR_STACK_GAP - TIMELINE_AVATAR_SIZE
const BELOW_CLOSE_TOP = TIMELINE_RULER_Y + RULER_TRI_GAP + TRIANGLE_H + AVATAR_TRI_GAP
const BELOW_FAR_TOP = BELOW_CLOSE_TOP + TIMELINE_AVATAR_SIZE + AVATAR_STACK_GAP

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
  actionCount?: number
  turnKind: TurnKind
  onMarkerClick: (av: number) => void
}

export function ActionMarker({ av, spd, color, characterName, characterId, leftPercent, stackLevel, actionCount, turnKind, onMarkerClick }: ActionMarkerProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const [imgError, setImgError] = useState(false)

  const { avatarTop, isAbove, isFar } = POSITIONS[Math.min(stackLevel, 3)]
  const avatarBottom = avatarTop + TIMELINE_AVATAR_SIZE

  const triangleTop = isAbove
    ? avatarBottom + AVATAR_TRI_GAP
    : avatarTop - AVATAR_TRI_GAP - TRIANGLE_H

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
      label={turnKind === 'ult'
        ? tAv('Marker.UltTooltip', { name: characterName, av: av.toFixed(2) })
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
        {/* Avatar / Ult icon */}
        <div style={{ position: 'absolute', top: avatarTop, left: '50%', transform: 'translateX(-50%)' }}>
          {turnKind === 'ult' ? (
            <div style={{
              width: TIMELINE_AVATAR_SIZE,
              height: TIMELINE_AVATAR_SIZE,
              borderRadius: '50%',
              border: '2px solid gold',
              backgroundColor: 'rgba(255,215,0,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <IconBolt size={Math.round(TIMELINE_AVATAR_SIZE * 0.55)} color='gold' />
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

        {/* Multi-action badge (ult markers are always single events) */}
        {turnKind !== 'ult' && actionCount !== undefined && actionCount > 1 && (
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
