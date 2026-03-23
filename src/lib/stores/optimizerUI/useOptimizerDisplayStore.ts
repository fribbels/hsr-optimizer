import type { ComputeEngine } from 'lib/constants/constants'
import { COMPUTE_ENGINE_CPU } from 'lib/constants/constants'
import type { OptimizerDisplayDataStatSim } from 'lib/optimization/bufferPacker'
import type { Simulation } from 'lib/simulations/statSimulationTypes'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import type { OptimizerDisplayState, PermutationDetails } from 'lib/stores/optimizerUI/optimizerUITypes'
import type { Build, CharacterId } from 'types/character'
import type { OptimizerContext } from 'types/optimizer'
import { createTabAwareStore } from 'lib/stores/infrastructure/createTabAwareStore'

type OptimizerDisplayActions = {
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
  addSimulation: (sim: Simulation) => void
  removeSimulation: (key: Simulation['key']) => void
  replaceSimulation: (oldKey: Simulation['key'], sim: Simulation) => void
  clearSimulations: () => void
  setSelectedStatSimulations: (keys: Simulation['key'][]) => void
  setCharacterSelectModalOpen: (open: boolean) => void
  setMenuState: (state: Record<string, boolean>) => void
}

type OptimizerDisplayStore = OptimizerDisplayState & OptimizerDisplayActions

const initialState: OptimizerDisplayState = {
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
  characterSelectModalOpen: false,
  menuState: {},
}

export const useOptimizerDisplayStore = createTabAwareStore<OptimizerDisplayStore>((set) => ({
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
  addSimulation: (sim) => set((s) => ({ statSimulations: [...s.statSimulations, sim] })),
  removeSimulation: (key) => set((s) => ({ statSimulations: s.statSimulations.filter((x) => x.key !== key) })),
  replaceSimulation: (oldKey, sim) => set((s) => ({ statSimulations: s.statSimulations.map((x) => x.key === oldKey ? sim : x) })),
  clearSimulations: () => set({ statSimulations: [] }),
  setSelectedStatSimulations: (keys) => set({ selectedStatSimulations: keys }),
  setCharacterSelectModalOpen: (open) => set({ characterSelectModalOpen: open }),
  setMenuState: (menuState) => set({ menuState }),
}))
