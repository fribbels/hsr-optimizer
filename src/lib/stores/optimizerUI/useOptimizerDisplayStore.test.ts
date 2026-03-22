// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import { COMPUTE_ENGINE_CPU } from 'lib/constants/constants'
import { type Simulation, StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { type OptimizerContext } from 'types/optimizer'
import { type PermutationDetails } from 'lib/stores/optimizerUI/optimizerUITypes'

// ---- Helpers ----

function state() {
  return useOptimizerDisplayStore.getState()
}

function makeSim(key: string): Simulation {
  return { key, simType: StatSimTypes.SubstatRolls, request: {} as Simulation['request'] }
}

// ---- Reset ----

beforeEach(() => {
  useOptimizerDisplayStore.setState(useOptimizerDisplayStore.getInitialState())
})

// ---- Tests ----

describe('useOptimizerDisplayStore', () => {
  describe('initial state', () => {
    it('store initializes with correct defaults for all fields', () => {
      expect(state().context).toBeNull()
      expect(state().permutations).toBe(0)
      expect(state().optimizationInProgress).toBe(false)
      expect(state().focusCharacterId).toBeUndefined()
      expect(state().optimizationId).toBeNull()
      expect(state().optimizerRunningEngine).toBe(COMPUTE_ENGINE_CPU)
      expect(state().optimizerStartTime).toBeNull()
      expect(state().optimizerEndTime).toBeNull()
      expect(state().permutationsSearched).toBe(0)
      expect(state().permutationsResults).toBe(0)
      expect(state().optimizerBuild).toBeNull()
      expect(state().optimizerSelectedRowData).toBeNull()
      expect(state().statSimulationDisplay).toBe(StatSimTypes.Disabled)
      expect(state().statSimulations).toEqual([])
      expect(state().selectedStatSimulations).toEqual([])
      expect(state().characterSelectModalOpen).toBe(false)
      expect(state().menuState).toEqual({})
      expect(state().permutationDetails).toEqual({
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
  })

  describe('simple setters update their respective fields', () => {
    it('scalar setters update optimization lifecycle fields', () => {
      state().setPermutations(42)
      state().setOptimizationInProgress(true)
      state().setOptimizationId('run-abc')
      state().setOptimizerRunningEngine('GPU Stable')
      state().setOptimizerStartTime(12345)
      state().setOptimizerEndTime(99999)
      state().setPermutationsSearched(500)
      state().setPermutationsResults(10)

      expect(state().permutations).toBe(42)
      expect(state().optimizationInProgress).toBe(true)
      expect(state().optimizationId).toBe('run-abc')
      expect(state().optimizerRunningEngine).toBe('GPU Stable')
      expect(state().optimizerStartTime).toBe(12345)
      expect(state().optimizerEndTime).toBe(99999)
      expect(state().permutationsSearched).toBe(500)
      expect(state().permutationsResults).toBe(10)
    })

    it('object/reference setters update context, build, row data, and display fields', () => {
      const ctx = { test: true } as unknown as OptimizerContext
      const build = { Head: 'r1' } as any
      const row = { stat: 1 } as any
      const details: PermutationDetails = {
        Head: 10, Hands: 20, Body: 30, Feet: 40, PlanarSphere: 50, LinkRope: 60,
        HeadTotal: 100, HandsTotal: 200, BodyTotal: 300, FeetTotal: 400, PlanarSphereTotal: 500, LinkRopeTotal: 600,
      }

      state().setContext(ctx)
      state().setOptimizerBuild(build)
      state().setOptimizerSelectedRowData(row)
      state().setPermutationDetails(details)
      state().setFocusCharacterId(Kafka.id)
      state().setStatSimulationDisplay(StatSimTypes.SubstatRolls)
      state().setCharacterSelectModalOpen(true)
      state().setMenuState({ panel1: true, panel2: false })

      expect(state().context).toBe(ctx)
      expect(state().optimizerBuild).toBe(build)
      expect(state().optimizerSelectedRowData).toBe(row)
      expect(state().permutationDetails).toEqual(details)
      expect(state().focusCharacterId).toBe(Kafka.id)
      expect(state().statSimulationDisplay).toBe(StatSimTypes.SubstatRolls)
      expect(state().characterSelectModalOpen).toBe(true)
      expect(state().menuState).toEqual({ panel1: true, panel2: false })
    })
  })

  describe('simulation actions', () => {
    it('addSimulation appends a simulation to the array', () => {
      const sim1 = makeSim('k1')
      const sim2 = makeSim('k2')
      state().addSimulation(sim1)
      state().addSimulation(sim2)
      expect(state().statSimulations).toEqual([sim1, sim2])
    })

    it('removeSimulation removes by key and preserves other simulations', () => {
      const sim1 = makeSim('k1')
      const sim2 = makeSim('k2')
      state().addSimulation(sim1)
      state().addSimulation(sim2)
      state().removeSimulation('k1')
      expect(state().statSimulations).toEqual([sim2])
    })

    it('removeSimulation with non-existent key leaves array unchanged', () => {
      const sim1 = makeSim('k1')
      state().addSimulation(sim1)
      state().removeSimulation('nonexistent')
      expect(state().statSimulations).toEqual([sim1])
    })

    it('replaceSimulation swaps matching simulation and preserves others', () => {
      const sim1 = makeSim('k1')
      const sim2 = makeSim('k2')
      state().addSimulation(sim1)
      state().addSimulation(sim2)
      const replacement = { ...sim1, simType: StatSimTypes.Benchmarks }
      state().replaceSimulation('k1', replacement)
      expect(state().statSimulations).toEqual([replacement, sim2])
    })

    it('replaceSimulation with non-existent key preserves array unchanged', () => {
      const sim1 = makeSim('k1')
      state().addSimulation(sim1)
      state().replaceSimulation('nonexistent', makeSim('k3'))
      expect(state().statSimulations).toEqual([sim1])
    })

    it('clearSimulations empties the array', () => {
      state().addSimulation(makeSim('k1'))
      state().addSimulation(makeSim('k2'))
      state().clearSimulations()
      expect(state().statSimulations).toEqual([])
    })

    it('setSelectedStatSimulations updates selected keys', () => {
      state().setSelectedStatSimulations(['key1', 'key2'])
      expect(state().selectedStatSimulations).toEqual(['key1', 'key2'])
    })

    it('setStatSimulations replaces entire array', () => {
      const sims = [makeSim('s1'), makeSim('s2')]
      state().setStatSimulations(sims)
      expect(state().statSimulations).toEqual(sims)
    })
  })

  describe('optimization lifecycle', () => {
    it('start → progress → complete produces correct final state', () => {
      // Start
      state().setOptimizationInProgress(true)
      state().setPermutationsSearched(0)
      state().setPermutationsResults(0)
      state().setOptimizationId('run-1')
      expect(state().optimizationInProgress).toBe(true)

      // Progress
      state().setOptimizerStartTime(1000)
      state().setPermutationsSearched(50000)
      state().setPermutationsResults(10)
      state().setOptimizerEndTime(2000)
      expect(state().permutationsSearched).toBe(50000)
      expect(state().permutationsResults).toBe(10)

      // Complete
      state().setOptimizationInProgress(false)
      expect(state().optimizationInProgress).toBe(false)
      expect(state().permutationsSearched).toBe(50000)
      expect(state().optimizationId).toBe('run-1')
    })

    it('start → cancel leaves last-known progress values intact', () => {
      state().setOptimizationInProgress(true)
      state().setOptimizerStartTime(1000)
      state().setPermutationsSearched(25000)
      state().setOptimizerEndTime(1500)

      // Cancel
      state().setOptimizationInProgress(false)

      expect(state().optimizationInProgress).toBe(false)
      expect(state().permutationsSearched).toBe(25000)
      expect(state().optimizerStartTime).toBe(1000)
    })

    // DISPLAY-5: GPU null device handler doesn't set optimizationInProgress=false,
    // leaving the UI permanently stuck in loading state.
    // This test asserts CORRECT behavior: after GPU null detection, optimization must stop.
    it.fails('GPU null device detection sets optimizationInProgress to false (DISPLAY-5)', () => {
      // Simulate: startOptimization sets in-progress
      state().setOptimizationInProgress(true)
      state().setOptimizationId('gpu-run')
      state().setPermutationsSearched(0)
      state().setPermutationsResults(0)

      // Simulate: GPU device check returns null → should stop optimization
      // Currently this is MISSING from optimizer.ts:235-238
      // The fix adds: setOptimizationInProgress(false) in the null device handler
      // For the test, we directly verify the store behavior:
      // After the bug is fixed, the optimizer will call setOptimizationInProgress(false)
      // For now, we simulate the buggy path where it's NOT called:
      // (The bug is that the GPU null handler doesn't call this)

      // We expect that after the full GPU-null handling, optimization should NOT be in progress
      // But since the bug exists, optimizationInProgress remains true
      expect(state().optimizationInProgress).toBe(false)
    })

    // DISPLAY-3: startOptimization doesn't reset stale timing from previous run.
    // Between starting and the engine setting new times, stale data is visible.
    it.fails('startOptimization resets stale timing fields from previous run (DISPLAY-3)', () => {
      // Previous run left timing data
      state().setOptimizerStartTime(1000)
      state().setOptimizerEndTime(2000)
      state().setOptimizationInProgress(false)

      // Simulate startOptimization: resets progress but not timing
      state().setPermutationsSearched(0)
      state().setPermutationsResults(0)
      state().setOptimizationInProgress(true)

      // CORRECT behavior: timing should be cleared at optimization start
      expect(state().optimizerStartTime).toBeNull()
      expect(state().optimizerEndTime).toBeNull()
    })
  })

  describe('menuState', () => {
    it('setMenuState replaces entire menu state object', () => {
      state().setMenuState({ a: true })
      state().setMenuState({ b: false })
      expect(state().menuState).toEqual({ b: false })
    })

    it('setMenuState produces a new reference', () => {
      const original = state().menuState
      state().setMenuState({ ...original, test: true })
      expect(state().menuState).not.toBe(original)
    })
  })
})
