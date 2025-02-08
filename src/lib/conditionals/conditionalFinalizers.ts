import { calculateAshblazingSet } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

// Standard ATK

export function standardAtkFinalizer(x: ComputedStatsArray) {
  x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.ATK], Source.NONE)
  x.SKILL_DMG.buff(x.a[Key.SKILL_SCALING] * x.a[Key.ATK], Source.NONE)
  x.ULT_DMG.buff(x.a[Key.ULT_SCALING] * x.a[Key.ATK], Source.NONE)
  x.FUA_DMG.buff(x.a[Key.FUA_SCALING] * x.a[Key.ATK], Source.NONE)
  x.DOT_DMG.buff(x.a[Key.DOT_SCALING] * x.a[Key.ATK], Source.NONE)
}

export function gpuStandardAtkFinalizer() {
  return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;
x.FUA_DMG += x.FUA_SCALING * x.ATK;
x.DOT_DMG += x.DOT_SCALING * x.ATK;
`
}

// Standard HP

export function standardHpFinalizer(x: ComputedStatsArray) {
  x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.HP], Source.NONE)
  x.SKILL_DMG.buff(x.a[Key.SKILL_SCALING] * x.a[Key.HP], Source.NONE)
  x.ULT_DMG.buff(x.a[Key.ULT_SCALING] * x.a[Key.HP], Source.NONE)
  x.FUA_DMG.buff(x.a[Key.FUA_SCALING] * x.a[Key.HP], Source.NONE)
  x.DOT_DMG.buff(x.a[Key.DOT_SCALING] * x.a[Key.HP], Source.NONE)
}

export function gpuStandardHpFinalizer() {
  return `
x.BASIC_DMG += x.BASIC_SCALING * x.HP;
x.SKILL_DMG += x.SKILL_SCALING * x.HP;
x.ULT_DMG += x.ULT_SCALING * x.HP;
x.FUA_DMG += x.FUA_SCALING * x.HP;
x.DOT_DMG += x.DOT_SCALING * x.HP;
`
}

// Standard DEF

export function standardDefFinalizer(x: ComputedStatsArray) {
  x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.DEF], Source.NONE)
  x.SKILL_DMG.buff(x.a[Key.SKILL_SCALING] * x.a[Key.DEF], Source.NONE)
  x.ULT_DMG.buff(x.a[Key.ULT_SCALING] * x.a[Key.DEF], Source.NONE)
  x.FUA_DMG.buff(x.a[Key.FUA_SCALING] * x.a[Key.DEF], Source.NONE)
  x.DOT_DMG.buff(x.a[Key.DOT_SCALING] * x.a[Key.DEF], Source.NONE)
}

export function gpuStandardDefFinalizer() {
  return `
x.BASIC_DMG += x.BASIC_SCALING * x.DEF;
x.SKILL_DMG += x.SKILL_SCALING * x.DEF;
x.ULT_DMG += x.ULT_SCALING * x.DEF;
x.FUA_DMG += x.FUA_SCALING * x.DEF;
x.DOT_DMG += x.DOT_SCALING * x.DEF;
`
}

// Heals

export function standardHpHealFinalizer(x: ComputedStatsArray) {
  x.HEAL_VALUE.buff(x.a[Key.HEAL_SCALING] * x.a[Key.HP] + x.a[Key.HEAL_FLAT], Source.NONE)
}

export function standardAtkHealFinalizer(x: ComputedStatsArray) {
  x.HEAL_VALUE.buff(x.a[Key.HEAL_SCALING] * x.a[Key.ATK] + x.a[Key.HEAL_FLAT], Source.NONE)
}

export function standardFlatHealFinalizer(x: ComputedStatsArray) {
  x.HEAL_VALUE.buff(x.a[Key.HEAL_FLAT], Source.NONE)
}

export function gpuStandardAtkHealFinalizer() {
  return `
x.HEAL_VALUE += x.HEAL_SCALING * x.ATK + x.HEAL_FLAT;
`
}

export function gpuStandardHpHealFinalizer() {
  return `
x.HEAL_VALUE += x.HEAL_SCALING * x.HP + x.HEAL_FLAT;
`
}

export function gpuStandardFlatHealFinalizer() {
  return `
x.HEAL_VALUE += x.HEAL_FLAT;
`
}

// Shields

export function standardDefShieldFinalizer(x: ComputedStatsArray) {
  x.SHIELD_VALUE.buff(x.a[Key.SHIELD_SCALING] * x.a[Key.DEF] + x.a[Key.SHIELD_FLAT], Source.NONE)
}

export function gpuStandardDefShieldFinalizer() {
  return `
x.SHIELD_VALUE += x.SHIELD_SCALING * x.DEF + x.SHIELD_FLAT;
`
}

// FUA

export function standardFuaAtkFinalizer(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, hitMulti: number) {
  x.BASIC_DMG.buff(x.a[Key.BASIC_SCALING] * x.a[Key.ATK], Source.NONE)
  x.SKILL_DMG.buff(x.a[Key.SKILL_SCALING] * x.a[Key.ATK], Source.NONE)
  x.ULT_DMG.buff(x.a[Key.ULT_SCALING] * x.a[Key.ATK], Source.NONE)
  x.FUA_DMG.buff(x.a[Key.FUA_SCALING] * (x.a[Key.ATK] + calculateAshblazingSet(x, action, context, hitMulti)), Source.NONE)
  x.DOT_DMG.buff(x.a[Key.DOT_SCALING] * x.a[Key.ATK], Source.NONE)
}

export function gpuStandardFuaAtkFinalizer(hitMulti: number) {
  return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;
x.FUA_DMG += x.FUA_SCALING * (x.ATK + calculateAshblazingSet(p_x, p_state, ${hitMulti}));
x.DOT_DMG += x.DOT_SCALING * x.ATK;
`
}

export function standardAdditionalDmgAtkFinalizer(x: ComputedStatsArray) {
  x.BASIC_ADDITIONAL_DMG.buff(x.a[Key.BASIC_ADDITIONAL_DMG_SCALING] * x.a[Key.ATK], Source.NONE)
  x.SKILL_ADDITIONAL_DMG.buff(x.a[Key.SKILL_ADDITIONAL_DMG_SCALING] * x.a[Key.ATK], Source.NONE)
  x.ULT_ADDITIONAL_DMG.buff(x.a[Key.ULT_ADDITIONAL_DMG_SCALING] * x.a[Key.ATK], Source.NONE)
  x.FUA_ADDITIONAL_DMG.buff(x.a[Key.FUA_ADDITIONAL_DMG_SCALING] * x.a[Key.ATK], Source.NONE)
}

export function gpuStandardAdditionalDmgAtkFinalizer() {
  return `
x.BASIC_ADDITIONAL_DMG += x.BASIC_ADDITIONAL_DMG_SCALING * x.ATK;
x.SKILL_ADDITIONAL_DMG += x.SKILL_ADDITIONAL_DMG_SCALING * x.ATK;
x.ULT_ADDITIONAL_DMG += x.ULT_ADDITIONAL_DMG_SCALING * x.ATK;
x.FUA_ADDITIONAL_DMG += x.FUA_ADDITIONAL_DMG_SCALING * x.ATK;
`
}
