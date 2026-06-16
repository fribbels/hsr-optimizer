import { Tooltip } from '@mantine/core'
import { Assets } from 'lib/rendering/assets'
import { TIMELINE_AVATAR_SIZE, TIMELINE_RULER_Y } from 'lib/tabs/tabAvVisualizer/constants'
import type { MarkerClickContext } from 'lib/tabs/tabAvVisualizer/timeline/Timeline'
import { useState } from 'react'

const TRIANGLE_H = 7
const TRIANGLE_W = 6
const AVATAR_TRI_GAP = 2   // avatar 与三角之间的间距
const RULER_TRI_GAP = 1    // 数轴线与最近三角尖端的间距
const AVATAR_STACK_GAP = 8 // 上下两层头像之间的间距

// 四个固定位置（从行顶部计算 top 值）
const ABOVE_CLOSE_TOP = TIMELINE_RULER_Y - RULER_TRI_GAP - TRIANGLE_H - AVATAR_TRI_GAP - TIMELINE_AVATAR_SIZE
const ABOVE_FAR_TOP = ABOVE_CLOSE_TOP - AVATAR_STACK_GAP - TIMELINE_AVATAR_SIZE
const BELOW_CLOSE_TOP = TIMELINE_RULER_Y + RULER_TRI_GAP + TRIANGLE_H + AVATAR_TRI_GAP
const BELOW_FAR_TOP = BELOW_CLOSE_TOP + TIMELINE_AVATAR_SIZE + AVATAR_STACK_GAP

// stackLevel → 位置信息的映射：0=上近, 1=下近, 2=上远, 3=下远
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
  actionCount?: number   // 该 AV 处此角色的行动总次数（>1 时显示徽章）
  onMarkerClick: (ctx: MarkerClickContext) => void
}

export function ActionMarker({ av, spd, color, characterName, characterId, leftPercent, stackLevel, actionCount, onMarkerClick }: ActionMarkerProps) {
  const [imgError, setImgError] = useState(false)

  const { avatarTop, isAbove, isFar } = POSITIONS[Math.min(stackLevel, 3)]
  const avatarBottom = avatarTop + TIMELINE_AVATAR_SIZE

  // 三角顶部位置（朝上/朝下）
  const triangleTop = isAbove
    ? avatarBottom + AVATAR_TRI_GAP          // 头像下方，三角朝下 ▼
    : avatarTop - AVATAR_TRI_GAP - TRIANGLE_H // 头像上方，三角朝上 ▲

  // 远端标记的虚线连接（三角尖到数轴线）
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
      label={`${characterName}  SPD ${spd.toFixed(1)}  AV ${av.toFixed(2)}`}
      position='top'
      withArrow
      openDelay={100}
    >
      <div
        onClick={(e) => {
          e.stopPropagation()
          onMarkerClick({ triggerAv: av, sourceCharId: characterId })
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
        {/* 头像 */}
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
              style={{
                width: TIMELINE_AVATAR_SIZE,
                height: TIMELINE_AVATAR_SIZE,
                borderRadius: '50%',
                objectFit: 'cover',
                border: `2px solid ${color}`,
                display: 'block',
              }}
            />
          )}
        </div>

        {/* 多次行动徽章：同一 AV 该角色行动次数 > 1 时显示，内切于头像底部（不超出头像范围，避免遮挡相邻头像） */}
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

        {/* 三角箭头（近端朝向数轴，远端背离数轴） */}
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

        {/* 虚线连接（仅远端标记）*/}
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
