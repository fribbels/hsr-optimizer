// @vitest-environment jsdom
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { executeOrchestrator, prepareOrchestrator } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import {
  generateTestSingleRelicsByPart,
  testMains,
  testSets,
  testStatSpread,
} from 'lib/simulations/tests/simTestUtils'
import { clone } from 'lib/utils/objectUtils'
import { ScoringConfigType, type ScoringConfig, type SimulationMetadata } from 'types/metadata'
import type { Character } from 'types/character'
import { NULL_TURN_ABILITY_NAME } from 'lib/optimization/rotation/turnAbilityConfig'
import { Bronya } from 'lib/conditionals/character/1100/Bronya'
import { Sparkle } from 'lib/conditionals/character/1300/Sparkle'
import { Robin } from 'lib/conditionals/character/1300/Robin'
import { RuanMei } from 'lib/conditionals/character/1300/RuanMei'
import { Yaoguang } from 'lib/conditionals/character/1500/Yaoguang'
import { Metadata } from 'lib/state/metadataInitializer'
import { expect, test } from 'vitest'

void Bronya
void Sparkle
void Robin
void RuanMei
void Yaoguang

Metadata.initialize()

function bufferConfig(simulation: SimulationMetadata): ScoringConfig {
  return { configType: ScoringConfigType.BUFFER, simulation, scoringActionKey: 'BUFF' }
}

const supportSimulation: SimulationMetadata = {
  parts: {
    [Parts.Body]: [Stats.CD],
    [Parts.Feet]: [Stats.SPD],
    [Parts.PlanarSphere]: [Stats.HP_P, Stats.DEF_P],
    [Parts.LinkRope]: [Stats.ERR],
  },
  substats: [Stats.CD, Stats.SPD, Stats.RES, Stats.HP_P, Stats.DEF_P],
  comboTurnAbilities: [NULL_TURN_ABILITY_NAME],
  relicSets: [
    [Sets.SacerdosRelivedOrdeal, Sets.SacerdosRelivedOrdeal],
    [Sets.MessengerTraversingHackerspace, Sets.MessengerTraversingHackerspace],
  ],
  ornamentSets: [
    Sets.BrokenKeel,
    Sets.FleetOfTheAgeless,
    Sets.PenaconyLandOfTheDreams,
  ],
  teammates: [
    { characterId: '1309', lightCone: '23029', characterEidolon: 0, lightConeSuperimposition: 1 },
    { characterId: '1302', lightCone: '23016', characterEidolon: 0, lightConeSuperimposition: 1 },
    { characterId: '1304', lightCone: '23023', characterEidolon: 0, lightConeSuperimposition: 1 },
  ],
  deprioritizeBuffs: false,
}

test('Bronya support score prepare', () => {
  globalThis.SEQUENTIAL_BENCHMARKS = true

  const character = {
    form: {
      characterId: '1101',
      characterEidolon: 6,
      lightCone: '21003',
      lightConeSuperimposition: 5,
    },
  } as Character

  const singleRelicByPart = generateTestSingleRelicsByPart(
    testSets(Sets.SacerdosRelivedOrdeal, Sets.SacerdosRelivedOrdeal, Sets.BrokenKeel),
    testMains(Stats.CD, Stats.SPD, Stats.HP_P, Stats.ERR),
    testStatSpread(),
  )

  const orchestrator = prepareOrchestrator(
    character,
    bufferConfig(clone(supportSimulation)),
    singleRelicByPart,
    {},
  )

  console.log('Original sim score:', orchestrator.originalSimResult?.simScore)
  console.log('Context default actions:', orchestrator.context?.defaultActions?.map((a) => `${a.actionName}[type=${a.actionType}] hits=${a.hits?.length}`))
  expect(orchestrator.originalSimResult).toBeDefined()
  expect(orchestrator.originalSimResult!.simScore).toBeGreaterThan(0)
})

test('Bronya support score full benchmark', async () => {
  globalThis.SEQUENTIAL_BENCHMARKS = true

  const character = {
    form: {
      characterId: '1101',
      characterEidolon: 6,
      lightCone: '21003',
      lightConeSuperimposition: 5,
    },
  } as Character

  const singleRelicByPart = generateTestSingleRelicsByPart(
    testSets(Sets.SacerdosRelivedOrdeal, Sets.SacerdosRelivedOrdeal, Sets.BrokenKeel),
    testMains(Stats.CD, Stats.SPD, Stats.HP_P, Stats.ERR),
    testStatSpread(),
  )

  const orchestrator = prepareOrchestrator(
    character,
    bufferConfig(clone(supportSimulation)),
    singleRelicByPart,
    {},
  )

  await executeOrchestrator(orchestrator)

  console.log('Bronya support score percent:', orchestrator.percent)
  expect(orchestrator.percent).toBeDefined()
  expect(orchestrator.percent).toBeGreaterThan(0)
}, 60000)

