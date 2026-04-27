// @vitest-environment jsdom
import { Huohuo } from 'lib/conditionals/character/1200/Huohuo'
import { Lingsha } from 'lib/conditionals/character/1200/Lingsha'
import { Robin } from 'lib/conditionals/character/1300/Robin'
import { Sunday } from 'lib/conditionals/character/1300/Sunday'
import { Anaxa } from 'lib/conditionals/character/1400/Anaxa'
import { Castorice } from 'lib/conditionals/character/1400/Castorice'
import { Tribbie } from 'lib/conditionals/character/1400/Tribbie'
import { TrailblazerRemembranceStelle } from 'lib/conditionals/character/8000/TrailblazerRemembrance'
import { VictoryInABlink } from 'lib/conditionals/lightcone/4star/VictoryInABlink'
import { AGroundedAscent } from 'lib/conditionals/lightcone/5star/AGroundedAscent'
import { FlowingNightglow } from 'lib/conditionals/lightcone/5star/FlowingNightglow'
import { IfTimeWereAFlower } from 'lib/conditionals/lightcone/5star/IfTimeWereAFlower'
import { LifeShouldBeCastToFlames } from 'lib/conditionals/lightcone/5star/LifeShouldBeCastToFlames'
import { MakeFarewellsMoreBeautiful } from 'lib/conditionals/lightcone/5star/MakeFarewellsMoreBeautiful'
import { NightOfFright } from 'lib/conditionals/lightcone/5star/NightOfFright'
import { ScentAloneStaysTrue } from 'lib/conditionals/lightcone/5star/ScentAloneStaysTrue'
import {
  Sets,
  Stats,
} from 'lib/constants/constants'
import { prepareOrchestrator } from 'lib/simulations/orchestrator/runDpsScoreBenchmarkOrchestrator'
import {
  generateE6S5Test,
  generateTestSingleRelicsByPart,
  testCharacter,
  testMains,
  testSets,
  testStatSpread,
} from 'lib/simulations/tests/simTestUtils'
import { getGameMetadata } from 'lib/state/gameMetadata'
import { Metadata } from 'lib/state/metadataInitializer'
import { clone } from 'lib/utils/objectUtils'
import { type Character } from 'types/character'
import type { CharacterId } from 'types/character'
import {
  describe,
  expect,
  test,
} from 'vitest'

Metadata.initialize()

function buildOrchestrator(
  characterId: string,
  lightConeId: string,
  teammates: ReturnType<typeof testCharacter>[],
  userSets: ReturnType<typeof testSets>,
  mains: ReturnType<typeof testMains>,
  stats: ReturnType<typeof testStatSpread>,
  spdBenchmark?: number,
) {
  const input = generateE6S5Test({
    character: testCharacter(characterId, lightConeId),
    teammate0: testCharacter(teammates[0].characterId, teammates[0].lightCone),
    teammate1: testCharacter(teammates[1].characterId, teammates[1].lightCone),
    teammate2: testCharacter(teammates[2].characterId, teammates[2].lightCone),
    sets: userSets,
    mains,
    stats,
  })

  const character = { form: { ...input.character } } as Character
  const simulationMetadata = clone(getGameMetadata().characters[characterId as CharacterId].scoringMetadata.simulation!)
  simulationMetadata.teammates[0] = input.teammate0
  simulationMetadata.teammates[1] = input.teammate1
  simulationMetadata.teammates[2] = input.teammate2

  const singleRelicByPart = generateTestSingleRelicsByPart(input.sets, input.mains, input.stats)
  return prepareOrchestrator(character, simulationMetadata, singleRelicByPart, { spdBenchmark })
}

// Castorice default metadata: Poet + BoneCollection
// Anaxa default metadata: Scholar + RutilantArena

const castoriceTeammates = [
  testCharacter(Tribbie.id, IfTimeWereAFlower.id),
  testCharacter(TrailblazerRemembranceStelle.id, VictoryInABlink.id),
  testCharacter(Lingsha.id, ScentAloneStaysTrue.id),
]

