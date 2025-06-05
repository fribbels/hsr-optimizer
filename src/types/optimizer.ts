import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  ElementName,
  PathName,
} from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ConditionalRegistry } from 'lib/optimization/calculateConditionals'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { AbilityKind } from 'lib/optimization/rotation/turnAbilityConfig'
import { CharacterId } from 'types/character'
import {
  CharacterConditionalsController,
  ConditionalValueMap,
  LightConeConditionalsController,
} from 'types/conditionals'
import { LightCone } from 'types/lightCone'
import {
  ElementalDamageType,
  ElementalResPenType,
} from 'types/metadata'

export type OptimizerAction = {
  precomputedX: ComputedStatsArray,
  precomputedM: ComputedStatsArray,

  characterConditionals: ConditionalValueMap,
  lightConeConditionals: ConditionalValueMap,
  teammateCharacterConditionals: ConditionalValueMap,
  teammateLightConeConditionals: ConditionalValueMap,
  setConditionals: SetConditional,

  conditionalRegistry: ConditionalRegistry,
  conditionalState: {
    [key: string]: number,
  },

  actorId: string,
  actionType: AbilityKind,
  actionIndex: number,

  teammate0: TeammateAction,
  teammate1: TeammateAction,
  teammate2: TeammateAction,
  teammateDynamicConditionals: DynamicConditional[],
  // Teammate data all gets precomputed, only the non-precomputable values go in here
}

export type TeammateAction = {
  actorId: string,
  characterConditionals: ConditionalValueMap,
  lightConeConditionals: ConditionalValueMap,
}

export type SetConditional = {
  enabledHunterOfGlacialForest: boolean,
  enabledFiresmithOfLavaForging: boolean,
  enabledGeniusOfBrilliantStars: boolean,
  enabledBandOfSizzlingThunder: boolean,
  enabledMessengerTraversingHackerspace: boolean,
  enabledCelestialDifferentiator: boolean,
  enabledWatchmakerMasterOfDreamMachinations: boolean,
  enabledPenaconyLandOfTheDreams: boolean,
  enabledIzumoGenseiAndTakamaDivineRealm: boolean,
  enabledForgeOfTheKalpagniLantern: boolean,
  enabledTheWindSoaringValorous: boolean,
  enabledTheWondrousBananAmusementPark: boolean,
  enabledScholarLostInErudition: boolean,
  enabledHeroOfTriumphantSong: boolean,
  enabledWarriorGoddessOfSunAndThunder: boolean,
  enabledWavestriderCaptain: boolean,
  valueChampionOfStreetwiseBoxing: number,
  valueWastelanderOfBanditryDesert: number,
  valueLongevousDisciple: number,
  valueTheAshblazingGrandDuke: number,
  valuePrisonerInDeepConfinement: number,
  valuePioneerDiverOfDeadWaters: number,
  valueSigoniaTheUnclaimedDesolation: number,
  valueDuranDynastyOfRunningWolves: number,
  valueSacerdosRelivedOrdeal: number,
  valueArcadiaOfWovenDreams: number,
}

export type CharacterStatsBreakdown = {
  base: {
    [key: string]: number,
  },
  lightCone: {
    [key: string]: number,
  },
  traces: {
    [key: string]: number,
  },
}

export type BasicForm = {
  characterId: CharacterId,
  characterEidolon: number,
  lightCone: LightCone['id'],
  lightConeSuperimposition: number,
}

export type CharacterMetadata = {
  characterId: string,
  characterEidolon: number,
  lightCone: string,
  lightConeSuperimposition: number,
  lightConePath: PathName,
  path: PathName,
  element: ElementName,
}

export type OptimizerContext = CharacterMetadata & {
  teammate0Metadata: CharacterMetadata,
  teammate1Metadata: CharacterMetadata,
  teammate2Metadata: CharacterMetadata,

  // Optimizer environment
  resultsLimit: number,
  resultSort: string,
  combatBuffs: OptimizerCombatBuffs,
  deprioritizeBuffs: boolean,

  // Character data
  elementalDamageType: ElementalDamageType, // Ice DMG Boost
  elementalResPenType: ElementalResPenType, // ICE_RES_PEN
  elementalBreakScaling: number, // Ice: 1.0
  characterStatsBreakdown: CharacterStatsBreakdown,

  // Base stats
  baseHP: number,
  baseATK: number,
  baseDEF: number,
  baseSPD: number,
  baseEnergy: number,

  // Enemy data
  enemyLevel: number,
  enemyCount: number,
  enemyMaxToughness: number,
  enemyDamageResistance: number,
  enemyEffectResistance: number,
  enemyElementalWeak: boolean,
  enemyWeaknessBroken: boolean,
  weaknessBrokenMultiplier: number,

  activeAbilities: AbilityType[],
  activeAbilityFlags: number,
  actions: OptimizerAction[],
  comboDot: number,
  dotAbilities: number,

  characterConditionalController: CharacterConditionalsController,
  lightConeConditionalController: LightConeConditionalsController,
}

export type OptimizerCombatBuffs = {
  ATK: number,
  ATK_P: number,
  HP: number,
  HP_P: number,
  DEF: number,
  DEF_P: number,
  CR: number,
  CD: number,
  SPD: number,
  SPD_P: number,
  BE: number,
  DMG_BOOST: number,
  DEF_PEN: number,
  RES_PEN: number,
  EFFECT_RES_PEN: number,
  VULNERABILITY: number,
  BREAK_EFFICIENCY: number,
}
