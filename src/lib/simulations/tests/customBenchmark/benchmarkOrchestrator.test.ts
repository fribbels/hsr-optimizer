// @vitest-environment jsdom
import { Kafka } from 'lib/conditionals/character/1000/Kafka'
import { Huohuo } from 'lib/conditionals/character/1200/Huohuo'
import { Lingsha } from 'lib/conditionals/character/1200/Lingsha'
import { BlackSwan } from 'lib/conditionals/character/1300/BlackSwan'
import { Boothill } from 'lib/conditionals/character/1300/Boothill'
import { Firefly } from 'lib/conditionals/character/1300/Firefly'
import { Robin } from 'lib/conditionals/character/1300/Robin'
import { RuanMei } from 'lib/conditionals/character/1300/RuanMei'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import { Anaxa } from 'lib/conditionals/character/1400/Anaxa'
import { TheHerta } from 'lib/conditionals/character/1400/TheHerta'
import { TrailblazerHarmonyStelle } from 'lib/conditionals/character/8000/TrailblazerHarmony'
import { TrailblazerRemembranceStelle } from 'lib/conditionals/character/8000/TrailblazerRemembrance'
import { MemoriesOfThePast } from 'lib/conditionals/lightcone/4star/MemoriesOfThePast'
import { SweatNowCryLess } from 'lib/conditionals/lightcone/4star/SweatNowCryLess'
import { AGroundedAscent } from 'lib/conditionals/lightcone/5star/AGroundedAscent'
import { FlowingNightglow } from 'lib/conditionals/lightcone/5star/FlowingNightglow'
import { IntotheUnreachableVeil } from 'lib/conditionals/lightcone/5star/IntotheUnreachableVeil'
import { LifeShouldBeCastToFlames } from 'lib/conditionals/lightcone/5star/LifeShouldBeCastToFlames'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import { PastSelfInTheMirror } from 'lib/conditionals/lightcone/5star/PastSelfInTheMirror'
import { PatienceIsAllYouNeed } from 'lib/conditionals/lightcone/5star/PatienceIsAllYouNeed'
import { ReforgedRemembrance } from 'lib/conditionals/lightcone/5star/ReforgedRemembrance'
import { SailingTowardsASecondLife } from 'lib/conditionals/lightcone/5star/SailingTowardsASecondLife'
import { ScentAloneStaysTrue } from 'lib/conditionals/lightcone/5star/ScentAloneStaysTrue'
import { WhereaboutsShouldDreamsRest } from 'lib/conditionals/lightcone/5star/WhereaboutsShouldDreamsRest'
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
import { Metadata } from 'lib/state/metadataInitializer'
import { test } from 'vitest'

Metadata.initialize()

const TIMEOUT = 60000

test('Anaxa benchmark 0', async () => {
  await expectBenchmarkResultsToMatch(
    0,
    generateE6S5Test({
      character: testCharacter(Anaxa.id, LifeShouldBeCastToFlames.id),
      teammate0: testCharacter(Sunday.id, AGroundedAscent.id),
      teammate1: testCharacter(Robin.id, FlowingNightglow.id),
      teammate2: testCharacter(Huohuo.id, NightOfFright.id),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    6395631.5,
    7783189.5,
  )
}, TIMEOUT)

test('Anaxa benchmark 133.333', async () => {
  await expectBenchmarkResultsToMatch(
    133.333,
    generateE6S5Test({
      character: testCharacter(Anaxa.id, LifeShouldBeCastToFlames.id),
      teammate0: testCharacter(Sunday.id, AGroundedAscent.id),
      teammate1: testCharacter(Robin.id, FlowingNightglow.id),
      teammate2: testCharacter(Huohuo.id, NightOfFright.id),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    5640659,
    7213742.5,
  )
}, TIMEOUT)

test('Anaxa benchmark 200 captain', async () => {
  await expectBenchmarkResultsToMatch(
    200,
    generateE6S5Test({
      character: testCharacter(Anaxa.id, LifeShouldBeCastToFlames.id),
      teammate0: testCharacter(Sunday.id, AGroundedAscent.id),
      teammate1: testCharacter(Robin.id, FlowingNightglow.id),
      teammate2: testCharacter(Huohuo.id, NightOfFright.id),
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
      character: testCharacter(BlackSwan.id, ReforgedRemembrance.id),
      teammate0: testCharacter(Kafka.id, PatienceIsAllYouNeed.id),
      teammate1: testCharacter(RuanMei.id, PastSelfInTheMirror.id),
      teammate2: testCharacter(Huohuo.id, NightOfFright.id),
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
      character: testCharacter(Firefly.id, WhereaboutsShouldDreamsRest.id),
      teammate0: testCharacter(TrailblazerHarmonyStelle.id, MemoriesOfThePast.id),
      teammate1: testCharacter(RuanMei.id, PastSelfInTheMirror.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
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
      character: testCharacter(TheHerta.id, IntotheUnreachableVeil.id),
      teammate0: testCharacter(TrailblazerRemembranceStelle.id, SweatNowCryLess.id),
      teammate1: testCharacter(Sunday.id, AGroundedAscent.id),
      teammate2: testCharacter(Robin.id, FlowingNightglow.id),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.IzumoGenseiAndTakamaDivineRealm),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    4654556,
    5781975.5,
  )
}, TIMEOUT)

test('The herta benchmark 100 err', async () => {
  await expectBenchmarkResultsToMatch(
    100,
    generateE6S5Test({
      character: testCharacter(TheHerta.id, IntotheUnreachableVeil.id),
      teammate0: testCharacter(TrailblazerRemembranceStelle.id, SweatNowCryLess.id),
      teammate1: testCharacter(Sunday.id, AGroundedAscent.id),
      teammate2: testCharacter(Robin.id, FlowingNightglow.id),
      sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.IzumoGenseiAndTakamaDivineRealm),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ERR),
      stats: testStatSpread(),
    }),
    4252174.5,
    5328960,
  )
}, TIMEOUT)

test('Boothill benchmark 0', async () => {
  await expectBenchmarkResultsToMatch(
    0,
    generateE6S5Test({
      character: testCharacter(Boothill.id, SailingTowardsASecondLife.id),
      teammate0: testCharacter(TrailblazerHarmonyStelle.id, MemoriesOfThePast.id),
      teammate1: testCharacter(RuanMei.id, PastSelfInTheMirror.id),
      teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
      sets: testSets(Sets.ThiefOfShootingMeteor, Sets.WatchmakerMasterOfDreamMachinations, Sets.TaliaKingdomOfBanditry),
      mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
      stats: testStatSpread(),
    }),
    6526830.5,
    7711471.5,
  )
}, TIMEOUT)
