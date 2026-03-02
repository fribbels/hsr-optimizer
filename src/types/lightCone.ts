import type data from 'data/game_data.json'
import { DBMetadataSuperimpositions } from 'lib/state/metadataInitializer'

// TODO: We do a SuperImpositionLevel - 1 which requires this to be a number instead of 1 | 2 | 3...
export type SuperImpositionLevel = number

export type LightConeId = keyof typeof data.lightCones

export type LightCone = {
  id: LightConeId,
  name: string,
  displayName: string,
  path: string,
  rarity: number,
  superimpositions: DBMetadataSuperimpositions,
  imageOffset: { x: number; y: number; s: number },
}
