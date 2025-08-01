import {
  newLcHeight,
  newLcMargin,
  parentH,
} from 'lib/constants/constantsUi'
import { ScoringType } from 'lib/scoring/simScoringUtils'
import { LoadingBlurredImage } from 'lib/ui/LoadingBlurredImage'
import React from 'react'
import { CustomImageConfig } from 'types/customImage'

interface CharacterCustomPortraitProps {
  customPortrait: CustomImageConfig
  parentW: number
  scoringType: ScoringType
  onPortraitLoad?: (img: string) => void
}

const CharacterCustomPortrait: React.FC<CharacterCustomPortraitProps> = ({
  customPortrait,
  parentW,
  scoringType,
  onPortraitLoad,
}) => {
  // Scale by height so that the light cone in combat scoring doesn't cut off part of the image
  const scaleWidth = parentW / customPortrait.customImageParams.croppedAreaPixels.width
  const totalLcHeight = newLcHeight + newLcMargin
  const heightScaleLimit = customPortrait.customImageParams.croppedAreaPixels.width / customPortrait.originalDimensions.width
  const scaleHeight = scoringType == ScoringType.COMBAT_SCORE
    ? Math.max((parentH - totalLcHeight) / parentH, heightScaleLimit)
    : 1

  // When we shrink the scale by height, this is aligned left so the right side shrinks left.
  // To balance that, we horizontally offset back towards the center, proportionally to the light cone height
  // That also means we have to set left limits so that this doesnt cause the image to underflow on the left & right
  const horizontalOffset = scoringType == ScoringType.COMBAT_SCORE
    ? totalLcHeight / parentH * parentW / 2
    : 0

  const height = customPortrait.originalDimensions.height * scaleWidth * scaleHeight
  const width = customPortrait.originalDimensions.width * scaleWidth * scaleHeight
  const top = -customPortrait.customImageParams.croppedAreaPixels.y * scaleWidth * scaleHeight
  const left = Math.min(
    0,
    Math.max(
      -customPortrait.customImageParams.croppedAreaPixels.x * scaleWidth * scaleHeight + horizontalOffset,
      -width + parentW,
    ),
  )

  return (
    <div
      style={{
        position: 'absolute',
      }}
    >
      <LoadingBlurredImage
        src={customPortrait.imageUrl}
        style={{
          position: 'relative',
          height: `${height}px`,
          width: `${width}px`,
          top: `${top}px`,
          left: `${left}px`,
          objectFit: 'cover',
        }}
        callback={onPortraitLoad}
      />
    </div>
  )
}

export default CharacterCustomPortrait
