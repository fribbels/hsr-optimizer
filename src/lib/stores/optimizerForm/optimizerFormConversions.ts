import {
  CombatBuffs,
  ConditionalDataType,
  Constants,
} from 'lib/constants/constants'
import { defaultSetConditionals } from 'lib/optimization/defaultForm'
import {
  createDefaultFormState,
  createDefaultTeammate,
} from 'lib/stores/optimizerForm/optimizerFormDefaults'
import {
  type OptimizerRequest,
  type OptimizerRequestState,
  type RatingFilterState,
  type StatFilterState,
  type TeammateState,
} from 'lib/stores/optimizerForm/optimizerFormTypes'
import {
  DEFAULT_SET_FILTERS,
  expandSetFilters,
} from 'lib/stores/optimizerForm/setFilterConversions'
import {
  type Form,
  type Teammate,
} from 'types/form'

const MAX_INT = Constants.MAX_INT

// Stat filter keys that are percentages and need ÷100 for internal format
const PERCENTAGE_STAT_KEYS = new Set([
  'minCr',
  'maxCr',
  'minCd',
  'maxCd',
  'minEhr',
  'maxEhr',
  'minRes',
  'maxRes',
  'minBe',
  'maxBe',
  'minErr',
  'maxErr',
])

/**
 * Convert a display-format store state to an internal-format Form.
 * Pure function — does not mutate the input.
 */
export function displayToInternal(state: OptimizerRequestState): Form {
  // Convert stat filters: undefined → 0/MAX_INT, percentage stats ÷ 100
  const statFilterEntries = Object.entries(state.statFilters) as Array<[keyof StatFilterState, number | undefined]>
  const statFilters = {} as Record<string, number>
  for (const [key, value] of statFilterEntries) {
    const isMin = key.startsWith('min')
    const defaultValue = isMin ? 0 : MAX_INT
    if (value == null) {
      statFilters[key] = defaultValue
    } else {
      statFilters[key] = PERCENTAGE_STAT_KEYS.has(key) ? value / 100 : value
    }
  }

  // Convert rating filters: undefined → 0/MAX_INT, no percentage conversion
  const ratingFilterEntries = Object.entries(state.ratingFilters) as Array<[keyof RatingFilterState, number | undefined]>
  const ratingFilters = {} as Record<string, number>
  for (const [key, value] of ratingFilterEntries) {
    const isMin = key.startsWith('min')
    ratingFilters[key] = value ?? (isMin ? 0 : MAX_INT)
  }

  // Convert teammates tuple → flat teammate0/1/2
  const teammate0 = teammateStateToTeammate(state.teammates[0])
  const teammate1 = teammateStateToTeammate(state.teammates[1])
  const teammate2 = teammateStateToTeammate(state.teammates[2])

  return {
    // Character identity
    characterEidolon: state.characterEidolon,
    characterId: state.characterId!,
    characterLevel: state.characterLevel,

    // Light cone
    lightCone: state.lightCone!,
    lightConeLevel: state.lightConeLevel,
    lightConeSuperimposition: state.lightConeSuperimposition,

    // Enemy
    enemyCount: state.enemyCount,
    enemyElementalWeak: state.enemyElementalWeak,
    enemyLevel: state.enemyLevel,
    enemyMaxToughness: state.enemyMaxToughness,
    enemyResistance: state.enemyResistance,
    enemyEffectResistance: state.enemyEffectResistance,
    enemyWeaknessBroken: state.enemyWeaknessBroken,

    // Conditionals — shallow-clone to prevent downstream mutation of store state
    characterConditionals: { ...state.characterConditionals },
    lightConeConditionals: { ...state.lightConeConditionals },
    setConditionals: Object.fromEntries(
      Object.entries(state.setConditionals).map(([k, v]) => [k, [...v]]),
    ) as typeof state.setConditionals,

    // Relic filters
    enhance: state.enhance,
    grade: state.grade,
    rank: state.rank,
    exclude: state.exclude,
    includeEquippedRelics: state.includeEquippedRelics,
    keepCurrentRelics: state.keepCurrentRelics,
    mainBody: state.mainBody,
    mainFeet: state.mainFeet,
    mainHands: state.mainHands,
    mainHead: state.mainHead,
    mainLinkRope: state.mainLinkRope,
    mainPlanarSphere: state.mainPlanarSphere,
    mainStatUpscaleLevel: state.mainStatUpscaleLevel,
    rankFilter: state.rankFilter,
    ...expandSetFilters(state.setFilters),
    setFilters: state.setFilters,
    statDisplay: state.statDisplay,
    memoDisplay: state.memoDisplay,

    // Weights — shallow-clone to prevent downstream mutation of store state
    weights: { ...state.weights },

    // Combat buffs (percentage buffs ÷ 100)
    combatBuffs: convertCombatBuffsToInternal(state.combatBuffs),

    // Combo
    comboStateJson: state.comboStateJson,
    comboTurnAbilities: state.comboTurnAbilities,
    comboPreprocessor: state.comboPreprocessor,
    comboType: state.comboType,

    // Scoring / display
    resultSort: state.resultSort,
    resultsLimit: state.resultsLimit,

    // Team set contribution
    teamRelicSet: state.teamRelicSet,
    teamOrnamentSet: state.teamOrnamentSet,

    // Optimizer options
    deprioritizeBuffs: state.deprioritizeBuffs,

    // Stat sim
    statSim: state.statSim,

    // Result min filter (default for Form)
    resultMinFilter: 0,

    // Teammates
    teammate0,
    teammate1,
    teammate2,

    // Stat & rating filters (spread as flat fields)
    ...statFilters,
    ...ratingFilters,
  } as Form
}

