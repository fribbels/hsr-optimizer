// ---------------------------------------------------------------------------
// Color heuristics — composable, toggleable pure functions.
// Each heuristic modifies one aspect of the color pipeline.
// All operate in OKLCH space (L: 0-1, C: 0-0.4+, H: 0-360).
// ---------------------------------------------------------------------------

import chroma from 'chroma-js'

// ---------------------------------------------------------------------------
// Toggle flags — each controls one heuristic
// ---------------------------------------------------------------------------
export interface HeuristicFlags {
  hueNudge: boolean          // Push all hues toward aesthetic anchors
  chromaLUT: boolean         // Hue-dependent chroma multiplier
  dislikeFix: boolean        // Material You yellow-green fix
  adaptivePortrait: boolean  // Seed-driven portrait filter
  gamutMap: boolean          // Push chroma to gamut edge (maximize vibrancy)
  contrastAlpha: boolean     // Adaptive alpha: dark seeds more transparent, light more opaque
  seedRelativeL: boolean     // Panel L adapts to seed L
  compBorder: boolean        // Analogous border hue (subtle shift)
  chromaCompensate: boolean  // Raise maxC ceiling to allow more chroma through
  edgeSample: boolean        // Extract from portrait edges
}

export const DEFAULT_HEURISTIC_FLAGS: HeuristicFlags = {
  hueNudge: false,
  chromaLUT: false,
  dislikeFix: false,
  adaptivePortrait: false,
  gamutMap: false,
  contrastAlpha: false,
  seedRelativeL: false,
  compBorder: false,
  chromaCompensate: false,
  edgeSample: false,
}

// ---------------------------------------------------------------------------
// 1. Hue Nudge — push ALL hues toward nearest aesthetic anchor
// Anchors: blue (260°), teal (190°), purple (300°), red (0°/360°), magenta (330°)
// Every hue gets gently pulled toward the nearest anchor. Warm muddy hues
// (30-80°) get the strongest pull since they're farthest from any anchor.
// ---------------------------------------------------------------------------
const HUE_ANCHORS = [0, 190, 260, 300, 330, 360] // red, teal, blue, purple, magenta, red(wrap)

export function hueNudge(h: number, c: number, _l: number): number {
  const hNorm = ((h % 360) + 360) % 360

  // Find nearest anchor
  let nearestAnchor = HUE_ANCHORS[0]
  let minDist = 360
  for (const anchor of HUE_ANCHORS) {
    const d = Math.abs(hNorm - anchor)
    if (d < minDist) { minDist = d; nearestAnchor = anchor }
  }

  // Nudge strength: farther from anchor = stronger pull
  // Very aggressive — up to 60° shift for colors deep in the warm desert
  const maxNudge = 60
  const pullStrength = Math.min(minDist / 45, 1.0) // 0 at anchor, 1 at 45°+ away

  // Low chroma = stronger pull (muddy colors benefit more)
  const chromaFactor = 1 - Math.min(c / 0.20, 1)
  const nudge = maxNudge * pullStrength * (0.4 + 0.6 * chromaFactor)

  // Direction toward nearest anchor
  let direction = nearestAnchor > hNorm ? 1 : -1
  // Handle wrap-around
  if (nearestAnchor === 360 && hNorm > 180) direction = 1
  if (nearestAnchor === 0 && hNorm > 180) direction = -1

  return ((hNorm + nudge * direction) % 360 + 360) % 360
}

// ---------------------------------------------------------------------------
// 2. Chroma LUT — hue-dependent chroma multiplier
// Normalizes perceived vibrancy across hues on dark backgrounds.
// Blues look muted → boost. Oranges look loud → reduce.
// ---------------------------------------------------------------------------
const CHROMA_MULT_LUT: Record<number, number> = {
  0: 1.00,    // red
  30: 0.85,   // red-orange — loud
  60: 0.80,   // orange — very vivid
  90: 0.90,   // yellow-orange
  120: 1.15,  // yellow-green — muted
  150: 1.30,  // green — needs boost on dark bg
  180: 1.20,  // teal
  210: 1.10,  // cyan
  240: 1.05,  // blue-cyan
  270: 1.00,  // blue — reference
  300: 0.95,  // blue-magenta
  330: 0.90,  // magenta — vivid
}

