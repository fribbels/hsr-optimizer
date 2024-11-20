import chroma from 'chroma-js'

export function addColorTransparency(color: string, alpha: number) {
  return chroma(color).alpha(alpha).css()
}
