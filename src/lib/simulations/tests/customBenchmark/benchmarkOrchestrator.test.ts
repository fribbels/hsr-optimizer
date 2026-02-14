import {
  Sets,
  Stats,
} from 'lib/constants/constants'
import { expectBenchmarkResultsToMatch } from 'lib/simulations/tests/customBenchmark/benchmarkOrchestratorTestUtils'
import {
  generateE6S5Test,
  testCharacter,
  testMains,
  testSets,
  testStatSpread,
} from 'lib/simulations/tests/simTestUtils'
import {
  A_GROUNDED_ASCENT,
  ANAXA,
  BLACK_SWAN,
  BOOTHILL,
  FIREFLY,
  FLOWING_NIGHTGLOW,
  HUOHUO,
  INTO_THE_UNREACHABLE_VEIL,
  KAFKA,
  LIFE_SHOULD_BE_CAST_TO_FLAMES,
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
  WHEREABOUTS_SHOULD_DREAMS_REST,
} from 'lib/simulations/tests/testMetadataConstants'
import { Metadata } from 'lib/state/metadata'
import { test } from 'vitest'

Metadata.initialize()

const TIMEOUT = 60000

test('Anaxa benchmark 0', async () => {
  await expectBenchmarkResultsToMatch(
    0,
    generateE6S5Test({
      character: testCharacter(ANAXA, LIFE_SHOULD_BE_CAST_TO_FLAMES),
      teammate0: testCharacter(SUNDAY, A_GROUNDED_ASCENT),
      teammate1: testCharacter(ROBIN, FLOWING_NIGHTGLOW),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    6395631.5,
    7782346,
  )
}, TIMEOUT)

test('Anaxa benchmark 133.333', async () => {
  await expectBenchmarkResultsToMatch(
    133.333,
    generateE6S5Test({
      character: testCharacter(ANAXA, LIFE_SHOULD_BE_CAST_TO_FLAMES),
      teammate0: testCharacter(SUNDAY, A_GROUNDED_ASCENT),
      teammate1: testCharacter(ROBIN, FLOWING_NIGHTGLOW),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    5640659,
    7212902,
  )
}, TIMEOUT)

test('Anaxa benchmark 200 captain', async () => {
  await expectBenchmarkResultsToMatch(
    200,
    generateE6S5Test({
      character: testCharacter(ANAXA, LIFE_SHOULD_BE_CAST_TO_FLAMES),
      teammate0: testCharacter(SUNDAY, A_GROUNDED_ASCENT),
      teammate1: testCharacter(ROBIN, FLOWING_NIGHTGLOW),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    4676874,
    5581103.5,
  )
}, TIMEOUT)

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
    1498006.1736582317,
    1704332.625,
  )
}, TIMEOUT)

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
    4879910,
    5954549.5,
  )
}, TIMEOUT)

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
    4654556,
    5781292.5,
  )
}, TIMEOUT)

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
    4252174.5,
    5328330.5,
  )
}, TIMEOUT)

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
}, TIMEOUT)
