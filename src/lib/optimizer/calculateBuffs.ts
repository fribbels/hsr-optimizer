import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { ComputedStatsArray, Key } from 'lib/optimizer/computedStatsArray'

/*
 * These methods handle buffing damage types for characters who have dynamic ability types. For example Yunli's FUA
 * can be both ULT and FUA dmg so buffs must be applied to both without overlapping.
 *
 * The flags are bitwise, so the usage should be:
 * buffAbilityDmg(x, BASIC_TYPE | SKILL_TYPE, 1.00, condition)
 *
 * And changing characters ability type should be:
 * x.BASIC_DMG_TYPE = BASIC_TYPE | FUA_TYPE
 */

type Condition = boolean | number | undefined

export function buffAbilityDmg(x: ComputedStatsObject, abilityTypeFlags: number, value: number, condition?: Condition) {
  if (condition === false) return

  if (abilityTypeFlags & x.BASIC_DMG_TYPE) x.BASIC_BOOST += value
  if (abilityTypeFlags & x.SKILL_DMG_TYPE) x.SKILL_BOOST += value
  if (abilityTypeFlags & x.ULT_DMG_TYPE) x.ULT_BOOST += value
  if (abilityTypeFlags & x.FUA_DMG_TYPE) x.FUA_BOOST += value
  if (abilityTypeFlags & x.DOT_DMG_TYPE) x.DOT_BOOST += value
  // No break
}

export function _buffAbilityDmg(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: string) {
  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) x.BASIC_BOOST.buff(value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) x.SKILL_BOOST.buff(value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) x.ULT_BOOST.buff(value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) x.FUA_BOOST.buff(value, source)
  if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) x.DOT_BOOST.buff(value, source)
}

export function buffAbilityVulnerability(x: ComputedStatsObject, abilityTypeFlags: number, value: number, condition?: Condition) {
  if (condition === false) return

  if (abilityTypeFlags & x.BASIC_DMG_TYPE) x.BASIC_VULNERABILITY += value
  if (abilityTypeFlags & x.SKILL_DMG_TYPE) x.SKILL_VULNERABILITY += value
  if (abilityTypeFlags & x.ULT_DMG_TYPE) x.ULT_VULNERABILITY += value
  if (abilityTypeFlags & x.FUA_DMG_TYPE) x.FUA_VULNERABILITY += value
  if (abilityTypeFlags & x.DOT_DMG_TYPE) x.DOT_VULNERABILITY += value
  if (abilityTypeFlags & x.BREAK_DMG_TYPE) x.BREAK_VULNERABILITY += value
  // No super break
}

export function _buffAbilityVulnerability(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: string) {
  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) x.BASIC_VULNERABILITY.buff(value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) x.SKILL_VULNERABILITY.buff(value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) x.ULT_VULNERABILITY.buff(value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) x.FUA_VULNERABILITY.buff(value, source)
  if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) x.DOT_VULNERABILITY.buff(value, source)
  if (abilityTypeFlags & x.a[Key.BREAK_DMG_TYPE]) x.BREAK_VULNERABILITY.buff(value, source)
  // No super break
}

export function buffAbilityResPen(x: ComputedStatsObject, abilityTypeFlags: number, value: number, condition?: Condition) {
  if (condition === false) return

  if (abilityTypeFlags & x.BASIC_DMG_TYPE) x.BASIC_RES_PEN += value
  if (abilityTypeFlags & x.SKILL_DMG_TYPE) x.SKILL_RES_PEN += value
  if (abilityTypeFlags & x.ULT_DMG_TYPE) x.ULT_RES_PEN += value
  if (abilityTypeFlags & x.FUA_DMG_TYPE) x.FUA_RES_PEN += value
  if (abilityTypeFlags & x.DOT_DMG_TYPE) x.DOT_RES_PEN += value
  // No break
}

export function _buffAbilityResPen(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: string) {
  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) x.BASIC_RES_PEN.buff(value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) x.SKILL_RES_PEN.buff(value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) x.ULT_RES_PEN.buff(value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) x.FUA_RES_PEN.buff(value, source)
  if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) x.DOT_RES_PEN.buff(value, source)
  // No break
}

export function buffAbilityDefPen(x: ComputedStatsObject, abilityTypeFlags: number, value: number, condition?: Condition) {
  if (condition === false) return

  if (abilityTypeFlags & x.BASIC_DMG_TYPE) x.BASIC_DEF_PEN += value
  if (abilityTypeFlags & x.SKILL_DMG_TYPE) x.SKILL_DEF_PEN += value
  if (abilityTypeFlags & x.ULT_DMG_TYPE) x.ULT_DEF_PEN += value
  if (abilityTypeFlags & x.FUA_DMG_TYPE) x.FUA_DEF_PEN += value
  if (abilityTypeFlags & x.DOT_DMG_TYPE) x.DOT_DEF_PEN += value
  if (abilityTypeFlags & x.BREAK_DMG_TYPE) x.BREAK_DEF_PEN += value
  if (abilityTypeFlags & x.SUPER_BREAK_DMG_TYPE) x.SUPER_BREAK_DEF_PEN += value
}

export function _buffAbilityDefPen(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: string) {
  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) x.BASIC_DEF_PEN.buff(value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) x.SKILL_DEF_PEN.buff(value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) x.ULT_DEF_PEN.buff(value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) x.FUA_DEF_PEN.buff(value, source)
  if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) x.DOT_DEF_PEN.buff(value, source)
  if (abilityTypeFlags & x.a[Key.BREAK_DMG_TYPE]) x.BREAK_DEF_PEN.buff(value, source)
  if (abilityTypeFlags & x.a[Key.SUPER_BREAK_DMG_TYPE]) x.SUPER_BREAK_DEF_PEN.buff(value, source)
}

export function buffAbilityCr(x: ComputedStatsObject, abilityTypeFlags: number, value: number, condition?: Condition) {
  if (condition === false) return

  if (abilityTypeFlags & x.BASIC_DMG_TYPE) x.BASIC_CR_BOOST += value
  if (abilityTypeFlags & x.SKILL_DMG_TYPE) x.SKILL_CR_BOOST += value
  if (abilityTypeFlags & x.ULT_DMG_TYPE) x.ULT_CR_BOOST += value
  if (abilityTypeFlags & x.FUA_DMG_TYPE) x.FUA_CR_BOOST += value
  // No dot, break
}

export function _buffAbilityCr(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: string) {
  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) x.BASIC_CR_BOOST.buff(value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) x.SKILL_CR_BOOST.buff(value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) x.ULT_CR_BOOST.buff(value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) x.FUA_CR_BOOST.buff(value, source)
  // No dot, break
}

export function buffAbilityCd(x: ComputedStatsObject, abilityTypeFlags: number, value: number, condition?: Condition) {
  if (condition === false) return

  if (abilityTypeFlags & x.BASIC_DMG_TYPE) x.BASIC_CD_BOOST += value
  if (abilityTypeFlags & x.SKILL_DMG_TYPE) x.SKILL_CD_BOOST += value
  if (abilityTypeFlags & x.ULT_DMG_TYPE) x.ULT_CD_BOOST += value
  if (abilityTypeFlags & x.FUA_DMG_TYPE) x.FUA_CD_BOOST += value
  // No dot, break
}

export function _buffAbilityCd(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: string) {
  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) x.BASIC_CD_BOOST.buff(value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) x.SKILL_CD_BOOST.buff(value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) x.ULT_CD_BOOST.buff(value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) x.FUA_CD_BOOST.buff(value, source)
  // No dot, break
}
