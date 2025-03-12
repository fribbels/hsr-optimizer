import { BuffSource } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key, StatController } from 'lib/optimization/computedStatsArray'

/*
 * These methods handle buffing damage types for characters who have dynamic ability types. For example Yunli's FUA
 * can be both ULT and FUA dmg so buffs must be applied to both without overlapping.
 *
 * The flags are bitwise, so the usage should be:
 * buffAbilityDmg(x, BASIC_DMG_TYPE | SKILL_DMG_TYPE, 1.00, condition)
 *
 * And changing characters ability type should be:
 * x.BASIC_DMG_TYPE = BASIC_DMG_TYPE | FUA_DMG_TYPE
 */

export enum Target {
  MAIN,
  MEMO,
  DUAL,
  TEAM,
  SINGLE,
}

function targetSelection(target: Target, statController: StatController, value: number, source: BuffSource) {
  switch (target) {
    case Target.MAIN:
      statController.buff(value, source)
      break
    case Target.MEMO:
      statController.buffMemo(value, source)
      break
    case Target.DUAL:
      statController.buffDual(value, source)
      break
    case Target.TEAM:
      statController.buffTeam(value, source)
      break
    case Target.SINGLE:
      statController.buffSingle(value, source)
      break
  }
}

export function allTypesExcept(abilityTypeFlags: number) {
  return ~abilityTypeFlags
}

export function buffAbilityTrueDmg(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: BuffSource, target = Target.MAIN) {
  if (value == 0) return

  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) targetSelection(target, x.BASIC_TRUE_DMG_MODIFIER, value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) targetSelection(target, x.SKILL_TRUE_DMG_MODIFIER, value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) targetSelection(target, x.ULT_TRUE_DMG_MODIFIER, value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) targetSelection(target, x.FUA_TRUE_DMG_MODIFIER, value, source)
  if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) targetSelection(target, x.DOT_TRUE_DMG_MODIFIER, value, source)
  if (abilityTypeFlags & x.a[Key.BREAK_DMG_TYPE]) targetSelection(target, x.BREAK_TRUE_DMG_MODIFIER, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_SKILL_DMG_TYPE]) targetSelection(target, x.MEMO_SKILL_TRUE_DMG_MODIFIER, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_TALENT_DMG_TYPE]) targetSelection(target, x.MEMO_TALENT_TRUE_DMG_MODIFIER, value, source)
  // if (abilityTypeFlags & x.a[Key.SUPER_BREAK_DMG_TYPE]) targetSelection(target, x.SUPER_BREAK_TRUE_DMG_MODIFIER, value, source)
  // if (abilityTypeFlags & x.a[Key.ADDITIONAL_DMG_TYPE]) targetSelection(target, x.ADDITIONAL_TRUE_DMG_MODIFIER, value, source)
}

export function buffAbilityDmg(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: BuffSource, target = Target.MAIN) {
  if (value == 0) return

  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) targetSelection(target, x.BASIC_DMG_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) targetSelection(target, x.SKILL_DMG_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) targetSelection(target, x.ULT_DMG_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) targetSelection(target, x.FUA_DMG_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) targetSelection(target, x.DOT_DMG_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.BREAK_DMG_TYPE]) targetSelection(target, x.BREAK_DMG_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_SKILL_DMG_TYPE]) targetSelection(target, x.MEMO_SKILL_DMG_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_TALENT_DMG_TYPE]) targetSelection(target, x.MEMO_TALENT_DMG_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.ADDITIONAL_DMG_TYPE]) targetSelection(target, x.ADDITIONAL_DMG_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.SUPER_BREAK_DMG_TYPE]) targetSelection(target, x.SUPER_BREAK_DMG_BOOST, value, source)
}

export function buffAbilityVulnerability(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: BuffSource, target = Target.MAIN) {
  if (value == 0) return

  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) targetSelection(target, x.BASIC_VULNERABILITY, value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) targetSelection(target, x.SKILL_VULNERABILITY, value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) targetSelection(target, x.ULT_VULNERABILITY, value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) targetSelection(target, x.FUA_VULNERABILITY, value, source)
  if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) targetSelection(target, x.DOT_VULNERABILITY, value, source)
  if (abilityTypeFlags & x.a[Key.BREAK_DMG_TYPE]) targetSelection(target, x.BREAK_VULNERABILITY, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_SKILL_DMG_TYPE]) targetSelection(target, x.MEMO_SKILL_VULNERABILITY, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_TALENT_DMG_TYPE]) targetSelection(target, x.MEMO_TALENT_VULNERABILITY, value, source)
  // if (abilityTypeFlags & x.a[Key.ADDITIONAL_DMG_TYPE]) targetSelection(target, x.ADDITIONAL_VULNERABILITY, value, source)
  if (abilityTypeFlags & x.a[Key.SUPER_BREAK_DMG_TYPE]) targetSelection(target, x.SUPER_BREAK_VULNERABILITY, value, source)
}

