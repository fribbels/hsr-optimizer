import { TFunction } from 'i18next'
import {
  ConditionalDataType,
  Sets,
} from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'

export type SelectOptionContent = {
  display: string
  value: number
  label: string
}

export enum SetType {
  RELIC = 'relic',
  ORNAMENT = 'ornament',
}

export type SetInfo = {
  index: number
  setType: SetType
  ingameId: string
}

export type SetConditionals = {
  p2c?: (c: BasicStatsArray, context: OptimizerContext) => void
  p4c?: (c: BasicStatsArray, context: OptimizerContext) => void
  p2x?: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => void
  p4x?: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => void
  p2t?: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => void
  p4t?: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => void
  dynamicConditionals?: DynamicConditional[]
}

type SetConditionalTFunction = TFunction<'optimizerTab', 'SetConditionals.SelectOptions'>

export type SetDisplay = {
  conditionalType: ConditionalDataType
  conditionalI18nKey?: string
  modifiable?: boolean
  selectionOptions?: (t: SetConditionalTFunction) => SelectOptionContent[]
  defaultValue: boolean | number
}

export type TeammateEffectParams = {
  x: ComputedStatsContainer
  characterElement: string
  teammateElement: string
  teammateActorId: string
}

export type TeammateOption = {
  value: string
  i18nKey: string
  nonstackable: boolean
  effect: (params: TeammateEffectParams) => void
}

export type SetConfig = {
  id: keyof typeof Sets
  info: SetInfo
  conditionals: SetConditionals
  display: SetDisplay
  teammate?: TeammateOption[]
}
