import { ElementName } from 'lib/constants/constants'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import {
  OptimizerAction,
  OptimizerContext,
} from './optimizer'

export interface Action {
  name: string
  hits: Hit[]
}

export const DefaultDamageFunction: DamageFunction = {
  apply: () => 0,
}

export interface Hit {
  damageFunction: DamageFunction
  damageType: number
  element: ElementName

  atkScaling: number
  hpScaling: number
  defScaling: number
  specialScaling: number
}

export interface DamageFunction {
  apply: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => 0
}
