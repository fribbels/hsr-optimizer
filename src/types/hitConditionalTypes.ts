import { StatKey } from 'lib/optimization/engine/config/keys'
import { ElementTag } from 'lib/optimization/engine/config/tag'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  DamageFunction,
  DamageFunctionType,
} from 'lib/optimization/engine/damage/damageCalculator'
import {
  OptimizerAction,
  OptimizerContext,
} from './optimizer'

export interface AbilityDefinition {
  hits: HitDefinition[]
}

export interface Hit extends HitDefinition {
  localHitIndex: number
  registerIndex: number
  sourceEntityIndex: number
}

export interface HitDefinition {
  sourceEntity?: string
  referenceHit?: Hit

  damageFunction: DamageFunction
  damageFunctionType: DamageFunctionType // For serialization
  damageType: number
  damageElement: ElementTag

  atkScaling?: number
  hpScaling?: number
  defScaling?: number
  specialScaling?: number

  toughnessDmg?: number

  activeHit: boolean
}

export interface EntityDefinition {
  primary: boolean
  summon: boolean
  memosprite: boolean
  pet?: boolean

  memoBaseAtkFlat?: number
  memoBaseHpFlat?: number
  memoBaseDefFlat?: number
  memoBaseSpdFlat?: number

  memoBaseAtkScaling?: number
  memoBaseHpScaling?: number
  memoBaseDefScaling?: number
  memoBaseSpdScaling?: number
}
