import {
  MainStats,
  Parts,
  Sets,
  SetsOrnaments,
  SetsRelics,
  Stats,
  SubStats,
} from 'lib/constants/constants'
import { SingleRelicByPart } from 'lib/gpu/webgpuTypes'
import {
  StatConfig,
  StatsConfig,
} from 'lib/optimization/config/computedStatsConfig'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { generateContext } from 'lib/optimization/context/calculateContext'
import { AbilityMeta } from 'lib/optimization/rotation/turnAbilityConfig'
import { StatCalculator } from 'lib/relics/statCalculator'
import { runStatSimulations } from 'lib/simulations/statSimulation'
import {
  RunStatSimulationsResult,
  Simulation,
  StatSimTypes,
} from 'lib/simulations/statSimulationTypes'
import { generateFullDefaultForm } from 'lib/simulations/utils/benchmarkForm'
import { TsUtils } from 'lib/utils/TsUtils'
import { CharacterId } from 'types/character'
import { Form } from 'types/form'
import { LightCone } from 'types/lightCone'
import { Relic } from 'types/relic'

export type SimTestUtils = {
  characterId: CharacterId,
  lightCone: LightCone['id'],
  characterEidolon: number,
  lightConeSuperimposition: number,
}
export type TestCharacterBasic = {
  characterId: string,
  lightCone: string,
}
export type TestSets = {
  simRelicSet1: Sets,
  simRelicSet2: Sets,
  simOrnamentSet: Sets,
}
export type TestStats = Record<string, number>
export type TestMains = {
  simBody: MainStats,
  simFeet: MainStats,
  simPlanarSphere: MainStats,
  simLinkRope: MainStats,
}
export type TestInput = {
  character: SimTestUtils,
  teammate0: SimTestUtils,
  teammate1: SimTestUtils,
  teammate2: SimTestUtils,
  sets: TestSets,
  stats: TestStats,
  mains: TestMains,
}
export type TestInputBasic = {
  character: TestCharacterBasic,
  teammate0: TestCharacterBasic,
  teammate1: TestCharacterBasic,
  teammate2: TestCharacterBasic,
  sets: TestSets,
  mains: TestMains,
  stats: TestStats,
}
export type TestResultByKey = Record<number, number>
export type TestResultByName = Record<string, number>

