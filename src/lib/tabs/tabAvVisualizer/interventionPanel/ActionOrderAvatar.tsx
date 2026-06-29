import { Assets } from 'lib/rendering/assets'
import { ActionOverlayBadge } from 'lib/tabs/tabAvVisualizer/SpecialActionIcon'
import { useState } from 'react'

type ActionOrderAvatarProps = {
  characterId: string
  characterName: string
  color: string
  size?: number
  // This entry's own slot *is* this character's Ult/extraAttack (own separate slot in the sequence, not
  // merged onto a different normal-action slot) — still shows this character's own avatar, just with the
  // matching overlay badge attached, so it reads as "this character's Ult" rather than an anonymous icon.
  hasUltOverlay?: boolean
  hasExtraOverlay?: boolean
}

// Mirrors ActionMarker.tsx's avatar rendering (falls back to a color block + initial on image load failure);
// used for the action-order row in the intervention panel
export function ActionOrderAvatar({ characterId, characterName, color, size = 40, hasUltOverlay, hasExtraOverlay }: ActionOrderAvatarProps) {
  const [imgError, setImgError] = useState(false)

  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      {imgError ? (
        <div style={{
          width: size,
          height: size,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          backgroundColor: `${color}33`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: Math.round(size * 0.4),
          fontWeight: 700,
          color,
        }}>
          {characterName.charAt(0)}
        </div>
      ) : (
        <img
          src={Assets.getCharacterAvatarById(characterId)}
          onError={() => setImgError(true)}
          style={{
            width: size,
            height: size,
            borderRadius: '50%',
            objectFit: 'cover',
            border: `2px solid ${color}`,
            display: 'block',
          }}
        />
      )}
      {hasUltOverlay && <ActionOverlayBadge edge='bottom' color={color} size={size} />}
      {hasExtraOverlay && <ActionOverlayBadge edge='top' color={color} size={size} />}
    </div>
  )
}
