import { AbilityType } from 'lib/conditionals/conditionalConstants'
import {
  ElementName,
  PathName,
} from 'lib/constants/constants'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { ConditionalRegistry } from 'lib/optimization/calculateConditionals'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { ActionModifier } from 'lib/optimization/context/calculateActions'
import {
  ComputedStatsContainer,
  ComputedStatsContainerConfig,
} from 'lib/optimization/engine/container/computedStatsContainer'
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
import {
  AbilityDefinition,
  Hit,
} from './hitConditionalTypes'

export type OptimizerAction = {
  precomputedX: ComputedStatsArray,
  precomputedM: ComputedStatsArray,

  precomputedStats: ComputedStatsContainer,
  config: ComputedStatsContainerConfig,

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
  actorEidolon: number,
  actionType: AbilityKind,
  // Ability name
  actionName: string,
  // Identifier variable
  actionIdentifier: string,
  actionIndex: number,

  hits?: Hit[],

  teammate0: TeammateAction,
  teammate1: TeammateAction,
  teammate2: TeammateAction,
  teammateDynamicConditionals: DynamicConditional[],
  // Teammate data all gets precomputed, only the non-precomputable values go in here

  registerIndices: number[],
  registerIndex: number,
}

export type TeammateAction = {
  actorId: string,
  actorEidolon: number,
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
  enabledWorldRemakingDeliverer: boolean,
  enabledSelfEnshroudedRecluse: boolean,
  enabledDivinerOfDistantReach: boolean,
  enabledAmphoreusTheEternalLand: boolean,
  enabledTengokuLivestream: boolean,
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
  valueEverGloriousMagicalGirl: number,
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
  characterId: CharacterId,
  characterEidolon: number,
  lightCone: string,
  lightConeSuperimposition: number,
  lightConePath: PathName,
  path: PathName,
  element: ElementName,
}

export type ShaderVariables = {
  actionLength: number,
  needsEhp: boolean,
}

export type OptimizerContext = CharacterMetadata & {
  shaderVariables: ShaderVariables,

  // NEW
  maxContainerArrayLength: number, // Maximum array size for container reuse (stats + registers)
  maxStatsArrayLength: number, // Maximum stats array size (without registers)
  maxEntitiesCount: number, // Maximum entities across all actions
  maxHitsCount: number, // Maximum hits across all actions
  actionDeclarations: string[],
  actionModifiers: ActionModifier[],
  characterController: CharacterConditionalsController,
  teammateControllers: CharacterConditionalsController[],
  outputRegistersLength: number,

  // GPU buffer data (populated during WGSL generation)
  precomputedStatsData?: Float32Array,

  rotationActions: OptimizerAction[],
  defaultActions: OptimizerAction[],
  allActions: OptimizerAction[],

  teammate0Metadata: CharacterMetadata,
  teammate1Metadata: CharacterMetadata,
  teammate2Metadata: CharacterMetadata,

  // Optimizer environment
  resultsLimit: number,
  resultSort: string,
  primaryAbilityKey: string, // Primary ability from scoringMetadata.sortOption.key (e.g., 'BASIC', 'SKILL')
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
  hitActions?: AbilityDefinition[],
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
