import { Constants, Parts } from 'lib/constants/constants'
import {
  OpenCloseIDs,
  setClose,
} from 'lib/hooks/useOpenClose'
import { Optimizer } from 'lib/optimization/optimizer'
import { AppPages } from 'lib/constants/appPages'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { useCharacterStore } from 'lib/stores/character/characterStore'
import { recalculatePermutations } from 'lib/tabs/tabOptimizer/optimizerForm/optimizerFormActions'
import { getRelics } from 'lib/stores/relic/relicStore'
import { useOptimizerRequestStore } from 'lib/stores/optimizerForm/useOptimizerRequestStore'
import { useOptimizerDisplayStore } from 'lib/stores/optimizerUI/useOptimizerDisplayStore'
import type { MainStatPart, RatingFilterState, StatFilterState } from 'lib/stores/optimizerForm/optimizerFormTypes'
import type { Form } from 'types/form'

// ---- Zero Permutations ----

export enum ZeroPermRootCause {
  IMPORT = 'IMPORT',
  BODY_MAIN = 'BODY_MAIN',
  FEET_MAIN = 'FEET_MAIN',
  PLANAR_SPHERE_MAIN = 'PLANAR_SPHERE_MAIN',
  LINK_ROPE_MAIN = 'LINK_ROPE_MAIN',
  RELIC_SETS = 'RELIC_SETS',
  ORNAMENT_SETS = 'ORNAMENT_SETS',
  KEEP_CURRENT = 'KEEP_CURRENT',
  PRIORITY = 'PRIORITY',
  EXCLUDE_ENABLED = 'EXCLUDE_ENABLED',
  EQUIPPED_DISABLED = 'EQUIPPED_DISABLED',
  MINIMUM_ROLLS = 'MINIMUM_ROLLS',
}

function mainStatFixes(part: Exclude<Parts, typeof Parts.Head | typeof Parts.Hands>) {
  return {
    descriptionKey: `0Perms.RootCauses.${part}_MAIN.Description` as const,
    buttonTextKey: `0Perms.RootCauses.${part}_MAIN.ButtonText` as const,
    applyFix: () => {
      useOptimizerRequestStore.getState().setMainStats(`main${part}` as MainStatPart, [])
    },
    successMessageKey: `0Perms.RootCauses.${part}_MAIN.SuccessMessage` as const,
  }
}

