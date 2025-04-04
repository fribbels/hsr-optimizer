import { Constants, MainStats, Parts, Stats, SubStats } from 'lib/constants/constants'
import { BasicStatsArray, BasicStatsArrayCore } from 'lib/optimization/basicStatsArray'
import { ComputedStatsArray, ComputedStatsArrayCore, Key } from 'lib/optimization/computedStatsArray'
import { StatCalculator } from 'lib/relics/statCalculator'
import { SimulationFlags, SimulationResult } from 'lib/scoring/simScoringUtils'
import { simulateBuild } from 'lib/simulations/new/simulateBuild'
import { precisionRound } from 'lib/utils/mathUtils'
import { isFlat } from 'lib/utils/statUtils'
import { Form } from 'types/form'
import { OptimizerContext } from 'types/optimizer'

type RunSimulationsParams = {
  quality: number
  speedRollValue: number
  mainStatMultiplier: number
  substatRollsModifier: (num: number, stat: string, simRequest: SimulationRequest) => number
  simulationFlags: SimulationFlags
}

const defaultSimulationParams: RunSimulationsParams = {
  quality: 1,
  speedRollValue: 2.6,
  mainStatMultiplier: 1,
  substatRollsModifier: (num: number) => num,
  simulationFlags: {} as SimulationFlags,
}

export type SimulationRelic = {
  set: string
  condensedStats: [number, number][]
}

function simulationRelic(set: string, mainStat: string, mainValue: number): SimulationRelic {
  return {
    set: set,
    condensedStats: [[statToKey[mainStat], mainValue]],
  }
}

const cachedComputedStatsArray = new ComputedStatsArrayCore(false) as ComputedStatsArray
const cachedBasicStatsArray = new BasicStatsArrayCore(false) as BasicStatsArray

export type RunStatSimulationsResult = {
  x: ComputedStatsArray
  xa: Float32Array
  ca: Float32Array
  simScore: number
}

// Can be called from both main and worker
// Context must exist
export function runStatSimulations(
  simulations: Simulation[],
  form: Form,
  context: OptimizerContext,
  inputParams: Partial<RunSimulationsParams> = {},
): RunStatSimulationsResult[] {
  const params: RunSimulationsParams = { ...defaultSimulationParams, ...inputParams }
  const forcedBasicSpd = params.simulationFlags.forceBasicSpd ? params.simulationFlags.forceBasicSpdValue : undefined
  const simulationResults: RunStatSimulationsResult[] = []
  for (const action of context.actions) {
    action.conditionalState = {}
  }

  for (const sim of simulations) {
    const request = sim.request

    const simRelics = generateSimRelics(request, sim, params)
    const basicStatsArray = form.trace ? new BasicStatsArrayCore(true) : cachedBasicStatsArray
    const computedStatsArray = form.trace ? new ComputedStatsArrayCore(true) : cachedComputedStatsArray

    const x = simulateBuild(
      simRelics,
      context,
      basicStatsArray,
      computedStatsArray,
      forcedBasicSpd,
    )

    const result: RunStatSimulationsResult = {
      x: x,
      xa: x.a,
      ca: x.c.a,
      simScore: x.a[Key.COMBO_DMG],
    }

    simulationResults.push(result)
  }

  // console.log(simulationResults)

  return simulationResults
}

export type SimulationRelicByPart = {
  LinkRope: SimulationRelic
  PlanarSphere: SimulationRelic
  Feet: SimulationRelic
  Body: SimulationRelic
  Hands: SimulationRelic
  Head: SimulationRelic
}

function generateSimRelics(request: SimulationRequest, sim: Simulation, params: RunSimulationsParams): SimulationRelicByPart {
  const simRelics = {
    [Parts.Head]: simulationRelic(request.simRelicSet1, Constants.Stats.HP, 705.600),
    [Parts.Hands]: simulationRelic(request.simRelicSet1, Constants.Stats.ATK, 352.800),
    [Parts.Body]: simulationRelic(request.simRelicSet2, request.simBody, StatCalculator.getMaxedStatValue(request.simBody as MainStats) * params.mainStatMultiplier),
    [Parts.Feet]: simulationRelic(request.simRelicSet2, request.simFeet, StatCalculator.getMaxedStatValue(request.simFeet as MainStats) * params.mainStatMultiplier),
    [Parts.LinkRope]: simulationRelic(request.simOrnamentSet, request.simLinkRope, StatCalculator.getMaxedStatValue(request.simLinkRope as MainStats) * params.mainStatMultiplier),
    [Parts.PlanarSphere]: simulationRelic(request.simOrnamentSet, request.simPlanarSphere, StatCalculator.getMaxedStatValue(request.simPlanarSphere as MainStats) * params.mainStatMultiplier),
  }

  addSubstats(simRelics, sim, params)
  return simRelics
}

export enum StatSimTypes {
  Disabled = 'disabled',
  SubstatTotals = 'substatTotals',
  SubstatRolls = 'substatRolls',
}

type Simulation = {
  name?: string
  key?: string
  simType: StatSimTypes
  request: SimulationRequest
  result?: SimulationResult
}

type SimulationStats = {
  [key: string]: number
}

type SimulationRequest = {
  name?: string // This name is optionally provided from the sim form, then the parent either autogens or inherits
  simRelicSet1: string
  simRelicSet2: string
  simOrnamentSet: string
  simBody: string
  simFeet: string
  simPlanarSphere: string
  simLinkRope: string
  stats: SimulationStats
}

function addSubstats(relics: SimulationRelicByPart, sim: Simulation, params: RunSimulationsParams) {
  const request = sim.request
  for (const substat of SubStats) {
    const value = sim.simType == StatSimTypes.SubstatRolls
      ? convertRollCountsToSubstatTotal(substat, sim, params)
      : request.stats[substat]

    if (!value) continue
    relics.Head.condensedStats.push([statToKey[substat], value])
  }
}

function convertRollCountsToSubstatTotal(substat: SubStats, sim: Simulation, params: RunSimulationsParams) {
  const substatScale = isFlat(substat) ? 1 : 0.01
  const substatValue = substat == Stats.SPD
    ? params.speedRollValue
    : StatCalculator.getMaxedSubstatValue(substat, params.quality)

  let substatCount = sim.request.stats[substat] || 0
  substatCount = params.substatRollsModifier(substatCount, substat, sim.request)

  return precisionRound(substatCount * substatValue * substatScale)
}

// Hardcoded
const statToKey: Record<string, number> = {
  [Stats.HP_P]: 0,
  [Stats.ATK_P]: 1,
  [Stats.DEF_P]: 2,
  [Stats.SPD_P]: 3,
  [Stats.HP]: 4,
  [Stats.ATK]: 5,
  [Stats.DEF]: 6,
  [Stats.SPD]: 7,
  [Stats.CR]: 8,
  [Stats.CD]: 9,
  [Stats.EHR]: 10,
  [Stats.RES]: 11,
  [Stats.BE]: 12,
  [Stats.ERR]: 13,
  [Stats.OHB]: 14,
  [Stats.Physical_DMG]: 15,
  [Stats.Fire_DMG]: 16,
  [Stats.Ice_DMG]: 17,
  [Stats.Lightning_DMG]: 18,
  [Stats.Wind_DMG]: 19,
  [Stats.Quantum_DMG]: 20,
  [Stats.Imaginary_DMG]: 21,
} as const

