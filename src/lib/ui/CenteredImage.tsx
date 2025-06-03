import { showcaseOutlineLight } from 'lib/characterPreview/CharacterPreviewComponents'
import { cardShadow } from 'lib/tabs/tabOptimizer/optimizerForm/layout/FormCard'
import React from 'react'

export function CenteredImage(props: {
  src: string,
  containerW: number,
  containerH: number,
  zoom?: number, // Optional zoom factor, defaults to 1.0
  centerY?: number, // Vertical point to center (in px from top of original image)
  relativeHeight?: number, // Original height that centerY is relative to
}) {
  const {
    src,
    containerW,
    containerH,
    zoom = 1.0,
    centerY,
    relativeHeight,
  } = props

  // Determine where to position the image vertically
  let yPosition = '50%' // Default to center

  if (centerY != null && relativeHeight != null) {
    // Convert the centerY position to a percentage of the original image height
    yPosition = `${(centerY / relativeHeight) * 100}%`
  }

  return (
    <div
      style={{
        overflow: 'hidden',
        border: showcaseOutlineLight,
        boxShadow: cardShadow,
        borderRadius: 5,
        width: containerW,
        height: containerH,
        position: 'relative',
      }}
    >
      <div
        style={{
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <img
          src={src}
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            width: '100%',
            height: 'auto',
            objectFit: 'cover',
            transform: `translate(-50%, -${yPosition}) scale(${zoom})`,
            transformOrigin: `center ${yPosition}`,
          }}
        />
      </div>
    </div>
  )
}
