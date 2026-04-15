import {
  CombatBuffs,
  DEFAULT_MEMO_DISPLAY,
  DEFAULT_STAT_DISPLAY,
  Sets,
} from 'lib/constants/constants'
import type { SetConditionals } from 'lib/optimization/combo/comboTypes'
import { ComboType } from 'lib/optimization/rotation/comboType'
import {
  DEFAULT_BASIC,
  NULL_TURN_ABILITY_NAME,
} from 'lib/optimization/rotation/turnAbilityConfig'
import { setConfigRegistry } from 'lib/sets/setConfigRegistry'
import {
  type OptimizerRequestState,
  type RatingFilterState,
  type StatFilterState,
  type TeammateState,
} from 'lib/stores/optimizerForm/optimizerFormTypes'

function buildDefaultSetConditionals(): SetConditionals {
  const result = {} as SetConditionals
  for (const [id, config] of setConfigRegistry) {
    ;(result as Record<string, [undefined, boolean | number]>)[Sets[id]] = [undefined, config.display.defaultValue]
  }
  return result
}

export function createDefaultTeammate(): TeammateState {
  return {
    characterId: undefined,
    characterEidolon: 0,
    lightCone: undefined,
    lightConeSuperimposition: 1,
    teamRelicSet: undefined,
    teamOrnamentSet: undefined,
    characterConditionals: {},
    lightConeConditionals: {},
  }
}

export function createDefaultStatFilters(): StatFilterState {
  return {
    minAtk: undefined,
    maxAtk: undefined,
    minHp: undefined,
    maxHp: undefined,
    minDef: undefined,
    maxDef: undefined,
    minSpd: undefined,
    maxSpd: undefined,
    minCr: undefined,
    maxCr: undefined,
    minCd: undefined,
    maxCd: undefined,
    minEhr: undefined,
    maxEhr: undefined,
    minRes: undefined,
    maxRes: undefined,
    minBe: undefined,
    maxBe: undefined,
    minErr: undefined,
    maxErr: undefined,
  }
}

export function createDefaultRatingFilters(): RatingFilterState {
  return {
    minBasic: undefined,
    maxBasic: undefined,
    minDot: undefined,
    maxDot: undefined,
    minBreak: undefined,
    maxBreak: undefined,
    minEhp: undefined,
    maxEhp: undefined,
    minFua: undefined,
    maxFua: undefined,
    minSkill: undefined,
    maxSkill: undefined,
    minMemoSkill: undefined,
    maxMemoSkill: undefined,
    minMemoTalent: undefined,
    maxMemoTalent: undefined,
    minUlt: undefined,
    maxUlt: undefined,
  }
}

export function createDefaultCombatBuffs(): Record<string, number> {
  const combatBuffs: Record<string, number> = {}
  for (const entry of Object.values(CombatBuffs)) {
    combatBuffs[entry.key] = 0
  }
  return combatBuffs
}

export function createDefaultFormState(): OptimizerRequestState {
  return {
    // Character identity
    characterId: undefined,
    characterEidolon: 0,
    characterLevel: 80,

    // Light cone
    lightCone: undefined,
    lightConeLevel: 80,
    lightConeSuperimposition: 1,

    // Teammates
    teammates: [createDefaultTeammate(), createDefaultTeammate(), createDefaultTeammate()],

    // Conditionals
    characterConditionals: {},
    lightConeConditionals: {},
    setConditionals: buildDefaultSetConditionals(),

    // Relic filters
    enhance: 9,
    grade: 5,
    rank: 0,
    exclude: [],
    includeEquippedRelics: true,
    keepCurrentRelics: false,
    rankFilter: true,
    mainStatUpscaleLevel: 15,
    mainHead: [],
    mainHands: [],
    mainBody: [],
    mainFeet: [],
    mainPlanarSphere: [],
    mainLinkRope: [],
    setFilters: { fourPiece: [], twoPieceCombos: [], ornaments: [] },

    // Weights
    weights: {} as OptimizerRequestState['weights'],

    // Stat / rating filters
    statFilters: createDefaultStatFilters(),
    ratingFilters: createDefaultRatingFilters(),

    // Enemy config
    enemyLevel: 95,
    enemyCount: 1,
    enemyResistance: 0.2,
    enemyEffectResistance: 0.3,
    enemyMaxToughness: 360,
    enemyElementalWeak: true,
    enemyWeaknessBroken: false,

    // Combo
    comboType: ComboType.SIMPLE,
    comboStateJson: '{}',
    comboPreprocessor: true,
    comboTurnAbilities: [NULL_TURN_ABILITY_NAME, DEFAULT_BASIC],

    // Scoring / display
    resultSort: undefined,
    resultsLimit: 1024,
    statDisplay: DEFAULT_STAT_DISPLAY,
    memoDisplay: DEFAULT_MEMO_DISPLAY,

    // Combat buffs
    combatBuffs: createDefaultCombatBuffs(),

    // Team set contribution
    teamRelicSet: undefined,
    teamOrnamentSet: undefined,

    // Optimizer options
    deprioritizeBuffs: false,

    // Stat sim
    statSim: undefined,
  }
}
