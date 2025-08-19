import { ElementName } from 'lib/constants/constants'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import {
  OptimizerAction,
  OptimizerContext,
} from './optimizer'

export interface HitAction {
  name: string
  hits: Hit[]
}

export type DamageFunctionName = string

export const DefaultDamageFunction: DamageFunction = {
  apply: () => 1,
}

export interface Hit {
  damageFunction: DamageFunction
  damageType: number
  damageElement: ElementName

  atkScaling: number
  hpScaling: number
  defScaling: number
  specialScaling: number
}

export interface DamageFunction {
  apply: (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext) => number
}
