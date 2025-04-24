import { runDpsScoreBenchmarkOrchestrator } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { generateTestSingleRelicsByPart, TestInput, testStatSpread } from 'lib/simulations/tests/statSim/statSimTestUtils'
import DB from 'lib/state/db'
import { Character } from 'types/character'
import { expect } from 'vitest'

export async function expectBenchmarkResultsToMatch(
  input: TestInput,
  percent: number,
) {
  globalThis.SEQUENTIAL_BENCHMARKS = true

  const character = {
    form: {
      ...input.character,
    },
  } as Character
  const sets = input.sets
  const mains = input.mains

  const simulationMetadata = DB.getMetadata().characters[input.character.characterId].scoringMetadata.simulation!
  const showcaseTemporaryOptions = { spdBenchmark: undefined }
  const singleRelicByPart = generateTestSingleRelicsByPart(sets, mains, testStatSpread())

  const orchestrator = await runDpsScoreBenchmarkOrchestrator(
    character,
    simulationMetadata,
    singleRelicByPart,
    showcaseTemporaryOptions,
  )
  const simScore = orchestrator.simulationScore!
  console.log(simScore.percent)
  console.log(simScore.originalSimScore)
  try {
    expect(simScore.percent).toBeCloseTo(percent, 5)
  } catch (error: unknown) {
    // @ts-ignore
    const message = error.message
    throw new Error(`
${DB.getMetadata().characters[input.character.characterId].displayName} BENCHMARK
${message}
${JSON.stringify(input, null, 2)}
      `)
  }
}
