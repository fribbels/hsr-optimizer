import { Sets, Stats } from 'lib/constants/constants'
import { collectResults, generateE6S5Test, testCharacter, testMains, testSets, testStatSpread } from 'lib/simulations/tests/simTestUtils'
import { BRONYA, BUT_THE_BATTLE_ISNT_OVER, HUOHUO, I_SHALL_BE_MY_OWN_SWORD, JINGLIU, NIGHT_OF_FRIGHT, PAST_SELF_IN_MIRROR, RUAN_MEI } from 'lib/simulations/tests/testMetadataConstants'
import { Metadata } from 'lib/state/metadata'
import { test } from 'vitest'

test('generateTest', () => {
  if (!process.env._JETBRAINS_VITEST_REPORTER_ABSOLUTE_PATH) {
    return
  }

  Metadata.initialize()

  const input = generateE6S5Test({
    character: testCharacter(JINGLIU, I_SHALL_BE_MY_OWN_SWORD),
    teammate0: testCharacter(BRONYA, BUT_THE_BATTLE_ISNT_OVER),
    teammate1: testCharacter(RUAN_MEI, PAST_SELF_IN_MIRROR),
    teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
    sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
    mains: testMains(Stats.CD, Stats.ATK_P, Stats.Ice_DMG, Stats.ATK_P),
    stats: testStatSpread(),
  })
  const { outputBasic, outputCombat } = collectResults(input)

  console.log()
  console.log(JSON.stringify(outputBasic, null, 2) + ',')
  console.log(JSON.stringify(outputCombat, null, 2))
})
