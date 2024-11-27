import chroma from 'chroma-js'
import { scaleTowardsRange } from 'lib/utils/mathUtils'
import { PaletteResponse } from 'lib/utils/vibrantFork'

export function showcaseCardBackgroundColor(color: string) {
  const scaleFactor = 0.98
  const minSaturation = 0.20
  const maxSaturation = 0.275
  const chromaColor = chroma(color)

  const currentSaturation = chromaColor.get('hsl.s')
  const clampedSaturation = scaleTowardsRange(currentSaturation, minSaturation, maxSaturation, scaleFactor)

  const adjustedColor = chromaColor.set('hsl.s', clampedSaturation)

  const finalColor = adjustedColor
    .luminance(scaleTowardsRange(adjustedColor.luminance(), 0.025, 0.025, 0.98))
    .alpha(0.89)

  // console.log(finalColor.luminance())
  // console.log(finalColor.hsl())

  return finalColor.css()
}

export function showcaseCardBorderColor(color: string) {
  return chroma(color).saturate(0.9).luminance(0.125).alpha(0.75).css()
}

export function showcaseBackgroundColor(color: string) {
  return chroma(color).desaturate(0.2).luminance(0.02).css()
}

export function showcaseSegmentedColor(color: string) {
  return chroma(color).luminance(0.1).alpha(0.5).css()
}

export function colorTransparent() {
  return '#00000000'
}

export function showcaseTransition() {
  return 'background-color 0.35s, box-shadow 0.25s, border-color 0.25s'
}

export function selectColor(color1: string, color2: string): string {
  const targetBlue = 'rgb(0, 0, 255)'

  const deltaE1 = chroma.deltaE(color1, targetBlue)
  const deltaE2 = chroma.deltaE(color2, targetBlue)

  return deltaE1 < deltaE2 ? color1 : color2
}

export function colorSorter(a: string, b: string): number {
  const [hueA, , lightnessA] = chroma(a).hsl()
  const [hueB, , lightnessB] = chroma(b).hsl()

  const lightnessDiff = lightnessB - lightnessA
  if (lightnessDiff !== 0) return lightnessDiff

  return hueA - hueB
}

// Sort colors into groups by lightness, then by hue within groups
export function sortColorsByGroups(colors: string[], groupSize: number): string[] {
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
  const colors = [
    palette.Vibrant,
    palette.DarkVibrant,
    palette.Muted,
    palette.DarkMuted,
    palette.LightVibrant,
    palette.LightMuted,
    ...palette.colors,
  ].slice(0, 64)

  return sortColorsByGroups(colors, 8)
}