export function chromaLUTMultiplier(h: number): number {
  const hNorm = ((h % 360) + 360) % 360
  const bucket = Math.floor(hNorm / 30) * 30
  const next = (bucket + 30) % 360
  const t = (hNorm - bucket) / 30
  const a = CHROMA_MULT_LUT[bucket] ?? 1.0
  const b = CHROMA_MULT_LUT[next] ?? 1.0
  return a + (b - a) * t
}

// Additive offset per hue: greens/teals get +0.01, oranges get -0.008
const CHROMA_OFFSET_LUT: Record<number, number> = {
  0: 0, 30: -0.006, 60: -0.008, 90: -0.004,
  120: 0.006, 150: 0.012, 180: 0.010, 210: 0.008,
  240: 0.004, 270: 0, 300: -0.002, 330: -0.004,
}

function chromaOffset(h: number): number {
  const hNorm = ((h % 360) + 360) % 360
  const bucket = Math.floor(hNorm / 30) * 30
  const next = (bucket + 30) % 360
  const t = (hNorm - bucket) / 30
  const a = CHROMA_OFFSET_LUT[bucket] ?? 0
  const b = CHROMA_OFFSET_LUT[next] ?? 0
  return a + (b - a) * t
}

export function applyChromaLUT(c: number, h: number): number {
  return c * chromaLUTMultiplier(h) + chromaOffset(h)
}

// ---------------------------------------------------------------------------
// 3. Dislike Fix — Material You's DislikeAnalyzer
// Yellow-greens (hue 90-111°) with chroma > 0.06 and L < 0.65 look muddy.
// Fix: lighten to L=0.70 (makes them feel fresh/lime instead of rotting).
// Thresholds adapted from HCT (chroma 16 ≈ OKLCH ~0.06, tone 65 ≈ L 0.65).
// ---------------------------------------------------------------------------
export function fixDisliked(l: number, c: number, h: number): { l: number; c: number; h: number } {
  const hNorm = ((h % 360) + 360) % 360
  const isDislikedHue = hNorm >= 90 && hNorm <= 111
  const isChromatic = c > 0.06
  const isDark = l < 0.65
  if (isDislikedHue && isChromatic && isDark) {
    return { l: 0.70, c, h }
  }
  return { l, c, h }
}

// ---------------------------------------------------------------------------
// 4. Adaptive Portrait — seed-driven portrait filter params
// Dark seeds → brighter portrait. Warm seeds → desaturated portrait.
// High chroma seeds → less blur (portrait color IS the identity).
// ---------------------------------------------------------------------------
function hueWarmth(h: number): number {
  const hNorm = ((h % 360) + 360) % 360
  if (hNorm > 180) return 0
  return Math.exp(-((hNorm - 50) * (hNorm - 50)) / (2 * 50 * 50))
}

export function adaptivePortraitFilter(seedL: number, seedC: number, seedH: number): {
  blur: number
  brightness: number
  saturate: number
} {
  // Brightness: dark seeds → brighter portrait, light seeds → dimmer
  // Tighter range: 0.50-0.68 (was 0.35-0.75)
  const brightness = Math.max(0.50, Math.min(0.68, 0.68 - 0.25 * seedL))

  // Saturate: warm hues → slightly desaturated portrait, cool → keep
  const warmth = hueWarmth(seedH)
  const saturate = Math.max(0.70, Math.min(1.00, 0.95 - 0.20 * warmth))

  // Blur: keep in a moderate range (15-22, was 10-24)
  const chromaNorm = Math.min(seedC / 0.15, 1)
  const blur = Math.max(15, Math.min(22, 21 - 6 * chromaNorm))

  return { blur: Math.round(blur), brightness: Math.round(brightness * 100) / 100, saturate: Math.round(saturate * 100) / 100 }
}

