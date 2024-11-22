import chroma from 'chroma-js'

export function showcaseCardBackgroundColor(color: string) {
  const minSaturation = 0.2
  const maxSaturation = 0.35
  const chromaColor = chroma(color)

  const currentSaturation = chromaColor.get('hsl.s')
  const clampedSaturation = Math.min(Math.max(currentSaturation, minSaturation), maxSaturation)

  const adjustedColor = chromaColor.set('hsl.s', clampedSaturation)

  return adjustedColor.luminance(0.025).alpha(0.9).css()
}

export function showcaseCardBorderColor(color: string) {
  return chroma(color).saturate(0.5).luminance(0.125).alpha(0.9).css()
}

export function showcaseBackgroundColor(color: string) {
  return chroma(color).desaturate(2).luminance(0.03).css()
}

export function showcaseSegmentedColor(color: string) {
  return chroma(color).luminance(0.1).alpha(0.5).css()
}

export function colorTransparent() {
  return '#00000000'
}

export function showcaseTransition() {
  return 'background-color 1.0s, box-shadow 0.25s, border-color 0.25s'
}

export function selectColor(color1: string, color2: string): string {
  const targetBlue = 'rgb(0, 0, 255)'

  const deltaE1 = chroma.deltaE(color1, targetBlue)
  const deltaE2 = chroma.deltaE(color2, targetBlue)

  return deltaE1 < deltaE2 ? color1 : color2
}
