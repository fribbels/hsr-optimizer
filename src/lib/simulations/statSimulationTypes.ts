import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { SimulationFlags } from 'lib/scoring/simScoringUtils'

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
  simRelicSet1: string,
  simRelicSet2: string,
  simOrnamentSet: string,
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
}

export type PrimaryActionStats = {
  DMG_BOOST: number
  CR_BOOST: number
  CD_BOOST: number
}

export type SimulateBuildResult = {
  x: ComputedStatsContainer
  primaryActionStats: PrimaryActionStats
}

export type RunStatSimulationsResult = {
  x: ComputedStatsContainer,
  xa: Float32Array,
  ca: Float32Array,
  simScore: number,
  key?: string,
  primaryActionStats?: PrimaryActionStats,
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
