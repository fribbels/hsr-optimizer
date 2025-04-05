import { Parts, Stats, SubStats } from 'lib/constants/constants'
import { Key } from 'lib/optimization/computedStatsArray'
import { SimulationSets } from 'lib/scoring/dpsScore'
import { calculateMaxSubstatRollCounts, calculateMinSubstatRollCounts } from 'lib/scoring/rollCounter'
import { benchmarkScoringParams, invertDiminishingReturnsSpdFormula, PartialSimulationWrapper, simSorter, SimulationFlags, SimulationResult, spdRollsCap } from 'lib/scoring/simScoringUtils'
import { runStatSimulations } from 'lib/simulations/new/statSimulation'
import { isErrRopeForced } from 'lib/simulations/new/utils/benchmarkUtils'
import { runComputeOptimalSimulationWorker } from 'lib/simulations/new/workerPool'
import { Simulation, SimulationRequest } from 'lib/simulations/statSimulationController'
import { StatSimTypes } from 'lib/tabs/tabOptimizer/optimizerForm/components/StatSimulationDisplay'
import { TsUtils } from 'lib/utils/TsUtils'
import { ComputeOptimalSimulationRunnerInput } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { Character } from 'types/character'
import { Form } from 'types/form'
import { SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'

export async function generateBenchmarkBuild(
  character: Character,
  simulationSets: SimulationSets,
  originalSim: Simulation,
  targetSpd: number,
  metadata: SimulationMetadata,
  simulationForm: Form,
  context: OptimizerContext,
  baselineSimResult: SimulationResult,
  originalSimResult: SimulationResult,
  simulationFlags: SimulationFlags,
) {
  const partialSimulationWrappers = generatePartialSimulations(character, metadata, simulationSets, originalSim)
  const candidateBenchmarkSims: Simulation[] = []

  const clonedContext = TsUtils.clone(context)

  console.time('!!!!!!!!!!!!!!!!! runner')
  const runnerPromises = partialSimulationWrappers.map((partialSimulationWrapper) => {
    // const simulationResult = runSimulations(simulationForm, context, [partialSimulationWrapper.simulation], benchmarkScoringParams)[0]
    const simulationResults = runStatSimulations([partialSimulationWrapper.simulation], simulationForm, context)
    const simulationResult = simulationResults[0]

    // Find the speed deduction
    const finalSpeed = simulationResult.xa[Key.SPD]
    partialSimulationWrapper.finalSpeed = finalSpeed

    const mainsCount = partialSimulationWrapper.simulation.request.simFeet == Stats.SPD ? 1 : 0
    const rolls = TsUtils.precisionRound(invertDiminishingReturnsSpdFormula(mainsCount, targetSpd - finalSpeed, benchmarkScoringParams.speedRollValue), 3)

    partialSimulationWrapper.speedRollsDeduction = Math.min(Math.max(0, rolls), spdRollsCap(partialSimulationWrapper.simulation, benchmarkScoringParams))

    if (partialSimulationWrapper.speedRollsDeduction >= 26 && partialSimulationWrapper.simulation.request.simFeet != Stats.SPD) {
      console.log('Rejected candidate sim with non SPD boots')
      return null
    }

    // Define min/max limits
    const minSubstatRollCounts = calculateMinSubstatRollCounts(partialSimulationWrapper, benchmarkScoringParams, simulationFlags)
    const maxSubstatRollCounts = calculateMaxSubstatRollCounts(partialSimulationWrapper, metadata, benchmarkScoringParams, baselineSimResult, simulationFlags)

    // Start the sim search at the max then iterate downwards
    Object.values(SubStats).map((stat) => partialSimulationWrapper.simulation.request.stats[stat] = maxSubstatRollCounts[stat])

    const input: ComputeOptimalSimulationRunnerInput = {
      partialSimulationWrapper: partialSimulationWrapper,
      inputMinSubstatRollCounts: minSubstatRollCounts,
      inputMaxSubstatRollCounts: maxSubstatRollCounts,
      simulationForm: simulationForm,
      context: clonedContext,
      metadata: metadata,
      scoringParams: TsUtils.clone(benchmarkScoringParams),
      simulationFlags: simulationFlags,
    }

    return runComputeOptimalSimulationWorker(input)
  })

  const runnerOutputs = await Promise.all(runnerPromises)
  console.timeEnd('!!!!!!!!!!!!!!!!! runner')
  runnerOutputs.forEach((runnerOutput, index) => {
    if (!runnerOutput) return

    const candidateBenchmarkSim = runnerOutput.simulation

    // DEBUG
    // candidateBenchmarkSim.key = JSON.stringify(candidateBenchmarkSim.request)
    // candidateBenchmarkSim.name = ''

    if (!candidateBenchmarkSim || partialSimulationWrappers[index].simulation.request.stats[Stats.SPD] > 26 && partialSimulationWrappers[index].simulation.request.simFeet != Stats.SPD) {
      // Reject non speed boot builds that exceed the speed cap. 48 - 11 * 2 = 26 max subs that can go in to SPD
      console.log('Rejected candidate sim')
    } else {
      candidateBenchmarkSims.push(candidateBenchmarkSim)
    }
  })

  console.log(candidateBenchmarkSims)
  //
  // // Try to minimize the penalty modifier before optimizing sim score
  //
  candidateBenchmarkSims.sort(simSorter)
  const benchmarkSim = candidateBenchmarkSims[0]

  return benchmarkSim
}

// Generate all main stat possibilities
export function generatePartialSimulations(
  character: Character,
  metadata: SimulationMetadata,
  simulationSets: SimulationSets,
  originalSim: Simulation,
) {
  const forceSpdBoots = false // originalBaseSpeed - baselineSimResult.x[Stats.SPD] > 2.0 * 2 * 5 // 3 min spd rolls per piece
  const feetParts: string[] = forceSpdBoots ? [Stats.SPD] : metadata.parts[Parts.Feet]

  const forceErrRope = isErrRopeForced(character.form, metadata, originalSim)
  const ropeParts: string[] = forceErrRope ? [Stats.ERR] : metadata.parts[Parts.LinkRope]

  const { relicSet1, relicSet2, ornamentSet } = simulationSets

  const results: PartialSimulationWrapper[] = []
  for (const body of metadata.parts[Parts.Body]) {
    for (const feet of feetParts) {
      for (const planarSphere of metadata.parts[Parts.PlanarSphere]) {
        for (const linkRope of ropeParts) {
          const request: SimulationRequest = {
            name: '',
            simRelicSet1: relicSet1,
            simRelicSet2: relicSet2,
            simOrnamentSet: ornamentSet,
            simBody: body,
            simFeet: feet,
            simPlanarSphere: planarSphere,
            simLinkRope: linkRope,
            stats: {
              [Stats.HP_P]: 0,
              [Stats.ATK_P]: 0,
              [Stats.DEF_P]: 0,
              [Stats.HP]: 0,
              [Stats.ATK]: 0,
              [Stats.DEF]: 0,
              [Stats.SPD]: 0,
              [Stats.CR]: 0,
              [Stats.CD]: 0,
              [Stats.EHR]: 0,
              [Stats.RES]: 0,
              [Stats.BE]: 0,
            },
          }
          const simulation: Simulation = {
            name: '',
            key: '',
            simType: StatSimTypes.SubstatRolls,
            request: request,
          }
          const partialSimulationWrapper: PartialSimulationWrapper = {
            simulation: simulation,
            finalSpeed: 0,
            speedRollsDeduction: 0,
          }
          results.push(partialSimulationWrapper)
        }
      }
    }
  }

  return results
}
