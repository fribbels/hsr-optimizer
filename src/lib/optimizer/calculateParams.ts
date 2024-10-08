import { Constants, ElementToDamage, ElementToResPenType, Stats } from 'lib/constants'
import DB from 'lib/db'
import { CharacterStats } from 'lib/characterStats'
import { defaultSetConditionals } from 'lib/defaultForm'
import { emptyLightCone } from 'lib/optimizer/optimizerUtils'
import { Form } from 'types/Form'
import { calculateConditionals, ConditionalRegistry } from 'lib/optimizer/calculateConditionals.ts'
import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { LightConeConditional } from 'types/LightConeConditionals'
import { CharacterConditional } from 'types/CharacterConditional'

export type CharacterStats = {
  base: { [key: string]: number }
  lightCone: { [key: string]: number }
  traces: { [key: string]: number }
}

export type OptimizerParams = {
  element: string
  ELEMENTAL_BREAK_SCALING: number
  ELEMENTAL_DMG_TYPE: string
  RES_PEN_TYPE: string
  brokenMultiplier: number
  character: CharacterStats
  baseHP: number
  baseATK: number
  baseDEF: number
  baseSPD: number
  resistance: number
  enabledHunterOfGlacialForest: number
  enabledFiresmithOfLavaForging: number
  enabledGeniusOfBrilliantStars: number
  enabledBandOfSizzlingThunder: number
  enabledMessengerTraversingHackerspace: number
  enabledCelestialDifferentiator: number
  enabledWatchmakerMasterOfDreamMachinations: number
  enabledIzumoGenseiAndTakamaDivineRealm: number
  enabledForgeOfTheKalpagniLantern: number
  enabledTheWindSoaringValorous: number
  enabledTheWondrousBananAmusementPark: number
  enabledScholarLostInErudition: number
  valueChampionOfStreetwiseBoxing: number
  valueWastelanderOfBanditryDesert: number
  valueLongevousDisciple: number
  valueTheAshblazingGrandDuke: number
  valuePrisonerInDeepConfinement: number
  valuePioneerDiverOfDeadWaters: number
  valueSigoniaTheUnclaimedDesolation: number
  valueDuranDynastyOfRunningWolves: number
  precomputedX: ComputedStatsObject
  characterConditionals: CharacterConditional
  lightConeConditionals: LightConeConditional
  conditionalRegistry: ConditionalRegistry
  conditionalState: { [key: string]: number }
}

/**
 * request - stores input from the user form
 * params - stores some precomputed data for easier use through the optimizer
 * These are currently somewhat mixed up, could use a cleanup
 */
export function generateParams(request: Form): OptimizerParams {
  const params: Partial<OptimizerParams> = {}

  generateCharacterBaseParams(request, params)
  generateSetConditionalParams(request, params)
  generateMultiplierParams(request, params)
  generateElementParams(request, params)

  calculateConditionals(request, params)

  return params as OptimizerParams
}

function generateCharacterBaseParams(request: Form, params: Partial<OptimizerParams>) {
  const lightConeMetadata = DB.getMetadata().lightCones[request.lightCone]
  const lightConeStats = lightConeMetadata?.stats || emptyLightCone()
  const lightConeSuperimposition = lightConeMetadata?.superimpositions[request.lightConeSuperimposition] || 1

  const characterMetadata = DB.getMetadata().characters[request.characterId]
  const characterStats = characterMetadata.stats

  params.element = characterMetadata.element

  const baseStats: CharacterStats = {
    base: {
      ...CharacterStats.getZeroes(),
      ...characterStats,
    },
    traces: {
      ...CharacterStats.getZeroes(),
      ...characterMetadata.traces,
    },
    lightCone: {
      ...CharacterStats.getZeroes(),
      ...lightConeStats,
      ...lightConeSuperimposition,
    },
  }

  params.character = baseStats

  const baseHp = sumCharacterBase(Stats.HP, baseStats.base, baseStats.lightCone)
  const baseAtk = sumCharacterBase(Stats.ATK, baseStats.base, baseStats.lightCone)
  const baseDef = sumCharacterBase(Stats.DEF, baseStats.base, baseStats.lightCone)
  const baseSpd = sumCharacterBase(Stats.SPD, baseStats.base, baseStats.lightCone)

  request.baseHp = baseHp
  request.baseAtk = baseAtk
  request.baseDef = baseDef
  request.baseSpd = baseSpd

  params.baseHP = baseHp
  params.baseATK = baseAtk
  params.baseDEF = baseDef
  params.baseSPD = baseSpd
}

