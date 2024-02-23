import { Constants, Stats } from 'lib/constants'

/**
 * request - stores input from the user form
 * params - stores some precomputed data for easier use through the optimizer
 */
export function generateParams(request) {
  const params = {}

  generateSetConditionalParams(request, params)
  generateMultiplierParams(request, params)
  generateElementParams(request, params)
  generateCharacterBaseParams(request, params)

  return params
}

function generateSetConditionalParams(request, params) {
  const setConditionals = request.setConditionals

  params.enabledHunterOfGlacialForest = setConditionals[Constants.Sets.HunterOfGlacialForest][1] == true ? 1 : 0
  params.enabledFiresmithOfLavaForging = setConditionals[Constants.Sets.FiresmithOfLavaForging][1] == true ? 1 : 0
  params.enabledGeniusOfBrilliantStars = setConditionals[Constants.Sets.GeniusOfBrilliantStars][1] == true ? 1 : 0
  params.enabledBandOfSizzlingThunder = setConditionals[Constants.Sets.BandOfSizzlingThunder][1] == true ? 1 : 0
  params.enabledMessengerTraversingHackerspace = setConditionals[Constants.Sets.MessengerTraversingHackerspace][1] == true ? 1 : 0
  params.enabledCelestialDifferentiator = setConditionals[Constants.Sets.CelestialDifferentiator][1] == true ? 1 : 0
  params.enabledWatchmakerMasterOfDreamMachinations = setConditionals[Constants.Sets.WatchmakerMasterOfDreamMachinations][1] == true ? 1 : 0

  params.valueChampionOfStreetwiseBoxing = setConditionals[Constants.Sets.ChampionOfStreetwiseBoxing][1]
  params.valueWastelanderOfBanditryDesert = setConditionals[Constants.Sets.WastelanderOfBanditryDesert][1]
  params.valueLongevousDisciple = setConditionals[Constants.Sets.LongevousDisciple][1]
  params.valueTheAshblazingGrandDuke = setConditionals[Constants.Sets.TheAshblazingGrandDuke][1]
  params.valuePrisonerInDeepConfinement = setConditionals[Constants.Sets.PrisonerInDeepConfinement][1]
  params.valuePioneerDiverOfDeadWaters = setConditionals[Constants.Sets.PioneerDiverOfDeadWaters][1]
}

function generateMultiplierParams(request, params) {
  params.brokenMultiplier = request.enemyWeaknessBroken ? 1 : 0.9
  params.resistance = (request.enemyElementalWeak ? 0 : request.enemyResistance) - request.buffResPen
}

function generateElementParams(request, params) {
  params.damageElement = request.damageElement
  params.ELEMENTAL_DMG_TYPE = elementToDamageType(params.damageElement)
  params.RES_PEN_TYPE = elementToResPenType(params.damageElement)
}

function generateCharacterBaseParams(request, _params) {
  let trace = request.character.traces
  let lc = request.character.lightCone
  let base = request.character.base

  let baseHp = sumCharacterBase(Stats.HP, base, lc)
  let baseAtk = sumCharacterBase(Stats.ATK, base, lc)
  let baseDef = sumCharacterBase(Stats.DEF, base, lc)
  let baseSpd = sumCharacterBase(Stats.SPD, base, lc)

  request.baseHp = baseHp
  request.baseAtk = baseAtk
  request.baseDef = baseDef
  request.baseSpd = baseSpd
}

function elementToDamageType(damageElement) {
  return {
    [Stats.Physical_DMG]: 'PHYSICAL_DMG_BOOST',
    [Stats.Fire_DMG]: 'FIRE_DMG_BOOST',
    [Stats.Ice_DMG]: 'ICE_DMG_BOOST',
    [Stats.Lightning_DMG]: 'LIGHTNING_DMG_BOOST',
    [Stats.Wind_DMG]: 'WIND_DMG_BOOST',
    [Stats.Quantum_DMG]: 'QUANTUM_DMG_BOOST',
    [Stats.Imaginary_DMG]: 'IMAGINARY_DMG_BOOST',
  }[damageElement]
}

function elementToResPenType(damageElement) {
  return {
    [Stats.Physical_DMG]: 'PHYSICAL_RES_PEN',
    [Stats.Fire_DMG]: 'FIRE_RES_PEN',
    [Stats.Ice_DMG]: 'ICE_RES_PEN',
    [Stats.Lightning_DMG]: 'LIGHTNING_RES_PEN',
    [Stats.Wind_DMG]: 'WIND_RES_PEN',
    [Stats.Quantum_DMG]: 'QUANTUM_RES_PEN',
    [Stats.Imaginary_DMG]: 'IMAGINARY_RES_PEN',
  }[damageElement]
}

function sumCharacterBase(stat, base, lc) {
  return base[stat] + lc[stat]
}
