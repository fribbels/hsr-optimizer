import { LoadingBlurredImage } from 'lib/ui/LoadingBlurredImage'
import React from 'react'
import { CustomImageConfig } from 'types/customImage'

interface CharacterCustomPortraitProps {
  customPortrait: CustomImageConfig
  parentW: number
}

const CharacterCustomPortrait: React.FC<CharacterCustomPortraitProps> = ({
  customPortrait,
  parentW,
}) => {
  const scaleWidth = parentW / customPortrait.customImageParams.croppedAreaPixels.width

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
          left: `-${customPortrait.customImageParams.croppedAreaPixels.x * scaleWidth}px`,
          top: `-${customPortrait.customImageParams.croppedAreaPixels.y * scaleWidth}px`,
          width: `${customPortrait.originalDimensions.width * scaleWidth}px`,
          height: `${customPortrait.originalDimensions.height * scaleWidth}px`,
          objectFit: 'cover',
        }}
      />
    </div>
  )
}

export default CharacterCustomPortrait