export const ZeroPermRootCauseFixes = {
  [ZeroPermRootCause.IMPORT]: {
    descriptionKey: '0Perms.RootCauses.IMPORT.Description',
    buttonTextKey: '0Perms.RootCauses.IMPORT.ButtonText',
    applyFix: () => {
      useGlobalStore.getState().setActiveKey(AppPages.IMPORT)
      setClose(OpenCloseIDs.ZERO_PERMS_MODAL)
    },
    successMessageKey: '0Perms.RootCauses.IMPORT.SuccessMessage',
  },
  [ZeroPermRootCause.BODY_MAIN]: mainStatFixes(Parts.Body),
  [ZeroPermRootCause.FEET_MAIN]: mainStatFixes(Parts.Feet),
  [ZeroPermRootCause.PLANAR_SPHERE_MAIN]: mainStatFixes(Parts.PlanarSphere),
  [ZeroPermRootCause.LINK_ROPE_MAIN]: mainStatFixes(Parts.LinkRope),
  [ZeroPermRootCause.RELIC_SETS]: {
    descriptionKey: '0Perms.RootCauses.RELIC_SETS.Description',
    buttonTextKey: '0Perms.RootCauses.RELIC_SETS.ButtonText',
    applyFix: () => {
      const current = useOptimizerRequestStore.getState().setFilters
      useOptimizerRequestStore.getState().setSetFilters({ ...current, fourPiece: [], twoPieceCombos: [] })
    },
    successMessageKey: '0Perms.RootCauses.RELIC_SETS.SuccessMessage',
  },
  [ZeroPermRootCause.ORNAMENT_SETS]: {
    descriptionKey: '0Perms.RootCauses.ORNAMENT_SETS.Description',
    buttonTextKey: '0Perms.RootCauses.ORNAMENT_SETS.ButtonText',
    applyFix: () => {
      const current = useOptimizerRequestStore.getState().setFilters
      useOptimizerRequestStore.getState().setSetFilters({ ...current, ornaments: [] })
    },
    successMessageKey: '0Perms.RootCauses.ORNAMENT_SETS.SuccessMessage',
  },
  [ZeroPermRootCause.KEEP_CURRENT]: {
    descriptionKey: '0Perms.RootCauses.KEEP_CURRENT.Description',
    buttonTextKey: '0Perms.RootCauses.KEEP_CURRENT.ButtonText',
    applyFix: () => {
      useOptimizerRequestStore.getState().setRelicFilterField('keepCurrentRelics', false)
    },
    successMessageKey: '0Perms.RootCauses.KEEP_CURRENT.SuccessMessage',
  },
  [ZeroPermRootCause.PRIORITY]: {
    descriptionKey: '0Perms.RootCauses.PRIORITY.Description',
    buttonTextKey: '0Perms.RootCauses.PRIORITY.ButtonText',
    applyFix: () => {
      useCharacterStore.getState().insertCharacter(useOptimizerDisplayStore.getState().focusCharacterId!, 0)
      recalculatePermutations()
    },
    successMessageKey: '0Perms.RootCauses.PRIORITY.SuccessMessage',
  },
  [ZeroPermRootCause.EXCLUDE_ENABLED]: {
    descriptionKey: '0Perms.RootCauses.EXCLUDE_ENABLED.Description',
    buttonTextKey: '0Perms.RootCauses.EXCLUDE_ENABLED.ButtonText',
    applyFix: () => {
      useOptimizerRequestStore.getState().setRelicFilterField('exclude', [])
    },
    successMessageKey: '0Perms.RootCauses.EXCLUDE_ENABLED.SuccessMessage',
  },
  [ZeroPermRootCause.EQUIPPED_DISABLED]: {
    descriptionKey: '0Perms.RootCauses.EQUIPPED_DISABLED.Description',
    buttonTextKey: '0Perms.RootCauses.EQUIPPED_DISABLED.ButtonText',
    applyFix: () => {
      useOptimizerRequestStore.getState().setRelicFilterField('includeEquippedRelics', true)
    },
    successMessageKey: '0Perms.RootCauses.EQUIPPED_DISABLED.SuccessMessage',
  },
  [ZeroPermRootCause.MINIMUM_ROLLS]: {
    descriptionKey: '0Perms.RootCauses.MINIMUM_ROLLS.Description',
    buttonTextKey: '0Perms.RootCauses.MINIMUM_ROLLS.ButtonText',
    applyFix: () => {
      useOptimizerRequestStore.getState().setWeight('minWeightedRolls', 0)
    },
    successMessageKey: '0Perms.RootCauses.MINIMUM_ROLLS.SuccessMessage',
  },
} as const

/**
 * Detects root causes for zero permutations. Pure logic -- returns the list
 * of detected causes without side effects.
 */
export function detectZeroPermutationCauses(request: Form): ZeroPermRootCause[] {
  const causes: ZeroPermRootCause[] = []

  const { counts, preCounts } = Optimizer.getFilteredRelicCounts(request)
  const allRelics = getRelics()

  // Zero relics overrides everything else
  if (allRelics.length === 0) {
    return [ZeroPermRootCause.IMPORT]
  }

  // Main stats
  if (counts.Body === 0 && request.mainBody.length > 0 && preCounts.Body > 0) {
    causes.push(ZeroPermRootCause.BODY_MAIN)
  }
  if (counts.Feet === 0 && request.mainFeet.length > 0 && preCounts.Feet > 0) {
    causes.push(ZeroPermRootCause.FEET_MAIN)
  }
  if (counts.PlanarSphere === 0 && request.mainPlanarSphere.length > 0 && preCounts.PlanarSphere > 0) {
    causes.push(ZeroPermRootCause.PLANAR_SPHERE_MAIN)
  }
  if (counts.LinkRope === 0 && request.mainLinkRope.length > 0 && preCounts.LinkRope > 0) {
    causes.push(ZeroPermRootCause.LINK_ROPE_MAIN)
  }

  // Ornament sets
  if (counts.PlanarSphere === 0 || counts.LinkRope === 0) {
    if (request.ornamentSets.length > 0) {
      causes.push(ZeroPermRootCause.ORNAMENT_SETS)
    }
  }

  // Relic sets
  if (counts.Head === 0 || counts.Hands === 0 || counts.Body === 0 || counts.Feet === 0) {
    if (request.relicSets.length > 0) {
      causes.push(ZeroPermRootCause.RELIC_SETS)
    }
  }

  // Keep current
  if (request.keepCurrentRelics) {
    causes.push(ZeroPermRootCause.KEEP_CURRENT)
  }

  // Priority
  if (request.rank !== 0) {
    causes.push(ZeroPermRootCause.PRIORITY)
  }

  // Exclude enabled
  if (request.exclude.length > 0) {
    causes.push(ZeroPermRootCause.EXCLUDE_ENABLED)
  }

  // Equipped disabled
  if (!request.includeEquippedRelics) {
    causes.push(ZeroPermRootCause.EQUIPPED_DISABLED)
  }

  // Minimum rolls
  if ((request.weights.minWeightedRolls ?? 0) > 0) {
    causes.push(ZeroPermRootCause.MINIMUM_ROLLS)
  }

  // Fallback: default to import issue
  if (causes.length === 0) {
    causes.push(ZeroPermRootCause.IMPORT)
  }

  return causes
}

