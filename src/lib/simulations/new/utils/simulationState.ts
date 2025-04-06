import { Sets, Stats } from 'lib/constants/constants'
import { RelicBuild, ScoringParams } from 'lib/scoring/simScoringUtils'
import { SimulationRequest } from 'lib/simulations/statSimulationController'
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

export type SimulationStateInputs = SimulationState['inputs']
export type SimulationStateConfig = SimulationState['config']

export function createCustomBenchmarkSimulationState(
  form: Form,
  context: OptimizerContext,
  metadata: SimulationMetadata,
  simulationRequest: SimulationRequest,
  scoringParams: ScoringParams,
): SimulationState {
  const inputs: SimulationStateInputs = {
    context,
    form,
    metadata,
    scoringParams,
  }

  const config: SimulationStateConfig = {
    overwriteSets: true,
    addBreakEffect: false,
    overcapCritRate: false,
    simPoetActive: false,
    characterPoetActive: isPoet(simulationRequest),
    forceBasicSpd: true,
    forceBasicSpdValue: simulationRequest.stats[Stats.SPD],
  }

  return {
    inputs,
    config,
  }
}

function isPoet(simulationRequest: SimulationRequest) {
  return simulationRequest.simRelicSet1 == Sets.PoetOfMourningCollapse
    && simulationRequest.simRelicSet2 == Sets.PoetOfMourningCollapse
}
