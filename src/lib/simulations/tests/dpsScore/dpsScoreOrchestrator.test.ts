import { Sets, Stats } from 'lib/constants/constants'
import { expectBenchmarkResultsToMatch } from 'lib/simulations/tests/dpsScore/dpsScoreOrchestratorTestUtils'
import { generateE6S5Test, testCharacter, testMains, testSets, testStatSpread } from 'lib/simulations/tests/statSim/statSimTestUtils'
import {
  ACHERON,
  ALONG_THE_PASSING_SHORE,
  AVENTURINE,
  BLACK_SWAN,
  HUOHUO,
  INCESSANT_RAIN,
  KAFKA,
  NIGHT_OF_FRIGHT,
  PAST_SELF_IN_MIRROR,
  PATIENCE_IS_ALL_YOU_NEED,
  PELA,
  REFORGED_REMEMBRANCE,
  RESOLUTION_SHINES_AS_PEARLS_OF_SWEAT,
  RUAN_MEI,
  SILVER_WOLF,
  TREND_OF_THE_UNIVERSAL_MARKET,
} from 'lib/simulations/tests/testMetadataConstants'
import { Metadata } from 'lib/state/metadata'
import { test } from 'vitest'

Metadata.initialize()

test('Kafka benchmark', async () => {
  await expectBenchmarkResultsToMatch(
    generateE6S5Test({
      character: testCharacter(KAFKA, PATIENCE_IS_ALL_YOU_NEED),
      teammate0: testCharacter(BLACK_SWAN, REFORGED_REMEMBRANCE),
      teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement, Sets.FirmamentFrontlineGlamoth),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    1.0161751893878095,
  )
})

test('Acheron benchmark', async () => {
  await expectBenchmarkResultsToMatch(
    generateE6S5Test({
      character: testCharacter(ACHERON, ALONG_THE_PASSING_SHORE),
      teammate0: testCharacter(PELA, RESOLUTION_SHINES_AS_PEARLS_OF_SWEAT),
      teammate1: testCharacter(SILVER_WOLF, INCESSANT_RAIN),
      teammate2: testCharacter(AVENTURINE, TREND_OF_THE_UNIVERSAL_MARKET),
      sets: testSets(Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters, Sets.IzumoGenseiAndTakamaDivineRealm),
      mains: testMains(Stats.CD, Stats.ATK_P, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    1.2754714905646887,
  )
})
