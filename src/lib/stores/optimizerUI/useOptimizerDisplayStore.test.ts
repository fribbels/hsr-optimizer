// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { COMPUTE_ENGINE_CPU } from 'lib/constants/constants'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { type CharacterId } from 'types/character'
import { type OptimizerContext } from 'types/optimizer'
import { type PermutationDetails } from 'lib/stores/optimizerUI/optimizerUITypes'

beforeEach(() => {
  useOptimizerDisplayStore.setState(useOptimizerDisplayStore.getInitialState())
})

// ---- Initial state tests ----

describe('initial state', () => {
  it('has null context', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.context).toBeNull()
  })

  it('has 0 permutations', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.permutations).toBe(0)
  })

  it('is not in progress', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.optimizationInProgress).toBe(false)
  })

  it('has no focus character', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.focusCharacterId).toBeUndefined()
  })

  it('has all-zero permutation details', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.permutationDetails).toEqual({
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
    })
  })

  it('has null optimizationId', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.optimizationId).toBeNull()
  })

  it('has CPU as default compute engine', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.optimizerRunningEngine).toBe(COMPUTE_ENGINE_CPU)
  })

  it('has null start and end times', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.optimizerStartTime).toBeNull()
    expect(state.optimizerEndTime).toBeNull()
  })

  it('has 0 permutations searched and results', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.permutationsSearched).toBe(0)
    expect(state.permutationsResults).toBe(0)
  })

  it('has null optimizer build and selected row data', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.optimizerBuild).toBeNull()
    expect(state.optimizerSelectedRowData).toBeNull()
  })

  it('has disabled stat simulation display', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.statSimulationDisplay).toBe(StatSimTypes.Disabled)
  })

  it('has empty simulations arrays', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.statSimulations).toEqual([])
    expect(state.selectedStatSimulations).toEqual([])
  })

  it('has closed modal', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.characterSelectModalOpen).toBe(false)
  })

  it('has empty menu state', () => {
    const state = useOptimizerDisplayStore.getState()
    expect(state.menuState).toEqual({})
  })
})

// ---- Setter tests ----

describe('setters', () => {
  it('setContext updates context', () => {
    const ctx = { test: true } as unknown as OptimizerContext
    useOptimizerDisplayStore.getState().setContext(ctx)
    expect(useOptimizerDisplayStore.getState().context).toBe(ctx)
  })

  it('setPermutations updates permutations', () => {
    useOptimizerDisplayStore.getState().setPermutations(42)
    expect(useOptimizerDisplayStore.getState().permutations).toBe(42)
  })

  it('setOptimizationInProgress updates flag', () => {
    useOptimizerDisplayStore.getState().setOptimizationInProgress(true)
    expect(useOptimizerDisplayStore.getState().optimizationInProgress).toBe(true)
  })

  it('setFocusCharacterId updates focus character', () => {
    const id = '1001' as CharacterId
    useOptimizerDisplayStore.getState().setFocusCharacterId(id)
    expect(useOptimizerDisplayStore.getState().focusCharacterId).toBe(id)
  })

  it('setPermutationDetails updates details', () => {
    const details: PermutationDetails = {
      Head: 10,
      Hands: 20,
      Body: 30,
      Feet: 40,
      PlanarSphere: 50,
      LinkRope: 60,
      HeadTotal: 100,
      HandsTotal: 200,
      BodyTotal: 300,
      FeetTotal: 400,
      PlanarSphereTotal: 500,
      LinkRopeTotal: 600,
    }
    useOptimizerDisplayStore.getState().setPermutationDetails(details)
    expect(useOptimizerDisplayStore.getState().permutationDetails).toEqual(details)
  })

  it('setOptimizationId updates id', () => {
    useOptimizerDisplayStore.getState().setOptimizationId('abc-123')
    expect(useOptimizerDisplayStore.getState().optimizationId).toBe('abc-123')
  })

  it('setOptimizerRunningEngine updates engine', () => {
    useOptimizerDisplayStore.getState().setOptimizerRunningEngine('GPU Stable')
    expect(useOptimizerDisplayStore.getState().optimizerRunningEngine).toBe('GPU Stable')
  })

  it('setOptimizerStartTime updates start time', () => {
    useOptimizerDisplayStore.getState().setOptimizerStartTime(12345)
    expect(useOptimizerDisplayStore.getState().optimizerStartTime).toBe(12345)
  })

  it('setOptimizerEndTime updates end time', () => {
    useOptimizerDisplayStore.getState().setOptimizerEndTime(99999)
    expect(useOptimizerDisplayStore.getState().optimizerEndTime).toBe(99999)
  })

  it('setPermutationsSearched updates count', () => {
    useOptimizerDisplayStore.getState().setPermutationsSearched(500)
    expect(useOptimizerDisplayStore.getState().permutationsSearched).toBe(500)
  })

  it('setPermutationsResults updates count', () => {
    useOptimizerDisplayStore.getState().setPermutationsResults(10)
    expect(useOptimizerDisplayStore.getState().permutationsResults).toBe(10)
  })

  it('setOptimizerBuild updates build', () => {
    const build = { id: 'build1' } as any
    useOptimizerDisplayStore.getState().setOptimizerBuild(build)
    expect(useOptimizerDisplayStore.getState().optimizerBuild).toBe(build)
  })

  it('setOptimizerSelectedRowData updates row data', () => {
    const row = { stat: 1 } as any
    useOptimizerDisplayStore.getState().setOptimizerSelectedRowData(row)
    expect(useOptimizerDisplayStore.getState().optimizerSelectedRowData).toBe(row)
  })

  it('setStatSimulationDisplay updates display type', () => {
    useOptimizerDisplayStore.getState().setStatSimulationDisplay(StatSimTypes.SubstatRolls)
    expect(useOptimizerDisplayStore.getState().statSimulationDisplay).toBe(StatSimTypes.SubstatRolls)
  })

  it('setStatSimulations updates simulations array', () => {
    const sims = [{ key: 'sim1', simType: StatSimTypes.SubstatRolls }] as any
    useOptimizerDisplayStore.getState().setStatSimulations(sims)
    expect(useOptimizerDisplayStore.getState().statSimulations).toEqual(sims)
  })

  it('setSelectedStatSimulations updates selected keys', () => {
    useOptimizerDisplayStore.getState().setSelectedStatSimulations(['key1', 'key2'])
    expect(useOptimizerDisplayStore.getState().selectedStatSimulations).toEqual(['key1', 'key2'])
  })

  it('setCharacterSelectModalOpen updates modal state', () => {
    useOptimizerDisplayStore.getState().setCharacterSelectModalOpen(true)
    expect(useOptimizerDisplayStore.getState().characterSelectModalOpen).toBe(true)
  })

  it('setMenuState updates menu state', () => {
    const menu = { panel1: true, panel2: false }
    useOptimizerDisplayStore.getState().setMenuState(menu)
    expect(useOptimizerDisplayStore.getState().menuState).toEqual(menu)
  })
})
