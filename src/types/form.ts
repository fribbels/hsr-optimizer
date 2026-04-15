import type { SetConditionals } from 'lib/optimization/combo/comboTypes'
import type { ComboType } from 'lib/optimization/rotation/comboType'
import type { TurnAbilityName } from 'lib/optimization/rotation/turnAbilityConfig'
import type { SortOption } from 'lib/optimization/sortOptions'
import type {
  Simulation,
  SimulationRequest,
} from 'lib/simulations/statSimulationTypes'
import type {
  CharacterId,
  Eidolon,
} from 'types/character'

import type {
  SetsOrnaments,
  SetsRelics,
} from 'lib/sets/setConfigRegistry'
import type { SetFilters } from 'lib/stores/optimizerForm/setFilterTypes'
import type { ConditionalValueMap } from 'types/conditionals'
import type {
  LightConeId,
  SuperImpositionLevel,
} from 'types/lightCone'
import type { ScoringMetadata } from 'types/metadata'
import type {
  RelicEnhance,
  RelicGrade,
} from 'types/relic'
import type {
  MemoDisplay,
  StatDisplay,
} from 'types/store'

export type Teammate = {
  characterId: CharacterId,
  characterEidolon: number,
  lightCone: LightConeId,
  lightConeSuperimposition: number,
  teamOrnamentSet?: string,
  teamRelicSet?: string,
  characterConditionals?: ConditionalValueMap,
  lightConeConditionals?: ConditionalValueMap,
}

export type OptimizerForm = Form

export type Form =
  & {
    // Core
    characterEidolon: Eidolon,
    characterId: CharacterId,
    characterLevel: number,

    // Light cone
    lightCone: LightConeId,
    lightConeLevel: number,
    lightConeSuperimposition: SuperImpositionLevel,

    // Enemy
    enemyCount: number,
    enemyElementalWeak: boolean,
    enemyLevel: number,
    enemyMaxToughness: number,
    enemyResistance: number,
    enemyEffectResistance: number,
    enemyWeaknessBroken: boolean,

    // Conditionals
    characterConditionals: ConditionalValueMap,
    lightConeConditionals: ConditionalValueMap,
    setConditionals: SetConditionals,

    // Optimizer filters
    enhance: RelicEnhance,
    grade: RelicGrade,
    rank: number,
    exclude: CharacterId[],
    includeEquippedRelics: boolean,
    keepCurrentRelics: boolean,
    mainBody: string[],
    mainFeet: string[],
    mainHands: string[],
    mainHead: string[],
    mainLinkRope: string[],
    mainPlanarSphere: string[],
    mainStatUpscaleLevel: number,
    rankFilter: boolean,
    ornamentSets: OrnamentSetFilters,
    relicSets: RelicSetFilters,
    setFilters?: SetFilters,
    statDisplay: StatDisplay,
    memoDisplay: MemoDisplay,

    weights: ScoringMetadata['stats'],

    combatBuffs: {
      [key: string]: number,
    },

    // Optimizer additional data
    statSim?: {
      key: string,
      benchmarks: SimulationRequest,
      substatRolls: SimulationRequest,
      simulations: Simulation[],
    },
    optimizationId?: string,
    sortOption?: string,
    resultSort?: keyof typeof SortOption,
    resultsLimit?: number,
    deprioritizeBuffs?: boolean,
    resultMinFilter: number,
    trace?: boolean,
    teamRelicSet?: string,
    teamOrnamentSet?: string,

    // Combo
    comboStateJson: string,
    comboTurnAbilities: TurnAbilityName[],
    comboPreprocessor: boolean,
    comboType: ComboType,
    comboDot: number,

    teammate0: Teammate,
    teammate1: Teammate,
    teammate2: Teammate,
  }
  // Min / Max
  & StatFilters
  & RatingFilters

export type RelicSetFilters = Array<[pieces: string] | [pieces: string, set: SetsRelics] | [pieces: string, set1: SetsRelics, set2: SetsRelics]>
export type OrnamentSetFilters = Array<SetsOrnaments>

export type StatFilters = {
  minAtk: number,
  maxAtk: number,
  minHp: number,
  maxHp: number,
  minDef: number,
  maxDef: number,
  minSpd: number,
  maxSpd: number,
  minCr: number,
  maxCr: number,
  minCd: number,
  maxCd: number,
  minEhr: number,
  maxEhr: number,
  minRes: number,
  maxRes: number,
  minBe: number,
  maxBe: number,
  minErr: number,
  maxErr: number,
}

export type RatingFilters = {
  minBasic: number,
  maxBasic: number,
  minDot: number,
  maxDot: number,
  minBreak: number,
  maxBreak: number,
  minEhp: number,
  maxEhp: number,
  minFua: number,
  maxFua: number,
  minSkill: number,
  maxSkill: number,
  minMemoSkill: number,
  maxMemoSkill: number,
  minMemoTalent: number,
  maxMemoTalent: number,
  minUlt: number,
  maxUlt: number,
}

export type TeammateProperty = 'teammate0' | 'teammate1' | 'teammate2'
