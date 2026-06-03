import {
  newLcHeight,
  newLcMargin,
  parentH,
} from 'lib/constants/constantsUi'
import { LoadingBlurredImage } from 'lib/ui/LoadingBlurredImage'
import { type CustomImageConfig } from 'types/customImage'

export function CharacterCustomPortrait({
  customPortrait,
  parentW,
  defaultPortraitUrl,
}: {
  customPortrait: CustomImageConfig,
  parentW: number,
  defaultPortraitUrl: string,
}) {
  // Scale by height so that the light cone in combat scoring doesn't cut off part of the image
  const scaleWidth = parentW / customPortrait.customImageParams.croppedAreaPixels.width
  const totalLcHeight = newLcHeight + newLcMargin
  const heightScaleLimit = customPortrait.customImageParams.croppedAreaPixels.width / customPortrait.originalDimensions.width
  const scaleHeight = Math.max((parentH - totalLcHeight) / parentH, heightScaleLimit)

  const horizontalOffset = totalLcHeight / parentH * parentW / 2

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
      data-fallback-src={defaultPortraitUrl}
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
      />
    </div>
  )
}
