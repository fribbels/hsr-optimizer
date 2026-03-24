// ---------------------------------------------------------------------------
// ColorThief-based palette extraction
// Uses OKLCH quantization for perceptually uniform palette extraction.
// ---------------------------------------------------------------------------

import { getSwatches, getPalette as ctGetPalette } from 'colorthief'

export type PaletteResponse = {
  Vibrant: string
  Muted: string
  DarkVibrant: string
  DarkMuted: string
  LightVibrant: string
  LightMuted: string
  colors: string[]
}

const DEFAULT_FALLBACK = '#2241be'

// ---------------------------------------------------------------------------
// Extract palette using colorthief with OKLCH quantization.
// Returns PaletteResponse compatible with the existing pipeline so both
// extractors are interchangeable.
// ---------------------------------------------------------------------------
export async function getColorThiefPalette(src: string | HTMLCanvasElement): Promise<PaletteResponse | null> {
  try {
    const source = typeof src === 'string' ? await loadImage(src) : src

    const [swatches, palette] = await Promise.all([
      getSwatches(source, { colorSpace: 'oklch', quality: 5 }),
      ctGetPalette(source, { colorCount: 32, colorSpace: 'oklch', quality: 5 }),
    ])

    const swatchHex = {
      Vibrant: swatches.Vibrant?.color.hex() ?? DEFAULT_FALLBACK,
      Muted: swatches.Muted?.color.hex() ?? DEFAULT_FALLBACK,
      DarkVibrant: swatches.DarkVibrant?.color.hex() ?? DEFAULT_FALLBACK,
      DarkMuted: swatches.DarkMuted?.color.hex() ?? DEFAULT_FALLBACK,
      LightVibrant: swatches.LightVibrant?.color.hex() ?? DEFAULT_FALLBACK,
      LightMuted: swatches.LightMuted?.color.hex() ?? DEFAULT_FALLBACK,
    }

    const swatchSet = new Set(Object.values(swatchHex))
    const colors = (palette ?? [])
      .map((c) => c.hex())
      .filter((hex) => {
        if (swatchSet.has(hex)) return false
        // Drop very dark or very desaturated colors — they produce muddy seeds
        const r = parseInt(hex.slice(1, 3), 16)
        const g = parseInt(hex.slice(3, 5), 16)
        const b = parseInt(hex.slice(5, 7), 16)
        const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255
        if (lum < 0.12) return false // near-black
        return true
      })

    return { ...swatchHex, colors }
  } catch (e) {
    console.error('[colorThiefExtractor]', e)
    return null
  }
}

// ---------------------------------------------------------------------------
// Image loader — creates an HTMLImageElement from a URL.
// Handles CORS for cross-origin portrait images.
// ---------------------------------------------------------------------------
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}
