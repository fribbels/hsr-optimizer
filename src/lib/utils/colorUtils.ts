import chroma, { Color } from 'chroma-js'
import { scaleTowardsRange } from 'lib/utils/mathUtils'
import { PaletteResponse } from 'lib/utils/vibrantFork'

export function showcaseCardBackgroundColor(color: string, darkMode: boolean) {
  const scaleFactor = 0.96
  const minSaturation = 0.20
  const maxSaturation = 0.30
  const chromaColor = chroma(color)

  const currentSaturation = chromaColor.get('hsl.s')
  const clampedSaturation = scaleTowardsRange(currentSaturation, minSaturation, maxSaturation, scaleFactor)

  const adjustedColor = chromaColor.set('hsl.s', clampedSaturation)

  const finalColor = adjustedColor
    .luminance(scaleTowardsRange(adjustedColor.luminance(), 0.025, 0.0285, 0.9375))
    .alpha(darkMode ? 0.70 : 0.765)

  // console.log(finalColor.luminance())
  // console.log(finalColor.hsl())

  return darkModeModifier(finalColor, darkMode).css()
}

export function darkModeModifier(color: Color, darkMode: boolean) {
  return !darkMode
    ? color
    : color
      .desaturate(0.05)
      .darken(0.20)
}

export function showcaseCardBorderColor(color: string, darkMode: boolean) {
  const finalColor = chroma(color).desaturate(0.6).luminance(0.125).brighten(0.90).alpha(0.75)
  return darkModeModifier(finalColor, darkMode).css()
}

export function showcaseBackgroundColor(color: string, darkMode: boolean) {
  const finalColor = chroma(color).desaturate(0.2).luminance(0.02)
  return darkModeModifier(finalColor, darkMode).css()
}

export function showcaseSegmentedColor(color: string, darkMode: boolean) {
  const finalColor = chroma(color).desaturate(0.5).luminance(0.1).alpha(0.6)
  return darkModeModifier(finalColor, darkMode).css()
}

export function colorTransparent() {
  return '#00000000'
}

export function showcaseTransition() {
  return 'background-color 0.35s, box-shadow 0.25s, border-color 0.25s'
}

export function selectClosestColor(colors: string[]): string {
  const targetBlue = '#2d58b6'

  if (!colors || colors.length === 0) {
    return targetBlue
  }

  const orangenessValues = colors.map(measureOrangeness)

  if (orangenessValues.every((orangeness) => orangeness > 0.3)) {
    return targetBlue
  }

  return colors.reduce((closestColor, currentColor, index) => {
    const deltaEClosest = chroma.deltaE(closestColor, targetBlue)
    const deltaECurrent = chroma.deltaE(currentColor, targetBlue)

    const orangenessClosest = measureOrangeness(closestColor)
    const orangenessCurrent = measureOrangeness(currentColor)

    const penalizedClosest = deltaEClosest * (1 + orangenessClosest)
    const penalizedCurrent = deltaECurrent * (1 + orangenessCurrent)

    return penalizedCurrent < penalizedClosest ? currentColor : closestColor
  })
}

export function measureOrangeness(color: string): number {
  const targetHue = 37.5
  const orangeRange = 40
  const [hue, saturation, lightness] = chroma(color).hsl()

  const hueDifference = Math.abs(hue - targetHue)
  const orangenessHue = 1 - Math.min(hueDifference / orangeRange, 1)

  const saturationAdjustment = Math.max(0, saturation - 0.2) // Ignore very desaturated colors

  const orangeness = 0.8 * orangenessHue + 0.2 * saturationAdjustment

  return orangeness
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
