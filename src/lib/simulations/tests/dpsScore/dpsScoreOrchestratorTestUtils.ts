import { runDpsScoreBenchmarkOrchestrator } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import {
  generateTestSingleRelicsByPart,
  TestInput,
} from 'lib/simulations/tests/simTestUtils'
import DB from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'
import { Character } from 'types/character'
import { expect } from 'vitest'

export async function expectDpsScoreResultsToMatch(
  input: TestInput,
  percent: number,
  spdBenchmark?: number,
) {
  // Only for test cases
  globalThis.SEQUENTIAL_BENCHMARKS = true

  const character = {
    form: {
      ...input.character,
    },
  } as Character

  const simulationMetadata = TsUtils.clone(DB.getMetadata().characters[input.character.characterId].scoringMetadata.simulation!)
  const showcaseTemporaryOptions = { spdBenchmark: spdBenchmark }
  const singleRelicByPart = generateTestSingleRelicsByPart(input.sets, input.mains, input.stats)
  simulationMetadata.teammates[0] = input.teammate0
  simulationMetadata.teammates[1] = input.teammate1
  simulationMetadata.teammates[2] = input.teammate2

  const orchestrator = await runDpsScoreBenchmarkOrchestrator(
    character,
    simulationMetadata,
    singleRelicByPart,
    showcaseTemporaryOptions,
  )
  const simScore = orchestrator.simulationScore!
  console.log(simScore.percent)
  console.log(simScore.originalSimScore)
  console.log(simScore.benchmarkSim.request)
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
