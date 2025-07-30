import { Stats } from 'lib/constants/constants'
import { initializeContextConditionals } from 'lib/simulations/contextConditionals'
import { computeOptimalSimulationSearch } from 'lib/worker/computeOptimalSimulationWorker'
import { ComputeOptimalSimulationWorkerInput } from 'lib/worker/computeOptimalSimulationWorkerRunner'
import { testInput } from 'lib/worker/maxima/testData'
import {
  describe,
  expect,
  it,
} from 'vitest'

describe('manual test', () => {
  it('verifies a given input', () => {
    // const input = testInput as unknown as ComputeOptimalSimulationWorkerInput
    // initializeContextConditionals(input.context)
    // computeOptimalSimulationSearch(input)
  })
})
