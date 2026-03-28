import chroma from 'chroma-js'
import { type MantineColorsTuple } from '@mantine/core'

// Dark palette offsets aligned with Mantine's semantic expectations:
// dark-0 = text, dark-1 = dimmed, dark-2 = placeholder,
// dark-4 = borders, dark-5 = hover, dark-6 = component bg, dark-7 = body
const DARK_LIGHTNESS_OFFSETS = [0.70, 0.45, 0.35, 0.25, 0.26, 0.12, 0.08, 0, -0.02, -0.04]

const PRIMARY_LIGHTNESS = [0.94, 0.86, 0.76, 0.66, 0.56, 0, 0.40, 0.32, 0.24, 0.16]

const SURFACE_HUE_OFFSET = 6.6
const SURFACE_SATURATION = 0.407
const SURFACE_BASE_LIGHTNESS = 0.159

// Custom layer offsets not in the dark palette (injected via cssVariablesResolver)
const LAYER_1_OFFSET = 0.04
const LAYER_2_OFFSET = 0.08
const LAYER_3_OFFSET = 0.10

export function deriveDarkPalette(seedHue: number): MantineColorsTuple {
  const baseBg = chroma.hsl(seedHue + SURFACE_HUE_OFFSET, SURFACE_SATURATION, SURFACE_BASE_LIGHTNESS)
  const baseL = baseBg.get('hsl.l')
  return DARK_LIGHTNESS_OFFSETS.map((offset) =>
    chroma(baseBg).set('hsl.l', baseL + offset).hex(),
  ) as unknown as MantineColorsTuple
}

export function derivePrimaryPalette(seed: string): MantineColorsTuple {
  const [h, s, l] = chroma(seed).hsl()
  const seedL = Math.min(l, 0.55)
  const lightness = [...PRIMARY_LIGHTNESS]
  lightness[5] = seedL
  return lightness.map((pl) =>
    chroma.hsl(h, s, pl).hex(),
  ) as unknown as MantineColorsTuple
}

export function deriveCustomLayers(seedHue: number): { layer1: string; layer2: string; layer3: string } {
  const baseBg = chroma.hsl(seedHue + SURFACE_HUE_OFFSET, SURFACE_SATURATION, SURFACE_BASE_LIGHTNESS)
  const baseL = baseBg.get('hsl.l')
  return {
    layer1: chroma(baseBg).set('hsl.l', baseL + LAYER_1_OFFSET).hex(),
    layer2: chroma(baseBg).set('hsl.l', baseL + LAYER_2_OFFSET).hex(),
    layer3: chroma(baseBg).set('hsl.l', baseL + LAYER_3_OFFSET).hex(),
  }
}