function teammateStateToTeammate(ts: TeammateState): Teammate {
  return {
    characterId: ts.characterId!,
    characterEidolon: ts.characterEidolon,
    lightCone: ts.lightCone!,
    lightConeSuperimposition: ts.lightConeSuperimposition,
    teamRelicSet: ts.teamRelicSet,
    teamOrnamentSet: ts.teamOrnamentSet,
    characterConditionals: { ...ts.characterConditionals },
    lightConeConditionals: { ...ts.lightConeConditionals },
  } as Teammate
}

function convertCombatBuffsToDisplay(buffs: Record<string, number> | undefined): Record<string, number> {
  const result: Record<string, number> = {}
  if (!buffs) return result
  for (const buff of Object.values(CombatBuffs)) {
    const value = buffs[buff.key]
    if (value != null) {
      result[buff.key] = buff.percent ? value * 100 : value
    }
  }
  return result
}

function convertCombatBuffsToInternal(buffs: Record<string, number>): Record<string, number> {
  const result: Record<string, number> = {}
  for (const buff of Object.values(CombatBuffs)) {
    const value = buffs[buff.key]
    if (value != null) {
      result[buff.key] = buff.percent ? value / 100 : value
    }
  }
  return result
}

/**
 * Build an optimizer request from display-format state.
 */
export function buildOptimizerRequest(state: OptimizerRequestState): OptimizerRequest {
  return { ...displayToInternal(state), resultMinFilter: 0 }
}

/**
 * Build a save-ready form from display-format state.
 */
export function buildSaveForm(state: OptimizerRequestState): Form {
  return displayToInternal(state)
}

/**
 * Normalize an internal-format Form by round-tripping through display format.
 * Applies all defaults, then converts back to internal.
 */
export function normalizeForm(form: Form): Form {
  return displayToInternal({ ...createDefaultFormState(), ...internalFormToState(form) } as OptimizerRequestState)
}

/**
 * Convert an internal-format Form (as stored in DB) to a full OptimizerRequestState.
 * Replaces formToDisplay() — outputs store state instead of antd form values.
 */
