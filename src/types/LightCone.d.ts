import { StatsValues } from 'lib/constants'
import { AssetRelativeUrl, DataMineId, ExternalPath, InternalPath, Promotions, Rarity } from './Common'
import { LightConeRanksDescriptions } from './LightConeConditionals'
import { PreconvertStatKey } from 'lib/characterConverter'

// TODO: We do a SuperImpositionLevel - 1 which requires this to be a number instead of 1 | 2 | 3...
export type SuperImpositionLevel = number
export type SuperImposition = {
  [K in StatsValues]: SuperImpositionLevel;
} | number

export type LightConeRanks = {
  id: DataMineId
  desc: LightConeRanksDescriptions
  skill: string
  params: [number, number, number][]
  properties: [{
    type: PreconvertStatKey
    value: number
  }][]
}

export type LightCone = {
  desc: string
  icon: AssetRelativeUrl
  id: string
  name: string
  path: InternalPath | ExternalPath
  portrait: AssetRelativeUrl
  preview: AssetRelativeUrl
  promotions: Promotions
  ranks: LightConeRanks
  rarity: Rarity
  superimpositions: { [key: number]: SuperImposition }
}
