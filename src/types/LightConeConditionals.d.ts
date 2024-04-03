import { Form } from 'types/Form'
import { DataMineId } from 'types/Common'
import { Conditional, ConditionalBuff } from 'types/Conditionals'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants.ts'

export interface LightConeConditional extends Conditional {
  // TOOD: lightConeConditional.precomputeEffect mutates by ref, purify

  // Character's individual effects
  precomputeEffects: (x: ComputedStatsObject, request: Form) => void

  // Shared effects between teammates and main character
  precomputeMutualEffects?: (x: ComputedStatsObject, request: Form) => void

  // Effects unique to teammate calculation
  precomputeTeammateEffects?: (x: ComputedStatsObject, request: Form) => void
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
