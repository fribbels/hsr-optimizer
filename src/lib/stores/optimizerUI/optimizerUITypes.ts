import type { ComputeEngine } from 'lib/constants/constants'
import type { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import type {
  Simulation,
  StatSimTypes,
} from 'lib/simulations/statSimulationTypes'
import type {
  Build,
  CharacterId,
} from 'types/character'
import type { OptimizerContext } from 'types/optimizer'

// ---- Permutation details ----

export type PermutationDetails = {
  Head: number,
  Hands: number,
  Body: number,
  Feet: number,
  PlanarSphere: number,
  LinkRope: number,
  HeadTotal: number,
  HandsTotal: number,
  BodyTotal: number,
  FeetTotal: number,
  PlanarSphereTotal: number,
  LinkRopeTotal: number,
}

// ---- Optimizer UI state ----
//
// Transient runtime & display state for the optimizer tab. These fields
// are ephemeral — they reset between optimization runs and are NEVER
// persisted to DB. If a new field should be saved with a character build,
// it belongs in OptimizerRequestState (useOptimizerRequestStore) instead.

export type OptimizerDisplayState = {
  focusCharacterId: CharacterId | undefined,
  context: OptimizerContext | null,
  permutations: number,
  permutationDetails: PermutationDetails,
  optimizationInProgress: boolean,
  optimizationId: string | null,
  optimizerRunningEngine: ComputeEngine,
  optimizerStartTime: number | null,
  optimizerEndTime: number | null,
  permutationsSearched: number,
  permutationsResults: number,
  optimizerBuild: Build | null,
  optimizerSelectedRowData: OptimizerDisplayDataStatSim | null,
  statSimulationDisplay: StatSimTypes,
  statSimulations: Simulation[],
  selectedStatSimulations: Simulation['key'][],
  characterSelectModalOpen: boolean,
  menuState: Record<string, boolean>,
}
