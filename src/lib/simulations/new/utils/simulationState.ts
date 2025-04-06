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
    simulationFlags: SimulationFlags
    spdBenchmark?: number
    mainStatMultiplier: number
    overwriteSets: boolean
    simulationSets: SimulationSets
  }
}
