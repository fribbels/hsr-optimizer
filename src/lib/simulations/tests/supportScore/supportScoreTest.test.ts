// @vitest-environment jsdom
import { Bronya } from 'lib/conditionals/character/1100/Bronya'
import { Robin } from 'lib/conditionals/character/1300/Robin'
import { RuanMei } from 'lib/conditionals/character/1300/RuanMei'
import { SparkleB1 } from 'lib/conditionals/character/1300/SparkleB1'
import { RobinSummeretto } from 'lib/conditionals/character/1500/RobinSummeretto'
import { Yaoguang } from 'lib/conditionals/character/1500/Yaoguang'
import { RiseAndSing } from 'lib/conditionals/lightcone/5star/RiseAndSing'
import {
  Parts,
  Sets,
  Stats,
} from 'lib/constants/constants'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { SELF_ENTITY_INDEX } from 'lib/optimization/engine/config/tag'
import { NULL_TURN_ABILITY_NAME } from 'lib/optimization/rotation/turnAbilityConfig'
import {
  executeOrchestrator,
  prepareOrchestrator,
} from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import {
  generateTestSingleRelicsByPart,
  testMains,
  testSets,
  testStatSpread,
} from 'lib/simulations/tests/simTestUtils'
import { Metadata } from 'lib/state/metadataInitializer'
import { clone } from 'lib/utils/objectUtils'
import type { Character } from 'types/character'
import {
  type ScoringConfig,
  ScoringConfigType,
  type SimulationMetadata,
} from 'types/metadata'
import {
  expect,
  test,
} from 'vitest'

void Bronya
void SparkleB1
void Robin
void RuanMei
void Yaoguang
void RobinSummeretto

Metadata.initialize()

function bufferConfig(simulation: SimulationMetadata): ScoringConfig {
  return { configType: ScoringConfigType.BUFFER, simulation }
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

test('support score copies RES equalization target into pool flags', () => {
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
    testStatSpread(12),
  )

  const orchestrator = prepareOrchestrator(
    character,
    bufferConfig(clone(supportSimulation)),
    singleRelicByPart,
    {},
  )

  expect(orchestrator.flags.benchmarkBasicResTarget).toBeGreaterThanOrEqual(0.50)
  expect(orchestrator.poolComboStates!.length).toBeGreaterThan(0)

  for (const state of orchestrator.poolComboStates!) {
    expect(state.flags.benchmarkBasicResTarget).toBe(orchestrator.flags.benchmarkBasicResTarget)
  }
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
  expect(orchestrator.simulationScore!.baselineSimScore).toBe(orchestrator.baselineSimResult!.simScore)
}, 60000)

test('Sparkle support score prepare', () => {
  globalThis.SEQUENTIAL_BENCHMARKS = true
  const character = { form: { characterId: '1306b1', characterEidolon: 6, lightCone: '23003', lightConeSuperimposition: 5 } } as Character
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
    parts: { [Parts.Body]: [Stats.ATK_P], [Parts.Feet]: [Stats.ATK_P, Stats.SPD], [Parts.PlanarSphere]: [Stats.ATK_P], [Parts.LinkRope]: [Stats.ATK_P] },
    substats: [Stats.ATK_P, Stats.ATK, Stats.SPD, Stats.RES, Stats.HP_P],
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
    testMains(Stats.ATK_P, Stats.ATK_P, Stats.ATK_P, Stats.ATK_P),
    testStatSpread(),
  )
  const orchestrator = prepareOrchestrator(character, bufferConfig(clone(robinSimulation)), singleRelicByPart, {})
  expect(orchestrator.originalSimResult).toBeDefined()
  expect(orchestrator.originalSimResult!.simScore).toBeGreaterThan(0)
  expect(orchestrator.originalSim!.request.simFeet).toBe(Stats.ATK_P)
  expect(orchestrator.baselineSim!.request.simFeet).toBe(Stats.SPD)
  expect(orchestrator.zeroMainsStatResult).toBeDefined()
})

