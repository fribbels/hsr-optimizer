import { calculateAshblazingSetP } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

// Standard ATK

export function standardAtkFinalizer(x: ComputedStatsArray) {
  x.BASIC_DMG.buff(x.a[Key.BASIC_ATK_SCALING] * x.a[Key.ATK], Source.NONE)
  x.SKILL_DMG.buff(x.a[Key.SKILL_ATK_SCALING] * x.a[Key.ATK], Source.NONE)
  x.ULT_DMG.buff(x.a[Key.ULT_ATK_SCALING] * x.a[Key.ATK], Source.NONE)
  x.FUA_DMG.buff(x.a[Key.FUA_ATK_SCALING] * x.a[Key.ATK], Source.NONE)
  x.DOT_DMG.buff(x.a[Key.DOT_ATK_SCALING] * x.a[Key.ATK], Source.NONE)
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
  x.BASIC_DMG.buff(x.a[Key.BASIC_HP_SCALING] * x.a[Key.HP], Source.NONE)
  x.SKILL_DMG.buff(x.a[Key.SKILL_HP_SCALING] * x.a[Key.HP], Source.NONE)
  x.ULT_DMG.buff(x.a[Key.ULT_HP_SCALING] * x.a[Key.HP], Source.NONE)
  x.FUA_DMG.buff(x.a[Key.FUA_HP_SCALING] * x.a[Key.HP], Source.NONE)
  x.DOT_DMG.buff(x.a[Key.DOT_HP_SCALING] * x.a[Key.HP], Source.NONE)
}

export function standardFinalizer(x: ComputedStatsArray) {
  basicFinalizer(x)
  skillFinalizer(x)
  ultFinalizer(x)
  fuaFinalizer(x)
  dotFinalizer(x)
}