const anaxaTeammates = [
  testCharacter(Sunday.id, AGroundedAscent.id),
  testCharacter(Robin.id, FlowingNightglow.id),
  testCharacter(Huohuo.id, NightOfFright.id),
]

const castoriceDefaultMains = testMains(Stats.CD, Stats.HP_P, Stats.Quantum_DMG, Stats.HP_P)
const anaxaDefaultMains = testMains(Stats.CD, Stats.SPD, Stats.Wind_DMG, Stats.ATK_P)

describe('Pool SPD targeting', () => {
  test('Default=Poet, User=Poet (same sets) — pool deduplicates to 1', () => {
    const o = buildOrchestrator(
      Castorice.id, MakeFarewellsMoreBeautiful.id, castoriceTeammates,
      testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      castoriceDefaultMains, testStatSpread(),
    )
    expect(o.poolComboStates).toHaveLength(1)
    expect(o.poolComboStates![0].flags.simPoetActive).toBe(true)
  })

  test('Poet as secondary metadata match — user equips Poet on non-Poet-primary character, pool=1 with Poet SPD targeting', () => {
    // Anaxa's primary metadata set is Scholar, but Poet is listed as a secondary alternative.
    // When user equips Poet, calculateSimSets matches it from metadata → default becomes Poet → dedup to 1.
    const o = buildOrchestrator(
      Anaxa.id, LifeShouldBeCastToFlames.id, anaxaTeammates,
      testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.RutilantArena),
      anaxaDefaultMains, testStatSpread(),
    )
    expect(o.poolComboStates).toHaveLength(1)
    expect(o.poolComboStates![0].flags.simPoetActive).toBe(true)
    expect(o.poolComboStates![0].basicSpdTarget).toBeLessThan(110)
  })

  test('Default=Poet, User=Normal (same ornament) — pool=2, different SPD targets', () => {
    const o = buildOrchestrator(
      Castorice.id, MakeFarewellsMoreBeautiful.id, castoriceTeammates,
      testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne),
      castoriceDefaultMains, testStatSpread(),
    )
    expect(o.poolComboStates).toHaveLength(2)

    const poetEntry = o.poolComboStates!.find((s) => s.flags.simPoetActive)
    const normalEntry = o.poolComboStates!.find((s) => !s.flags.simPoetActive)
    expect(poetEntry).toBeDefined()
    expect(normalEntry).toBeDefined()
    expect(poetEntry!.combatSpdTarget).not.toEqual(normalEntry!.combatSpdTarget)
  })

  test('Default=Poet, User=Normal (different ornament) — pool=4 cross-products with both Poet and non-Poet', () => {
    const o = buildOrchestrator(
      Castorice.id, MakeFarewellsMoreBeautiful.id, castoriceTeammates,
      testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.RutilantArena),
      castoriceDefaultMains, testStatSpread(),
    )
    expect(o.poolComboStates).toHaveLength(4)

    const poetEntries = o.poolComboStates!.filter((s) => s.flags.simPoetActive)
    const normalEntries = o.poolComboStates!.filter((s) => !s.flags.simPoetActive)
    expect(poetEntries.length).toBeGreaterThanOrEqual(1)
    expect(normalEntries.length).toBeGreaterThanOrEqual(1)
  })

  test('Default=Normal, User=Normal (different sets) — each entry gets own baseline and SPD state', () => {
    const o = buildOrchestrator(
      Anaxa.id, LifeShouldBeCastToFlames.id, anaxaTeammates,
      testSets(Sets.MessengerTraversingHackerspace, Sets.MessengerTraversingHackerspace, Sets.RutilantArena),
      anaxaDefaultMains, testStatSpread(),
    )
    expect(o.poolComboStates!.length).toBeGreaterThan(1)

    for (const state of o.poolComboStates!) {
      expect(state.flags.simPoetActive).toBe(false)
    }

    // Messenger and Scholar entries have different set bonuses → different baseline scores
    const messengerEntry = o.poolComboStates!.find((s) =>
      s.sets.relicSet1 === Sets.MessengerTraversingHackerspace,
    )
    const scholarEntry = o.poolComboStates!.find((s) =>
      s.sets.relicSet1 === Sets.ScholarLostInErudition,
    )
    expect(messengerEntry).toBeDefined()
    expect(scholarEntry).toBeDefined()
    expect(messengerEntry!.baselineScore).not.toEqual(scholarEntry!.baselineScore)

    // Non-Poet targets equal originalSpd — same for both since basicSpdTarget doesn't depend on set
    expect(messengerEntry!.basicSpdTarget).toBeCloseTo(o.originalSpd!, 1)
    expect(scholarEntry!.basicSpdTarget).toBeCloseTo(o.originalSpd!, 1)
  })

  test('spdBenchmark override is respected by pool entries', () => {
    const o = buildOrchestrator(
      Castorice.id, MakeFarewellsMoreBeautiful.id, castoriceTeammates,
      testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne),
      castoriceDefaultMains, testStatSpread(),
      90,
    )
    expect(o.poolComboStates).toHaveLength(2)

    const normalEntry = o.poolComboStates!.find((s) => !s.flags.simPoetActive)!
    expect(normalEntry.basicSpdTarget).toBeLessThanOrEqual(90)
  })

  test('Default=Normal, User=Normal (identical) — dedup to pool=1', () => {
    const o = buildOrchestrator(
      Anaxa.id, LifeShouldBeCastToFlames.id, anaxaTeammates,
      testSets(Sets.ScholarLostInErudition, Sets.ScholarLostInErudition, Sets.RutilantArena),
      anaxaDefaultMains, testStatSpread(),
    )
    expect(o.poolComboStates).toHaveLength(1)
    expect(o.poolComboStates![0].flags.simPoetActive).toBe(false)
  })

  test('Poet entry uses Poet breakpoint SPD targeting (< 95 threshold)', () => {
    // Castorice with Poet at 0 SPD rolls — baseline SPD should be well below 95
    const o = buildOrchestrator(
      Castorice.id, MakeFarewellsMoreBeautiful.id, castoriceTeammates,
      testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      castoriceDefaultMains, testStatSpread(0),
    )
    const poetState = o.poolComboStates![0]
    expect(poetState.flags.simPoetActive).toBe(true)
    // Poet breakpoint targeting should push basicSpdTarget below 95
    expect(poetState.basicSpdTarget).toBeLessThan(95)
  })

  test('Non-Poet entry targets originalSpd regardless of default being Poet', () => {
    const o = buildOrchestrator(
      Castorice.id, MakeFarewellsMoreBeautiful.id, castoriceTeammates,
      testSets(Sets.LongevousDisciple, Sets.LongevousDisciple, Sets.BoneCollectionsSereneDemesne),
      castoriceDefaultMains, testStatSpread(),
    )
    const normalEntry = o.poolComboStates!.find((s) => !s.flags.simPoetActive)
    expect(normalEntry).toBeDefined()
    // Non-Poet targeting: basicSpdTarget = min(originalSpd, spdBenchmark ?? originalSpd)
    // Should equal originalSpd since no spdBenchmark override
    expect(normalEntry!.basicSpdTarget).toBeCloseTo(o.originalSpd!, 1)
  })

  test('Pool combatSpdTarget matches default when sets are identical', () => {
    // Verify the always-recompute path produces the same result as the default path
    const o = buildOrchestrator(
      Castorice.id, MakeFarewellsMoreBeautiful.id, castoriceTeammates,
      testSets(Sets.PoetOfMourningCollapse, Sets.PoetOfMourningCollapse, Sets.BoneCollectionsSereneDemesne),
      castoriceDefaultMains, testStatSpread(),
    )
    expect(o.poolComboStates).toHaveLength(1)
    expect(o.poolComboStates![0].combatSpdTarget).toBeCloseTo(o.benchmarkCombatSpdTarget!, 5)
  })
})
