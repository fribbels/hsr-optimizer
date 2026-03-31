import chroma from 'chroma-js'
import type { PaletteResponse } from 'lib/characterPreview/color/colorExtractionService'

export function showcaseBackgroundColor(color: string) {
  return chroma(color).desaturate(0.2).luminance(0.02).css()
}

export function withAlpha(cssColor: string, alpha: number): string {
  return chroma(cssColor).alpha(alpha).css()
}


const DEFAULT_FALLBACK = '#2241be'

/**
 * Selects the most visually suitable seed color from a palette for use as the
 * showcase card background tint.
 *
 * Pre-filter: removes the fallback placeholder, near-white achromatic colors,
 * and near-black colors.
 *
 * Scoring — base score is OKLCH chroma (more saturated = higher start):
 *
 *   1. Warm/skin-tone suppression — orange/yellow hues are heavily penalized,
 *      with an additional penalty for muddy brown tones (low chroma in that range).
 *
 *   2. Cool hue boost — cyan/blue/violet hues are boosted to favor the cool
 *      tones common in HSR's art direction.
 *
 *   3. Mid-lightness preference — bell curve peaked around a mid-lightness target.
 *      Prevents washed-out pastels and near-invisible darks from winning.
 *
 * Returns the highest-scoring candidate, or DEFAULT_FALLBACK if all candidates
 * are filtered out.
 */
export function pickBestSeed(palette: PaletteResponse): string {
  const all = [
    palette.Vibrant, palette.DarkVibrant, palette.Muted,
    palette.DarkMuted, palette.LightVibrant, palette.LightMuted,
    ...palette.colors,
  ].filter((c) => {
    if (c === DEFAULT_FALLBACK) return false
    const [l, ch] = chroma(c).oklch()
    if (l > 0.90 && ch < 0.03) return false  // near-white achromatic (no usable hue)
    if (l < 0.05) return false                 // near-black (too dark to tint)
    return true
  })

  if (!all.length) return DEFAULT_FALLBACK

  let best = all[0]
  let bestScore = -Infinity

  for (const color of all) {
    const [l, c, h] = chroma(color).oklch()
    let score = c

    // Suppress warm skin tones (orange/yellow range); extra penalty for muddy browns (low chroma in that range)
    if (!Number.isNaN(h)) {
      if (h >= 10 && h <= 80 && c < 0.22) score *= 0.1
      if (h >= 40 && h <= 70 && c > 0.02 && c < 0.12) score *= 0.1
    }

    // Boost cool hues (cyan → blue → violet)
    if (!Number.isNaN(h) && h >= 180 && h <= 310) score *= 1.5

    // Prefer mid-lightness; penalize very dark and very light colors
    const lDist = Math.abs(l - 0.45)
    score *= Math.max(0.2, 1 - lDist * 2)

    if (score > bestScore) { bestScore = score; best = color }
  }

  return best
}

// Sorts by HSL lightness descending, then by hue ascending as a tiebreaker.
function colorSorter(a: string, b: string): number {
  const [hueA, , lightnessA] = chroma(a).hsl()
  const [hueB, , lightnessB] = chroma(b).hsl()

  const lightnessDiff = lightnessB - lightnessA
  if (lightnessDiff !== 0) return lightnessDiff

  return hueA - hueB
}

// Partitions colors into lightness bands of `groupSize`, then sorts each band
// by hue. The result is a visually organized grid: each row is a lightness tier,
// and colors flow through the hue wheel within that tier.
function sortColorsByGroups(colors: string[], groupSize: number): string[] {
  const sortedColors = colors.sort(colorSorter)

  const groupedColors: string[] = []
  for (let i = 0; i < sortedColors.length; i += groupSize) {
    const group = sortedColors.slice(i, i + groupSize)

    const hueSortedGroup = group.sort((a, b) => {
      const hueA = chroma(a).hsl()[0]
      const hueB = chroma(b).hsl()[0]
      return hueA - hueB
    })

    groupedColors.push(...hueSortedGroup)
  }

  return groupedColors
}

/**
 * Builds the full color swatch grid shown in the showcase customization sidebar.
 *
 * All palette colors (named swatches + extras) are normalized to a fixed
 * OKLCH lightness and chroma while preserving their hue. This ensures every
 * swatch is equally readable regardless of how dark or saturated the source
 * color was. Achromatic colors (NaN hue) are mapped to hue 0.
 *
 * After normalization, duplicates are removed (multiple input hues can round to
 * the same output hex), the list is capped, and the result is sorted into
 * fixed-width lightness bands with hue ordering within each band.
 */
export function organizeColors(palette: PaletteResponse) {
  const colors = [...new Set([
    palette.Vibrant,
    palette.DarkVibrant,
    palette.Muted,
    palette.DarkMuted,
    palette.LightVibrant,
    palette.LightMuted,
    ...palette.colors,
  ])].map((hex) => {
    // Preserve hue; normalize lightness and chroma for uniform readability
    const [, , h] = chroma(hex).oklch()
    return chroma.oklch(0.70, 0.15, Number.isNaN(h) ? 0 : h).hex()
  }).slice(0, 64)

  return sortColorsByGroups([...new Set(colors)], 8)
}

/**
 * Adjusts a user-supplied custom color to fit the showcase card aesthetic:
 * lifts HSV value toward white (brightens dark colors without blowing out
 * light ones) and reduces saturation slightly (softens overly vivid picks).
 * The fallback placeholder is returned unchanged.
 */
export function modifyCustomColor(hex: string) {
  if (hex === DEFAULT_FALLBACK) return hex

  const color = chroma(hex)

  const currentV = color.get('hsv.v')
  const newV = currentV + (1 - currentV) * 0.45

  const currentS = color.get('hsv.s')
  const newS = currentS - (currentS * 0.15)

  const primary = color.set('hsv.v', newV).set('hsv.s', newS).hex()

  return primary
}
