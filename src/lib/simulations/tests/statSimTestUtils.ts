import { MainStats, Parts, Sets, SetsOrnaments, SetsRelics, Stats, SubStats } from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import { StatConfig, StatsConfig } from 'lib/optimization/config/computedStatsConfig'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { StatCalculator } from 'lib/relics/statCalculator'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import { Simulation, StatSimTypes } from 'lib/simulations/statSimulationTypes'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import DB from 'lib/state/db'
import { Metadata } from 'lib/state/metadata'
import { TsUtils } from 'lib/utils/TsUtils'
import { Form } from 'types/form'
import { Relic } from 'types/relic'
import { expect } from 'vitest'

export function expectWithinDelta(actual: number, expected: number, delta: number = 0.001): void {
  const difference = Math.abs(actual - expected)
  const pass = difference <= delta

  if (!pass) {
    throw new Error(`Expected ${actual} to be within ${delta} of ${expected} (difference: ${difference})`)
  }
}

Metadata.initialize()

export type TestCharacter = {
  characterId: string
  lightCone: string
  characterEidolon: number
  lightConeSuperimposition: number
}

export type TestCharacterBasic = {
  characterId: string
  lightCone: string
}

export type TestSets = {
  simRelicSet1: Sets
  simRelicSet2: Sets
  simOrnamentSet: Sets
}

export type TestStats = Record<string, number>

export type TestMains = {
  simBody: MainStats
  simFeet: MainStats
  simPlanarSphere: MainStats
  simLinkRope: MainStats
}

export type TestInput = {
  character: TestCharacter
  teammate0: TestCharacter
  teammate1: TestCharacter
  teammate2: TestCharacter
  sets: TestSets
  stats: TestStats
  mains: TestMains
}

export type TestInputBasic = {
  character: TestCharacterBasic
  teammate0: TestCharacterBasic
  teammate1: TestCharacterBasic
  teammate2: TestCharacterBasic
  sets: TestSets
  mains: TestMains
  stats: TestStats
}

export type TestResultByKey = Record<number, number>
export type TestResultByName = Record<string, number>

export function addTeammate(index: number, request: Form, character: TestCharacter) {
  const teammate = generateFullDefaultForm(
    character.characterId,
    character.lightCone,
    character.characterEidolon,
    character.lightConeSuperimposition,
    true,
  )

  if (index == 0) request.teammate0 = teammate
  if (index == 1) request.teammate1 = teammate
  if (index == 2) request.teammate2 = teammate
}

export function applyEidolonSuperimposition(input: TestInputBasic, e: number, s: number) {
  const modifiedInput = input as TestInput
  modifiedInput.character.characterEidolon = e
  modifiedInput.teammate0.characterEidolon = e
  modifiedInput.teammate1.characterEidolon = e
  modifiedInput.teammate2.characterEidolon = e
  modifiedInput.character.lightConeSuperimposition = s
  modifiedInput.teammate0.lightConeSuperimposition = s
  modifiedInput.teammate1.lightConeSuperimposition = s
  modifiedInput.teammate2.lightConeSuperimposition = s

  return modifiedInput
}

export function generateE0S1Test(input: TestInputBasic) {
  return applyEidolonSuperimposition(input, 0, 1)
}

export function generateE6S5Test(input: TestInputBasic) {
  return applyEidolonSuperimposition(input, 6, 5)
}

export function runTest(input: TestInput) {
  const { character, teammate0, teammate1, teammate2, sets, stats, mains } = input

  const form = generateFullDefaultForm(character.characterId, character.lightCone, character.characterEidolon, character.lightConeSuperimposition)
  addTeammate(0, form, teammate0)
  addTeammate(1, form, teammate1)
  addTeammate(2, form, teammate2)
  const context = generateContext(form)

  const simulation: Simulation = {
    simType: StatSimTypes.SubstatRolls,
    request: {
      ...sets,
      ...mains,
      stats: stats,
    },
  } as unknown as Simulation

  const simulationResult = runStatSimulations([simulation], form, context)[0]
  return simulationResult.x
}

export function testCharacter(characterId: string, lightCone: string): TestCharacterBasic {
  return { characterId, lightCone }
}

export function testSets(simRelicSet1: SetsRelics, simRelicSet2: SetsRelics, simOrnamentSet: SetsOrnaments): TestSets {
  return { simRelicSet1, simRelicSet2, simOrnamentSet }
}

export function testMains(simBody: MainStats, simFeet: MainStats, simPlanarSphere: MainStats, simLinkRope: MainStats): TestMains {
  return { simBody, simFeet, simPlanarSphere, simLinkRope }
}

