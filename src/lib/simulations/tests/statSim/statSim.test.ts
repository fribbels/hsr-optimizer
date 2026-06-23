// @vitest-environment jsdom
import { FuXuan } from 'lib/conditionals/character/1200/FuXuan'
import { HuohuoB1 } from 'lib/conditionals/character/1200/HuohuoB1'
import { Jiaoqiu } from 'lib/conditionals/character/1200/Jiaoqiu'
import { Acheron } from 'lib/conditionals/character/1300/Acheron'
import { Robin } from 'lib/conditionals/character/1300/Robin'
import { SparkleB1 } from 'lib/conditionals/character/1300/SparkleB1'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import { Anaxa } from 'lib/conditionals/character/1400/Anaxa'
import { AGroundedAscent } from 'lib/conditionals/lightcone/5star/AGroundedAscent'
import { AlongThePassingShore } from 'lib/conditionals/lightcone/5star/AlongThePassingShore'
import { EarthlyEscapade } from 'lib/conditionals/lightcone/5star/EarthlyEscapade'
import { FlowingNightglow } from 'lib/conditionals/lightcone/5star/FlowingNightglow'
import { LifeShouldBeCastToFlames } from 'lib/conditionals/lightcone/5star/LifeShouldBeCastToFlames'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import { SheAlreadyShutHerEyes } from 'lib/conditionals/lightcone/5star/SheAlreadyShutHerEyes'
import { ThoseManySprings } from 'lib/conditionals/lightcone/5star/ThoseManySprings'
import {
  Sets,
  Stats,
} from 'lib/constants/constants'
import {
  generateE6S5Test,
  testCharacter,
  testMains,
  testSets,
  testStatSpread,
} from 'lib/simulations/tests/simTestUtils'
import { expectSimResultsToMatch } from 'lib/simulations/tests/statSim/statSimTestUtils'
import { Metadata } from 'lib/state/metadataInitializer'
import { test } from 'vitest'

Metadata.initialize()

test('Anaxa sim', () => {
  expectSimResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Anaxa.id, LifeShouldBeCastToFlames.id),
      teammate0: testCharacter(Sunday.id, AGroundedAscent.id),
      teammate1: testCharacter(Robin.id, FlowingNightglow.id),
      teammate2: testCharacter(HuohuoB1.id, NightOfFright.id),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    {
      ATK: 2848.4648438,
      DEF: 1674.0800781,
      HP: 3651.2683105,
      SPD: 148.0319977,
      CR: 0.654,
      CD: 1.796,
      EHR: 0.432,
      RES: 0.432,
      BE: 0.648,
      OHB: 0,
      ERR: 0,
      WIND_DMG_BOOST: 0.6128,
    },
    {
      ATK: 5822.3603516,
      DEF: 1674.0800781,
      HP: 3651.2683105,
      SPD: 175.1921082,
      CR: 1.314,
      CD: 5.0139999,
      EHR: 0.432,
      RES: 0.932,
      BE: 0.648,
      OHB: 0,
      ERR: 0,
      BOOST: 6.0868,
      EHP: 8966.4990234,
      HEAL_VALUE: 0,
      SHIELD_VALUE: 0,
      BASIC_DMG: 352794.5246537,
      SKILL_DMG: 1359471.2947962,
      ULT_DMG: 564471.2394459,
      FUA_DMG: 0,
      DOT_DMG: 0,
      BREAK_DMG: 46384.46875,
      MEMO_SKILL_DMG: 0,
      MEMO_TALENT_DMG: 0,
      COMBO_DMG: 5858482.8126597,
    },
  )
})

test('Acheron sim', () => {
  expectSimResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Acheron.id, AlongThePassingShore.id),
      teammate0: testCharacter(Jiaoqiu.id, ThoseManySprings.id),
      teammate1: testCharacter(SparkleB1.id, EarthlyEscapade.id),
      teammate2: testCharacter(FuXuan.id, SheAlreadyShutHerEyes.id),
      sets: testSets(Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters, Sets.IzumoGenseiAndTakamaDivineRealm),
      mains: testMains(Stats.CD, Stats.ATK_P, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    {
      ATK: 3948.1425781,
      DEF: 1283.574585,
      HP: 3832.8474121,
      SPD: 127,
      CR: 0.414,
      CD: 2.6359999,
      EHR: 0.432,
      RES: 0.432,
      BE: 0.648,
      OHB: 0,
      ERR: 0,
      LIGHTNING_DMG_BOOST: 0.4688,
    },
    {
      ATK: 5081.6889781,
      DEF: 1283.574585,
      HP: 4360.8474121,
      SPD: 127,
      CR: 1.026,
      CD: 5.6319999,
      EHR: 0.432,
      RES: 0.432,
      BE: 0.648,
      OHB: 0,
      ERR: 0,
      BOOST: 2.8388,
      EHP: 32793.9415686,
      HEAL_VALUE: 0,
      SHIELD_VALUE: 0,
      BASIC_DMG: 522981.5629506,
      SKILL_DMG: 836770.500721,
      ULT_DMG: 2623275.5197605,
      FUA_DMG: 0,
      DOT_DMG: 0,
      BREAK_DMG: 34608.8620462,
      MEMO_SKILL_DMG: 0,
      MEMO_TALENT_DMG: 0,
      COMBO_DMG: 4296816.5212025,
    },
  )
})

// test('Jingliu scholar preprocessor sim', () => {
//   expectSimResultsToMatch(
//     generateE6S5Test({
//       character: testCharacter(JINGLIU, I_SHALL_BE_MY_OWN_SWORD),
//       teammate0: testCharacter(BRONYA, BUT_THE_BATTLE_ISNT_OVER),
//       teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
//       teammate2: testCharacter(HuohuoB1.id, NightOfFright.id),
//       sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
//       mains: testMains(Stats.CD, Stats.ATK_P, Stats.Ice_DMG, Stats.ATK_P),
//       stats: testStatSpread(),
//     }),
//     {
//       ATK: 3248.652832,
//       DEF: 1358.2800293,
//       HP: 4689.0083008,
//       SPD: 131,
//       CR: 0.534,
//       CD: 2.4890001,
//       EHR: 0.432,
//       RES: 0.432,
//       BE: 0.648,
//       OHB: 0,
//       ERR: 0,
//       ICE_DMG_BOOST: 0.3888,
//     },
//     {
//       ATK: 7670.6303711,
//       DEF: 1358.2800293,
//       HP: 4689.0083008,
//       SPD: 152.5041046,
//       CR: 1.0539999,
//       CD: 3.8650002,
//       EHR: 0.432,
//       RES: 0.782,
//       BE: 0.848,
//       OHB: 0,
//       ERR: 0,
//       BOOST: 4.0468001,
//       EHP: 10227.2568359,
//       HEAL_VALUE: 0,
//       SHIELD_VALUE: 0,
//       BASIC_DMG: 145666.828125,
//       SKILL_DMG: 614899.625,
//       ULT_DMG: 582882.125,
//       FUA_DMG: 0,
//       DOT_DMG: 0,
//       BREAK_DMG: 16481.2050781,
//       MEMO_SKILL_DMG: 0,
//       MEMO_TALENT_DMG: 0,
//       COMBO_DMG: 2380257.75,
//     },
//   )
// })
