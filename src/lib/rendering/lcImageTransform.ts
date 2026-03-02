const NAT_HEIGHT = 1260
const NAT_WIDTH = 904
const NAT_BORDER = 14
const GAME_WIDTH = 520
const ASPECT = NAT_HEIGHT / NAT_WIDTH
const BORDER_SCALAR = (NAT_HEIGHT + NAT_WIDTH - NAT_BORDER * 4) / (NAT_HEIGHT + NAT_WIDTH)

// Minimum zoom to push the border outside the container.
const BORDER_HIDE_ZOOM = 1 + 2 * 20 / NAT_WIDTH

export type LcImageOffset = { x: number; y: number; s: number }

/**
 * Compute the raw vertical offset (dy) from game data.
 * Uses the game's offset formula to convert raw {x, y, s} into a pixel dy
 * for a given container width. The dx and scale from the game formula are
 * not used — we only apply vertical centering with a fixed border-hiding zoom.
 */
function computeRawDy(offset: LcImageOffset, containerWidth: number): number {
  const elemAdj = containerWidth * BORDER_SCALAR
  const scalar = GAME_WIDTH / (elemAdj - NAT_BORDER * ASPECT)
  const scaledImageHeight = GAME_WIDTH * ASPECT * scalar
  return -offset.y * (NAT_HEIGHT / scaledImageHeight)
}

/**
 * Compute the CSS transform for an LC portrait image.
 *
 * Applies:
 * 1. A fixed zoom (BORDER_HIDE_ZOOM) to push the baked-in 14px white border
 *    outside the visible container.
 * 2. A vertical offset (dy) derived from the game's imageOffset data to
 *    center the point of interest.
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
  const scale = BORDER_HIDE_ZOOM

  // Rendered image height at width: 100% * scale
  const imgH = containerWidth * ASPECT * scale

  // Border size at rendered scale
  const border = NAT_BORDER * containerWidth * scale / NAT_WIDTH

  // Maximum |dy| before the image edge (minus border) enters the container
  const maxDy = Math.max(0, (imgH - containerHeight) / 2 - border)

  // Raw dy from game offset data
  const rawDy = computeRawDy(offset, containerWidth)

  // Clamp to safe range
  const dy = Math.max(-maxDy, Math.min(maxDy, rawDy))

  return { dy, scale }
}