export function internalFormToState(form: Form): Partial<OptimizerRequestState> {
  const { statFilters, ratingFilters, teammates } = internalToDisplay(form)

  return {
    characterId: form.characterId,
    characterEidolon: form.characterEidolon,
    characterLevel: form.characterLevel ?? 80,
    lightCone: form.lightCone,
    lightConeLevel: form.lightConeLevel ?? 80,
    lightConeSuperimposition: form.lightConeSuperimposition ?? 1,

    // Enemy config
    enemyCount: form.enemyCount,
    enemyLevel: form.enemyLevel,
    enemyResistance: form.enemyResistance,
    enemyEffectResistance: form.enemyEffectResistance,
    enemyMaxToughness: form.enemyMaxToughness,
    enemyElementalWeak: form.enemyElementalWeak,
    enemyWeaknessBroken: form.enemyWeaknessBroken,

    // Conditionals — shallow-clone to prevent shared references with character store (mirrors displayToInternal)
    characterConditionals: { ...(form.characterConditionals ?? {}) },
    lightConeConditionals: { ...(form.lightConeConditionals ?? {}) },
    setConditionals: Object.fromEntries(
      Object.entries(form.setConditionals ?? defaultSetConditionals).map(([k, v]) => [k, [...v]]),
    ) as typeof defaultSetConditionals,

    // Relic filters
    enhance: form.enhance,
    grade: form.grade,
    rank: form.rank,
    exclude: form.exclude ?? [],
    includeEquippedRelics: form.includeEquippedRelics ?? true,
    keepCurrentRelics: form.keepCurrentRelics ?? false,
    mainBody: form.mainBody ?? [],
    mainFeet: form.mainFeet ?? [],
    mainHands: form.mainHands ?? [],
    mainHead: form.mainHead ?? [],
    mainLinkRope: form.mainLinkRope ?? [],
    mainPlanarSphere: form.mainPlanarSphere ?? [],
    mainStatUpscaleLevel: form.mainStatUpscaleLevel ?? 15,
    rankFilter: form.rankFilter,
    setFilters: form.setFilters ?? DEFAULT_SET_FILTERS,
    statDisplay: form.statDisplay,
    memoDisplay: form.memoDisplay,

    // Weights — shallow-clone to prevent shared references (mirrors displayToInternal)
    weights: { ...(form.weights ?? {}) },

    // Combat buffs (internal → display: multiply percent buffs by 100)
    combatBuffs: convertCombatBuffsToDisplay(form.combatBuffs),

    // Combo
    comboStateJson: form.comboStateJson ?? '{}',
    comboTurnAbilities: form.comboTurnAbilities,
    comboPreprocessor: form.comboPreprocessor ?? true,
    comboType: form.comboType,

    // Scoring / display
    resultSort: form.resultSort,
    resultsLimit: form.resultsLimit ?? 1024,

    // Team sets
    teamRelicSet: form.teamRelicSet,
    teamOrnamentSet: form.teamOrnamentSet,

    // Options
    deprioritizeBuffs: form.deprioritizeBuffs ?? false,

    // Stat sim
    statSim: form.statSim,

    // Filters
    statFilters,
    ratingFilters,
    teammates,
  }
}

/**
 * Convert an internal-format Form (partial allowed) back to display format.
 * Returns statFilters, ratingFilters, and teammates in display format.
 */
export function internalToDisplay(form: Partial<Form>): {
  statFilters: StatFilterState,
  ratingFilters: RatingFilterState,
  teammates: [TeammateState, TeammateState, TeammateState],
} {
  return {
    statFilters: internalToStatFilters(form),
    ratingFilters: internalToRatingFilters(form),
    teammates: [
      teammateToTeammateState(form.teammate0),
      teammateToTeammateState(form.teammate1),
      teammateToTeammateState(form.teammate2),
    ],
  }
}

export function internalToStatFilters(form: Partial<Form>): StatFilterState {
  return {
    minAtk: unsetMin(form.minAtk),
    maxAtk: unsetMax(form.maxAtk),
    minHp: unsetMin(form.minHp),
    maxHp: unsetMax(form.maxHp),
    minDef: unsetMin(form.minDef),
    maxDef: unsetMax(form.maxDef),
    minSpd: unsetMin(form.minSpd),
    maxSpd: unsetMax(form.maxSpd),
    minCr: unsetMin(form.minCr, true),
    maxCr: unsetMax(form.maxCr, true),
    minCd: unsetMin(form.minCd, true),
    maxCd: unsetMax(form.maxCd, true),
    minEhr: unsetMin(form.minEhr, true),
    maxEhr: unsetMax(form.maxEhr, true),
    minRes: unsetMin(form.minRes, true),
    maxRes: unsetMax(form.maxRes, true),
    minBe: unsetMin(form.minBe, true),
    maxBe: unsetMax(form.maxBe, true),
    minErr: unsetMin(form.minErr, true),
    maxErr: unsetMax(form.maxErr, true),
  }
}