// ---------------------------------------------------------------------------
// 5. Gamut Map — push chroma toward gamut boundary for max vibrancy
// Instead of just clamping to maxC, find the actual sRGB gamut limit at this
// L+H and use a fraction of it. Makes colors as vivid as safely possible.
// ---------------------------------------------------------------------------
export function gamutMapChroma(l: number, _c: number, h: number, fraction: number = 0.30): number {
  // Binary search for max in-gamut chroma at this L,H
  let lo = 0
  let hi = 0.4 // OKLCH chroma never exceeds ~0.4 in sRGB
  for (let i = 0; i < 12; i++) {
    const mid = (lo + hi) / 2
    if (chroma.oklch(l, mid, h).clipped()) {
      hi = mid
    } else {
      lo = mid
    }
  }
  // Use fraction of the gamut boundary
  return lo * fraction
}

// ---------------------------------------------------------------------------
// 6. Contrast Alpha — adaptive alpha based on seed brightness
// Dark seeds → more transparent (show portrait through), light seeds → more opaque.
// Makes dark-themed characters feel moody/atmospheric, light characters readable.
// ---------------------------------------------------------------------------
export function contrastAwareAlpha(
  _panelL: number,
  _portraitEstimateL: number,
  baseAlpha: number,
  seedL: number,
): number {
  // seedL range ~0.2-0.8. Map to alpha offset:
  // Dark seed (L=0.2) → alpha - 0.15 (more transparent/glassy, moody)
  // Light seed (L=0.7) → alpha + 0.15 (more opaque, readable)
  const offset = (seedL - 0.45) * 0.50
  return Math.max(0.30, Math.min(0.78, baseAlpha + offset))
}

// ---------------------------------------------------------------------------
// 7. Seed-Relative Lightness — panel L adapts to seed L
// Compression toward a center: dark seeds get slightly darker cards,
// light seeds get slightly lighter cards, preserving tonal identity.
// ---------------------------------------------------------------------------
export function seedRelativeLightness(targetL: number, seedL: number, adaptiveScale: number = 0.15): number {
  return targetL + (seedL - targetL) * adaptiveScale
}

// ---------------------------------------------------------------------------
// 8. Analogous Border — subtle hue shift for border
// Shifts border hue by 30° (analogous color) for gentle color interest
// without the clashing of complementary.
// ---------------------------------------------------------------------------
export function complementaryBorderHue(seedH: number, offset: number = 30): number {
  return (seedH + offset) % 360
}

// ---------------------------------------------------------------------------
// 9. Chroma Compensate — raise the chroma ceiling
// The default maxC (0.048) is conservative. This multiplies it by 1.5x,
// letting more of the seed's color character through the pipeline.
// Applied as a maxC multiplier in the gallery's computeCardColors.
// ---------------------------------------------------------------------------
export function chromaCompensation(inputC: number, inputL: number, outputL: number, factor: number = 0.3): number {
  const deltaL = Math.max(0, inputL - outputL)
  return inputC * (1 + deltaL * factor)
}

// The actual visible effect: a maxC multiplier applied in computeCardColors
export const CHROMA_COMPENSATE_MAX_C_MULT = 1.5

// ---------------------------------------------------------------------------
// 10. Edge Sample — extract colors from portrait edges only
// Draws image to canvas, masks center, returns ImageData for extraction.
// ---------------------------------------------------------------------------
export function createEdgeMaskedCanvas(
  img: HTMLImageElement,
  borderFraction: number = 0.25,
): HTMLCanvasElement {
  const w = img.naturalWidth
  const h = img.naturalHeight
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!

  // Draw full image
  ctx.drawImage(img, 0, 0)

  // Clear center region (keep only edges)
  const bx = Math.floor(w * borderFraction)
  const by = Math.floor(h * borderFraction)
  ctx.clearRect(bx, by, w - 2 * bx, h - 2 * by)

  return canvas
}

// ---------------------------------------------------------------------------
// Utility: estimate portrait background luminance from palette
// Takes the mean OKLCH L of all swatches, halved for brightness filter.
// Used by contrastAwareAlpha.
// ---------------------------------------------------------------------------
export function estimatePortraitLuminance(
  seedColor: string,
  portraitBrightness: number,
): number {
  const [l] = chroma(seedColor).oklch()
  return l * portraitBrightness
}
