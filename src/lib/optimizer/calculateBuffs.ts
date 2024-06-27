import {
  ABILITY_TYPE_TO_DMG_TYPE_VARIABLE,
  BASIC_TYPE,
  BREAK_TYPE,
  ComputedStatsObject,
  DOT_TYPE,
  FUA_TYPE,
  SKILL_TYPE,
  SUPER_BREAK_TYPE,
  ULT_TYPE
} from 'lib/conditionals/conditionalConstants'

/*
 * These methods handle buffing damage types for characters who have dynamic ability types. For example Yunli's FUA
 * can be both ULT and FUA dmg so buffs must be applied to both without overlapping.
 */


function extractAbilityTypeFlags(x: ComputedStatsObject, abilityTypeBitFlags: number[]) {
  let activeAbilityTypes = 0
  for (const abilityTypeBitFlag of abilityTypeBitFlags) {
    const dmgTypeVarName = ABILITY_TYPE_TO_DMG_TYPE_VARIABLE[abilityTypeBitFlag]
    activeAbilityTypes |= x[dmgTypeVarName]
  }

  return activeAbilityTypes
}

export function buffDmgTypeBoost(x: ComputedStatsObject, dmgTypeBitFlags: number[], value: number) {
  const activeAbilityTypes = extractAbilityTypeFlags(x, dmgTypeBitFlags)

  if (activeAbilityTypes & BASIC_TYPE) x.BASIC_BOOST += value
  if (activeAbilityTypes & SKILL_TYPE) x.SKILL_BOOST += value
  if (activeAbilityTypes & ULT_TYPE) x.ULT_BOOST += value
  if (activeAbilityTypes & FUA_TYPE) x.FUA_BOOST += value
  if (activeAbilityTypes & DOT_TYPE) x.DOT_BOOST += value
  // No break
}

export function buffDmgTypeVulnerability(x: ComputedStatsObject, dmgTypeBitFlags: number[], value: number) {
  const activeAbilityTypes = extractAbilityTypeFlags(x, dmgTypeBitFlags)

  if (activeAbilityTypes & BASIC_TYPE) x.BASIC_VULNERABILITY += value
  if (activeAbilityTypes & SKILL_TYPE) x.SKILL_VULNERABILITY += value
  if (activeAbilityTypes & ULT_TYPE) x.ULT_VULNERABILITY += value
  if (activeAbilityTypes & FUA_TYPE) x.FUA_VULNERABILITY += value
  if (activeAbilityTypes & DOT_TYPE) x.DOT_VULNERABILITY += value
  if (activeAbilityTypes & BREAK_TYPE) x.BREAK_VULNERABILITY += value
  // No super break
}

export function buffDmgTypeResShred(x: ComputedStatsObject, dmgTypeBitFlags: number[], value: number) {
  const activeAbilityTypes = extractAbilityTypeFlags(x, dmgTypeBitFlags)

  if (activeAbilityTypes & BASIC_TYPE) x.BASIC_RES_PEN += value
  if (activeAbilityTypes & SKILL_TYPE) x.SKILL_RES_PEN += value
  if (activeAbilityTypes & ULT_TYPE) x.ULT_RES_PEN += value
  if (activeAbilityTypes & FUA_TYPE) x.FUA_RES_PEN += value
  if (activeAbilityTypes & DOT_TYPE) x.DOT_RES_PEN += value
  // No break
}

export function buffDmgTypeDefShred(x: ComputedStatsObject, dmgTypeBitFlags: number[], value: number) {
  const activeAbilityTypes = extractAbilityTypeFlags(x, dmgTypeBitFlags)

  if (activeAbilityTypes & BASIC_TYPE) x.BASIC_DEF_PEN += value
  if (activeAbilityTypes & SKILL_TYPE) x.SKILL_DEF_PEN += value
  if (activeAbilityTypes & ULT_TYPE) x.ULT_DEF_PEN += value
  if (activeAbilityTypes & FUA_TYPE) x.FUA_DEF_PEN += value
  if (activeAbilityTypes & DOT_TYPE) x.DOT_DEF_PEN += value
  if (activeAbilityTypes & BREAK_TYPE) x.BREAK_DEF_PEN += value
  if (activeAbilityTypes & SUPER_BREAK_TYPE) x.SUPER_BREAK_DEF_PEN += value
}

export function buffDmgTypeCrBoost(x: ComputedStatsObject, dmgTypeBitFlags: number[], value: number) {
  const activeAbilityTypes = extractAbilityTypeFlags(x, dmgTypeBitFlags)

  if (activeAbilityTypes & BASIC_TYPE) x.BASIC_CR_BOOST += value
  if (activeAbilityTypes & SKILL_TYPE) x.SKILL_CR_BOOST += value
  if (activeAbilityTypes & ULT_TYPE) x.ULT_CR_BOOST += value
  if (activeAbilityTypes & FUA_TYPE) x.FUA_CR_BOOST += value
  // No fua break
}

export function buffDmgTypeCdBoost(x: ComputedStatsObject, dmgTypeBitFlags: number[], value: number) {
  const activeAbilityTypes = extractAbilityTypeFlags(x, dmgTypeBitFlags)

  if (activeAbilityTypes & BASIC_TYPE) x.BASIC_CD_BOOST += value
  if (activeAbilityTypes & SKILL_TYPE) x.SKILL_CD_BOOST += value
  if (activeAbilityTypes & ULT_TYPE) x.ULT_CD_BOOST += value
  if (activeAbilityTypes & FUA_TYPE) x.FUA_CD_BOOST += value
  // No fua break
}
