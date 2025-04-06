import { SimulationSets } from 'lib/scoring/dpsScore'
import { RelicBuild, ScoringParams, SimulationFlags } from 'lib/scoring/simScoringUtils'
import { Character } from 'types/character'
import { Form } from 'types/form'
import { SimulationMetadata } from 'types/metadata'
import { OptimizerContext } from 'types/optimizer'

export type SimulationState = {
  inputs: {
    context: OptimizerContext
    form: Form
    metadata: SimulationMetadata
    scoringParams: ScoringParams

    character?: Character
    displayRelics?: RelicBuild

    customMainStats?: {
      bodyMainStat?: string
      feetMainStat?: string
      planarSphereMainStat?: string
      linkRopeMainStat?: string
    }
    customTargetSpd?: number
  }

  // Configuration
  config: {
    spdBenchmark?: number
    mainStatMultiplier?: number

    overwriteSets: boolean
    addBreakEffect?: boolean
    overcapCritRate?: boolean
    simPoetActive?: boolean
    characterPoetActive?: boolean
    forceBasicSpd?: boolean
    forceBasicSpdValue?: number
  }
}

export function createSimulationState(
  // Required parameters
  context: OptimizerContext,
  form: Form,
  metadata: SimulationMetadata,
  scoringParams: ScoringParams,
  simulationSets: SimulationSets,
  // Optional parameters
  options: {
    simulationFlags?: SimulationFlags
    character?: Character
    displayRelics?: RelicBuild
    customMainStats?: SimulationState['inputs']['customMainStats']
    customTargetSpd?: number
    spdBenchmark?: number
    mainStatMultiplier?: number
    overwriteSets?: boolean
  } = {},
): SimulationState {
  return {
    inputs: {
      context,
      form,
      metadata,
      scoringParams,
      character: options.character,
      displayRelics: options.displayRelics,
      customMainStats: options.customMainStats,
      customTargetSpd: options.customTargetSpd,
    },
    config: {
      spdBenchmark: options.spdBenchmark,
      mainStatMultiplier: options.mainStatMultiplier ?? 1,
      overwriteSets: options.overwriteSets ?? false,
      simulationSets,
    },
    results: {},
    status: {
      originalBuildCompleted: false,
      baselineBuildCompleted: false,
      speedAdjustmentsCompleted: false,
      benchmarkBuildCompleted: false,
      perfectBuildCompleted: false,
      scoreCalculated: false,
    },
    metrics: {
      startTime: performance.now(),
    },
  }
}
