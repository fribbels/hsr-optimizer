import type { MainStats } from 'lib/constants/constants'
import {
  Constants,
  Parts,
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { BasicStatsArrayCore } from 'lib/optimization/basicStatsArray'
import { calculateSetCounts } from 'lib/optimization/calculateStats'
import { resetConditionalState } from 'lib/optimization/conditionalStateUtils'
import { GlobalRegister } from 'lib/optimization/engine/config/keys'
import type { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { StatCalculator } from 'lib/relics/statCalculator'
import { cloneSimResult } from 'lib/scoring/simScoringUtils'
import type { DiminishingReturnsFormulas, SimulationFlags } from 'lib/scoring/simScoringUtils'
import {
  OrnamentSetCount,
  OrnamentSetToIndex,
  RelicSetCount,
  RelicSetToIndex,
  type SetsOrnaments,
  type SetsRelics,
} from 'lib/sets/setConfigRegistry'
import { simulateBuild } from 'lib/simulations/simulateBuild'
import type {
  BenchmarkSimulationState,
  CachedRunStatSimulationsResult,
  PrecomputedSetState,
  RunSimulationsParams,
  RunStatSimulationsResult,
  Simulation,
  SimulationRelic,
  SimulationRelicByPart,
} from 'lib/simulations/statSimulationTypes'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { precisionRound } from 'lib/utils/mathUtils'
import { isFlat } from 'lib/utils/statUtils'
import type { Form } from 'types/form'
import type { OptimizerContext } from 'types/optimizer'

const defaultSimulationParams: RunSimulationsParams = {
  quality: 1,
  speedRollValue: 2.6,
  mainStatMultiplier: 1,
  substatRollsModifier: (num: number) => num,
  simulationFlags: {} as SimulationFlags,
  stabilize: false,
}

function simulationRelic(set: string, mainStat: string, mainValue: number): SimulationRelic {
  return {
    set: set,
    condensedStats: mainStat ? [[statToKey[mainStat], mainValue]] : [],
  }
}

// Cached arrays for non-tracing simulations (tracing creates fresh instances)
const cachedBasicStatsArray = new BasicStatsArrayCore(false)

// Optional cachedComputedStatsContainer reuses a single container across calls to avoid repeated allocations.
// Result.x is a shared reference when cached — use stabilize or clone to retain results.
export function runStatSimulations(
  simulations: Simulation[],
  form: Form,
  context: OptimizerContext,
  inputParams: Partial<RunSimulationsParams> = {},
  cachedComputedStatsContainer: ComputedStatsContainer | null = null,
): RunStatSimulationsResult[] {
  const params: RunSimulationsParams = { ...defaultSimulationParams, ...inputParams }
  const trace = !!form.trace
  const forcedBasicSpd = params.simulationFlags.benchmarkBasicSpdTarget
  const simulationResults: RunStatSimulationsResult[] = []
  for (const action of context.allActions) {
    resetConditionalState(action)
  }

  const container = trace ? null : cachedComputedStatsContainer

  for (const sim of simulations) {
    const simRelics = generateSimRelics(sim, params)
    const basicStatsArray = trace ? new BasicStatsArrayCore(true) : cachedBasicStatsArray

    const { x, primaryActionStats, actionDamage, rotationDamage, actionBuffSnapshots, rotationBuffSteps } = simulateBuild(
      simRelics,
      context,
      basicStatsArray,
      container,
      trace,
      forcedBasicSpd,
      !!params.skipDefaults,
    )

    const result: RunStatSimulationsResult = {
      x: x,
      xa: x.a,
      ca: x.c.a,
      simScore: x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG),
      key: sim.key,
      primaryActionStats,
      actionDamage,
      rotationDamage,
      actionBuffSnapshots,
      rotationBuffSteps,
    }

    simulationResults.push(params.stabilize ? cloneSimResult(result) : result)
  }

  return simulationResults
}

function generateSimRelics(simulation: Simulation, params: RunSimulationsParams): SimulationRelicByPart {
  const request = simulation.request
  const simRelics = {
    [Parts.Head]: simulationRelic(request.simRelicSet1, Constants.Stats.HP, 705.600),
    [Parts.Hands]: simulationRelic(request.simRelicSet1, Constants.Stats.ATK, 352.800),
    [Parts.Body]: simulationRelic(
      request.simRelicSet2,
      request.simBody,
      StatCalculator.getMaxedStatValue(request.simBody as MainStats) * params.mainStatMultiplier,
    ),
    [Parts.Feet]: simulationRelic(
      request.simRelicSet2,
      request.simFeet,
      StatCalculator.getMaxedStatValue(request.simFeet as MainStats) * params.mainStatMultiplier,
    ),
    [Parts.LinkRope]: simulationRelic(
      request.simOrnamentSet,
      request.simLinkRope,
      StatCalculator.getMaxedStatValue(request.simLinkRope as MainStats) * params.mainStatMultiplier,
    ),
    [Parts.PlanarSphere]: simulationRelic(
      request.simOrnamentSet,
      request.simPlanarSphere,
      StatCalculator.getMaxedStatValue(request.simPlanarSphere as MainStats) * params.mainStatMultiplier,
    ),
  }

  addSubstats(simRelics, simulation, params)
  return simRelics
}

function addSubstats(relics: SimulationRelicByPart, sim: Simulation, params: RunSimulationsParams) {
  const request = sim.request
  for (const substat of SubStats) {
    const value = sim.simType === StatSimTypes.SubstatRolls
      ? convertRollCountsToSubstatTotal(substat, sim, params)
      : request.stats[substat]

    if (!value) continue
    relics.Head.condensedStats!.push([statToKey[substat], value])
  }
}

function convertRollCountsToSubstatTotal(substat: SubStats, sim: Simulation, params: RunSimulationsParams) {
  const substatScale = isFlat(substat) ? 1 : 0.01
  const substatValue = substat === Stats.SPD
    ? params.speedRollValue
    : StatCalculator.getMaxedSubstatValue(substat, params.quality)

  let substatCount = sim.request.stats[substat] || 0
  substatCount = params.substatRollsModifier(substatCount, substat, sim)

  return precisionRound(substatCount * substatValue * substatScale)
}

function assertCachedResultComplete(
  result: CachedRunStatSimulationsResult,
): asserts result is RunStatSimulationsResult {
  if (result.x == null || result.xa == null || result.ca == null) {
    throw new Error('Benchmark simulation result returned before simulateBuild populated container references')
  }
}

// Prepares reusable state for computeOptimalSimulationSearch's hot damageFunction loop.
// Substats are intentionally omitted here: runSingleStatSimulation mutates Head's
// preallocated substat rows for each candidate roll distribution.
export function buildBenchmarkSimulationState(
  simulation: Simulation,
  params: RunSimulationsParams,
  diminishingReturns?: DiminishingReturnsFormulas,
): BenchmarkSimulationState {
  const request = simulation.request

  const simRelics: SimulationRelicByPart = {
    [Parts.Head]: simulationRelic(request.simRelicSet1, Constants.Stats.HP, 705.600),
    [Parts.Hands]: simulationRelic(request.simRelicSet1, Constants.Stats.ATK, 352.800),
    [Parts.Body]: simulationRelic(
      request.simRelicSet2,
      request.simBody,
      StatCalculator.getMaxedStatValue(request.simBody as MainStats) * params.mainStatMultiplier,
    ),
    [Parts.Feet]: simulationRelic(
      request.simRelicSet2,
      request.simFeet,
      StatCalculator.getMaxedStatValue(request.simFeet as MainStats) * params.mainStatMultiplier,
    ),
    [Parts.LinkRope]: simulationRelic(
      request.simOrnamentSet,
      request.simLinkRope,
      StatCalculator.getMaxedStatValue(request.simLinkRope as MainStats) * params.mainStatMultiplier,
    ),
    [Parts.PlanarSphere]: simulationRelic(
      request.simOrnamentSet,
      request.simPlanarSphere,
      StatCalculator.getMaxedStatValue(request.simPlanarSphere as MainStats) * params.mainStatMultiplier,
    ),
  }

  // Pre-allocate head entries: slot 0 = HP main (constant), slots 1..12 = substats (zeroed, mutated per eval)
  const headEntries: [number, number][] = simRelics.Head.condensedStats!.slice()
  for (let i = 0; i < SubStats.length; i++) {
    headEntries.push([0, 0])
  }
  simRelics.Head.condensedStats = headEntries

  // Pre-resolve set indices
  const usedSets = new Set([
    RelicSetToIndex[simRelics.Head.set as SetsRelics],
    RelicSetToIndex[simRelics.Hands.set as SetsRelics],
    RelicSetToIndex[simRelics.Body.set as SetsRelics],
    RelicSetToIndex[simRelics.Feet.set as SetsRelics],
    OrnamentSetToIndex[simRelics.PlanarSphere.set as SetsOrnaments],
    OrnamentSetToIndex[simRelics.LinkRope.set as SetsOrnaments],
  ])
  const unusedSets = [0, 1, 2, 3, 4, 5].filter((x) => !usedSets.has(x))
  let unusedSetCounter = 0

  const setH = RelicSetToIndex[simRelics.Head.set as SetsRelics] ?? unusedSets[unusedSetCounter++]
  const setG = RelicSetToIndex[simRelics.Hands.set as SetsRelics] ?? unusedSets[unusedSetCounter++]
  const setB = RelicSetToIndex[simRelics.Body.set as SetsRelics] ?? unusedSets[unusedSetCounter++]
  const setF = RelicSetToIndex[simRelics.Feet.set as SetsRelics] ?? unusedSets[unusedSetCounter++]
  const setP = OrnamentSetToIndex[simRelics.PlanarSphere.set as SetsOrnaments] ?? unusedSets[unusedSetCounter++]
  const setL = OrnamentSetToIndex[simRelics.LinkRope.set as SetsOrnaments] ?? unusedSets[unusedSetCounter++]

  const relicSetIndex = setH + setB * RelicSetCount + setG * RelicSetCount * RelicSetCount + setF * RelicSetCount * RelicSetCount * RelicSetCount
  const ornamentSetIndex = setP + setL * OrnamentSetCount
  const sets = [setH, setG, setB, setF, setP, setL]
  const setCounts = calculateSetCounts(sets)

  const precomputedSets: PrecomputedSetState = {
    setH, setG, setB, setF, setP, setL,
    relicSetIndex, ornamentSetIndex,
    sets, setCounts,
  }

  // Pre-compute per-substat: scale, value, key, modifier
  const substatScales: number[] = []
  const substatValues: number[] = []
  const substatKeys: number[] = []
  const substatModifier: ((rolls: number) => number)[] = []

  const mainStats = [
    request.simBody, request.simFeet, request.simPlanarSphere, request.simLinkRope,
    Constants.Stats.ATK, Constants.Stats.HP,
  ]

  for (let i = 0; i < SubStats.length; i++) {
    const substat = SubStats[i]
    substatScales.push(isFlat(substat) ? 1 : 0.01)
    substatValues.push(
      substat === Stats.SPD
        ? params.speedRollValue
        : StatCalculator.getMaxedSubstatValue(substat, params.quality),
    )
    substatKeys.push(statToKey[substat])

    if (diminishingReturns) {
      const mainsCount = mainStats.filter((m) => m === substat).length
      const formula = substat === Stats.SPD ? diminishingReturns.spd : diminishingReturns.stat
      substatModifier.push((rolls: number) => formula(mainsCount, rolls))
    } else {
      substatModifier.push((rolls: number) => params.substatRollsModifier(rolls, substat, simulation))
    }
  }

  return {
    relics: simRelics,
    headEntries,
    substatScales,
    substatValues,
    substatKeys,
    substatModifier,
    precomputedSets,
    params,
    cachedResult: {
      x: null,
      xa: null,
      ca: null,
      simScore: 0,
      key: undefined,
      primaryActionStats: undefined,
      actionDamage: undefined,
      rotationDamage: undefined,
      actionBuffSnapshots: undefined,
      rotationBuffSteps: undefined,
    },
  }
}

export function runSingleStatSimulation(
  state: BenchmarkSimulationState,
  sim: Simulation,
  form: Form,
  context: OptimizerContext,
  cachedComputedStatsContainer: ComputedStatsContainer,
): RunStatSimulationsResult {
  for (const action of context.allActions) resetConditionalState(action)

  // Mutate Head's substat entries in place from current roll counts
  const headEntries = state.headEntries
  const stats = sim.request.stats
  const scales = state.substatScales
  const values = state.substatValues
  const keys = state.substatKeys
  const modifier = state.substatModifier
  let len = 1 // slot 0 is HP main
  for (let i = 0; i < SubStats.length; i++) {
    const rolls = stats[SubStats[i]] || 0
    if (!rolls) continue
    const modifiedRolls = modifier[i](rolls)
    const value = precisionRound((modifiedRolls * values[i]) * scales[i])
    if (!value) continue
    const entry = headEntries[len]
    entry[0] = keys[i]
    entry[1] = value
    len++
  }
  // Zero out trailing slots so they're true no-ops (a[k] += 0 is bit-exact)
  for (let i = len; i < headEntries.length; i++) headEntries[i][1] = 0

  const params = state.params
  const forcedBasicSpd = params.simulationFlags.benchmarkBasicSpdTarget

  const built = simulateBuild(
    state.relics, context, cachedBasicStatsArray, cachedComputedStatsContainer,
    false, forcedBasicSpd, !!params.skipDefaults, state.precomputedSets,
  )

  const result = state.cachedResult
  result.x = built.x
  result.xa = built.x.a
  result.ca = built.x.c.a
  result.simScore = built.x.getGlobalRegisterValue(GlobalRegister.COMBO_DMG)
  result.key = sim.key
  result.primaryActionStats = built.primaryActionStats
  result.actionDamage = built.actionDamage
  result.rotationDamage = built.rotationDamage
  result.actionBuffSnapshots = built.actionBuffSnapshots
  result.rotationBuffSteps = built.rotationBuffSteps

  assertCachedResultComplete(result)
  return params.stabilize ? cloneSimResult({ ...result }) : result
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
