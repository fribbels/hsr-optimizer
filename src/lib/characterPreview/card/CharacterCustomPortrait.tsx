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
  const scale = parentW / customPortrait.customImageParams.croppedAreaPixels.width

  const height = customPortrait.originalDimensions.height * scale
  const width = customPortrait.originalDimensions.width * scale
  const top = -customPortrait.customImageParams.croppedAreaPixels.y * scale
  const left = Math.min(
    0,
    Math.max(
      -customPortrait.customImageParams.croppedAreaPixels.x * scale,
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
