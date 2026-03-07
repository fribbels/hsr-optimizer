import { ComputeEngine } from 'lib/constants/constants'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { Simulation, StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { Build, CharacterId } from 'types/character'
import { OptimizerContext } from 'types/optimizer'

// ---- Permutation details ----

export type PermutationDetails = {
  Head: number
  Hands: number
  Body: number
  Feet: number
  PlanarSphere: number
  LinkRope: number
  HeadTotal: number
  HandsTotal: number
  BodyTotal: number
  FeetTotal: number
  PlanarSphereTotal: number
  LinkRopeTotal: number
}

// ---- Optimizer UI state ----

export type OptimizerUIState = {
  focusCharacterId: CharacterId | undefined
  context: OptimizerContext | null
  permutations: number
  permutationDetails: PermutationDetails
  optimizationInProgress: boolean
  optimizationId: string | null
  optimizerRunningEngine: ComputeEngine
  optimizerStartTime: number | null
  optimizerEndTime: number | null
  permutationsSearched: number
  permutationsResults: number
  optimizerBuild: Build | null
  optimizerSelectedRowData: OptimizerDisplayDataStatSim | null
  statSimulationDisplay: StatSimTypes
  statSimulations: Simulation[]
  selectedStatSimulations: Simulation['key'][]
  teammateCount: number
  characterSelectModalOpen: boolean
  menuState: Record<string, boolean>
}
