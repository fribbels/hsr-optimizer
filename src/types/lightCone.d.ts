import { DBMetadataSuperimpositions } from 'lib/state/metadata'

// TODO: We do a SuperImpositionLevel - 1 which requires this to be a number instead of 1 | 2 | 3...
export type SuperImpositionLevel = number

export type LightCone = {
  id: string
  name: string
  displayName: string
  path: string
  rarity: number
  superimpositions: DBMetadataSuperimpositions
  imageCenter: number
}