test('Sparkle support score prepare', () => {
  globalThis.SEQUENTIAL_BENCHMARKS = true
  const character = { form: { characterId: '1306', characterEidolon: 6, lightCone: '23003', lightConeSuperimposition: 5 } } as Character
  const sparkleSimulation: SimulationMetadata = {
    parts: { [Parts.Body]: [Stats.CD], [Parts.Feet]: [Stats.SPD], [Parts.PlanarSphere]: [Stats.HP_P, Stats.DEF_P], [Parts.LinkRope]: [Stats.ERR] },
    substats: [Stats.CD, Stats.SPD, Stats.RES, Stats.HP_P, Stats.DEF_P],
    errRopeEidolon: 0,
    comboTurnAbilities: [NULL_TURN_ABILITY_NAME],
    relicSets: [[Sets.SacerdosRelivedOrdeal, Sets.SacerdosRelivedOrdeal], [Sets.MessengerTraversingHackerspace, Sets.MessengerTraversingHackerspace]],
    ornamentSets: [Sets.BrokenKeel, Sets.FleetOfTheAgeless, Sets.PenaconyLandOfTheDreams],
    teammates: [
      { characterId: '1308', lightCone: '23028', characterEidolon: 0, lightConeSuperimposition: 1 },
      { characterId: '1112', lightCone: '23016', characterEidolon: 0, lightConeSuperimposition: 1 },
      { characterId: '1225', lightCone: '23036', characterEidolon: 0, lightConeSuperimposition: 1 },
    ],
    deprioritizeBuffs: false,
  }
  const singleRelicByPart = generateTestSingleRelicsByPart(
    testSets(Sets.SacerdosRelivedOrdeal, Sets.SacerdosRelivedOrdeal, Sets.BrokenKeel),
    testMains(Stats.CD, Stats.SPD, Stats.HP_P, Stats.ERR),
    testStatSpread(),
  )
  const orchestrator = prepareOrchestrator(character, bufferConfig(clone(sparkleSimulation)), singleRelicByPart, {})
  expect(orchestrator.originalSimResult).toBeDefined()
  expect(orchestrator.originalSimResult!.simScore).toBeGreaterThan(0)
})

test('Robin support score prepare', () => {
  globalThis.SEQUENTIAL_BENCHMARKS = true
  const character = { form: { characterId: '1309', characterEidolon: 6, lightCone: '23026', lightConeSuperimposition: 5 } } as Character
  const robinSimulation: SimulationMetadata = {
    parts: { [Parts.Body]: [Stats.ATK_P], [Parts.Feet]: [Stats.ATK_P, Stats.SPD], [Parts.PlanarSphere]: [Stats.ATK_P], [Parts.LinkRope]: [Stats.ERR] },
    substats: [Stats.ATK_P, Stats.ATK, Stats.SPD, Stats.RES, Stats.HP_P],
    errRopeEidolon: 0,
    comboTurnAbilities: [NULL_TURN_ABILITY_NAME],
    relicSets: [[Sets.MessengerTraversingHackerspace, Sets.MessengerTraversingHackerspace]],
    ornamentSets: [Sets.FleetOfTheAgeless, Sets.BrokenKeel, Sets.PenaconyLandOfTheDreams, Sets.LushakaTheSunkenSeas],
    teammates: [
      { characterId: '1308', lightCone: '23028', characterEidolon: 0, lightConeSuperimposition: 1 },
      { characterId: '1112', lightCone: '23016', characterEidolon: 0, lightConeSuperimposition: 1 },
      { characterId: '1225', lightCone: '23036', characterEidolon: 0, lightConeSuperimposition: 1 },
    ],
    deprioritizeBuffs: false,
  }
  const singleRelicByPart = generateTestSingleRelicsByPart(
    testSets(Sets.MessengerTraversingHackerspace, Sets.MessengerTraversingHackerspace, Sets.FleetOfTheAgeless),
    testMains(Stats.ATK_P, Stats.ATK_P, Stats.ATK_P, Stats.ERR),
    testStatSpread(),
  )
  const orchestrator = prepareOrchestrator(character, bufferConfig(clone(robinSimulation)), singleRelicByPart, {})
  expect(orchestrator.originalSimResult).toBeDefined()
  expect(orchestrator.originalSimResult!.simScore).toBeGreaterThan(0)
})

