const NAT_HEIGHT = 1260
const NAT_WIDTH = 904
const NAT_BORDER = 14 // Actual baked-in border in the LC image
const CLAMP_MARGIN = 24 // Extra margin to keep the border hidden when translating
const GAME_WIDTH = 520
const ASPECT = NAT_HEIGHT / NAT_WIDTH
const BORDER_SCALAR = (NAT_HEIGHT + NAT_WIDTH - NAT_BORDER * 4) / (NAT_HEIGHT + NAT_WIDTH)

// Minimum zoom to push the border outside the container.
const BORDER_HIDE_ZOOM = 1 + 2 * 28 / NAT_WIDTH

export type LcImageOffset = { x: number; y: number; s: number }

/**
 * Compute the raw vertical offset (dy) from game data.
 * Uses metadata mapping to convert raw metadata y into container-space pixels.
 */
function computeRawDy(offset: LcImageOffset, containerWidth: number): number {
  const elemAdj = containerWidth * BORDER_SCALAR
  const scalar = GAME_WIDTH / (elemAdj - NAT_BORDER * ASPECT)
  const scaledImageHeight = GAME_WIDTH * ASPECT * scalar
  return -offset.y * (NAT_HEIGHT / scaledImageHeight)
}

/**
 * Metadata scale used by in-game style rendering after border correction.
 */
function computeMetadataScale(offset: LcImageOffset): number {
  return (offset.s ?? 1) / BORDER_SCALAR
}

/**
 * Compute the CSS transform for an LC portrait image.
 *
 * Applies:
 * 1. A fixed zoom (BORDER_HIDE_ZOOM) so the baked-in 14px white border
 *    stays outside the visible container.
 * 2. A vertical offset (dy) derived from the game's imageOffset data using the
 *    guide's conversion math.
 * 3. Clamping so the viewing window never extends beyond the image edge
 *    (which would show empty space or the border we're hiding).
 *
 * The image should be rendered with `width: 100%` inside a container with
 * `overflow: hidden` and flex centering.
 */
export function computeLcTransform(
  offset: LcImageOffset,
  containerWidth: number,
  containerHeight: number,
): { dy: number; scale: number } {
  // Keep render zoom fixed to border-hide behavior.
  const scale = BORDER_HIDE_ZOOM

  // Rendered image height at width: 100% * scale
  const imgH = containerWidth * ASPECT * scale

  // Clamp margin at rendered scale
  const margin = CLAMP_MARGIN * containerWidth * scale / NAT_WIDTH

  // Maximum |dy| before the image edge (minus margin) enters the container
  const maxDy = Math.max(0, (imgH - containerHeight) / 2 - margin)

  // Convert metadata-space dy into our fixed-scale render space.
  const metadataDy = computeRawDy(offset, containerWidth)
  const metadataScale = computeMetadataScale(offset)
  const rawDy = metadataDy * (scale / metadataScale)

  // Clamp to safe range
  const dy = Math.max(-maxDy, Math.min(maxDy, rawDy))

  return { dy, scale }
}
