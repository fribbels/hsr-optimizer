import { Constants, Stats } from 'lib/constants'
import DB from 'lib/db'
import { CharacterStats } from 'lib/characterStats'

/**
 * request - stores input from the user form
 * params - stores some precomputed data for easier use through the optimizer
 */
export function generateParams(request) {
  const params = {}

  generateCharacterBaseParams(request, params)
  generateSetConditionalParams(request, params)
  generateMultiplierParams(request, params)
  generateElementParams(request, params)

  return params
}

function generateSetConditionalParams(request, params) {
  const setConditionals = request.setConditionals

  // TODO: dedupe this with defaultForm.js
  for (let set of Object.values(Constants.Sets)) {
    if (!setConditionals[set]) {
      setConditionals[set] = [undefined, false]
    }
  }

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
  params.ELEMENTAL_DMG_TYPE = elementToDamageType(params.damageElement)
  params.RES_PEN_TYPE = elementToResPenType(params.damageElement)
}

function generateCharacterBaseParams(request, params) {
  let lightConeMetadata = DB.getMetadata().lightCones[request.lightCone]
  let lightConeStats = lightConeMetadata?.promotions[request.lightConeLevel] || emptyLightCone()
  let lightConeSuperimposition = lightConeMetadata?.superimpositions[request.lightConeSuperimposition] || 1

  let characterMetadata = DB.getMetadata().characters[request.characterId]
  let characterStats = characterMetadata.promotions[request.characterLevel]

  params.damageElement = elementToDamageMapping[characterMetadata.element]

  let baseStats = {
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

  console.log({ lightConeStats })
  console.log({ characterStats })

  let baseHp = sumCharacterBase(Stats.HP, baseStats.base, baseStats.lightCone)
  let baseAtk = sumCharacterBase(Stats.ATK, baseStats.base, baseStats.lightCone)
  let baseDef = sumCharacterBase(Stats.DEF, baseStats.base, baseStats.lightCone)
  let baseSpd = sumCharacterBase(Stats.SPD, baseStats.base, baseStats.lightCone)

  request.baseHp = baseHp
  request.baseAtk = baseAtk
  request.baseDef = baseDef
  request.baseSpd = baseSpd
}

function emptyLightCone() {
  return {
    [Stats.HP]: 0,
    [Stats.ATK]: 0,
    [Stats.DEF]: 0,
  }
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

const elementToDamageMapping = {
  Physical: Stats.Physical_DMG,
  Fire: Stats.Fire_DMG,
  Ice: Stats.Ice_DMG,
  Thunder: Stats.Lightning_DMG,
  Wind: Stats.Wind_DMG,
  Quantum: Stats.Quantum_DMG,
  Imaginary: Stats.Imaginary_DMG,
}
