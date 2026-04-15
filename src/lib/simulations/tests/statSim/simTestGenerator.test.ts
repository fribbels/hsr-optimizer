// @vitest-environment jsdom
import { Huohuo } from 'lib/conditionals/character/1200/Huohuo'
import { Robin } from 'lib/conditionals/character/1300/Robin'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import { Anaxa } from 'lib/conditionals/character/1400/Anaxa'
import { AGroundedAscent } from 'lib/conditionals/lightcone/5star/AGroundedAscent'
import { FlowingNightglow } from 'lib/conditionals/lightcone/5star/FlowingNightglow'
import { LifeShouldBeCastToFlames } from 'lib/conditionals/lightcone/5star/LifeShouldBeCastToFlames'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import {
  Sets,
  Stats,
} from 'lib/constants/constants'
import {
  collectResults,
  generateE6S5Test,
  testCharacter,
  testMains,
  testSets,
  testStatSpread,
} from 'lib/simulations/tests/simTestUtils'
import { Metadata } from 'lib/state/metadataInitializer'
import { test } from 'vitest'

test('generateTest', () => {
  const run = false
  if (!run) {
    return
  }

  Metadata.initialize()

  const input = generateE6S5Test({
    character: testCharacter(Anaxa.id, LifeShouldBeCastToFlames.id),
    teammate0: testCharacter(Sunday.id, AGroundedAscent.id),
    teammate1: testCharacter(Robin.id, FlowingNightglow.id),
    teammate2: testCharacter(Huohuo.id, NightOfFright.id),
    sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
    mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
    stats: testStatSpread(),
  })
  const { outputBasic, outputCombat } = collectResults(input)

  console.log()
  console.log(JSON.stringify(outputBasic, null, 2) + ',')
  console.log(JSON.stringify(outputCombat, null, 2))
})
