import { Form } from 'types/Form'
import { DataMineId } from 'types/Common'
import { Conditional, ConditionalBuff } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/constants.ts'

export interface LightConeConditional extends Conditional {
  // TOOD: lightConeConditional.precomputeEffect mutates by ref, purify
  precomputeEffects: (x: ComputedStatsObject, request: Form) => void
  teammatePrecomputeEffects?: (x: ComputedStatsObject, request: Form, teammateRequest: Form) => void
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
