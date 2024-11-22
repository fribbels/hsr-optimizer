import chroma from 'chroma-js'

export function addColorTransparency(color: string, alpha: number) {
  return chroma(color).desaturate(0.75).luminance(0.03).alpha(alpha).css()
}

export function showcaseCardBorderColor(color: string) {
  return chroma(color).saturate(0.5).brighten(1.5).css()
}

export function showcaseSegmentedTrackColor(color: string) {
  return chroma(color).desaturate(0.75).darken(0.25).alpha(0).css()
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