test('RuanMei support score prepare', () => {
  globalThis.SEQUENTIAL_BENCHMARKS = true
  const character = { form: { characterId: '1303', characterEidolon: 6, lightCone: '23019', lightConeSuperimposition: 5 } } as Character
  const ruanMeiSimulation: SimulationMetadata = {
    parts: { [Parts.Body]: [Stats.HP_P, Stats.DEF_P], [Parts.Feet]: [Stats.SPD], [Parts.PlanarSphere]: [Stats.HP_P, Stats.DEF_P], [Parts.LinkRope]: [Stats.ERR, Stats.BE] },
    substats: [Stats.BE, Stats.SPD, Stats.RES, Stats.HP_P, Stats.DEF_P],
    errRopeEidolon: 0,
    breakpoints: { [Stats.BE]: 1.80 },
    comboTurnAbilities: [NULL_TURN_ABILITY_NAME],
    relicSets: [[Sets.ThiefOfShootingMeteor, Sets.ThiefOfShootingMeteor], [Sets.MessengerTraversingHackerspace, Sets.MessengerTraversingHackerspace]],
    ornamentSets: [Sets.BrokenKeel, Sets.PenaconyLandOfTheDreams, Sets.SprightlyVonwacq],
    teammates: [
      { characterId: '1308', lightCone: '23028', characterEidolon: 0, lightConeSuperimposition: 1 },
      { characterId: '1112', lightCone: '23016', characterEidolon: 0, lightConeSuperimposition: 1 },
      { characterId: '1225', lightCone: '23036', characterEidolon: 0, lightConeSuperimposition: 1 },
    ],
    deprioritizeBuffs: false,
  }
  const singleRelicByPart = generateTestSingleRelicsByPart(
    testSets(Sets.ThiefOfShootingMeteor, Sets.ThiefOfShootingMeteor, Sets.BrokenKeel),
    testMains(Stats.HP_P, Stats.SPD, Stats.HP_P, Stats.ERR),
    testStatSpread(),
  )
  const orchestrator = prepareOrchestrator(character, bufferConfig(clone(ruanMeiSimulation)), singleRelicByPart, {})
  expect(orchestrator.originalSimResult).toBeDefined()
  expect(orchestrator.originalSimResult!.simScore).toBeGreaterThan(0)
})

test('Yaoguang support score prepare', () => {
  globalThis.SEQUENTIAL_BENCHMARKS = true
  const character = { form: { characterId: '1502', characterEidolon: 6, lightCone: '23040', lightConeSuperimposition: 5 } } as Character
  const yaoguangSimulation: SimulationMetadata = {
    parts: { [Parts.Body]: [Stats.HP_P, Stats.DEF_P], [Parts.Feet]: [Stats.SPD], [Parts.PlanarSphere]: [Stats.HP_P, Stats.DEF_P], [Parts.LinkRope]: [Stats.ERR] },
    substats: [Stats.SPD, Stats.RES, Stats.HP_P, Stats.DEF_P, Stats.ATK_P],
    errRopeEidolon: 0,
    skipSpdEqualization: true,
    comboTurnAbilities: [NULL_TURN_ABILITY_NAME],
    relicSets: [[Sets.MessengerTraversingHackerspace, Sets.MessengerTraversingHackerspace]],
    ornamentSets: [Sets.BrokenKeel, Sets.PenaconyLandOfTheDreams, Sets.SprightlyVonwacq],
    teammates: [
      { characterId: '1308', lightCone: '23028', characterEidolon: 0, lightConeSuperimposition: 1 },
      { characterId: '1112', lightCone: '23016', characterEidolon: 0, lightConeSuperimposition: 1 },
      { characterId: '1225', lightCone: '23036', characterEidolon: 0, lightConeSuperimposition: 1 },
    ],
    deprioritizeBuffs: false,
  }
  const singleRelicByPart = generateTestSingleRelicsByPart(
    testSets(Sets.MessengerTraversingHackerspace, Sets.MessengerTraversingHackerspace, Sets.BrokenKeel),
    testMains(Stats.HP_P, Stats.SPD, Stats.HP_P, Stats.ERR),
    testStatSpread(),
  )
  const orchestrator = prepareOrchestrator(character, bufferConfig(clone(yaoguangSimulation)), singleRelicByPart, {})
  expect(orchestrator.originalSimResult).toBeDefined()
  expect(orchestrator.originalSimResult!.simScore).toBeGreaterThan(0)
})