export function buffAbilityResPen(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: BuffSource, target = Target.MAIN) {
  if (value == 0) return

  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) targetSelection(target, x.BASIC_RES_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) targetSelection(target, x.SKILL_RES_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) targetSelection(target, x.ULT_RES_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) targetSelection(target, x.FUA_RES_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) targetSelection(target, x.DOT_RES_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.BREAK_DMG_TYPE]) targetSelection(target, x.BREAK_RES_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_SKILL_DMG_TYPE]) targetSelection(target, x.MEMO_SKILL_RES_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_TALENT_DMG_TYPE]) targetSelection(target, x.MEMO_TALENT_RES_PEN, value, source)
  // if (abilityTypeFlags & x.a[Key.ADDITIONAL_DMG_TYPE]) targetSelection(target, x.ADDITIONAL_RES_PEN, value, source)
  // if (abilityTypeFlags & x.a[Key.SUPER_BREAK_DMG_TYPE]) targetSelection(target, x.SUPER_BREAK_RES_PEN, value, source)
}

export function buffAbilityDefPen(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: BuffSource, target = Target.MAIN) {
  if (value == 0) return

  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) targetSelection(target, x.BASIC_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) targetSelection(target, x.SKILL_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) targetSelection(target, x.ULT_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) targetSelection(target, x.FUA_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) targetSelection(target, x.DOT_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.BREAK_DMG_TYPE]) targetSelection(target, x.BREAK_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_SKILL_DMG_TYPE]) targetSelection(target, x.MEMO_SKILL_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_TALENT_DMG_TYPE]) targetSelection(target, x.MEMO_TALENT_DEF_PEN, value, source)
  // if (abilityTypeFlags & x.a[Key.ADDITIONAL_DMG_TYPE]) targetSelection(target, x.ADDITIONAL_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.SUPER_BREAK_DMG_TYPE]) targetSelection(target, x.SUPER_BREAK_DEF_PEN, value, source)
}

export function buffAbilityCr(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: BuffSource, target = Target.MAIN) {
  if (value == 0) return

  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) targetSelection(target, x.BASIC_CR_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) targetSelection(target, x.SKILL_CR_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) targetSelection(target, x.ULT_CR_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) targetSelection(target, x.FUA_CR_BOOST, value, source)
  // if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) targetSelection(target, x.DOT_CR_BOOST, value, source)
  // if (abilityTypeFlags & x.a[Key.BREAK_DMG_TYPE]) targetSelection(target, x.BREAK_CR_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_SKILL_DMG_TYPE]) targetSelection(target, x.MEMO_SKILL_CR_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_TALENT_DMG_TYPE]) targetSelection(target, x.MEMO_TALENT_CR_BOOST, value, source)
  // if (abilityTypeFlags & x.a[Key.ADDITIONAL_DMG_TYPE]) targetSelection(target, x.ADDITIONAL_CR_BOOST, value, source)
  // if (abilityTypeFlags & x.a[Key.SUPER_BREAK_DMG_TYPE]) targetSelection(target, x.SUPER_BREAK_CR_BOOST, value, source)
}

export function buffAbilityCd(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: BuffSource, target = Target.MAIN) {
  if (value == 0) return

  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) targetSelection(target, x.BASIC_CD_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) targetSelection(target, x.SKILL_CD_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) targetSelection(target, x.ULT_CD_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) targetSelection(target, x.FUA_CD_BOOST, value, source)
  // if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) targetSelection(target, x.DOT_CD_BOOST, value, source)
  // if (abilityTypeFlags & x.a[Key.BREAK_DMG_TYPE]) targetSelection(target, x.BREAK_CD_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_SKILL_DMG_TYPE]) targetSelection(target, x.MEMO_SKILL_CD_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.MEMO_TALENT_DMG_TYPE]) targetSelection(target, x.MEMO_TALENT_CD_BOOST, value, source)
  // if (abilityTypeFlags & x.a[Key.ADDITIONAL_DMG_TYPE]) targetSelection(target, x.ADDITIONAL_CD_BOOST, value, source)
  // if (abilityTypeFlags & x.a[Key.SUPER_BREAK_DMG_TYPE]) targetSelection(target, x.SUPER_BREAK_CD_BOOST, value, source)
}
