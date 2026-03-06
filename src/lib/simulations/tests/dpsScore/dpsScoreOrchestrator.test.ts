// @vitest-environment jsdom
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
import { SilverWolf } from 'lib/conditionals/character/1000/SilverWolf'
import { Huohuo } from 'lib/conditionals/character/1200/Huohuo'
import { Lingsha } from 'lib/conditionals/character/1200/Lingsha'
import { Pela } from 'lib/conditionals/character/1100/Pela'
import { Serval } from 'lib/conditionals/character/1100/Serval'
import { Acheron } from 'lib/conditionals/character/1300/Acheron'
import { Aventurine } from 'lib/conditionals/character/1300/Aventurine'
import { Robin } from 'lib/conditionals/character/1300/Robin'
import { RuanMei } from 'lib/conditionals/character/1300/RuanMei'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import { Anaxa } from 'lib/conditionals/character/1400/Anaxa'
import { Castorice } from 'lib/conditionals/character/1400/Castorice'
import { TheHerta } from 'lib/conditionals/character/1400/TheHerta'
import { Tribbie } from 'lib/conditionals/character/1400/Tribbie'
import { TrailblazerRemembranceStelle } from 'lib/conditionals/character/8000/TrailblazerRemembrance'
import { Passkey } from 'lib/conditionals/lightcone/3star/Passkey'
import { ResolutionShinesAsPearlsOfSweat } from 'lib/conditionals/lightcone/4star/ResolutionShinesAsPearlsOfSweat'
import { TrendOfTheUniversalMarket } from 'lib/conditionals/lightcone/4star/TrendOfTheUniversalMarket'
import { VictoryInABlink } from 'lib/conditionals/lightcone/4star/VictoryInABlink'
import { AGroundedAscent } from 'lib/conditionals/lightcone/5star/AGroundedAscent'
import { AlongThePassingShore } from 'lib/conditionals/lightcone/5star/AlongThePassingShore'
import { FlowingNightglow } from 'lib/conditionals/lightcone/5star/FlowingNightglow'
import { IfTimeWereAFlower } from 'lib/conditionals/lightcone/5star/IfTimeWereAFlower'
import { IncessantRain } from 'lib/conditionals/lightcone/5star/IncessantRain'
import { IntotheUnreachableVeil } from 'lib/conditionals/lightcone/5star/IntotheUnreachableVeil'
import { LifeShouldBeCastToFlames } from 'lib/conditionals/lightcone/5star/LifeShouldBeCastToFlames'
import { MakeFarewellsMoreBeautiful } from 'lib/conditionals/lightcone/5star/MakeFarewellsMoreBeautiful'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import { ScentAloneStaysTrue } from 'lib/conditionals/lightcone/5star/ScentAloneStaysTrue'
import { Metadata } from 'lib/state/metadataInitializer'
import { test } from 'vitest'

Metadata.initialize()

const TIMEOUT = 60000

test('Acheron benchmark', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Acheron.id, AlongThePassingShore.id),
      teammate0: testCharacter(Pela.id, ResolutionShinesAsPearlsOfSweat.id),
      teammate1: testCharacter(SilverWolf.id, IncessantRain.id),
      teammate2: testCharacter(Aventurine.id, TrendOfTheUniversalMarket.id),
      sets: testSets(Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters, Sets.IzumoGenseiAndTakamaDivineRealm),
      mains: testMains(Stats.CD, Stats.ATK_P, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    1.2527343791677188,
  )
}, TIMEOUT)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

test('Anaxa benchmark', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Anaxa.id, LifeShouldBeCastToFlames.id),
      teammate0: testCharacter(Sunday.id, AGroundedAscent.id),
      teammate1: testCharacter(Robin.id, FlowingNightglow.id),
      teammate2: testCharacter(Huohuo.id, NightOfFright.id),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    1.358472235588175,
  )
}, TIMEOUT)

test('Anaxa benchmarked @ 0 spd', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Anaxa.id, LifeShouldBeCastToFlames.id),
      teammate0: testCharacter(Sunday.id, AGroundedAscent.id),
      teammate1: testCharacter(Robin.id, FlowingNightglow.id),
      teammate2: testCharacter(Huohuo.id, NightOfFright.id),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    0.8420648578813649,
    0,
  )
}, TIMEOUT)

test('Anaxa benchmarked @ 133.333 spd', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Anaxa.id, LifeShouldBeCastToFlames.id),
      teammate0: testCharacter(Sunday.id, AGroundedAscent.id),
      teammate1: testCharacter(Robin.id, FlowingNightglow.id),
      teammate2: testCharacter(Huohuo.id, NightOfFright.id),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    1.1385434694255276,
    133.333,
  )
}, TIMEOUT)

