import {
  Sets,
  Stats,
} from 'lib/constants/constants'
import { expectDpsScoreResultsToMatch } from 'lib/simulations/tests/dpsScore/dpsScoreOrchestratorTestUtils'
import {
  generateE6S5Test,
  testCharacter,
  testMains,
  testSets,
  testStatSpread,
  testStatSpreadSpd,
} from 'lib/simulations/tests/simTestUtils'
import {
  A_GROUNDED_ASCENT,
  ACHERON,
  ALONG_THE_PASSING_SHORE,
  ANAXA,
  AVENTURINE,
  CASTORICE,
  FLOWING_NIGHTGLOW,
  HUOHUO,
  IF_TIME_WERE_A_FLOWER,
  INCESSANT_RAIN,
  INTO_THE_UNREACHABLE_VEIL,
  LIFE_SHOULD_BE_CAST_TO_FLAMES,
  LINGSHA,
  MAKE_FAREWELLS_MORE_BEAUTIFUL,
  NIGHT_OF_FRIGHT,
  PASSKEY,
  PELA,
  RESOLUTION_SHINES_AS_PEARLS_OF_SWEAT,
  ROBIN,
  SCENT_ALONE_STAYS_TRUE,
  SERVAL,
  SILVER_WOLF,
  STELLE_REMEMBRANCE,
  SUNDAY,
  THE_HERTA,
  TREND_OF_THE_UNIVERSAL_MARKET,
  TRIBBIE,
  VICTORY_IN_A_BLINK,
} from 'lib/simulations/tests/testMetadataConstants'
import { Metadata } from 'lib/state/metadata'
import { test } from 'vitest'

Metadata.initialize()

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

test('Anaxa benchmark', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(ANAXA, LIFE_SHOULD_BE_CAST_TO_FLAMES),
      teammate0: testCharacter(SUNDAY, A_GROUNDED_ASCENT),
      teammate1: testCharacter(ROBIN, FLOWING_NIGHTGLOW),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    1.3588397642515457,
  )
})

test('Anaxa benchmarked @ 0 spd', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(ANAXA, LIFE_SHOULD_BE_CAST_TO_FLAMES),
      teammate0: testCharacter(SUNDAY, A_GROUNDED_ASCENT),
      teammate1: testCharacter(ROBIN, FLOWING_NIGHTGLOW),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    0.8420648578813649,
    0,
  )
})

test('Anaxa benchmarked @ 133.333 spd', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(ANAXA, LIFE_SHOULD_BE_CAST_TO_FLAMES),
      teammate0: testCharacter(SUNDAY, A_GROUNDED_ASCENT),
      teammate1: testCharacter(ROBIN, FLOWING_NIGHTGLOW),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    1.1389148678971417,
    133.333,
  )
})

test('Anaxa benchmarked @ 200 spd', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(ANAXA, LIFE_SHOULD_BE_CAST_TO_FLAMES),
      teammate0: testCharacter(SUNDAY, A_GROUNDED_ASCENT),
      teammate1: testCharacter(ROBIN, FLOWING_NIGHTGLOW),
      teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    1.3588397642515457,
    200,
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

test('Tribbie benchmark poet 101.3', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
      teammate0: testCharacter(THE_HERTA, INTO_THE_UNREACHABLE_VEIL),
      teammate1: testCharacter(SERVAL, PASSKEY),
      teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(5),
    }),
    0.7594088297079464,
  )
})

test('Tribbie benchmark poet 114.3', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
      teammate0: testCharacter(THE_HERTA, INTO_THE_UNREACHABLE_VEIL),
      teammate1: testCharacter(SERVAL, PASSKEY),
      teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(10),
    }),
    0.48696862468070123,
  )
})

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

test('Tribbie benchmark poet 88.3 @ 88.3', async () => {
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
    88.3,
  )
})

test('Tribbie benchmark poet 101.3 @ 88.3', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
      teammate0: testCharacter(THE_HERTA, INTO_THE_UNREACHABLE_VEIL),
      teammate1: testCharacter(SERVAL, PASSKEY),
      teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(5),
    }),
    0.7415866588590724,
    88.3,
  )
})

test('Tribbie benchmark poet 114.3 @ 88.3', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
      teammate0: testCharacter(THE_HERTA, INTO_THE_UNREACHABLE_VEIL),
      teammate1: testCharacter(SERVAL, PASSKEY),
      teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(10),
    }),
    0.4755402113049463,
    88.3,
  )
})
