import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { CharacterConditional, CharacterConditionalMap } from 'types/CharacterConditional'
import { LightConeConditional, LightConeConditionalMap } from 'types/LightConeConditionals'
import { ConditionalRegistry } from 'lib/optimizer/calculateConditionals'
import { DynamicConditional } from 'lib/gpu/conditionals/dynamicConditionals'

export type OptimizerAction = {
  precomputedX: ComputedStatsObject

  characterConditionals: CharacterConditionalMap
  lightConeConditionals: LightConeConditionalMap
  setConditionals: SetConditional

  conditionalRegistry: ConditionalRegistry
  conditionalState: { [key: string]: number }

  actionType: string
  actionIndex: number

  teammate0: TeammateAction
  teammate1: TeammateAction
  teammate2: TeammateAction
  teammateDynamicConditionals: DynamicConditional[]
  // Teammate data all gets precomputed, only the non-precomputable values go in here
}

export type TeammateAction = {
  characterConditionals: CharacterConditionalMap
  lightConeConditionals: LightConeConditionalMap
}

export type SetConditional = {
  enabledHunterOfGlacialForest: boolean
  enabledFiresmithOfLavaForging: boolean
  enabledGeniusOfBrilliantStars: boolean
  enabledBandOfSizzlingThunder: boolean
  enabledMessengerTraversingHackerspace: boolean
  enabledCelestialDifferentiator: boolean
  enabledWatchmakerMasterOfDreamMachinations: boolean
  enabledIzumoGenseiAndTakamaDivineRealm: boolean
  enabledForgeOfTheKalpagniLantern: boolean
  enabledTheWindSoaringValorous: boolean
  enabledTheWondrousBananAmusementPark: boolean
  enabledScholarLostInErudition: boolean
  valueChampionOfStreetwiseBoxing: number
  valueWastelanderOfBanditryDesert: number
  valueLongevousDisciple: number
  valueTheAshblazingGrandDuke: number
  valuePrisonerInDeepConfinement: number
  valuePioneerDiverOfDeadWaters: number
  valueSigoniaTheUnclaimedDesolation: number
  valueDuranDynastyOfRunningWolves: number
  valueSacerdosRelivedOrdeal: number
}

export type CharacterStatsBreakdown = {
  base: { [key: string]: number }
  lightCone: { [key: string]: number }
  traces: { [key: string]: number }
}

export type CharacterMetadata = {
  characterId: string
  characterEidolon: number
  lightCone: string
  lightConeSuperimposition: number
}

export type OptimizerContext = {
  // Request metadata
  characterId: string
  characterEidolon: number
  lightCone: string
  lightConeSuperimposition: number

  teammate0Metadata: CharacterMetadata
  teammate1Metadata: CharacterMetadata
  teammate2Metadata: CharacterMetadata

  // Optimizer environment
  resultsLimit: number
  resultSort: string
  minFilters: OptimizerMinFilters
  maxFilters: OptimizerMaxFilters
  combatBuffs: OptimizerCombatBuffs

  // Character data
  element: string // Ice
  elementalDamageType: string // Ice DMG Boost
  elementalResPenType: string // ICE_RES_PEN
  elementalBreakScaling: number // Ice: 1.0
  characterStatsBreakdown: CharacterStatsBreakdown

  // Base stats
  baseHP: number
  baseATK: number
  baseDEF: number
  baseSPD: number

  // Enemy data
  enemyLevel: number
  enemyCount: number
  enemyMaxToughness: number
  enemyDamageResistance: number
  enemyEffectResistance: number
  enemyElementalWeak: boolean
  enemyWeaknessBroken: boolean
  weaknessBrokenMultiplier: number

  actions: OptimizerAction[]
  comboBreak: number
  comboDot: number

  characterConditionalController: CharacterConditional
  lightConeConditionalController: LightConeConditional
}

export type OptimizerMinFilters = {}
export type OptimizerMaxFilters = {}

export type OptimizerCombatBuffs = {
  ATK: number
  ATK_P: number
  HP: number
  HP_P: number
  DEF: number
  DEF_P: number
  CR: number
  CD: number
  SPD: number
  SPD_P: number
  BE: number
  DMG_BOOST: number
  DEF_PEN: number
  RES_PEN: number
  EFFECT_RES_PEN: number
  VULNERABILITY: number
  BREAK_EFFICIENCY: number
}