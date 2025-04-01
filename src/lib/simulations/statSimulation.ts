import { Constants, MainStats, Parts, Stats, SubStats } from 'lib/constants/constants'
import { BasicStatsArray, BasicStatsArrayCore } from 'lib/optimization/basicStatsArray'
import { calculateBuild } from 'lib/optimization/calculateBuild'
import { ComputedStatsArray, ComputedStatsArrayCore } from 'lib/optimization/computedStatsArray'
import { formatOptimizerDisplayData } from 'lib/optimization/optimizer'
import { StatCalculator } from 'lib/relics/statCalculator'
import { SimulationFlags, SimulationResult } from 'lib/scoring/simScoringUtils'
import { Simulation, SimulationRequest } from 'lib/simulations/statSimulationController'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
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

export type SimulationRelicByPart = {
  LinkRope: SimulationRelic
  PlanarSphere: SimulationRelic
  Feet: SimulationRelic
  Body: SimulationRelic
  Hands: SimulationRelic
  Head: SimulationRelic
}

function generateSimRelics(request: SimulationRequest, params: RunSimulationsParams): SimulationRelicByPart {
  return {
    [Parts.Head]: simulationRelic(request.simRelicSet1, Constants.Stats.HP, 705.600),
    [Parts.Hands]: simulationRelic(request.simRelicSet1, Constants.Stats.ATK, 352.800),
    [Parts.Body]: simulationRelic(request.simRelicSet2, request.simBody, StatCalculator.getMaxedStatValue(request.simBody as MainStats) * params.mainStatMultiplier),
    [Parts.Feet]: simulationRelic(request.simRelicSet2, request.simFeet, StatCalculator.getMaxedStatValue(request.simFeet as MainStats) * params.mainStatMultiplier),
    [Parts.LinkRope]: simulationRelic(request.simOrnamentSet, request.simLinkRope, StatCalculator.getMaxedStatValue(request.simLinkRope as MainStats) * params.mainStatMultiplier),
    [Parts.PlanarSphere]: simulationRelic(request.simOrnamentSet, request.simPlanarSphere, StatCalculator.getMaxedStatValue(request.simPlanarSphere as MainStats) * params.mainStatMultiplier),
  }
}

function addSubstats(relics: SimulationRelicByPart, sim: Simulation, params: RunSimulationsParams) {
  const request = sim.request
  for (const substat of SubStats) {
    let value = request.stats[substat]
    if (!value) continue

    if (sim.simType == StatSimTypes.SubstatRolls) {
      const substatScale = isFlat(substat) ? 1 : 0.01
      const substatValue = substat == Stats.SPD
        ? params.speedRollValue
        : StatCalculator.getMaxedSubstatValue(substat, params.quality)

      let substatCount = sim.request.stats[substat] || 0
      substatCount = params.substatRollsModifier(substatCount, substat, request)

      value = precisionRound(substatCount * substatValue * substatScale)
    }

    if (value) {
      relics.Head.condensedStats.push([statToKey[substat], value])
    }
  }
}

const cachedComputedStatsArray = new ComputedStatsArrayCore(false) as ComputedStatsArray
const cachedBasicStatsArray = new BasicStatsArrayCore(false) as BasicStatsArray

export function simulate(
  simulations: Simulation[],
  form: Form,
  context: OptimizerContext | null,
  inputParams: Partial<RunSimulationsParams> = {},
): SimulationResult[] {
  const params: RunSimulationsParams = { ...defaultSimulationParams, ...inputParams }
  const forcedBasicSpd = params.simulationFlags.forceBasicSpd ? params.simulationFlags.forceBasicSpdValue : undefined

  const simulationResults: SimulationResult[] = []
  for (const sim of simulations) {
    const request = sim.request

    const simRelics = generateSimRelics(request, params)
    addSubstats(simRelics, sim, params)

    const basicStatsArray = form.trace ? new BasicStatsArrayCore(true) : cachedBasicStatsArray
    const computedStatsArray = form.trace ? new ComputedStatsArrayCore(true) : cachedComputedStatsArray

    const x = calculateBuild(
      form,
      simRelics,
      context,
      basicStatsArray,
      computedStatsArray,
      true,
      true,
      false,
      forcedBasicSpd,
    )

    // TODO: Clean this
    // For optimizer grid syncing with sim table
    const optimizerDisplayData = formatOptimizerDisplayData(x)
    optimizerDisplayData.statSim = {
      key: sim.key,
    }
    simulationResults.push(optimizerDisplayData as SimulationResult)
  }

  return simulationResults
}

// TODO: Is this still relevant
// Generate relic sets
// Since the optimizer uses index based relic set identification, it can't handle an empty set
// We have to fake rainbow sets by forcing a 2+1+1 or a 1+1+1+1 combination
// For planar sets we can't the index be negative or NaN, so we just use two unmatched sets
export function condenseRelic(relic: SimulationRelic) {

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
