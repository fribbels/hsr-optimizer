import { Sets, Stats } from 'lib/constants/constants'
import { expectBenchmarkResultsToMatch } from 'lib/simulations/tests/customBenchmark/benchmarkOrchestratorTestUtils'
import { generateE6S5Test, testCharacter, testMains, testSets, testStatSpread } from 'lib/simulations/tests/simTestUtils'
import {
  A_GROUNDED_ASCENT,
  BLACK_SWAN,
  BOOTHILL,
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
  SAILING_TOWARDS_A_SECOND_LIFE,
  SCENT_ALONE_STAYS_TRUE,
  STELLE_HARMONY,
  STELLE_REMEMBRANCE,
  SUNDAY,
  SWEAT_NOW_CRY_LESS,
  THE_HERTA,
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
    2704018,
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

test('Kafka benchmark 200 captain', async () => {
  await expectBenchmarkResultsToMatch(
    200,
    generateE6S5Test({
      character: testCharacter(KAFKA, PATIENCE_IS_ALL_YOU_NEED),
      teammate0: testCharacter(BLACK_SWAN, REFORGED_REMEMBRANCE),
      teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.WavestriderCaptain, Sets.WavestriderCaptain, Sets.FirmamentFrontlineGlamoth),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    1885952.625,
    2104143.25,
  )
})

test('Black Swan benchmark 0 captain', async () => {
  await expectBenchmarkResultsToMatch(
    0,
    generateE6S5Test({
      character: testCharacter(BLACK_SWAN, REFORGED_REMEMBRANCE),
      teammate0: testCharacter(KAFKA, PATIENCE_IS_ALL_YOU_NEED),
      teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.WavestriderCaptain, Sets.WavestriderCaptain, Sets.FirmamentFrontlineGlamoth),
      mains: testMains(Stats.ATK_P, Stats.ATK_P, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    2910233.691724067,
    3280864.25,
  )
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

// test('Firefly benchmark 160', async () => {
//   await expectBenchmarkResultsToMatch(
//     160,
//     generateE6S5Test({
//       character: testCharacter(FIREFLY, WHEREABOUTS_SHOULD_DREAMS_REST),
//       teammate0: testCharacter(STELLE_HARMONY, MEMORIES_OF_THE_PAST),
//       teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
//       teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
//       sets: testSets(Sets.IronCavalryAgainstTheScourge, Sets.IronCavalryAgainstTheScourge, Sets.ForgeOfTheKalpagniLantern),
//       mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
//       stats: testStatSpread(),
//     }),
//     3765406,
//     4595097.5,
//   )
// })

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

test('Boothill benchmark 0', async () => {
  await expectBenchmarkResultsToMatch(
    0,
    generateE6S5Test({
      character: testCharacter(BOOTHILL, SAILING_TOWARDS_A_SECOND_LIFE),
      teammate0: testCharacter(STELLE_HARMONY, MEMORIES_OF_THE_PAST),
      teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
      teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
      sets: testSets(Sets.ThiefOfShootingMeteor, Sets.WatchmakerMasterOfDreamMachinations, Sets.TaliaKingdomOfBanditry),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    6097738,
    7207996,
  )
})
