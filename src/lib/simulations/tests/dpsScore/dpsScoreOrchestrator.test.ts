import { Sets, Stats } from 'lib/constants/constants'
import { expectDpsScoreResultsToMatch } from 'lib/simulations/tests/dpsScore/dpsScoreOrchestratorTestUtils'
import { generateE6S5Test, testCharacter, testMains, testSets, testStatSpread, testStatSpreadSpd } from 'lib/simulations/tests/simTestUtils'
import {
  ACHERON,
  ALONG_THE_PASSING_SHORE,
  AVENTURINE,
  BLACK_SWAN,
  CASTORICE,
  HUOHUO,
  IF_TIME_WERE_A_FLOWER,
  INCESSANT_RAIN,
  INTO_THE_UNREACHABLE_VEIL,
  KAFKA,
  LINGSHA,
  MAKE_FAREWELLS_MORE_BEAUTIFUL,
  NIGHT_OF_FRIGHT,
  PASSKEY,
  PAST_SELF_IN_MIRROR,
  PATIENCE_IS_ALL_YOU_NEED,
  PELA,
  REFORGED_REMEMBRANCE,
  RESOLUTION_SHINES_AS_PEARLS_OF_SWEAT,
  RUAN_MEI,
  SCENT_ALONE_STAYS_TRUE,
  SERVAL,
  SILVER_WOLF,
  STELLE_REMEMBRANCE,
  THE_HERTA,
  TREND_OF_THE_UNIVERSAL_MARKET,
  TRIBBIE,
  VICTORY_IN_A_BLINK,
} from 'lib/simulations/tests/testMetadataConstants'
import { Metadata } from 'lib/state/metadata'
import { test } from 'vitest'

Metadata.initialize()

test('Kafka benchmark', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(KAFKA, PATIENCE_IS_ALL_YOU_NEED),
      teammate0: testCharacter(BLACK_SWAN, REFORGED_REMEMBRANCE),
      teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement, Sets.FirmamentFrontlineGlamoth),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    1.0203937557056166,
  )
})

test('Kafka benchmarked 150 spd', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(KAFKA, PATIENCE_IS_ALL_YOU_NEED),
      teammate0: testCharacter(BLACK_SWAN, REFORGED_REMEMBRANCE),
      teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement, Sets.FirmamentFrontlineGlamoth),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    0.9889414593738484,
    150,
  )
})

test('Acheron benchmark', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(ACHERON, ALONG_THE_PASSING_SHORE),
      teammate0: testCharacter(PELA, RESOLUTION_SHINES_AS_PEARLS_OF_SWEAT),
      teammate1: testCharacter(SILVER_WOLF, INCESSANT_RAIN),
      teammate2: testCharacter(AVENTURINE, TREND_OF_THE_UNIVERSAL_MARKET),
      sets: testSets(Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters, Sets.IzumoGenseiAndTakamaDivineRealm),
      mains: testMains(Stats.CD, Stats.ATK_P, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    1.2527343791677188,
  )
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

test('Castorice benchmark poet 113.4', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(CASTORICE, MAKE_FAREWELLS_MORE_BEAUTIFUL),
      teammate0: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
      teammate1: testCharacter(STELLE_REMEMBRANCE, VICTORY_IN_A_BLINK),
      teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpread(),
    }),
    0.7115087301725886,
  )
})

test('Castorice benchmark poet 100.4', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(CASTORICE, MAKE_FAREWELLS_MORE_BEAUTIFUL),
      teammate0: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
      teammate1: testCharacter(STELLE_REMEMBRANCE, VICTORY_IN_A_BLINK),
      teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(5),
    }),
    0.9678187582469107,
  )
})

test('Castorice benchmark poet 87.4', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(CASTORICE, MAKE_FAREWELLS_MORE_BEAUTIFUL),
      teammate0: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
      teammate1: testCharacter(STELLE_REMEMBRANCE, VICTORY_IN_A_BLINK),
      teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(0),
    }),
    1.145411776491712,
  )
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

test('Castorice benchmark longevous 121', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(CASTORICE, MAKE_FAREWELLS_MORE_BEAUTIFUL),
      teammate0: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
      teammate1: testCharacter(STELLE_REMEMBRANCE, VICTORY_IN_A_BLINK),
      teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
      sets: testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpread(),
    }),
    0.7295679289358679,
  )
})

test('Castorice benchmark longevous 108', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(CASTORICE, MAKE_FAREWELLS_MORE_BEAUTIFUL),
      teammate0: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
      teammate1: testCharacter(STELLE_REMEMBRANCE, VICTORY_IN_A_BLINK),
      teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
      sets: testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(5),
    }),
    0.7295679289358679,
  )
})

test('Castorice benchmark longevous 95', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(CASTORICE, MAKE_FAREWELLS_MORE_BEAUTIFUL),
      teammate0: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
      teammate1: testCharacter(STELLE_REMEMBRANCE, VICTORY_IN_A_BLINK),
      teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
      sets: testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(0),
    }),
    0.7295679289358679,
  )
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

test('Tribbie benchmark poet 88.3', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
      teammate0: testCharacter(THE_HERTA, INTO_THE_UNREACHABLE_VEIL),
      teammate1: testCharacter(SERVAL, PASSKEY),
      teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(0),
    }),
    0.9012144701511204,
  )
})
