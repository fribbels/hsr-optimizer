import { ComputeEngine, COMPUTE_ENGINE_CPU } from 'lib/constants/constants'
import { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import { Simulation, StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { OptimizerUIState, PermutationDetails } from 'lib/stores/optimizerUI/optimizerUITypes'
import { Build, CharacterId } from 'types/character'
import { OptimizerContext } from 'types/optimizer'
import { create } from 'zustand'

type OptimizerUIActions = {
  setFocusCharacterId: (id: CharacterId | undefined) => void
  setContext: (ctx: OptimizerContext | null) => void
  setPermutations: (n: number) => void
  setPermutationDetails: (details: PermutationDetails) => void
  setOptimizationInProgress: (inProgress: boolean) => void
  setOptimizationId: (id: string | null) => void
  setOptimizerRunningEngine: (engine: ComputeEngine) => void
  setOptimizerStartTime: (time: number | null) => void
  setOptimizerEndTime: (time: number | null) => void
  setPermutationsSearched: (n: number) => void
  setPermutationsResults: (n: number) => void
  setOptimizerBuild: (build: Build | null) => void
  setOptimizerSelectedRowData: (data: OptimizerDisplayDataStatSim | null) => void
  setStatSimulationDisplay: (display: StatSimTypes) => void
  setStatSimulations: (sims: Simulation[]) => void
  setSelectedStatSimulations: (keys: Simulation['key'][]) => void
  setTeammateCount: (count: number) => void
  setCharacterSelectModalOpen: (open: boolean) => void
  setMenuState: (state: Record<string, boolean>) => void
}

type OptimizerUIStore = OptimizerUIState & OptimizerUIActions

const initialState: OptimizerUIState = {
  focusCharacterId: undefined,
  context: null,
  permutations: 0,
  permutationDetails: {
    Head: 0,
    Hands: 0,
    Body: 0,
    Feet: 0,
    PlanarSphere: 0,
    LinkRope: 0,
    HeadTotal: 0,
    HandsTotal: 0,
    BodyTotal: 0,
    FeetTotal: 0,
    PlanarSphereTotal: 0,
    LinkRopeTotal: 0,
  },
  optimizationInProgress: false,
  optimizationId: null,
  optimizerRunningEngine: COMPUTE_ENGINE_CPU,
  optimizerStartTime: null,
  optimizerEndTime: null,
  permutationsSearched: 0,
  permutationsResults: 0,
  optimizerBuild: null,
  optimizerSelectedRowData: null,
  statSimulationDisplay: StatSimTypes.Disabled,
  statSimulations: [],
  selectedStatSimulations: [],
  teammateCount: 0,
  characterSelectModalOpen: false,
  menuState: {},
}

export const useOptimizerUIStore = create<OptimizerUIStore>()((set) => ({
  ...initialState,

  setFocusCharacterId: (id) => set({ focusCharacterId: id }),
  setContext: (ctx) => set({ context: ctx }),
  setPermutations: (n) => set({ permutations: n }),
  setPermutationDetails: (details) => set({ permutationDetails: details }),
  setOptimizationInProgress: (inProgress) => set({ optimizationInProgress: inProgress }),
  setOptimizationId: (id) => set({ optimizationId: id }),
  setOptimizerRunningEngine: (engine) => set({ optimizerRunningEngine: engine }),
  setOptimizerStartTime: (time) => set({ optimizerStartTime: time }),
  setOptimizerEndTime: (time) => set({ optimizerEndTime: time }),
  setPermutationsSearched: (n) => set({ permutationsSearched: n }),
  setPermutationsResults: (n) => set({ permutationsResults: n }),
  setOptimizerBuild: (build) => set({ optimizerBuild: build }),
  setOptimizerSelectedRowData: (data) => set({ optimizerSelectedRowData: data }),
  setStatSimulationDisplay: (display) => set({ statSimulationDisplay: display }),
  setStatSimulations: (sims) => set({ statSimulations: sims }),
  setSelectedStatSimulations: (keys) => set({ selectedStatSimulations: keys }),
  setTeammateCount: (count) => set({ teammateCount: count }),
  setCharacterSelectModalOpen: (open) => set({ characterSelectModalOpen: open }),
  setMenuState: (menuState) => set({ menuState }),
}))
