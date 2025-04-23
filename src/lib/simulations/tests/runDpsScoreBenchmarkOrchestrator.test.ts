import { Metadata } from 'lib/state/metadata'
import { test } from 'vitest'

Metadata.initialize()

test('aa', () => {
  globalThis.SEQUENTIAL_BENCHMARKS = true
  // runDpsScoreBenchmarkOrchestrator(
  //   character,
  //   simulationMetadata,
  //   singleRelicByPart,
  //   showcaseTemporaryOptions,
  //   // character: Character,
  //   // simulationMetadata: SimulationMetadata,
  //   // singleRelicByPart: SingleRelicByPart,
  //   // showcaseTemporaryOptions: ShowcaseTemporaryOptions,
  // )
})