export const basicFinalizer = (x: ComputedStatsArray) => x.BASIC_DMG.buff(x.a[Key.BASIC_HP_SCALING] * x.a[Key.HP] + x.a[Key.BASIC_ATK_SCALING] * boostedAtk(x, x.a[Key.BASIC_ATK_P_BOOST]) + x.a[Key.BASIC_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
export const skillFinalizer = (x: ComputedStatsArray) => x.SKILL_DMG.buff(x.a[Key.SKILL_HP_SCALING] * x.a[Key.HP] + x.a[Key.SKILL_ATK_SCALING] * boostedAtk(x, x.a[Key.SKILL_ATK_P_BOOST]) + x.a[Key.SKILL_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
export const ultFinalizer = (x: ComputedStatsArray) => x.ULT_DMG.buff(x.a[Key.ULT_HP_SCALING] * x.a[Key.HP] + x.a[Key.ULT_ATK_SCALING] * boostedAtk(x, x.a[Key.ULT_ATK_P_BOOST]) + x.a[Key.ULT_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
export const dotFinalizer = (x: ComputedStatsArray) => x.DOT_DMG.buff(x.a[Key.DOT_HP_SCALING] * x.a[Key.HP] + x.a[Key.DOT_ATK_SCALING] * boostedAtk(x, x.a[Key.DOT_ATK_P_BOOST]) + x.a[Key.DOT_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
export const fuaFinalizer = (x: ComputedStatsArray) => x.FUA_DMG.buff(x.a[Key.FUA_HP_SCALING] * x.a[Key.HP] + x.a[Key.FUA_ATK_SCALING] * boostedAtk(x, x.a[Key.FUA_ATK_P_BOOST]) + x.a[Key.FUA_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
export const memoSkillFinalizer = (x: ComputedStatsArray) => x.MEMO_SKILL_DMG.buff(x.a[Key.MEMO_SKILL_HP_SCALING] * x.a[Key.HP] + x.a[Key.MEMO_SKILL_ATK_SCALING] * boostedAtk(x, x.a[Key.MEMO_SKILL_ATK_P_BOOST]) + x.a[Key.MEMO_SKILL_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
export const memoTalentFinalizer = (x: ComputedStatsArray) => x.MEMO_TALENT_DMG.buff(x.a[Key.MEMO_TALENT_HP_SCALING] * x.a[Key.HP] + x.a[Key.MEMO_TALENT_ATK_SCALING] * boostedAtk(x, x.a[Key.MEMO_TALENT_ATK_P_BOOST]) + x.a[Key.MEMO_TALENT_DEF_SCALING] * x.a[Key.DEF], Source.NONE)

export function boostedAtk(x: ComputedStatsArray, abilityBoost: number) {
  return (x.a[Key.ATK] + (abilityBoost + x.a[Key.ATK_P_BOOST]) * x.a[Key.BASE_ATK])
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
  x.BASIC_DMG.buff(x.a[Key.BASIC_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
  x.SKILL_DMG.buff(x.a[Key.SKILL_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
  x.ULT_DMG.buff(x.a[Key.ULT_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
  x.FUA_DMG.buff(x.a[Key.FUA_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
  x.DOT_DMG.buff(x.a[Key.DOT_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
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
  basicFinalizer(x)
  skillFinalizer(x)
  ultFinalizer(x)
  dotFinalizer(x)

  const boostedAtkValue = boostedAtk(x, x.a[Key.FUA_ATK_P_BOOST] + calculateAshblazingSetP(x, action, context, hitMulti))
  x.FUA_DMG.buff(x.a[Key.FUA_HP_SCALING] * x.a[Key.HP] + x.a[Key.FUA_ATK_SCALING] * boostedAtkValue + x.a[Key.FUA_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
}

export function ashblazingFuaFinalizer(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, hitMulti: number) {
  const boostedAtkValue = boostedAtk(x, x.a[Key.FUA_ATK_P_BOOST] + calculateAshblazingSetP(x, action, context, hitMulti))
  x.FUA_DMG.buff(x.a[Key.FUA_HP_SCALING] * x.a[Key.HP] + x.a[Key.FUA_ATK_SCALING] * boostedAtkValue + x.a[Key.FUA_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
}

export function standardFuaFinalizer(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, hitMulti: number) {
  basicFinalizer(x)
  skillFinalizer(x)
  ultFinalizer(x)
  dotFinalizer(x)

  const boostedAtkValue = boostedAtk(x, x.a[Key.FUA_ATK_P_BOOST] + calculateAshblazingSetP(x, action, context, hitMulti))
  x.FUA_DMG.buff(x.a[Key.FUA_HP_SCALING] * x.a[Key.HP] + x.a[Key.FUA_ATK_SCALING] * boostedAtkValue + x.a[Key.FUA_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
}

export function gpuStandardFuaAtkFinalizer(hitMulti: number) {
  return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;
x.FUA_DMG += x.FUA_SCALING * (x.ATK + ${ashblazingWgsl(hitMulti)});
x.DOT_DMG += x.DOT_SCALING * x.ATK;
`
}

export function standardAdditionalDmgAtkFinalizer(x: ComputedStatsArray) {
  x.BASIC_ADDITIONAL_DMG.buff(x.a[Key.BASIC_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
  x.SKILL_ADDITIONAL_DMG.buff(x.a[Key.SKILL_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
  x.ULT_ADDITIONAL_DMG.buff(x.a[Key.ULT_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
  x.FUA_ADDITIONAL_DMG.buff(x.a[Key.FUA_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
}

export function standardAdditionalDmgHpFinalizer(x: ComputedStatsArray) {
  x.BASIC_ADDITIONAL_DMG.buff(x.a[Key.BASIC_ADDITIONAL_DMG_SCALING] * x.a[Key.HP], Source.NONE)
  x.SKILL_ADDITIONAL_DMG.buff(x.a[Key.SKILL_ADDITIONAL_DMG_SCALING] * x.a[Key.HP], Source.NONE)
  x.ULT_ADDITIONAL_DMG.buff(x.a[Key.ULT_ADDITIONAL_DMG_SCALING] * x.a[Key.HP], Source.NONE)
  x.FUA_ADDITIONAL_DMG.buff(x.a[Key.FUA_ADDITIONAL_DMG_SCALING] * x.a[Key.HP], Source.NONE)
}

export function gpuStandardAdditionalDmgAtkFinalizer() {
  return `
x.BASIC_ADDITIONAL_DMG += x.BASIC_ADDITIONAL_DMG_SCALING * x.ATK;
x.SKILL_ADDITIONAL_DMG += x.SKILL_ADDITIONAL_DMG_SCALING * x.ATK;
x.ULT_ADDITIONAL_DMG += x.ULT_ADDITIONAL_DMG_SCALING * x.ATK;
x.FUA_ADDITIONAL_DMG += x.FUA_ADDITIONAL_DMG_SCALING * x.ATK;
`
}

export function ashblazingWgsl(hitMulti: number) {
  return `calculateAshblazingSet(sets.TheAshblazingGrandDuke, action.setConditionals.valueTheAshblazingGrandDuke, ${hitMulti})`
}
