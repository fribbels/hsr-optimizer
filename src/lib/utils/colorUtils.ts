import chroma from 'chroma-js'

export function addColorTransparency(color: string, alpha: number) {
  const minSaturation = 0.2
  const maxSaturation = 0.3
  const chromaColor = chroma(color)

  const currentSaturation = chromaColor.get('hsl.s')

  const clampedSaturation = Math.min(Math.max(currentSaturation, minSaturation), maxSaturation)

  const adjustedColor = chromaColor.set('hsl.s', clampedSaturation)

  return adjustedColor.luminance(0.03).alpha(alpha).css()
}

export function showcaseCardBorderColor(color: string) {
  return chroma(color).saturate(0.5).brighten(1.5).css()
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
  return 'background-color 1.5s, border 1.5s'
}

export function mix(color1: string, color2: string) {
  return chroma.mix(color1, color2)
}
