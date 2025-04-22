import { Sets, Stats } from 'lib/constants/constants'
import { collectResults, generateE6S5Test, TestCase, testCharacter, testMains, testSets, testStatSpread } from 'lib/simulations/tests/statSimTestUtils'
import { BLACK_SWAN, HUOHUO, KAFKA, NIGHT_OF_FRIGHT, PAST_SELF_IN_MIRROR, PATIENCE_IS_ALL_YOU_NEED, REFORGED_REMEMBRANCE, RUAN_MEI } from 'lib/simulations/tests/testMetadataConstants'
import { Metadata } from 'lib/state/metadata'
import { test } from 'vitest'

Metadata.initialize()

test('testCalculateBuild2', () => {
  const testCases: TestCase[] = []

  testCases.push(collectResults(generateE6S5Test({
    character: testCharacter(KAFKA, PATIENCE_IS_ALL_YOU_NEED),
    teammate0: testCharacter(BLACK_SWAN, REFORGED_REMEMBRANCE),
    teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
    teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
    sets: testSets(Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement, Sets.FirmamentFrontlineGlamoth),
    mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
    stats: testStatSpread(),
  })))

  // testCases.push(collectResults(generateE6S5Test({
  //   character: testCharacter(KAFKA, PATIENCE_IS_ALL_YOU_NEED),
  //   teammate0: testCharacter(BLACK_SWAN, REFORGED_REMEMBRANCE),
  //   teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
  //   teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
  //   sets: testSets(Sets.PrisonerInDeepConfinement, Sets.PrisonerInDeepConfinement, Sets.FirmamentFrontlineGlamoth),
  //   mains: testMains(Stats.ATK_P, Stats.SPD, Stats.Lightning_DMG, Stats.ATK_P),
  //   stats: testStatSpread(),
  // })))

  console.log(JSON.stringify(testCases, null, 2))
})
