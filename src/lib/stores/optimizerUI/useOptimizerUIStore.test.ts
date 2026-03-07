// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useOptimizerUIStore } from 'lib/stores/optimizerUI/useOptimizerUIStore'
import { COMPUTE_ENGINE_CPU } from 'lib/constants/constants'
import { StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { CharacterId } from 'types/character'
import { OptimizerContext } from 'types/optimizer'
import { PermutationDetails } from 'lib/stores/optimizerUI/optimizerUITypes'

beforeEach(() => {
  useOptimizerUIStore.setState(useOptimizerUIStore.getInitialState())
})

// ---- Initial state tests ----

describe('initial state', () => {
  it('has null context', () => {
    const state = useOptimizerUIStore.getState()
    expect(state.context).toBeNull()
  })

  it('has 0 permutations', () => {
    const state = useOptimizerUIStore.getState()
    expect(state.permutations).toBe(0)
  })

  it('is not in progress', () => {
    const state = useOptimizerUIStore.getState()
    expect(state.optimizationInProgress).toBe(false)
  })

  it('has no focus character', () => {
    const state = useOptimizerUIStore.getState()
    expect(state.focusCharacterId).toBeUndefined()
  })

  it('has all-zero permutation details', () => {
    const state = useOptimizerUIStore.getState()
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
    const state = useOptimizerUIStore.getState()
    expect(state.optimizationId).toBeNull()
  })

  it('has CPU as default compute engine', () => {
    const state = useOptimizerUIStore.getState()
    expect(state.optimizerRunningEngine).toBe(COMPUTE_ENGINE_CPU)
  })

  it('has null start and end times', () => {
    const state = useOptimizerUIStore.getState()
    expect(state.optimizerStartTime).toBeNull()
    expect(state.optimizerEndTime).toBeNull()
  })

  it('has 0 permutations searched and results', () => {
    const state = useOptimizerUIStore.getState()
    expect(state.permutationsSearched).toBe(0)
    expect(state.permutationsResults).toBe(0)
  })

  it('has null optimizer build and selected row data', () => {
    const state = useOptimizerUIStore.getState()
    expect(state.optimizerBuild).toBeNull()
    expect(state.optimizerSelectedRowData).toBeNull()
  })

  it('has disabled stat simulation display', () => {
    const state = useOptimizerUIStore.getState()
    expect(state.statSimulationDisplay).toBe(StatSimTypes.Disabled)
  })

  it('has empty simulations arrays', () => {
    const state = useOptimizerUIStore.getState()
    expect(state.statSimulations).toEqual([])
    expect(state.selectedStatSimulations).toEqual([])
  })

  it('has 0 teammate count and closed modal', () => {
    const state = useOptimizerUIStore.getState()
    expect(state.teammateCount).toBe(0)
    expect(state.characterSelectModalOpen).toBe(false)
  })

  it('has empty menu state', () => {
    const state = useOptimizerUIStore.getState()
    expect(state.menuState).toEqual({})
  })
})

// ---- Setter tests ----

describe('setters', () => {
  it('setContext updates context', () => {
    const ctx = { test: true } as unknown as OptimizerContext
    useOptimizerUIStore.getState().setContext(ctx)
    expect(useOptimizerUIStore.getState().context).toBe(ctx)
  })

  it('setPermutations updates permutations', () => {
    useOptimizerUIStore.getState().setPermutations(42)
    expect(useOptimizerUIStore.getState().permutations).toBe(42)
  })

  it('setOptimizationInProgress updates flag', () => {
    useOptimizerUIStore.getState().setOptimizationInProgress(true)
    expect(useOptimizerUIStore.getState().optimizationInProgress).toBe(true)
  })

  it('setFocusCharacterId updates focus character', () => {
    const id = '1001' as CharacterId
    useOptimizerUIStore.getState().setFocusCharacterId(id)
    expect(useOptimizerUIStore.getState().focusCharacterId).toBe(id)
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
    useOptimizerUIStore.getState().setPermutationDetails(details)
    expect(useOptimizerUIStore.getState().permutationDetails).toEqual(details)
  })

  it('setOptimizationId updates id', () => {
    useOptimizerUIStore.getState().setOptimizationId('abc-123')
    expect(useOptimizerUIStore.getState().optimizationId).toBe('abc-123')
  })

  it('setOptimizerRunningEngine updates engine', () => {
    useOptimizerUIStore.getState().setOptimizerRunningEngine('GPU Stable')
    expect(useOptimizerUIStore.getState().optimizerRunningEngine).toBe('GPU Stable')
  })

  it('setOptimizerStartTime updates start time', () => {
    useOptimizerUIStore.getState().setOptimizerStartTime(12345)
    expect(useOptimizerUIStore.getState().optimizerStartTime).toBe(12345)
  })

  it('setOptimizerEndTime updates end time', () => {
    useOptimizerUIStore.getState().setOptimizerEndTime(99999)
    expect(useOptimizerUIStore.getState().optimizerEndTime).toBe(99999)
  })

  it('setPermutationsSearched updates count', () => {
    useOptimizerUIStore.getState().setPermutationsSearched(500)
    expect(useOptimizerUIStore.getState().permutationsSearched).toBe(500)
  })

  it('setPermutationsResults updates count', () => {
    useOptimizerUIStore.getState().setPermutationsResults(10)
    expect(useOptimizerUIStore.getState().permutationsResults).toBe(10)
  })

  it('setOptimizerBuild updates build', () => {
    const build = { id: 'build1' } as any
    useOptimizerUIStore.getState().setOptimizerBuild(build)
    expect(useOptimizerUIStore.getState().optimizerBuild).toBe(build)
  })

  it('setOptimizerSelectedRowData updates row data', () => {
    const row = { stat: 1 } as any
    useOptimizerUIStore.getState().setOptimizerSelectedRowData(row)
    expect(useOptimizerUIStore.getState().optimizerSelectedRowData).toBe(row)
  })

  it('setStatSimulationDisplay updates display type', () => {
    useOptimizerUIStore.getState().setStatSimulationDisplay(StatSimTypes.SubstatRolls)
    expect(useOptimizerUIStore.getState().statSimulationDisplay).toBe(StatSimTypes.SubstatRolls)
  })

  it('setStatSimulations updates simulations array', () => {
    const sims = [{ key: 'sim1', simType: StatSimTypes.SubstatRolls }] as any
    useOptimizerUIStore.getState().setStatSimulations(sims)
    expect(useOptimizerUIStore.getState().statSimulations).toEqual(sims)
  })

  it('setSelectedStatSimulations updates selected keys', () => {
    useOptimizerUIStore.getState().setSelectedStatSimulations(['key1', 'key2'])
    expect(useOptimizerUIStore.getState().selectedStatSimulations).toEqual(['key1', 'key2'])
  })

  it('setTeammateCount updates count', () => {
    useOptimizerUIStore.getState().setTeammateCount(3)
    expect(useOptimizerUIStore.getState().teammateCount).toBe(3)
  })

  it('setCharacterSelectModalOpen updates modal state', () => {
    useOptimizerUIStore.getState().setCharacterSelectModalOpen(true)
    expect(useOptimizerUIStore.getState().characterSelectModalOpen).toBe(true)
  })

  it('setMenuState updates menu state', () => {
    const menu = { panel1: true, panel2: false }
    useOptimizerUIStore.getState().setMenuState(menu)
    expect(useOptimizerUIStore.getState().menuState).toEqual(menu)
  })
})
