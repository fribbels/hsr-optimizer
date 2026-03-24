import chroma from 'chroma-js'
import type { PaletteResponse } from 'lib/characterPreview/color/colorThiefExtractor'

export function showcaseBackgroundColor(color: string) {
  return chroma(color).desaturate(0.2).luminance(0.02).css()
}


const DEFAULT_FALLBACK = '#2241be'

/**
 * Pick the best seed color from a palette using the midCool strategy:
 * Score = chroma × cool hue bias × bell curve around L=0.45.
 * Avoids skin tones, muddy browns, and near-white/near-black.
 */
export function pickBestSeed(palette: PaletteResponse): string {
  const all = [
    palette.Vibrant, palette.DarkVibrant, palette.Muted,
    palette.DarkMuted, palette.LightVibrant, palette.LightMuted,
    ...palette.colors,
  ].filter((c) => {
    if (c === DEFAULT_FALLBACK) return false
    const [l, ch] = chroma(c).oklch()
    if (l > 0.90 && ch < 0.03) return false
    if (l < 0.05) return false
    return true
  })

  if (!all.length) return DEFAULT_FALLBACK

  let best = all[0]
  let bestScore = -Infinity

  for (const color of all) {
    const [l, c, h] = chroma(color).oklch()
    let score = c

    // Avoid skin tones, browns, muddy warm tones
    if (!Number.isNaN(h)) {
      if (h >= 10 && h <= 80 && c < 0.22) score *= 0.1
      if (h >= 40 && h <= 70 && c > 0.02 && c < 0.12) score *= 0.1
    }

    // Cool hue bias (180-310°)
    if (!Number.isNaN(h) && h >= 180 && h <= 310) score *= 1.5

    // Bell curve around L=0.45 — prefer mid-lightness
    const lDist = Math.abs(l - 0.45)
    score *= Math.max(0.2, 1 - lDist * 2)

    if (score > bestScore) { bestScore = score; best = color }
  }

  return best
}

function colorSorter(a: string, b: string): number {
  const [hueA, , lightnessA] = chroma(a).hsl()
  const [hueB, , lightnessB] = chroma(b).hsl()

  const lightnessDiff = lightnessB - lightnessA
  if (lightnessDiff !== 0) return lightnessDiff

  return hueA - hueB
}

// Sort colors into groups by lightness, then by hue within groups
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

export function organizeColors(palette: PaletteResponse) {
  const colors = [...new Set([
    palette.Vibrant,
    palette.DarkVibrant,
    palette.Muted,
    palette.DarkMuted,
    palette.LightVibrant,
    palette.LightMuted,
    ...palette.colors,
  ])].slice(0, 64)

  return sortColorsByGroups(colors, 8)
}

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
