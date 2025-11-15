import { calculateAshblazingSetP } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import {
  ComputedStatsArray,
  Key,
} from 'lib/optimization/computedStatsArray'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'
import { SKILL_DMG_TYPE, ULT_DMG_TYPE } from './conditionalConstants'

export const basicAdditionalDmgAtkFinalizer = (x: ComputedStatsArray) =>
  x.BASIC_ADDITIONAL_DMG.buff(x.a[Key.BASIC_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
export const skillAdditionalDmgAtkFinalizer = (x: ComputedStatsArray) =>
  x.SKILL_ADDITIONAL_DMG.buff(x.a[Key.SKILL_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
export const ultAdditionalDmgAtkFinalizer = (x: ComputedStatsArray) =>
  x.ULT_ADDITIONAL_DMG.buff(x.a[Key.ULT_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
export const fuaAdditionalDmgAtkFinalizer = (x: ComputedStatsArray) =>
  x.FUA_ADDITIONAL_DMG.buff(x.a[Key.FUA_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
export const dotAdditionalDmgAtkFinalizer = (x: ComputedStatsArray) =>
  x.DOT_ADDITIONAL_DMG.buff(x.a[Key.DOT_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
export const memoSkillAdditionalDmgAtkFinalizer = (x: ComputedStatsArray) =>
  x.MEMO_SKILL_ADDITIONAL_DMG.buff(x.a[Key.MEMO_SKILL_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
export const memoTalentAdditionalDmgAtkFinalizer = (x: ComputedStatsArray) =>
  x.MEMO_TALENT_ADDITIONAL_DMG.buff(x.a[Key.MEMO_TALENT_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)

export const gpuBasicAdditionalDmgAtkFinalizer = () => `x.BASIC_ADDITIONAL_DMG += x.BASIC_ADDITIONAL_DMG_SCALING * (x.ATK + (x.ATK_P_BOOST) * baseATK);\n`
export const gpuSkillAdditionalDmgAtkFinalizer = () => `x.SKILL_ADDITIONAL_DMG += x.SKILL_ADDITIONAL_DMG_SCALING * (x.ATK + (x.ATK_P_BOOST) * baseATK);\n`
export const gpuUltAdditionalDmgAtkFinalizer = () => `x.ULT_ADDITIONAL_DMG += x.ULT_ADDITIONAL_DMG_SCALING * (x.ATK + (x.ATK_P_BOOST) * baseATK);\n`
export const gpuFuaAdditionalDmgAtkFinalizer = () => `x.FUA_ADDITIONAL_DMG += x.FUA_ADDITIONAL_DMG_SCALING * (x.ATK + (x.ATK_P_BOOST) * baseATK);\n`
export const gpuDotAdditionalDmgAtkFinalizer = () => `x.DOT_ADDITIONAL_DMG += x.DOT_ADDITIONAL_DMG_SCALING * (x.ATK + (x.ATK_P_BOOST) * baseATK);\n`
export const gpuMemoSkillAdditionalDmgAtkFinalizer = () =>
  `x.MEMO_SKILL_ADDITIONAL_DMG += x.MEMO_SKILL_ADDITIONAL_DMG_SCALING * (x.ATK + (x.ATK_P_BOOST) * baseATK);\n`
export const gpuMemoTalentAdditionalDmgAtkFinalizer = () =>
  `x.MEMO_TALENT_ADDITIONAL_DMG += x.MEMO_TALENT_ADDITIONAL_DMG_SCALING * (x.ATK + (x.ATK_P_BOOST) * baseATK);\n`

export const basicAdditionalDmgHpFinalizer = (x: ComputedStatsArray) =>
  x.BASIC_ADDITIONAL_DMG.buff(x.a[Key.BASIC_ADDITIONAL_DMG_SCALING] * x.a[Key.HP], Source.NONE)
export const skillAdditionalDmgHpFinalizer = (x: ComputedStatsArray) =>
  x.SKILL_ADDITIONAL_DMG.buff(x.a[Key.SKILL_ADDITIONAL_DMG_SCALING] * x.a[Key.HP], Source.NONE)
export const ultAdditionalDmgHpFinalizer = (x: ComputedStatsArray) => x.ULT_ADDITIONAL_DMG.buff(x.a[Key.ULT_ADDITIONAL_DMG_SCALING] * x.a[Key.HP], Source.NONE)
export const fuaAdditionalDmgHpFinalizer = (x: ComputedStatsArray) => x.FUA_ADDITIONAL_DMG.buff(x.a[Key.FUA_ADDITIONAL_DMG_SCALING] * x.a[Key.HP], Source.NONE)
export const dotAdditionalDmgHpFinalizer = (x: ComputedStatsArray) => x.DOT_ADDITIONAL_DMG.buff(x.a[Key.DOT_ADDITIONAL_DMG_SCALING] * x.a[Key.HP], Source.NONE)
export const memoSkillAdditionalDmgHpFinalizer = (x: ComputedStatsArray) =>
  x.MEMO_SKILL_ADDITIONAL_DMG.buff(x.a[Key.MEMO_SKILL_ADDITIONAL_DMG] * x.a[Key.HP], Source.NONE)
export const memoTalentAdditionalDmgHpFinalizer = (x: ComputedStatsArray) =>
  x.MEMO_TALENT_ADDITIONAL_DMG.buff(x.a[Key.MEMO_TALENT_ADDITIONAL_DMG_SCALING] * x.a[Key.HP], Source.NONE)

export const gpuBasicAdditionalDmgHpFinalizer = () => `x.BASIC_ADDITIONAL_DMG += x.BASIC_ADDITIONAL_DMG_SCALING * x.HP;\n`
export const gpuSkillAdditionalDmgHpFinalizer = () => `x.SKILL_ADDITIONAL_DMG += x.SKILL_ADDITIONAL_DMG_SCALING * x.HP;\n`
export const gpuUltAdditionalDmgHpFinalizer = () => `x.ULT_ADDITIONAL_DMG += x.ULT_ADDITIONAL_DMG_SCALING * x.HP;\n`
export const gpuFuaAdditionalDmgHpFinalizer = () => `x.FUA_ADDITIONAL_DMG += x.FUA_ADDITIONAL_DMG_SCALING * x.HP;\n`
export const gpuDotAdditionalDmgHpFinalizer = () => `x.DOT_ADDITIONAL_DMG += x.DOT_ADDITIONAL_DMG_SCALING * x.HP;\n`
export const gpuMemoSkillAdditionalDmgHpFinalizer = () => `x.MEMO_SKILL_ADDITIONAL_DMG += x.MEMO_SKILL_ADDITIONAL_DMG_SCALING * x.HP;\n`
export const gpuMemoTalentAdditionalDmgHpFinalizer = () => `x.MEMO_TALENT_ADDITIONAL_DMG += x.MEMO_TALENT_ADDITIONAL_DMG_SCALING * x.HP;\n`

export function standardAdditionalDmgAtkFinalizer(x: ComputedStatsArray) {
  x.BASIC_ADDITIONAL_DMG.buff(x.a[Key.BASIC_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
  x.SKILL_ADDITIONAL_DMG.buff(x.a[Key.SKILL_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
  x.ULT_ADDITIONAL_DMG.buff(x.a[Key.ULT_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
  x.FUA_ADDITIONAL_DMG.buff(x.a[Key.FUA_ADDITIONAL_DMG_SCALING] * boostedAtk(x, 0), Source.NONE)
}

export function gpuStandardAdditionalDmgAtkFinalizer() {
  return `
x.BASIC_ADDITIONAL_DMG += x.BASIC_ADDITIONAL_DMG_SCALING * (x.ATK + (x.ATK_P_BOOST) * baseATK);
x.SKILL_ADDITIONAL_DMG += x.SKILL_ADDITIONAL_DMG_SCALING * (x.ATK + (x.ATK_P_BOOST) * baseATK);
x.ULT_ADDITIONAL_DMG += x.ULT_ADDITIONAL_DMG_SCALING * (x.ATK + (x.ATK_P_BOOST) * baseATK);
x.FUA_ADDITIONAL_DMG += x.FUA_ADDITIONAL_DMG_SCALING * (x.ATK + (x.ATK_P_BOOST) * baseATK);
`
}

export function boostedAtk(x: ComputedStatsArray, abilityBoost: number) {
  return x.a[Key.ATK] + (abilityBoost + x.a[Key.ATK_P_BOOST]) * x.a[Key.BASE_ATK]
}

// FUA

export function boostAshblazingAtkP(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, hitMulti: number) {
  x.FUA_ATK_P_BOOST.buff(calculateAshblazingSetP(x, action, context, hitMulti), Source.NONE)
}

export function gpuBoostAshblazingAtkP(hitMulti: number) {
  return `x.FUA_ATK_P_BOOST += calculateAshblazingSetP(sets.TheAshblazingGrandDuke, action.setConditionals.valueTheAshblazingGrandDuke, ${hitMulti});`
}

//
//
//
//
//
//
//
//
//
//
//
//
//
//
//

// Heals

function addRawHealing(rawHealing: number, x: ComputedStatsArray) {
  const a = x.a
  const finalHealing = rawHealing * (
    1
    + a[Key.OHB]
    + a[Key.SKILL_OHB] * (a[Key.HEAL_TYPE] == SKILL_DMG_TYPE ? 1 : 0)
    + a[Key.ULT_OHB] * (a[Key.HEAL_TYPE] == ULT_DMG_TYPE ? 1 : 0)
  )

  x.HEAL_VALUE.buff(finalHealing, Source.NONE)
}

export function standardHpHealFinalizer(x: ComputedStatsArray) {
  addRawHealing(x.a[Key.HEAL_SCALING] * x.a[Key.HP] + x.a[Key.HEAL_FLAT], x)
}

export function standardAtkHealFinalizer(x: ComputedStatsArray) {
  addRawHealing(x.a[Key.HEAL_SCALING] * x.a[Key.ATK] + x.a[Key.HEAL_FLAT], x)
}

export function standardFlatHealFinalizer(x: ComputedStatsArray) {
  addRawHealing(x.a[Key.HEAL_FLAT], x)
}

function gpuAddRawHealing(wsglRawHealing: string) {
  return `
x.HEAL_VALUE += (${wsglRawHealing}) * (
  1
  + x.OHB
  + select(0.0, x.SKILL_OHB, x.HEAL_TYPE == SKILL_DMG_TYPE)
  + select(0.0, x.ULT_OHB, x.HEAL_TYPE == ULT_DMG_TYPE)
);
`
}

export function gpuStandardAtkHealFinalizer() {
  return gpuAddRawHealing('x.HEAL_SCALING * x.ATK + x.HEAL_FLAT');
}

export function gpuStandardHpHealFinalizer() {
  return gpuAddRawHealing('x.HEAL_SCALING * x.HP + x.HEAL_FLAT');
}

export function gpuStandardFlatHealFinalizer() {
  return gpuAddRawHealing('x.HEAL_FLAT');
}

// Shields

function addRawShield(rawShield: number, x: ComputedStatsArray) {
  x.SHIELD_VALUE.buff(rawShield * (1 + x.a[Key.SHIELD_BOOST]), Source.NONE)
}

export function standardAtkShieldFinalizer(x: ComputedStatsArray) {
  addRawShield(x.a[Key.SHIELD_SCALING] * x.a[Key.ATK] + x.a[Key.SHIELD_FLAT], x)
}

export function standardDefShieldFinalizer(x: ComputedStatsArray) {
  addRawShield(x.a[Key.SHIELD_SCALING] * x.a[Key.DEF] + x.a[Key.SHIELD_FLAT], x)
}

function gpuAddRawShield(wsglRawShield: string) {
  return `
x.SHIELD_VALUE = (${wsglRawShield}) * (1 + x.SHIELD_BOOST);
`;
}

export function gpuStandardDefShieldFinalizer() {
  return gpuAddRawShield('x.SHIELD_SCALING * x.DEF + x.SHIELD_FLAT');
}

export function gpuStandardAtkShieldFinalizer() {
  return gpuAddRawShield('x.SHIELD_SCALING * x.ATK + x.SHIELD_FLAT');
}
