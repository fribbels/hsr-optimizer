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
  DEFER,
}

function targetSelection(target: Target, statController: StatController, value: number, source: string) {
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
    case Target.DEFER:
      statController.buffDefer(value, source)
      break
  }
}

export function buffAbilityDmg(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: string, target = Target.MAIN) {
  if (value == 0) return

  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) targetSelection(target, x.BASIC_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) targetSelection(target, x.SKILL_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) targetSelection(target, x.ULT_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) targetSelection(target, x.FUA_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) targetSelection(target, x.DOT_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.BREAK_DMG_TYPE]) targetSelection(target, x.BREAK_BOOST, value, source)
}

export function buffAbilityVulnerability(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: string, target = Target.MAIN) {
  if (value == 0) return

  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) targetSelection(target, x.BASIC_VULNERABILITY, value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) targetSelection(target, x.SKILL_VULNERABILITY, value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) targetSelection(target, x.ULT_VULNERABILITY, value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) targetSelection(target, x.FUA_VULNERABILITY, value, source)
  if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) targetSelection(target, x.DOT_VULNERABILITY, value, source)
  if (abilityTypeFlags & x.a[Key.BREAK_DMG_TYPE]) targetSelection(target, x.BREAK_VULNERABILITY, value, source)
}

export function buffAbilityResPen(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: string, target = Target.MAIN) {
  if (value == 0) return

  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) targetSelection(target, x.BASIC_RES_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) targetSelection(target, x.SKILL_RES_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) targetSelection(target, x.ULT_RES_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) targetSelection(target, x.FUA_RES_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) targetSelection(target, x.DOT_RES_PEN, value, source)
}

export function buffAbilityDefPen(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: string, target = Target.MAIN) {
  if (value == 0) return

  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) targetSelection(target, x.BASIC_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) targetSelection(target, x.SKILL_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) targetSelection(target, x.ULT_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) targetSelection(target, x.FUA_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.DOT_DMG_TYPE]) targetSelection(target, x.DOT_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.BREAK_DMG_TYPE]) targetSelection(target, x.BREAK_DEF_PEN, value, source)
  if (abilityTypeFlags & x.a[Key.SUPER_BREAK_DMG_TYPE]) targetSelection(target, x.SUPER_BREAK_DEF_PEN, value, source)
}

export function buffAbilityCr(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: string, target = Target.MAIN) {
  if (value == 0) return

  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) targetSelection(target, x.BASIC_CR_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) targetSelection(target, x.SKILL_CR_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) targetSelection(target, x.ULT_CR_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) targetSelection(target, x.FUA_CR_BOOST, value, source)
}

export function buffAbilityCd(x: ComputedStatsArray, abilityTypeFlags: number, value: number, source: string, target = Target.MAIN) {
  if (value == 0) return

  if (abilityTypeFlags & x.a[Key.BASIC_DMG_TYPE]) targetSelection(target, x.BASIC_CD_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.SKILL_DMG_TYPE]) targetSelection(target, x.SKILL_CD_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.ULT_DMG_TYPE]) targetSelection(target, x.ULT_CD_BOOST, value, source)
  if (abilityTypeFlags & x.a[Key.FUA_DMG_TYPE]) targetSelection(target, x.FUA_CD_BOOST, value, source)
}
