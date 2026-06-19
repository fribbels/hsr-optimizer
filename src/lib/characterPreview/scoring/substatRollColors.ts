import chroma from 'chroma-js'

export type TierColors = { high: string; mid: string; low: string }

export const ROLL_WIDTH_RATIOS = { high: 1.0, mid: 0.9, low: 0.8 } as const

const COLOR_ALPHA = 0.90
const LOW_ALPHA_MULTIPLIER = 0.90

function seedHueChroma(seed: string) {
  const [, c, h] = chroma(seed).oklch()
  const achromatic = Number.isNaN(h) || c < 0.01
  return { hue: achromatic ? 0 : h, c: achromatic ? 0 : c }
}

function pastelColors(seedColor: string): TierColors {
  const { hue, c } = seedHueChroma(seedColor)
  const s = c > 0 ? Math.max(c, 0.12) : 0
  return {
    high: chroma.oklch(0.67, s * 0.75, hue).css(),
    mid: chroma.oklch(0.78, s * 0.38, hue).css(),
    low: chroma.oklch(0.95, 0.005, hue).css(),
  }
}

export function computeTierColors(seedColor: string): TierColors {
  const colors = pastelColors(seedColor)
  const lowAlpha = COLOR_ALPHA * LOW_ALPHA_MULTIPLIER
  return {
    high: chroma(colors.high).alpha(COLOR_ALPHA).css(),
    mid: chroma(colors.mid).alpha(COLOR_ALPHA).css(),
    low: chroma(colors.low).alpha(lowAlpha).css(),
  }
}