// ---- Zero Results ----

export enum ZeroResultRootCause {
  MIN_HP = 'MIN_HP',
  MAX_HP = 'MAX_HP',
  MIN_ATK = 'MIN_ATK',
  MAX_ATK = 'MAX_ATK',
  MIN_DEF = 'MIN_DEF',
  MAX_DEF = 'MAX_DEF',
  MIN_SPD = 'MIN_SPD',
  MAX_SPD = 'MAX_SPD',
  MIN_CR = 'MIN_CR',
  MAX_CR = 'MAX_CR',
  MIN_CD = 'MIN_CD',
  MAX_CD = 'MAX_CD',
  MIN_EHR = 'MIN_EHR',
  MAX_EHR = 'MAX_EHR',
  MIN_RES = 'MIN_RES',
  MAX_RES = 'MAX_RES',
  MIN_BE = 'MIN_BE',
  MAX_BE = 'MAX_BE',
  MIN_ERR = 'MIN_ERR',
  MAX_ERR = 'MAX_ERR',
  MIN_EHP = 'MIN_EHP',
  MAX_EHP = 'MAX_EHP',
  MIN_BASIC = 'MIN_BASIC',
  MAX_BASIC = 'MAX_BASIC',
  MIN_SKILL = 'MIN_SKILL',
  MAX_SKILL = 'MAX_SKILL',
  MIN_ULT = 'MIN_ULT',
  MAX_ULT = 'MAX_ULT',
  MIN_FUA = 'MIN_FUA',
  MAX_FUA = 'MAX_FUA',
  MIN_MEMO_SKILL = 'MIN_MEMO_SKILL',
  MAX_MEMO_SKILL = 'MAX_MEMO_SKILL',
  MIN_MEMO_TALENT = 'MIN_MEMO_TALENT',
  MAX_MEMO_TALENT = 'MAX_MEMO_TALENT',
  MIN_DOT = 'MIN_DOT',
  MAX_DOT = 'MAX_DOT',
  MIN_BREAK = 'MIN_BREAK',
  MAX_BREAK = 'MAX_BREAK',
  MIN_COMBO = 'MIN_COMBO',
  MAX_COMBO = 'MAX_COMBO',
  STAT_VIEW = 'STAT_VIEW',
}

function filterFixes(filter: ZeroResultRootCause) {
  const split = filter.split('_')
  const formAddress = split[0].toLowerCase()
    + split.slice(1).map((s) => s[0] + s.slice(1).toLowerCase()).join('')
  return {
    descriptionKey: `0Results.RootCauses.${filter}.Description` as const,
    buttonTextKey: `0Results.RootCauses.${filter}.ButtonText` as const,
    applyFix: () => {
      const store = useOptimizerRequestStore.getState()
      if (formAddress in store.statFilters) {
        store.setStatFilter(formAddress as keyof StatFilterState, undefined)
      } else if (formAddress in store.ratingFilters) {
        store.setRatingFilter(formAddress as keyof RatingFilterState, undefined)
      }
    },
    successMessageKey: `0Results.RootCauses.${filter}.SuccessMessage` as const,
  }
}

