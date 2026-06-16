import { Assets } from 'lib/rendering/assets'
import { useState } from 'react'

type ActionOrderAvatarProps = {
  characterId: string
  characterName: string
  color: string
  size?: number
}

// Mirrors ActionMarker.tsx's avatar rendering (falls back to a color block + initial on image load failure);
// used for the action-order row in the intervention panel
export function ActionOrderAvatar({ characterId, characterName, color, size = 40 }: ActionOrderAvatarProps) {
  const [imgError, setImgError] = useState(false)

  if (imgError) {
    return (
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
        flexShrink: 0,
      }}>
        {characterName.charAt(0)}
      </div>
    )
  }

  return (
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
        flexShrink: 0,
      }}
    />
  )
}
