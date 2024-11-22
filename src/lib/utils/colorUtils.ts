import chroma from 'chroma-js'

export function addColorTransparency(color: string, alpha: number) {
  return chroma(color).desaturate(0.75).luminance(0.03).alpha(alpha).css()
}

export function showcaseTransition() {
  return 'background-color 1.5s, border 1.5s'
}
