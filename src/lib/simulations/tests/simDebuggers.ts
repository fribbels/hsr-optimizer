import { Lingsha } from 'lib/conditionals/character/1200/Lingsha'
import { Castorice } from 'lib/conditionals/character/1400/Castorice'
import { Tribbie } from 'lib/conditionals/character/1400/Tribbie'
import { TrailblazerRemembranceStelle } from 'lib/conditionals/character/8000/TrailblazerRemembrance'
import { VictoryInABlink } from 'lib/conditionals/lightcone/4star/VictoryInABlink'
import { IfTimeWereAFlower } from 'lib/conditionals/lightcone/5star/IfTimeWereAFlower'
import { MakeFarewellsMoreBeautiful } from 'lib/conditionals/lightcone/5star/MakeFarewellsMoreBeautiful'
import { ScentAloneStaysTrue } from 'lib/conditionals/lightcone/5star/ScentAloneStaysTrue'
import {
  Sets,
  Stats,
} from 'lib/constants/constants'
import { RelicAugmenter } from 'lib/relics/relicAugmenter'
import * as equipmentService from 'lib/services/equipmentService'
import * as persistenceService from 'lib/services/persistenceService'
import {
  generateE6S5Test,
  generateTestSingleRelicsByPart,
  testCharacter,
  testMains,
  testSets,
  testStatSpread,
} from 'lib/simulations/tests/simTestUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { SaveState } from 'lib/state/saveState'
import { useScoringStore } from 'lib/stores/scoring/scoringStore'
import { uuid } from 'lib/utils/miscUtils'
import { ScoringConfigType } from 'types/metadata'

export function injectBenchmarkDebuggers() {
  // @ts-expect-error - Injecting debug helper onto globalThis for dev tooling
  globalThis.equipTestCharacter = equipTestCharacter
}

function equipTestCharacter() {
  const testInput = generateE6S5Test({
    character: testCharacter(Castorice.id, MakeFarewellsMoreBeautiful.id),
    teammate0: testCharacter(Tribbie.id, IfTimeWereAFlower.id),
    teammate1: testCharacter(TrailblazerRemembranceStelle.id, VictoryInABlink.id),
    teammate2: testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
    sets: testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
    mains: testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P),
    stats: testStatSpread(),
  })

  const simulationMetadata = getGameMetadata().characters[testInput.character.characterId].scoringMetadata.simulation!

  useScoringStore.getState().updateScoringConfigOverride(testInput.character.characterId, ScoringConfigType.DPS, {
    ...simulationMetadata,
    teammates: [
      testInput.teammate0,
      testInput.teammate1,
      testInput.teammate2,
    ],
  })
  SaveState.delayedSave()

  // @ts-expect-error - Test helper passes partial character data
  persistenceService.upsertCharacterFromForm(testInput.character)
  SaveState.delayedSave()

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

  Object.values(singleRelicByPart)
    .forEach((relic) => {
      relic.id = uuid()
      relic.equippedBy = testInput.character.characterId
      RelicAugmenter.augment(relic)
    })

  equipmentService.upsertRelicWithEquipment(singleRelicByPart.Head)
  equipmentService.upsertRelicWithEquipment(singleRelicByPart.Hands)
  equipmentService.upsertRelicWithEquipment(singleRelicByPart.Body)
  equipmentService.upsertRelicWithEquipment(singleRelicByPart.Feet)
  equipmentService.upsertRelicWithEquipment(singleRelicByPart.PlanarSphere)
  equipmentService.upsertRelicWithEquipment(singleRelicByPart.LinkRope)
}
