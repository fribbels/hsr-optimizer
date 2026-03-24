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
  blurSample: boolean        // Extract from blurred portrait (matches visible bg)
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
  blurSample: false,
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
// 3. Dislike Fix — expanded from Material You's DislikeAnalyzer
// Yellow-greens (hue 80-130°) look muddy on dark backgrounds.
// Pure yellows (hue 95-110°) are the worst offenders.
// Fix: shift hue toward nearest clean color (green at 145° or orange at 65°)
// and desaturate slightly. Lightness changes don't help because normalization
// compresses everything back to targetL.
// Also filters near-white/achromatic seeds (white bg problem).
// ---------------------------------------------------------------------------
export function fixDisliked(l: number, c: number, h: number): { l: number; c: number; h: number } {
  const hNorm = ((h % 360) + 360) % 360

  // Near-white / achromatic: shift to a neutral blue-gray
  if (c < 0.015 && l > 0.85) {
    return { l, c: 0.02, h: 260 } // force a faint blue tint
  }

  // Yellow-green danger zone: 70-155° (wider than Material You's 90-111°)
  // Covers yellows, yellow-greens, and greens that look ugly on dark cards
  if (hNorm >= 70 && hNorm <= 155 && c > 0.02) {
    const center = 110 // worst point (yellow-green)
    const dist = hNorm - center
    // Push toward teal (175°) if on the green side, toward warm orange (50°) if warm side
    const target = dist >= 0 ? 180 : 45
    // Stronger push near the center, tapers at edges
    const strength = 1 - Math.abs(dist) / 50
    const clampedStrength = Math.max(0, Math.min(1, strength))
    const newH = hNorm + (target - hNorm) * clampedStrength * 0.7
    // Desaturate more aggressively near the center
    const newC = c * (1 - clampedStrength * 0.3)
    return { l, c: newC, h: newH }
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
// Draws image to canvas, masks center, returns canvas for extraction.
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
// 10b. Blur Sample — apply blur + brightness + saturate to simulate what
// the blurred portrait background looks like, then extract from that.
// Uses OffscreenCanvas filter support (or falls back to downscale blur).
// ---------------------------------------------------------------------------
export function createBlurredCanvas(
  img: HTMLImageElement,
  blur: number = 18,
  brightness: number = 0.55,
  saturate: number = 0.85,
): HTMLCanvasElement {
  // Downscale to speed up + simulate blur (1/4 size then scale back)
  const scale = 0.25
  const sw = Math.floor(img.naturalWidth * scale)
  const sh = Math.floor(img.naturalHeight * scale)

  // Step 1: downscale (acts as a rough blur)
  const small = document.createElement('canvas')
  small.width = sw
  small.height = sh
  const sCtx = small.getContext('2d')!
  sCtx.drawImage(img, 0, 0, sw, sh)

  // Step 2: apply brightness + saturate by drawing with filter if supported
  const out = document.createElement('canvas')
  out.width = sw
  out.height = sh
  const oCtx = out.getContext('2d')!
  try {
    oCtx.filter = `brightness(${brightness}) saturate(${saturate}) blur(${Math.round(blur * scale)}px)`
    oCtx.drawImage(small, 0, 0)
  } catch {
    // Fallback: just use the downscaled version (no filter support)
    oCtx.drawImage(small, 0, 0)
  }

  return out
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