test('RuanMei support score prepare', () => {
  globalThis.SEQUENTIAL_BENCHMARKS = true
  const character = { form: { characterId: '1303', characterEidolon: 6, lightCone: '23019', lightConeSuperimposition: 5 } } as Character
  const ruanMeiSimulation: SimulationMetadata = {
    parts: {
      [Parts.Body]: [Stats.HP_P, Stats.DEF_P],
      [Parts.Feet]: [Stats.SPD],
      [Parts.PlanarSphere]: [Stats.HP_P, Stats.DEF_P],
      [Parts.LinkRope]: [Stats.ERR, Stats.BE],
    },
    substats: [Stats.BE, Stats.SPD, Stats.RES, Stats.HP_P, Stats.DEF_P],
    errRopeEidolon: 0,
    softBreakpoints: [
      { stat: Stats.BE, threshold: 1.80 },
    ],
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
    parts: {
      [Parts.Body]: [Stats.HP_P, Stats.DEF_P],
      [Parts.Feet]: [Stats.SPD],
      [Parts.PlanarSphere]: [Stats.HP_P, Stats.DEF_P],
      [Parts.LinkRope]: [Stats.ERR],
    },
    substats: [Stats.SPD, Stats.RES, Stats.HP_P, Stats.DEF_P, Stats.ATK_P],
    errRopeEidolon: 0,
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

function robinSummerettoSupportScore(characterEidolon: number, hpRolls: number = 10) {
  const character = {
    form: {
      characterId: RobinSummeretto.id,
      characterEidolon,
      lightCone: RiseAndSing.id,
      lightConeSuperimposition: 5,
    },
  } as Character

  const statSpread = testStatSpread()
  statSpread[Stats.HP_P] = hpRolls

  const singleRelicByPart = generateTestSingleRelicsByPart(
    testSets(Sets.WorldRemakingDeliverer, Sets.WorldRemakingDeliverer, Sets.LushakaTheSunkenSeas),
    testMains(Stats.HP_P, Stats.SPD, Stats.HP_P, Stats.HP_P),
    statSpread,
  )

  return prepareOrchestrator(
    character,
    bufferConfig(clone(RobinSummeretto.scoring.supportSimulation!)),
    singleRelicByPart,
    {},
  )
}

test('RobinSummeretto support score prepare', () => {
  globalThis.SEQUENTIAL_BENCHMARKS = true

  const orchestrator = robinSummerettoSupportScore(6)

  expect(orchestrator.originalSimResult).toBeDefined()
  expect(orchestrator.originalSimResult!.simScore).toBeGreaterThan(0)
  expect(orchestrator.baselineSim!.request.simFeet).toBe(Stats.SPD)
})

test('RobinSummeretto support score scales with HP', () => {
  globalThis.SEQUENTIAL_BENCHMARKS = true

  // Her ATK buff is a percentage of her own HP, so the buff output must track HP monotonically
  const lowHp = robinSummerettoSupportScore(6, 0)
  const highHp = robinSummerettoSupportScore(6, 20)

  expect(highHp.originalSimResult!.simScore).toBeGreaterThan(lowHp.originalSimResult!.simScore)
})

test('RobinSummeretto support score applies the Deviated Chord Vibes scaling', () => {
  globalThis.SEQUENTIAL_BENCHMARKS = true

  // Vibes cap at 50 below E2 and 70 from E2 onward, so the default Vibes differ by 10 across these
  // two builds while HP stays identical. Deviated Chord grants 0.4% of her HP per Vibe, and the flat
  // Lushaka contribution cancels out of the difference.
  const e1 = robinSummerettoSupportScore(1)
  const e6 = robinSummerettoSupportScore(6)

  const hp = e6.originalSimResult!.x.getActionValueByIndex(StatKey.HP, SELF_ENTITY_INDEX)
  expect(e1.originalSimResult!.x.getActionValueByIndex(StatKey.HP, SELF_ENTITY_INDEX)).toBeCloseTo(hp, 6)
  expect(e6.originalSimResult!.simScore - e1.originalSimResult!.simScore).toBeCloseTo(10 * 0.004 * hp, 6)
})
