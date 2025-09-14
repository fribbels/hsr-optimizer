import { ElementName } from 'lib/constants/constants'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { ComputedStatsContainer } from 'lib/optimization/engine/computedStatsContainer'
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

  toughnessDmg: number

  activeHit: boolean
}

export interface DamageFunction {
  apply: (x: ComputedStatsContainer, action: OptimizerAction, context: OptimizerContext) => number
}
