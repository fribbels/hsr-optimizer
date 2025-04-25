import { Sets, Stats } from 'lib/constants/constants'
import { expectBenchmarkResultsToMatch } from 'lib/simulations/tests/customBenchmark/benchmarkOrchestratorTestUtils'
import { generateE6S5Test, testCharacter, testMains, testSets, testStatSpread } from 'lib/simulations/tests/simTestUtils'
import {
  A_GROUNDED_ASCENT,
  BLACK_SWAN,
  FIREFLY,
  FLOWING_NIGHTGLOW,
  HUOHUO,
  INTO_THE_UNREACHABLE_VEIL,
  KAFKA,
  LINGSHA,
  MEMORIES_OF_THE_PAST,
  NIGHT_OF_FRIGHT,
  PAST_SELF_IN_MIRROR,
  PATIENCE_IS_ALL_YOU_NEED,
  REFORGED_REMEMBRANCE,
  ROBIN,
  RUAN_MEI,
  SCENT_ALONE_STAYS_TRUE,
  STELLE_HARMONY,
  STELLE_REMEMBRANCE,
  SUNDAY,
  SWEAT_NOW_CRY_LESS,
  THE_HERTA,
  WHEREABOUTS_SHOULD_DREAMS_REST,
} from 'lib/simulations/tests/testMetadataConstants'
import { Metadata } from 'lib/state/metadata'
import { test } from 'vitest'

Metadata.initialize()

test('Kafka benchmark 0', async () => {
  await expectBenchmarkResultsToMatch(
    0,
    generateE6S5Test({
      character: testCharacter(KAFKA, PATIENCE_IS_ALL_YOU_NEED),
      teammate0: testCharacter(BLACK_SWAN, REFORGED_REMEMBRANCE),
      teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement, Sets.FirmamentFrontlineGlamoth),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    2362779.75,
    2724628.75,
  )
})

test('Kafka benchmark 150', async () => {
  await expectBenchmarkResultsToMatch(
    150,
    generateE6S5Test({
      character: testCharacter(KAFKA, PATIENCE_IS_ALL_YOU_NEED),
      teammate0: testCharacter(BLACK_SWAN, REFORGED_REMEMBRANCE),
      teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement, Sets.FirmamentFrontlineGlamoth),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    2192571.75,
    2651803.75,
  )
})

test('Kafka benchmark 200', async () => {
  await expectBenchmarkResultsToMatch(
    200,
    generateE6S5Test({
      character: testCharacter(KAFKA, PATIENCE_IS_ALL_YOU_NEED),
      teammate0: testCharacter(BLACK_SWAN, REFORGED_REMEMBRANCE),
      teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement, Sets.FirmamentFrontlineGlamoth),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    1969118.75,
    2194457.25,
  )
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

test('Firefly benchmark 160', async () => {
  await expectBenchmarkResultsToMatch(
    160,
    generateE6S5Test({
      character: testCharacter(FIREFLY, WHEREABOUTS_SHOULD_DREAMS_REST),
      teammate0: testCharacter(STELLE_HARMONY, MEMORIES_OF_THE_PAST),
      teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
      teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
      sets: testSets(Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge, Sets.ForgeOfTheKalpagniLantern),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    3765406,
    4595097.5,
  )
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

test('The herta benchmark 100', async () => {
  await expectBenchmarkResultsToMatch(
    100,
    generateE6S5Test({
      character: testCharacter(THE_HERTA, INTO_THE_UNREACHABLE_VEIL),
      teammate0: testCharacter(STELLE_REMEMBRANCE, SWEAT_NOW_CRY_LESS),
      teammate1: testCharacter(SUNDAY, A_GROUNDED_ASCENT),
      teammate2: testCharacter(ROBIN, FLOWING_NIGHTGLOW),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.IzumoGenseiAndTakamaDivineRealm),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    2837405,
    3546020.5,
  )
})

test('The herta benchmark 100 err', async () => {
  await expectBenchmarkResultsToMatch(
    100,
    generateE6S5Test({
      character: testCharacter(THE_HERTA, INTO_THE_UNREACHABLE_VEIL),
      teammate0: testCharacter(STELLE_REMEMBRANCE, SWEAT_NOW_CRY_LESS),
      teammate1: testCharacter(SUNDAY, A_GROUNDED_ASCENT),
      teammate2: testCharacter(ROBIN, FLOWING_NIGHTGLOW),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.IzumoGenseiAndTakamaDivineRealm),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ERR),
      stats: testStatSpread(),
    }),
    2608734.5,
    3268191,
  )
})