export const ZeroResultRootCauseFixes = {
  [ZeroResultRootCause.MAX_HP]: filterFixes(ZeroResultRootCause.MAX_HP),
  [ZeroResultRootCause.MIN_HP]: filterFixes(ZeroResultRootCause.MIN_HP),
  [ZeroResultRootCause.MAX_ATK]: filterFixes(ZeroResultRootCause.MAX_ATK),
  [ZeroResultRootCause.MIN_ATK]: filterFixes(ZeroResultRootCause.MIN_ATK),
  [ZeroResultRootCause.MAX_DEF]: filterFixes(ZeroResultRootCause.MAX_DEF),
  [ZeroResultRootCause.MIN_DEF]: filterFixes(ZeroResultRootCause.MIN_DEF),
  [ZeroResultRootCause.MAX_SPD]: filterFixes(ZeroResultRootCause.MAX_SPD),
  [ZeroResultRootCause.MIN_SPD]: filterFixes(ZeroResultRootCause.MIN_SPD),
  [ZeroResultRootCause.MAX_CR]: filterFixes(ZeroResultRootCause.MAX_CR),
  [ZeroResultRootCause.MIN_CR]: filterFixes(ZeroResultRootCause.MIN_CR),
  [ZeroResultRootCause.MAX_CD]: filterFixes(ZeroResultRootCause.MAX_CD),
  [ZeroResultRootCause.MIN_CD]: filterFixes(ZeroResultRootCause.MIN_CD),
  [ZeroResultRootCause.MAX_EHR]: filterFixes(ZeroResultRootCause.MAX_EHR),
  [ZeroResultRootCause.MIN_EHR]: filterFixes(ZeroResultRootCause.MIN_EHR),
  [ZeroResultRootCause.MAX_RES]: filterFixes(ZeroResultRootCause.MAX_RES),
  [ZeroResultRootCause.MIN_RES]: filterFixes(ZeroResultRootCause.MIN_RES),
  [ZeroResultRootCause.MAX_BE]: filterFixes(ZeroResultRootCause.MAX_BE),
  [ZeroResultRootCause.MIN_BE]: filterFixes(ZeroResultRootCause.MIN_BE),
  [ZeroResultRootCause.MAX_ERR]: filterFixes(ZeroResultRootCause.MAX_ERR),
  [ZeroResultRootCause.MIN_ERR]: filterFixes(ZeroResultRootCause.MIN_ERR),
  [ZeroResultRootCause.MAX_EHP]: filterFixes(ZeroResultRootCause.MAX_EHP),
  [ZeroResultRootCause.MIN_EHP]: filterFixes(ZeroResultRootCause.MIN_EHP),
  [ZeroResultRootCause.MAX_BASIC]: filterFixes(ZeroResultRootCause.MAX_BASIC),
  [ZeroResultRootCause.MIN_BASIC]: filterFixes(ZeroResultRootCause.MIN_BASIC),
  [ZeroResultRootCause.MAX_SKILL]: filterFixes(ZeroResultRootCause.MAX_SKILL),
  [ZeroResultRootCause.MIN_SKILL]: filterFixes(ZeroResultRootCause.MIN_SKILL),
  [ZeroResultRootCause.MAX_ULT]: filterFixes(ZeroResultRootCause.MAX_ULT),
  [ZeroResultRootCause.MIN_ULT]: filterFixes(ZeroResultRootCause.MIN_ULT),
  [ZeroResultRootCause.MAX_FUA]: filterFixes(ZeroResultRootCause.MAX_FUA),
  [ZeroResultRootCause.MIN_FUA]: filterFixes(ZeroResultRootCause.MIN_FUA),
  [ZeroResultRootCause.MAX_DOT]: filterFixes(ZeroResultRootCause.MAX_DOT),
  [ZeroResultRootCause.MIN_DOT]: filterFixes(ZeroResultRootCause.MIN_DOT),
  [ZeroResultRootCause.MAX_BREAK]: filterFixes(ZeroResultRootCause.MAX_BREAK),
  [ZeroResultRootCause.MIN_BREAK]: filterFixes(ZeroResultRootCause.MIN_BREAK),
  [ZeroResultRootCause.MIN_MEMO_SKILL]: filterFixes(ZeroResultRootCause.MIN_MEMO_SKILL),
  [ZeroResultRootCause.MAX_MEMO_SKILL]: filterFixes(ZeroResultRootCause.MAX_MEMO_SKILL),
  [ZeroResultRootCause.MIN_MEMO_TALENT]: filterFixes(ZeroResultRootCause.MIN_MEMO_TALENT),
  [ZeroResultRootCause.MAX_MEMO_TALENT]: filterFixes(ZeroResultRootCause.MAX_MEMO_TALENT),
  [ZeroResultRootCause.MAX_COMBO]: filterFixes(ZeroResultRootCause.MAX_COMBO),
  [ZeroResultRootCause.MIN_COMBO]: filterFixes(ZeroResultRootCause.MIN_COMBO),
  [ZeroResultRootCause.STAT_VIEW]: {
    descriptionKey: `0Results.RootCauses.StatView.Description`,
    buttonTextKey: `0Results.RootCauses.StatView.ButtonText`,
    applyFix: () => {
      const setStatDisplay = useOptimizerRequestStore.getState().setStatDisplay
      setStatDisplay('combat')
    },
    successMessageKey: '0Results.RootCauses.StatView.SuccessMessage',
  },
} as const

