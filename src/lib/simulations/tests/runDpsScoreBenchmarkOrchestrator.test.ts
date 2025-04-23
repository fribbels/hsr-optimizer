import { Sets, Stats } from 'lib/constants/constants'
import { cloneComputedStatsArray } from 'lib/scoring/simScoringUtils'
import { runDpsScoreBenchmarkOrchestrator } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import { generateTestSingleRelicsByPart, testMains, testSets, testStatSpread } from 'lib/simulations/tests/statSimTestUtils'
import { KAFKA, PATIENCE_IS_ALL_YOU_NEED } from 'lib/simulations/tests/testMetadataConstants'
import DB from 'lib/state/db'
import { Metadata } from 'lib/state/metadata'
import { Character } from 'types/character'
import { test } from 'vitest'

Metadata.initialize()

test('aa', async () => {
  globalThis.SEQUENTIAL_BENCHMARKS = true

  const character = {
    form: {
      characterId: KAFKA,
      lightCone: PATIENCE_IS_ALL_YOU_NEED,
      characterEidolon: 6,
      lightConeSuperimposition: 5,
    },
  } as Character
  const sets = testSets(Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement, Sets.FirmamentFrontlineGlamoth)
  const mains = testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P)

  const simulationMetadata = DB.getMetadata().characters[KAFKA].scoringMetadata.simulation!
  const showcaseTemporaryOptions = { spdBenchmark: undefined }
  const singleRelicByPart = generateTestSingleRelicsByPart(sets, mains, testStatSpread())

  const orchestrator = await runDpsScoreBenchmarkOrchestrator(
    character,
    simulationMetadata,
    singleRelicByPart,
    showcaseTemporaryOptions,
  )

  const simScore = orchestrator.simulationScore!
  const x = cloneComputedStatsArray(simScore.originalSimResult.x)
  console.log(x.toComputedStatsObject())
  console.log(simScore.originalSimScore)
  console.log(simScore.percent)
})
