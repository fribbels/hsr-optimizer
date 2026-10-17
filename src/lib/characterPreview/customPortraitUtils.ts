import type { CustomImageConfig } from 'types/customImage'

const CROP_CENTER = 0.5
const PERCENT = 100

export function getCustomPortraitObjectPosition(
  portrait: CustomImageConfig,
  verticalCropFocus = CROP_CENTER,
): string {
  const crop = portrait.customImageParams.croppedAreaPixels
  const { width, height } = portrait.originalDimensions
  if (width <= 0 || height <= 0) return 'center'

  const x = (crop.x + crop.width * CROP_CENTER) / width * PERCENT
  const y = (crop.y + crop.height * verticalCropFocus) / height * PERCENT
  return `${x}% ${y}%`
}
