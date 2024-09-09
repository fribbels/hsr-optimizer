import { DataMineId } from 'types/Common'
import { Conditional, ConditionalBuff } from 'types/Conditionals'

export interface LightConeConditional extends Conditional {
}

export type ConditionalLightConeMap = {
  [key in ConditionalBuff]: number;
}

export type LightConeRanksDescriptions = string

export type LightConeRawRank = {
  id: DataMineId
  skill: string
  desc: string
  params: number[][]
  properties: { type: string; value: number }[][]
}