export const trackedCombatStats: StatConfig[] = [
  StatsConfig.ATK,
  StatsConfig.DEF,
  StatsConfig.HP,
  StatsConfig.SPD,
  StatsConfig.CR,
  StatsConfig.CD,
  StatsConfig.EHR,
  StatsConfig.RES,
  StatsConfig.BE,
  StatsConfig.OHB,
  StatsConfig.ERR,
  StatsConfig.ELEMENTAL_DMG,
  StatsConfig.EHP,
  StatsConfig.HEAL_VALUE,
  StatsConfig.SHIELD_VALUE,
  StatsConfig.BASIC_DMG,
  StatsConfig.SKILL_DMG,
  StatsConfig.ULT_DMG,
  StatsConfig.FUA_DMG,
  StatsConfig.DOT_DMG,
  StatsConfig.BREAK_DMG,
  StatsConfig.MEMO_SKILL_DMG,
  StatsConfig.MEMO_TALENT_DMG,
  StatsConfig.COMBO_DMG,
]

export const trackedBasicStats: StatConfig[] = [
  StatsConfig.ATK,
  StatsConfig.DEF,
  StatsConfig.HP,
  StatsConfig.SPD,
  StatsConfig.CR,
  StatsConfig.CD,
  StatsConfig.EHR,
  StatsConfig.RES,
  StatsConfig.BE,
  StatsConfig.OHB,
  StatsConfig.ERR,
  StatsConfig.ELEMENTAL_DMG,
]

export function collectResults(input: TestInput) {
  const x = runTest(input)

  const keyCombatResults: TestResultByKey = {}
  const nameCombatResults: TestResultByName = {}

  const keyBasicResults: TestResultByKey = {}
  const nameBasicResults: TestResultByName = {}

  for (const stat of trackedCombatStats) {
    const value = TsUtils.precisionRound(x.a[stat.index], 7)

    keyCombatResults[stat.index] = value
    nameCombatResults[stat.name] = value
  }
  for (const stat of trackedBasicStats) {
    const value = TsUtils.precisionRound(x.c.a[stat.index], 7)

    keyBasicResults[stat.index] = value
    nameBasicResults[stat.name] = value
  }

  return testCase(input, nameBasicResults, nameCombatResults)
}

export function testCase(input: TestInputBasic, outputBasic: TestResultByName, outputCombat: TestResultByName) {
  return { input, outputBasic, outputCombat }
}

export function testStatSpread() {
  return {
    [Stats.ATK]: 10,
    [Stats.ATK_P]: 10,
    [Stats.DEF]: 10,
    [Stats.DEF_P]: 10,
    [Stats.HP]: 10,
    [Stats.HP_P]: 10,
    [Stats.SPD]: 10,
    [Stats.CR]: 10,
    [Stats.CD]: 10,
    [Stats.EHR]: 10,
    [Stats.RES]: 10,
    [Stats.BE]: 10,
  }
}

export function expectSimResultsToMatch(
  input: TestInput,
  expectedComboBasic: TestResultByName,
  expectedComboCombat: TestResultByName,
) {
  const results = collectResults(input)
  expectSingleResultsToMatch(results.outputBasic, expectedComboBasic, input, 'BASIC')
  expectSingleResultsToMatch(results.outputCombat, expectedComboCombat, input, 'COMBAT')
}

function expectSingleResultsToMatch(actual: TestResultByName, expected: TestResultByName, input: TestInput, view: string) {
  for (const [key, value] of Object.entries(expected)) {
    try {
      expect(actual[key]).toBeCloseTo(value)
    } catch (error: unknown) {
      // @ts-ignore
      const message = error.message
      throw new Error(`
${DB.getMetadata().characters[input.character.characterId].displayName} ${key} ${view}
${message}
${JSON.stringify(input, null, 2)}
      `)
    }
  }
}

export function generateTestSingleRelicsByPart(
  sets: TestSets,
  mains: TestMains,
  stats: TestStats,
): SingleRelicByPart {
  const relicsByPart = {
    [Parts.Head]: testRelic(sets.simRelicSet1, Stats.HP),
    [Parts.Hands]: testRelic(sets.simRelicSet1, Stats.ATK),
    [Parts.Body]: testRelic(sets.simRelicSet2, mains.simBody),
    [Parts.Feet]: testRelic(sets.simRelicSet2, mains.simFeet),
    [Parts.PlanarSphere]: testRelic(sets.simOrnamentSet, mains.simPlanarSphere),
    [Parts.LinkRope]: testRelic(sets.simOrnamentSet, mains.simLinkRope),
  }

  for (const [stat, value] of Object.entries(stats)) {
    const substat = stat as SubStats
    relicsByPart[Parts.Head].substats.push({
      stat: substat,
      value: StatCalculator.getMaxedSubstatValue(substat) * value,
    })
  }

  return relicsByPart
}

function testRelic(set: Sets, main: MainStats) {
  return {
    main: {
      stat: main,
    },
    set: set,
    substats: [],
  } as unknown as Relic
}
