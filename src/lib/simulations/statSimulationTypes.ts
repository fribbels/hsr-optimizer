import type { Buff } from 'lib/optimization/basicStatsArray'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import type {
  AbilityKind,
  TurnAbilityName,
} from 'lib/optimization/rotation/turnAbilityConfig'
import type { SimulationFlags } from 'lib/scoring/simScoringUtils'
import type {
  SetsOrnaments,
  SetsRelics,
} from 'lib/sets/setConfigRegistry'

export enum StatSimTypes {
  Disabled = 'disabled',
  SubstatRolls = 'substatRolls',
  Benchmarks = 'benchmarks',
}

export type Simulation = {
  name?: string,
  key?: string,
  simType: StatSimTypes,
  request: SimulationRequest,
  result?: RunStatSimulationsResult,
}

export type SimulationRequest = {
  // This name is optionally provided from the sim form, then the parent either autogens or inherits
  name?: string,
  simRelicSet1: SetsRelics,
  simRelicSet2: SetsRelics,
  simOrnamentSet: SetsOrnaments,
  simBody: string,
  simFeet: string,
  simPlanarSphere: string,
  simLinkRope: string,
  stats: SubstatCounts,
}

export type SubstatCounts = Record<string, number>

export type RunSimulationsParams = {
  quality: number,
  speedRollValue: number,
  mainStatMultiplier: number,
  substatRollsModifier: (num: number, stat: string, sim: Simulation) => number,
  simulationFlags: SimulationFlags,
  stabilize?: boolean,
  skipDefaults?: boolean,
}

export type PrimaryActionStats = {
  // Full resolved stats for the primary hit's source entity, matching the damage formula:
  //   cr = CR (action+hit) + CR_BOOST (action)
  //   cd = CD (action+hit) + CD_BOOST (action)
  //   dmg = DMG_BOOST (action+hit) + elementDmgBoost (action)
  DMG_BOOST: number,
  sourceEntityCR: number,
  sourceEntityCD: number,
  sourceEntityElementDmgBoost: number,
}

export type ActionDamage = Partial<Record<AbilityKind, number>>

export type RotationDamageStep = {
  actionType: AbilityKind,
  actionName: TurnAbilityName,
  damage: number,
}

export type ActionBuffSnapshot = {
  buffs: Buff[],
  buffsMemo: Buff[],
}

export type RotationBuffStep = {
  actionType: string,
  snapshot: ActionBuffSnapshot,
}

export type SimulateBuildResult = {
  x: ComputedStatsContainer,
  primaryActionStats: PrimaryActionStats,
  actionDamage: ActionDamage,
  rotationDamage: RotationDamageStep[],
  actionBuffSnapshots?: Record<string, ActionBuffSnapshot>,
  rotationBuffSteps?: RotationBuffStep[],
}

export type RunStatSimulationsResult = {
  x: ComputedStatsContainer,
  xa: Float32Array,
  ca: Float32Array,
  simScore: number,
  key?: string,
  primaryActionStats?: PrimaryActionStats,
  actionDamage?: ActionDamage,
  rotationDamage?: RotationDamageStep[],
  actionBuffSnapshots?: Record<string, ActionBuffSnapshot>,
  rotationBuffSteps?: RotationBuffStep[],
}

export type SimulationRelic = {
  set: string,
  condensedStats: [number, number][],
}

export type SimulationRelicByPart = {
  LinkRope: SimulationRelic,
  PlanarSphere: SimulationRelic,
  Feet: SimulationRelic,
  Body: SimulationRelic,
  Hands: SimulationRelic,
  Head: SimulationRelic,
}
export type SimulationRelicArrayByPart = {
  LinkRope: SimulationRelic[],
  PlanarSphere: SimulationRelic[],
  Feet: SimulationRelic[],
  Body: SimulationRelic[],
  Hands: SimulationRelic[],
  Head: SimulationRelic[],
}
