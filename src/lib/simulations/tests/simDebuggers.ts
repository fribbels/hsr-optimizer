import { Sets, Stats } from 'lib/constants/constants'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import { generateE6S5Test, generateTestSingleRelicsByPart, testCharacter, testMains, testSets, testStatSpreadSpd } from 'lib/simulations/tests/simTestUtils'
import { I_SHALL_BE_MY_OWN_SWORD, IF_TIME_WERE_A_FLOWER, JINGLIU, LINGSHA, SCENT_ALONE_STAYS_TRUE, STELLE_REMEMBRANCE, TRIBBIE, VICTORY_IN_A_BLINK } from 'lib/simulations/tests/testMetadataConstants'
import DB from 'lib/state/db'
import { TsUtils } from 'lib/utils/TsUtils'

export function injectBenchmarkDebuggers() {
  // @ts-ignore
  globalThis.equipTestCharacter = equipTestCharacter
}

function equipTestCharacter() {
  const testInput = generateE6S5Test({
    character: testCharacter(JINGLIU, I_SHALL_BE_MY_OWN_SWORD),
    teammate0: testCharacter(TRIBBIE, IF_TIME_WERE_A_FLOWER),
    teammate1: testCharacter(STELLE_REMEMBRANCE, VICTORY_IN_A_BLINK),
    teammate2: testCharacter(LINGSHA, SCENT_ALONE_STAYS_TRUE),
    sets: testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne),
    mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
    stats: testStatSpreadSpd(0),
  })

  const simulationMetadata = DB.getMetadata().characters[testInput.character.characterId].scoringMetadata.simulation!

  DB.updateSimulationScoreOverrides(testInput.character.characterId, {
    ...simulationMetadata,
    teammates: [
      testInput.teammate0,
      testInput.teammate1,
      testInput.teammate2,
    ],
  })

  // @ts-ignore
  DB.addFromForm(testInput.character)

  const singleRelicByPart = generateTestSingleRelicsByPart(testInput.sets, testInput.mains, testInput.stats)
  singleRelicByPart.Head.substats = []
  singleRelicByPart.Hands.substats = []
  singleRelicByPart.Feet.substats = []
  singleRelicByPart.Body.substats = [
    { stat: Stats.BE, value: 64.8 },
    { stat: Stats.SPD, value: 26 },
    { stat: Stats.RES, value: 43.2 },
  ]
  singleRelicByPart.PlanarSphere.substats = [
    { stat: Stats.HP_P, value: 43.2 },
    { stat: Stats.ATK_P, value: 43.2 },
    { stat: Stats.DEF_P, value: 54 },
  ]
  singleRelicByPart.LinkRope.substats = [
    { stat: Stats.CR, value: 32.4 },
    { stat: Stats.CD, value: 64.8 },
    { stat: Stats.EHR, value: 43.2 },
  ]

  const relics = Object.values(singleRelicByPart)
    .map((relic) => {
      relic.id = TsUtils.uuid()
      relic.equippedBy = testInput.character.characterId
      return RelicAugmenter.augment(relic)
    })

  DB.setRelic(singleRelicByPart.Head)
  DB.setRelic(singleRelicByPart.Hands)
  DB.setRelic(singleRelicByPart.Body)
  DB.setRelic(singleRelicByPart.Feet)
  DB.setRelic(singleRelicByPart.PlanarSphere)
  DB.setRelic(singleRelicByPart.LinkRope)
}