export function addTeammate(index: number, request: Form, character: SimTestUtils) {
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

export function runTest(input: TestInput): RunStatSimulationsResult {
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

  return runStatSimulations([simulation], form, context)[0]
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

// Only stats 0-14 (HP_P through OHB) have matching indices between StatsConfig and StatKey.
// Stats past OHB are populated manually in collectResults using StatKey / actionDamage / primaryActionStats.
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
  StatsConfig.PHYSICAL_DMG_BOOST,
  StatsConfig.FIRE_DMG_BOOST,
  StatsConfig.ICE_DMG_BOOST,
  StatsConfig.LIGHTNING_DMG_BOOST,
  StatsConfig.WIND_DMG_BOOST,
  StatsConfig.QUANTUM_DMG_BOOST,
  StatsConfig.IMAGINARY_DMG_BOOST,
]

export function collectResults(input: TestInput) {
  const result = runTest(input)
  const { x, primaryActionStats, actionDamage } = result

  const keyCombatResults: TestResultByKey = {}
  const nameCombatResults: TestResultByName = {}

  const keyBasicResults: TestResultByKey = {}
  const nameBasicResults: TestResultByName = {}

  // Stats 0-14 have matching indices between StatsConfig and StatKey
  for (const stat of trackedCombatStats) {
    const value = TsUtils.precisionRound(x.a[stat.index], 7)

    keyCombatResults[stat.index] = value
    nameCombatResults[stat.name] = value
  }

  // CR and CD display values include their respective _BOOST components
  if (primaryActionStats) {
    nameCombatResults['CR'] = TsUtils.precisionRound(primaryActionStats.sourceEntityCR, 7)
    nameCombatResults['CD'] = TsUtils.precisionRound(primaryActionStats.sourceEntityCD, 7)
  }

  // Total DMG% = generic DMG_BOOST (action+hit) + element-specific boost (action)
  if (primaryActionStats) {
    nameCombatResults['DMG_BOOST'] = TsUtils.precisionRound(
      primaryActionStats.DMG_BOOST + primaryActionStats.sourceEntityElementDmgBoost, 7,
    )
  }

  // EHP and COMBO_DMG via correct StatKey indices
  nameCombatResults['EHP'] = TsUtils.precisionRound(x.a[StatKey.EHP], 7)
  nameCombatResults['COMBO_DMG'] = TsUtils.precisionRound(x.a[StatKey.COMBO_DMG], 7)

  // Default all ability damage types to 0, then populate from actionDamage
  const damageAbilities = ['BASIC', 'SKILL', 'ULT', 'FUA', 'DOT', 'BREAK', 'MEMO_SKILL', 'MEMO_TALENT']
  for (const ability of damageAbilities) {
    nameCombatResults[`${ability}_DMG`] = 0
  }
  nameCombatResults['HEAL_VALUE'] = 0
  nameCombatResults['SHIELD_VALUE'] = 0

  if (actionDamage) {
    let healValue = 0
    let shieldValue = 0

    for (const [actionName, dmg] of Object.entries(actionDamage)) {
      // actionName is TurnAbilityName like 'DEFAULT_BASIC' - strip marker prefix to get AbilityKind
      const abilityKind = actionName.replace(/^[A-Z]+_/, '')
      const meta = AbilityMeta[abilityKind as keyof typeof AbilityMeta]

      if (meta?.category === 'heal') {
        healValue += dmg ?? 0
      } else if (meta?.category === 'shield') {
        shieldValue += dmg ?? 0
      } else if (meta?.category === 'damage') {
        nameCombatResults[`${abilityKind}_DMG`] = TsUtils.precisionRound(dmg ?? 0, 7)
      }
    }

    nameCombatResults['HEAL_VALUE'] = TsUtils.precisionRound(healValue, 7)
    nameCombatResults['SHIELD_VALUE'] = TsUtils.precisionRound(shieldValue, 7)
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

export function testStatSpread(count: number = 10) {
  return {
    [Stats.ATK]: 0,
    [Stats.ATK_P]: count,
    [Stats.DEF]: 0,
    [Stats.DEF_P]: count,
    [Stats.HP]: 0,
    [Stats.HP_P]: count,
    [Stats.SPD]: count,
    [Stats.CR]: count,
    [Stats.CD]: count,
    [Stats.EHR]: count,
    [Stats.RES]: count,
    [Stats.BE]: count,
  }
}

export function testStatSpreadSpd(spdRolls: number, count: number = 10) {
  const stats = testStatSpread(count)
  stats[Stats.SPD] = spdRolls
  return stats
}

export function generateTestSingleRelicsByPart(
  sets: TestSets,
  mains: TestMains,
  stats: TestStats,
): SingleRelicByPart {
  const relicsByPart = {
    [Parts.Head]: testRelic(sets.simRelicSet1, Stats.HP, Parts.Head),
    [Parts.Hands]: testRelic(sets.simRelicSet1, Stats.ATK, Parts.Hands),
    [Parts.Body]: testRelic(sets.simRelicSet2, mains.simBody, Parts.Body),
    [Parts.Feet]: testRelic(sets.simRelicSet2, mains.simFeet, Parts.Feet),
    [Parts.PlanarSphere]: testRelic(sets.simOrnamentSet, mains.simPlanarSphere, Parts.PlanarSphere),
    [Parts.LinkRope]: testRelic(sets.simOrnamentSet, mains.simLinkRope, Parts.LinkRope),
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

function testRelic(set: Sets, main: MainStats, part: Parts) {
  return {
    main: {
      stat: main,
      value: StatCalculator.getMaxedStatValue(main),
    },
    enhance: 15,
    grade: 5,
    set: set,
    part: part,
    substats: [],
  } as unknown as Relic
}