const MAX_INT = Constants.MAX_INT

/**
 * Detects root causes for zero results. Pure logic -- returns the list
 * of detected causes without side effects.
 */
export function detectZeroResultCauses(request: Form): ZeroResultRootCause[] {
  const causes: ZeroResultRootCause[] = []

  // Always suggest switching between combat/basic views
  if (useOptimizerRequestStore.getState().statDisplay === 'base') causes.push(ZeroResultRootCause.STAT_VIEW)

  if (request.minHp) causes.push(ZeroResultRootCause.MIN_HP)
  if (request.maxHp < MAX_INT) causes.push(ZeroResultRootCause.MAX_HP)
  if (request.minAtk) causes.push(ZeroResultRootCause.MIN_ATK)
  if (request.maxAtk < MAX_INT) causes.push(ZeroResultRootCause.MAX_ATK)
  if (request.minDef) causes.push(ZeroResultRootCause.MIN_DEF)
  if (request.maxDef < MAX_INT) causes.push(ZeroResultRootCause.MAX_DEF)
  if (request.minSpd) causes.push(ZeroResultRootCause.MIN_SPD)
  if (request.maxSpd < MAX_INT) causes.push(ZeroResultRootCause.MAX_SPD)
  if (request.minCr) causes.push(ZeroResultRootCause.MIN_CR)
  if (request.maxCr < MAX_INT) causes.push(ZeroResultRootCause.MAX_CR)
  if (request.minCd) causes.push(ZeroResultRootCause.MIN_CD)
  if (request.maxCd < MAX_INT) causes.push(ZeroResultRootCause.MAX_CD)
  if (request.minEhr) causes.push(ZeroResultRootCause.MIN_EHR)
  if (request.maxEhr < MAX_INT) causes.push(ZeroResultRootCause.MAX_EHR)
  if (request.minRes) causes.push(ZeroResultRootCause.MIN_RES)
  if (request.maxRes < MAX_INT) causes.push(ZeroResultRootCause.MAX_RES)
  if (request.minBe) causes.push(ZeroResultRootCause.MIN_BE)
  if (request.maxBe < MAX_INT) causes.push(ZeroResultRootCause.MAX_BE)
  if (request.minErr) causes.push(ZeroResultRootCause.MIN_ERR)
  if (request.maxErr < MAX_INT) causes.push(ZeroResultRootCause.MAX_ERR)
  if (request.minEhp) causes.push(ZeroResultRootCause.MIN_EHP)
  if (request.maxEhp < MAX_INT) causes.push(ZeroResultRootCause.MAX_EHP)
  if (request.minBasic) causes.push(ZeroResultRootCause.MIN_BASIC)
  if (request.maxBasic < MAX_INT) causes.push(ZeroResultRootCause.MAX_BASIC)
  if (request.minSkill) causes.push(ZeroResultRootCause.MIN_SKILL)
  if (request.maxSkill < MAX_INT) causes.push(ZeroResultRootCause.MAX_SKILL)
  if (request.minUlt) causes.push(ZeroResultRootCause.MIN_ULT)
  if (request.maxUlt < MAX_INT) causes.push(ZeroResultRootCause.MAX_ULT)
  if (request.minFua) causes.push(ZeroResultRootCause.MIN_FUA)
  if (request.maxFua < MAX_INT) causes.push(ZeroResultRootCause.MAX_FUA)
  if (request.minMemoSkill) causes.push(ZeroResultRootCause.MIN_MEMO_SKILL)
  if (request.maxMemoSkill < MAX_INT) causes.push(ZeroResultRootCause.MAX_MEMO_SKILL)
  if (request.minMemoTalent) causes.push(ZeroResultRootCause.MIN_MEMO_TALENT)
  if (request.maxMemoTalent < MAX_INT) causes.push(ZeroResultRootCause.MAX_MEMO_TALENT)
  if (request.minDot) causes.push(ZeroResultRootCause.MIN_DOT)
  if (request.maxDot < MAX_INT) causes.push(ZeroResultRootCause.MAX_DOT)
  if (request.minBreak) causes.push(ZeroResultRootCause.MIN_BREAK)
  if (request.maxBreak < MAX_INT) causes.push(ZeroResultRootCause.MAX_BREAK)

  return causes
}

export type RootCauseFix = typeof ZeroPermRootCauseFixes[ZeroPermRootCause] | typeof ZeroResultRootCauseFixes[ZeroResultRootCause]