function generateSetConditionalParams(request: Form, params: Partial<OptimizerParams>) {
  const setConditionals = request.setConditionals ?? defaultSetConditionals

  for (const set of Object.values(Constants.Sets)) {
    if (!setConditionals[set]) {
      setConditionals[set] = defaultSetConditionals[set]
    }
  }

  params.enabledHunterOfGlacialForest = setConditionals[Constants.Sets.HunterOfGlacialForest][1] == true ? 1 : 0
  params.enabledFiresmithOfLavaForging = setConditionals[Constants.Sets.FiresmithOfLavaForging][1] == true ? 1 : 0
  params.enabledGeniusOfBrilliantStars = setConditionals[Constants.Sets.GeniusOfBrilliantStars][1] == true ? 1 : 0
  params.enabledBandOfSizzlingThunder = setConditionals[Constants.Sets.BandOfSizzlingThunder][1] == true ? 1 : 0
  params.enabledMessengerTraversingHackerspace = setConditionals[Constants.Sets.MessengerTraversingHackerspace][1] == true ? 1 : 0
  params.enabledCelestialDifferentiator = setConditionals[Constants.Sets.CelestialDifferentiator][1] == true ? 1 : 0
  params.enabledWatchmakerMasterOfDreamMachinations = setConditionals[Constants.Sets.WatchmakerMasterOfDreamMachinations][1] == true ? 1 : 0
  params.enabledIzumoGenseiAndTakamaDivineRealm = setConditionals[Constants.Sets.IzumoGenseiAndTakamaDivineRealm][1] == true ? 1 : 0
  params.enabledForgeOfTheKalpagniLantern = setConditionals[Constants.Sets.ForgeOfTheKalpagniLantern][1] == true ? 1 : 0
  params.enabledTheWindSoaringValorous = setConditionals[Constants.Sets.TheWindSoaringValorous][1] == true ? 1 : 0
  params.enabledTheWondrousBananAmusementPark = setConditionals[Constants.Sets.TheWondrousBananAmusementPark][1] == true ? 1 : 0
  params.enabledScholarLostInErudition = setConditionals[Constants.Sets.ScholarLostInErudition][1] == true ? 1 : 0

  params.valueChampionOfStreetwiseBoxing = setConditionals[Constants.Sets.ChampionOfStreetwiseBoxing][1] || 0
  params.valueWastelanderOfBanditryDesert = setConditionals[Constants.Sets.WastelanderOfBanditryDesert][1] || 0
  params.valueLongevousDisciple = setConditionals[Constants.Sets.LongevousDisciple][1] || 0
  params.valueTheAshblazingGrandDuke = setConditionals[Constants.Sets.TheAshblazingGrandDuke][1] || 0
  params.valuePrisonerInDeepConfinement = setConditionals[Constants.Sets.PrisonerInDeepConfinement][1] || 0
  params.valuePioneerDiverOfDeadWaters = setConditionals[Constants.Sets.PioneerDiverOfDeadWaters][1] || 0
  params.valueSigoniaTheUnclaimedDesolation = setConditionals[Constants.Sets.SigoniaTheUnclaimedDesolation][1] || 0
  params.valueDuranDynastyOfRunningWolves = setConditionals[Constants.Sets.DuranDynastyOfRunningWolves][1] || 0
}

function generateMultiplierParams(request: Form, params: Partial<OptimizerParams>) {
  params.brokenMultiplier = request.enemyWeaknessBroken ? 1 : 0.9
  params.resistance = (request.enemyElementalWeak ? 0 : request.enemyResistance) - request.combatBuffs.RES_PEN
}

function generateElementParams(request: Form, params: Partial<OptimizerParams>) {
  const ELEMENTAL_DMG_TYPE: string = ElementToDamage[params.element!]

  params.ELEMENTAL_DMG_TYPE = ELEMENTAL_DMG_TYPE
  params.RES_PEN_TYPE = ElementToResPenType[params.element!]
  params.ELEMENTAL_BREAK_SCALING = {
    [Stats.Physical_DMG]: 2.0,
    [Stats.Fire_DMG]: 2.0,
    [Stats.Ice_DMG]: 1.0,
    [Stats.Lightning_DMG]: 1.0,
    [Stats.Wind_DMG]: 1.5,
    [Stats.Quantum_DMG]: 0.5,
    [Stats.Imaginary_DMG]: 0.5,
  }[ELEMENTAL_DMG_TYPE]

  // Band-aid here to fill in the main character's elemental type
  request.PRIMARY_ELEMENTAL_DMG_TYPE = ELEMENTAL_DMG_TYPE
}

function sumCharacterBase(stat: string, base: { [key: string]: number }, lc: { [key: string]: number }) {
  return base[stat] + lc[stat]
}
