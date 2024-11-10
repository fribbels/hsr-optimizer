import { Parts } from 'lib/constants/constants'

export function partIsOrnament(part: string) {
  return part == Parts.PlanarSphere
    || part == Parts.LinkRope
}

export function partIsRelic(part: string) {
  return part == Parts.Head
    || part == Parts.Hands
    || part == Parts.Body
    || part == Parts.Feet
}
