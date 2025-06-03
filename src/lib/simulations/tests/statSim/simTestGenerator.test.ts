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
import {
  A_GROUNDED_ASCENT,
  ANAXA,
  FLOWING_NIGHTGLOW,
  HUOHUO,
  LIFE_SHOULD_BE_CAST_TO_FLAMES,
  NIGHT_OF_FRIGHT,
  ROBIN,
  SUNDAY,
} from 'lib/simulations/tests/testMetadataConstants'
import { Metadata } from 'lib/state/metadata'
import { test } from 'vitest'

test('generateTest', () => {
  const run = false
  if (!run) {
    return
  }

  Metadata.initialize()

  const input = generateE6S5Test({
    character: testCharacter(ANAXA, LIFE_SHOULD_BE_CAST_TO_FLAMES),
    teammate0: testCharacter(SUNDAY, A_GROUNDED_ASCENT),
    teammate1: testCharacter(ROBIN, FLOWING_NIGHTGLOW),
    teammate2: testCharacter(HUOHUO, NIGHT_OF_FRIGHT),
    sets: testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
    mains: testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P),
    stats: testStatSpread(),
  })
  const { outputBasic, outputCombat } = collectResults(input)

  console.log()
  console.log(JSON.stringify(outputBasic, null, 2) + ',')
  console.log(JSON.stringify(outputCombat, null, 2))
})