test('Anaxa benchmarked @ 200 spd', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Anaxa.id, LifeShouldBeCastToFlames.id),
      teammate0: testCharacter(Sunday.id, AGroundedAscent.id),
      teammate1: testCharacter(Robin.id, FlowingNightglow.id),
      teammate2: testCharacter(Huohuo.id, NightOfFright.id),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    1.358472235588175,
    200,
  )
}, TIMEOUT)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

test('Castorice benchmark poet 113.4', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Castorice.id, MakeFarewellsMoreBeautiful.id),
      teammate0: testCharacter(Tribbie.id, IfTimeWereAFlower.id),
      teammate1: testCharacter(TrailblazerRemembranceStelle.id, VictoryInABlink.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpread(),
    }),
    0.7115087301725886,
  )
}, TIMEOUT)

test('Castorice benchmark poet 100.4', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Castorice.id, MakeFarewellsMoreBeautiful.id),
      teammate0: testCharacter(Tribbie.id, IfTimeWereAFlower.id),
      teammate1: testCharacter(TrailblazerRemembranceStelle.id, VictoryInABlink.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(5),
    }),
    0.9678187582469107,
  )
}, TIMEOUT)

test('Castorice benchmark poet 87.4', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Castorice.id, MakeFarewellsMoreBeautiful.id),
      teammate0: testCharacter(Tribbie.id, IfTimeWereAFlower.id),
      teammate1: testCharacter(TrailblazerRemembranceStelle.id, VictoryInABlink.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(0),
    }),
    1.145411776491712,
  )
}, TIMEOUT)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

test('Castorice benchmark longevous 121', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Castorice.id, MakeFarewellsMoreBeautiful.id),
      teammate0: testCharacter(Tribbie.id, IfTimeWereAFlower.id),
      teammate1: testCharacter(TrailblazerRemembranceStelle.id, VictoryInABlink.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
      sets: testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpread(),
    }),
    0.7295679289358679,
  )
}, TIMEOUT)

test('Castorice benchmark longevous 108', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Castorice.id, MakeFarewellsMoreBeautiful.id),
      teammate0: testCharacter(Tribbie.id, IfTimeWereAFlower.id),
      teammate1: testCharacter(TrailblazerRemembranceStelle.id, VictoryInABlink.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
      sets: testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(5),
    }),
    0.7295679289358679,
  )
}, TIMEOUT)

test('Castorice benchmark longevous 95', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Castorice.id, MakeFarewellsMoreBeautiful.id),
      teammate0: testCharacter(Tribbie.id, IfTimeWereAFlower.id),
      teammate1: testCharacter(TrailblazerRemembranceStelle.id, VictoryInABlink.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
      sets: testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(0),
    }),
    0.7295679289358679,
  )
}, TIMEOUT)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

test('Tribbie benchmark poet 88.3', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Tribbie.id, IfTimeWereAFlower.id),
      teammate0: testCharacter(TheHerta.id, IntotheUnreachableVeil.id),
      teammate1: testCharacter(Serval.id, Passkey.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(0),
    }),
    0.9012144701511204,
  )
}, TIMEOUT)

test('Tribbie benchmark poet 101.3', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Tribbie.id, IfTimeWereAFlower.id),
      teammate0: testCharacter(TheHerta.id, IntotheUnreachableVeil.id),
      teammate1: testCharacter(Serval.id, Passkey.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(5),
    }),
    0.7594088297079464,
  )
}, TIMEOUT)

test('Tribbie benchmark poet 114.3', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Tribbie.id, IfTimeWereAFlower.id),
      teammate0: testCharacter(TheHerta.id, IntotheUnreachableVeil.id),
      teammate1: testCharacter(Serval.id, Passkey.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(10),
    }),
    0.48696862468070123,
  )
}, TIMEOUT)

//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

test('Tribbie benchmark poet 88.3 @ 88.3', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Tribbie.id, IfTimeWereAFlower.id),
      teammate0: testCharacter(TheHerta.id, IntotheUnreachableVeil.id),
      teammate1: testCharacter(Serval.id, Passkey.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(0),
    }),
    0.9012144701511204,
    88.3,
  )
}, TIMEOUT)

test('Tribbie benchmark poet 101.3 @ 88.3', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Tribbie.id, IfTimeWereAFlower.id),
      teammate0: testCharacter(TheHerta.id, IntotheUnreachableVeil.id),
      teammate1: testCharacter(Serval.id, Passkey.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(5),
    }),
    0.7415866588590724,
    88.3,
  )
}, TIMEOUT)

test('Tribbie benchmark poet 114.3 @ 88.3', async () => {
  await expectDpsScoreResultsToMatch(
    generateE6S5Test({
      character: testCharacter(Tribbie.id, IfTimeWereAFlower.id),
      teammate0: testCharacter(TheHerta.id, IntotheUnreachableVeil.id),
      teammate1: testCharacter(Serval.id, Passkey.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
      sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
      stats: testStatSpreadSpd(10),
    }),
    0.4755402113049463,
    88.3,
  )
}, TIMEOUT)
