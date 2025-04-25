import { Sets, Stats } from 'lib/constants/constants'
import { expectBenchmarkResultsToMatch } from 'lib/simulations/tests/customBenchmark/benchmarkOrchestratorTestUtils'
import { generateE6S5Test, testCharacter, testMains, testSets, testStatSpread } from 'lib/simulations/tests/simTestUtils'
import { BLACK_SWAN, HUOHUO, KAFKA, NIGHT_OF_FRIGHT, PAST_SELF_IN_MIRROR, PATIENCE_IS_ALL_YOU_NEED, REFORGED_REMEMBRANCE, RUAN_MEI } from 'lib/simulations/tests/testMetadataConstants'
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

// test('Acheron benchmark', async () => {
//   await expectBenchmarkResultsToMatch(
//     generateE6S5Test({
//       character: testCharacter(ACHERON, ALONG_THE_PASSING_SHORE),
//       teammate0: testCharacter(PELA, RESOLUTION_SHINES_AS_PEARLS_OF_SWEAT),
//       teammate1: testCharacter(SILVER_WOLF, INCESSANT_RAIN),
//       teammate2: testCharacter(AVENTURINE, TREND_OF_THE_UNIVERSAL_MARKET),
//       sets: testSets(Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters, Sets.IzumoGenseiAndTakamaDivineRealm),
//       mains: testMains(Stats.CD, Stats.ATK_P, Stats.Lightning_DMG, Stats.ATK_P),
//       stats: testStatSpread(),
//     }),
//     1.2527343791677188,
//   )
// })
//
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// test('Castorice benchmark poet 113.4', async () => {
//   await expectBenchmarkResultsToMatch(
//     generateE6S5Test({
//       character: testCharacter(CASTORICE, MAKE_FAREWELLS_MORE_BEAUTIFUL),
//       teammate0: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
//       teammate1: testCharacter(STELLE_REMEMBRANCE, VICTORY_IN_A_BLINK),
//       teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
//       sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
//       mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
//       stats: testStatSpread(),
//     }),
//     0.7115087301725886,
//   )
// })
//
// test('Castorice benchmark poet 100.4', async () => {
//   await expectBenchmarkResultsToMatch(
//     generateE6S5Test({
//       character: testCharacter(CASTORICE, MAKE_FAREWELLS_MORE_BEAUTIFUL),
//       teammate0: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
//       teammate1: testCharacter(STELLE_REMEMBRANCE, VICTORY_IN_A_BLINK),
//       teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
//       sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
//       mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
//       stats: testStatSpreadSpd(5),
//     }),
//     0.9678187582469107,
//   )
// })
//
// test('Castorice benchmark poet 87.4', async () => {
//   await expectBenchmarkResultsToMatch(
//     generateE6S5Test({
//       character: testCharacter(CASTORICE, MAKE_FAREWELLS_MORE_BEAUTIFUL),
//       teammate0: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
//       teammate1: testCharacter(STELLE_REMEMBRANCE, VICTORY_IN_A_BLINK),
//       teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
//       sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
//       mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
//       stats: testStatSpreadSpd(0),
//     }),
//     1.145411776491712,
//   )
// })
//
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// test('Castorice benchmark longevous 121', async () => {
//   await expectBenchmarkResultsToMatch(
//     generateE6S5Test({
//       character: testCharacter(CASTORICE, MAKE_FAREWELLS_MORE_BEAUTIFUL),
//       teammate0: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
//       teammate1: testCharacter(STELLE_REMEMBRANCE, VICTORY_IN_A_BLINK),
//       teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
//       sets: testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne),
//       mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
//       stats: testStatSpread(),
//     }),
//     0.7295679289358679,
//   )
// })
//
// test('Castorice benchmark longevous 108', async () => {
//   await expectBenchmarkResultsToMatch(
//     generateE6S5Test({
//       character: testCharacter(CASTORICE, MAKE_FAREWELLS_MORE_BEAUTIFUL),
//       teammate0: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
//       teammate1: testCharacter(STELLE_REMEMBRANCE, VICTORY_IN_A_BLINK),
//       teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
//       sets: testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne),
//       mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
//       stats: testStatSpreadSpd(5),
//     }),
//     0.7295679289358679,
//   )
// })
//
// test('Castorice benchmark longevous 95', async () => {
//   await expectBenchmarkResultsToMatch(
//     generateE6S5Test({
//       character: testCharacter(CASTORICE, MAKE_FAREWELLS_MORE_BEAUTIFUL),
//       teammate0: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
//       teammate1: testCharacter(STELLE_REMEMBRANCE, VICTORY_IN_A_BLINK),
//       teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
//       sets: testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne),
//       mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
//       stats: testStatSpreadSpd(0),
//     }),
//     0.7295679289358679,
//   )
// })
//
// //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//
// test('Tribbie benchmark poet 88.3', async () => {
//   await expectBenchmarkResultsToMatch(
//     generateE6S5Test({
//       character: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
//       teammate0: testCharacter(THE_HERTA, INTO_THE_UNREACHABLE_VEIL),
//       teammate1: testCharacter(SERVAL, PASSKEY),
//       teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
//       sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
//       mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
//       stats: testStatSpreadSpd(0),
//     }),
//     0.9012144701511204,
//   )
// })