function internalToRatingFilters(form: Partial<Form>): RatingFilterState {
  return {
    minBasic: unsetMin(form.minBasic),
    maxBasic: unsetMax(form.maxBasic),
    minDot: unsetMin(form.minDot),
    maxDot: unsetMax(form.maxDot),
    minBreak: unsetMin(form.minBreak),
    maxBreak: unsetMax(form.maxBreak),
    minEhp: unsetMin(form.minEhp),
    maxEhp: unsetMax(form.maxEhp),
    minFua: unsetMin(form.minFua),
    maxFua: unsetMax(form.maxFua),
    minSkill: unsetMin(form.minSkill),
    maxSkill: unsetMax(form.maxSkill),
    minMemoSkill: unsetMin(form.minMemoSkill),
    maxMemoSkill: unsetMax(form.maxMemoSkill),
    minMemoTalent: unsetMin(form.minMemoTalent),
    maxMemoTalent: unsetMax(form.maxMemoTalent),
    minUlt: unsetMin(form.minUlt),
    maxUlt: unsetMax(form.maxUlt),
  }
}

/** 0 → undefined; percentage stats × 100 */
function unsetMin(value: number | undefined, percent: boolean = false): number | undefined {
  if (value == null) return undefined
  const n = Number(value)
  if (!n) return undefined
  return parseFloat((percent ? n * 100 : n).toFixed(3))
}

/** MAX_INT → undefined; percentage stats × 100 */
function unsetMax(value: number | undefined, percent: boolean = false): number | undefined {
  if (value == null) return undefined
  const n = Number(value)
  if (n >= MAX_INT) return undefined
  return parseFloat((percent ? n * 100 : n).toFixed(3))
}

function teammateToTeammateState(teammate: Teammate | undefined): TeammateState {
  if (!teammate?.characterId) return createDefaultTeammate()
  return {
    characterId: teammate.characterId,
    characterEidolon: teammate.characterEidolon,
    lightCone: teammate.lightCone,
    lightConeSuperimposition: teammate.lightConeSuperimposition,
    teamRelicSet: teammate.teamRelicSet,
    teamOrnamentSet: teammate.teamOrnamentSet,
    // Shallow-clone to prevent shared references (mirrors teammateStateToTeammate)
    characterConditionals: { ...(teammate.characterConditionals ?? {}) },
    lightConeConditionals: { ...(teammate.lightConeConditionals ?? {}) },
  }
}

const conditionalsTypeToKey = {
  character: 'characterConditionals',
  lightCone: 'lightConeConditionals',
  set: 'setConditionals',
} as const

/**
 * Surgically patches combo state JSON when a conditional's default value changes.
 * ONLY patches activations[0] (the default) for booleans or partitions[0].value
 * for number/select, preserving per-turn rotation customization in activations[1..N].
 */
export function patchComboConditionalDefault(
  comboStateJson: string,
  conditionalsType: 'character' | 'lightCone' | 'set',
  changedKeys: Record<string, unknown>,
  teammateIndex?: 0 | 1 | 2,
): string {
  if (!comboStateJson || comboStateJson === '{}') return comboStateJson

  let comboState: Record<string, unknown>
  try {
    comboState = JSON.parse(comboStateJson)
  } catch {
    return comboStateJson
  }

  const entity = teammateIndex != null
    ? comboState[`comboTeammate${teammateIndex}`] as Record<string, unknown> | undefined
    : comboState.comboCharacter as Record<string, unknown> | undefined
  if (!entity) return comboStateJson

  const conditionalsKey = conditionalsTypeToKey[conditionalsType]
  const conditionals = entity[conditionalsKey] as Record<string, Record<string, unknown>> | undefined
  if (!conditionals) return comboStateJson

  for (const [key, newValue] of Object.entries(changedKeys)) {
    const conditional = conditionals[key]
    if (!conditional) continue

    if (conditional.type === ConditionalDataType.BOOLEAN) {
      const activations = conditional.activations as unknown[]
      if (activations && activations.length > 0) {
        activations[0] = newValue
      }
    } else if (conditional.type === ConditionalDataType.NUMBER || conditional.type === ConditionalDataType.SELECT) {
      const partitions = conditional.partitions as Array<Record<string, unknown>>
      if (partitions && partitions.length > 0) {
        partitions[0].value = newValue
      }
    }
  }

  return JSON.stringify(comboState)
}
