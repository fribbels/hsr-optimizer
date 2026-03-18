import {
  Parts,
} from 'lib/constants/constants'

export const partsToFilterMapping = {
  [Parts.Body]: 'simBody',
  [Parts.Feet]: 'simFeet',
  [Parts.PlanarSphere]: 'simPlanarSphere',
  [Parts.LinkRope]: 'simLinkRope',
} as const
