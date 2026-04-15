import { showcaseOutlineLight } from 'lib/characterPreview/CharacterPreviewComponents'
import { computeLcTransform } from 'lib/rendering/lcImageTransform'
import type { CSSProperties } from 'react'

export function CenteredImage({ src, containerW, containerH, imageOffset }: {
  src: string,
  containerW: number,
  containerH: number,
  imageOffset?: { x: number, y: number, s: number },
}) {
  let imageStyle: CSSProperties

  if (imageOffset) {
    const { dy, scale } = computeLcTransform(imageOffset, containerW, containerH)
    imageStyle = {
      width: '100%',
      height: 'auto',
      transform: `translateY(${dy}px) scale(${scale})`,
    }
  } else {
    imageStyle = {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: '100%',
      height: 'auto',
      objectFit: 'cover',
      transform: 'translate(-50%, -50%)',
    }
  }

  return (
    <div
      style={{
        overflow: 'hidden',
        border: showcaseOutlineLight,
        boxShadow: 'var(--shadow-card)',
        borderRadius: 6,
        width: containerW,
        height: containerH,
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <img
        src={src}
        style={imageStyle}
      />
    </div>
  )
}
