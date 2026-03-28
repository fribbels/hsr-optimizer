import chroma from 'chroma-js'
import { type MantineColorsTuple } from '@mantine/core'

const DARK_LIGHTNESS_OFFSETS = [0.70, 0.58, 0.45, 0.35, 0.20, 0.08, 0.04, 0, -0.02, -0.04]
const PRIMARY_LIGHTNESS = [0.94, 0.86, 0.76, 0.66, 0.56, 0, 0.40, 0.32, 0.24, 0.16]
const SURFACE_SATURATION = 0.41
const SURFACE_BASE_LIGHTNESS = 0.16

export function deriveDarkPalette(seedHue: number): MantineColorsTuple {
  const baseBg = chroma.hsl(seedHue, SURFACE_SATURATION, SURFACE_BASE_LIGHTNESS)
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
