import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { CharacterConditional } from 'types/CharacterConditional'
import { LightConeConditional } from 'types/LightConeConditionals'
import { ConditionalRegistry } from 'lib/optimizer/calculateConditionals'

export type OptimizerAction = {
  precomputedX: ComputedStatsObject

  characterConditionals: CharacterConditional
  lightConeConditionals: LightConeConditional
  setConditionals: SetConditional

  conditionalRegistry: ConditionalRegistry
  conditionalState: { [key: string]: number }

  // Teammate data all gets precomputed, only the non-precomputable values go in here
}

export type SetConditional = {
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
}

export type CharacterStatsBreakdown = {
  base: { [key: string]: number }
  lightCone: { [key: string]: number }
  traces: { [key: string]: number }
}

export type OptimizerContext = {
  // Request metadata
  characterId: string
  characterEidolon: number
  lightCone: string
  lightConeSuperimposition: number

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
}

export type OptimizerMinFilters = {}
export type OptimizerMaxFilters = {}

export type OptimizerCombatBuffs = {}