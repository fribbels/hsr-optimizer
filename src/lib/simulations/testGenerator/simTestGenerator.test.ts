import { Sets, Stats } from 'lib/constants/constants'
import { collectResults, generateE6S5Test, testCharacter, testMains, testSets, testStatSpread } from 'lib/simulations/tests/statSim/statSimTestUtils'
import { ACHERON, ALONG_THE_PASSING_SHORE, EARTHLY_ESCAPADE, FU_XUAN, JIAOQIU, SHE_ALREADY_SHUT_HER_EYES, SPARKLE, THOSE_MANY_SPRINGS } from 'lib/simulations/tests/testMetadataConstants'
import { test } from 'vitest'

test('generateTest', () => {
  const input = generateE6S5Test({
    character: testCharacter(ACHERON, ALONG_THE_PASSING_SHORE),
    teammate0: testCharacter(JIAOQIU, THOSE_MANY_SPRINGS),
    teammate1: testCharacter(SPARKLE, EARTHLY_ESCAPADE),
    teammate2: testCharacter(FU_XUAN, SHE_ALREADY_SHUT_HER_EYES),
    sets: testSets(Sets.PioneerDiverOfDeadWaters, Sets.PioneerDiverOfDeadWaters, Sets.IzumoGenseiAndTakamaDivineRealm),
    mains: testMains(Stats.CD, Stats.ATK_P, Stats.Lightning_DMG, Stats.ATK_P),
    stats: testStatSpread(),
  })
  const { outputBasic, outputCombat } = collectResults(input)

  console.log()
  console.log(JSON.stringify(outputBasic, null, 2) + ',')
  console.log(JSON.stringify(outputCombat, null, 2))
})
