import type { TFunction } from 'i18next'
import type {
  ConditionalDataType,
  SetKey,
  Sets,
  TwoPieceStatTag,
} from 'lib/constants/constants'
import type { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import type { BasicSetEffectEntry } from 'lib/gpu/injection/generateBasicSetEffects'
import type { BasicStatsArray } from 'lib/optimization/basicStatsArray'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import type {
  OptimizerAction,
  OptimizerContext,
  SetConditional,
} from 'types/optimizer'

export type SelectOptionContent = {
  display: string,
  value: number,
  label: string,
}

export enum SetType {
  RELIC = 'relic',
  ORNAMENT = 'ornament',
}

export type SetInfo = {
  index: number,
  setType: SetType,
  ingameId: string,
  twoPieceStatTag: TwoPieceStatTag | null,
}

export type SetConditionals = {
  p2c?: (c: BasicStatsArray, context: OptimizerContext) => void,
  p4c?: (c: BasicStatsArray, context: OptimizerContext) => void,
  p2x?: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => void,
  p4x?: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => void,
  p2t?: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => void,
  p4t?: (x: ComputedStatsContainer, context: OptimizerContext, setConditionals: SetConditional) => void,
  overrideConditional?: (value: boolean | number, context: OptimizerContext) => boolean | number,
  teammate?: readonly TeammateOption[],
  dynamicConditionals?: readonly DynamicConditional[],
  gpu?: (action: OptimizerAction, context: OptimizerContext) => string,
  gpuTerminal?: (action: OptimizerAction, context: OptimizerContext) => string,
  gpuBasic?: () => BasicSetEffectEntry[],
}

export type SetConditionalTFunction = TFunction<'optimizerTab', 'SetConditionals.SelectOptions'>

export type SetDisplay = {
  conditionalType: ConditionalDataType,
  conditionalI18nKey?: string,
  modifiable?: boolean,
  selectionOptions?: (t: SetConditionalTFunction) => SelectOptionContent[],
  defaultValue: boolean | number,
}

export type TeammateEffectParams = {
  x: ComputedStatsContainer,
  characterElement: string,
  teammateElement: string,
  teammateActorId: string,
}

export type TeammateOption = {
  value: string,
  label: (t: TFunction<'optimizerTab', 'TeammateCard'>) => string,
  desc: (t: TFunction<'optimizerTab', 'TeammateCard'>) => string,
  nonstackable: boolean,
  effect: (params: TeammateEffectParams) => void,
}

export type SetConfig = {
  id: Sets,
  setKey: SetKey,
  info: SetInfo,
  conditionals: SetConditionals,
  display: SetDisplay,
}
