import { Constants, ElementToDamage, ElementToResPenType, Stats } from 'lib/constants'
import DB from 'lib/db'
import { CharacterStats } from 'lib/characterStats'
import { defaultSetConditionals } from 'lib/defaultForm'
import { emptyLightCone } from 'lib/optimizer/optimizerUtils'

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

  // Band-aid here to fill in the main character's elemental type
  request.PRIMARY_ELEMENTAL_DMG_TYPE = params.ELEMENTAL_DMG_TYPE

  return params
}

function generateSetConditionalParams(request, params) {
  const setConditionals = request.setConditionals

  for (let set of Object.values(Constants.Sets)) {
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

  params.valueChampionOfStreetwiseBoxing = setConditionals[Constants.Sets.ChampionOfStreetwiseBoxing][1] || 0
  params.valueWastelanderOfBanditryDesert = setConditionals[Constants.Sets.WastelanderOfBanditryDesert][1] || 0
  params.valueLongevousDisciple = setConditionals[Constants.Sets.LongevousDisciple][1] || 0
  params.valueTheAshblazingGrandDuke = setConditionals[Constants.Sets.TheAshblazingGrandDuke][1] || 0
  params.valuePrisonerInDeepConfinement = setConditionals[Constants.Sets.PrisonerInDeepConfinement][1] || 0
  params.valuePioneerDiverOfDeadWaters = setConditionals[Constants.Sets.PioneerDiverOfDeadWaters][1] || 0
  params.valueSigoniaTheUnclaimedDesolation = setConditionals[Constants.Sets.SigoniaTheUnclaimedDesolation][1] || 0
}

function generateMultiplierParams(request, params) {
  params.brokenMultiplier = request.enemyWeaknessBroken ? 1 : 0.9
  params.resistance = (request.enemyElementalWeak ? 0 : request.enemyResistance) - request.buffResPen
}

function generateElementParams(request, params) {
  params.ELEMENTAL_DMG_TYPE = ElementToDamage[params.element]
  params.RES_PEN_TYPE = ElementToResPenType[params.element]
}

function generateCharacterBaseParams(request, params) {
  let lightConeMetadata = DB.getMetadata().lightCones[request.lightCone]
  let lightConeStats = lightConeMetadata?.promotions[80] || emptyLightCone()
  let lightConeSuperimposition = lightConeMetadata?.superimpositions[request.lightConeSuperimposition] || 1

  let characterMetadata = DB.getMetadata().characters[request.characterId]
  let characterStats = characterMetadata.promotions[80]

  params.element = characterMetadata.element

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

  // console.log({ lightConeStats })
  // console.log({ characterStats })

  let baseHp = sumCharacterBase(Stats.HP, baseStats.base, baseStats.lightCone)
  let baseAtk = sumCharacterBase(Stats.ATK, baseStats.base, baseStats.lightCone)
  let baseDef = sumCharacterBase(Stats.DEF, baseStats.base, baseStats.lightCone)
  let baseSpd = sumCharacterBase(Stats.SPD, baseStats.base, baseStats.lightCone)

  request.baseHp = baseHp
  request.baseAtk = baseAtk
  request.baseDef = baseDef
  request.baseSpd = baseSpd
}

function sumCharacterBase(stat, base, lc) {
  return base[stat] + lc[stat]
}
