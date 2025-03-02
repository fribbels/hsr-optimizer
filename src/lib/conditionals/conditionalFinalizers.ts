import { AbilityType } from 'lib/conditionals/conditionalConstants'
import { calculateAshblazingSetP } from 'lib/conditionals/conditionalUtils'
import { Source } from 'lib/optimization/buffSource'
import { ComputedStatsArray, Key } from 'lib/optimization/computedStatsArray'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

export function gpuStandardAtkFinalizer() {
  return `
x.BASIC_DMG += x.BASIC_SCALING * x.ATK;
x.SKILL_DMG += x.SKILL_SCALING * x.ATK;
x.ULT_DMG += x.ULT_SCALING * x.ATK;
x.FUA_DMG += x.FUA_SCALING * x.ATK;
x.DOT_DMG += x.DOT_SCALING * x.ATK;
`
}

export function standardFinalizer(x: ComputedStatsArray) {
  basicFinalizer(x)
  skillFinalizer(x)
  ultFinalizer(x)
  fuaFinalizer(x)
  dotFinalizer(x)
}

export const basicAtkFinalizer = (x: ComputedStatsArray) => x.BASIC_DMG.buff(x.a[Key.BASIC_ATK_SCALING] * boostedAtk(x, x.a[Key.BASIC_ATK_P_BOOST]), Source.NONE)
export const skillAtkFinalizer = (x: ComputedStatsArray) => x.SKILL_DMG.buff(x.a[Key.SKILL_ATK_SCALING] * boostedAtk(x, x.a[Key.SKILL_ATK_P_BOOST]), Source.NONE)
export const ultAtkFinalizer = (x: ComputedStatsArray) => x.ULT_DMG.buff(x.a[Key.ULT_ATK_SCALING] * boostedAtk(x, x.a[Key.ULT_ATK_P_BOOST]), Source.NONE)
export const dotAtkFinalizer = (x: ComputedStatsArray) => x.DOT_DMG.buff(x.a[Key.DOT_ATK_SCALING] * boostedAtk(x, x.a[Key.DOT_ATK_P_BOOST]), Source.NONE)
export const fuaAtkFinalizer = (x: ComputedStatsArray) => x.FUA_DMG.buff(x.a[Key.FUA_ATK_SCALING] * boostedAtk(x, x.a[Key.FUA_ATK_P_BOOST]), Source.NONE)
export const memoSkillAtkFinalizer = (x: ComputedStatsArray) => x.MEMO_SKILL_DMG.buff(x.a[Key.MEMO_SKILL_ATK_SCALING] * boostedAtk(x, x.a[Key.MEMO_SKILL_ATK_P_BOOST]), Source.NONE)
export const memoTalentAtkFinalizer = (x: ComputedStatsArray) => x.MEMO_TALENT_DMG.buff(x.a[Key.MEMO_TALENT_ATK_SCALING] * boostedAtk(x, x.a[Key.MEMO_TALENT_ATK_P_BOOST]), Source.NONE)

export const gpuBasicAtkFinalizer = () => `x.BASIC_DMG += x.BASIC_ATK_SCALING * (x.ATK + (x.BASIC_ATK_P_BOOST + x.ATK_P_BOOST) * baseATK);\n`
export const gpuSkillAtkFinalizer = () => `x.SKILL_DMG += x.SKILL_ATK_SCALING * (x.ATK + (x.SKILL_ATK_P_BOOST + x.ATK_P_BOOST) * baseATK);\n`
export const gpuUltAtkFinalizer = () => `x.ULT_DMG += x.ULT_ATK_SCALING * (x.ATK + (x.ULT_ATK_P_BOOST + x.ATK_P_BOOST) * baseATK);\n`
export const gpuFuaAtkFinalizer = () => `x.FUA_DMG += x.FUA_ATK_SCALING * (x.ATK + (x.FUA_ATK_P_BOOST + x.ATK_P_BOOST) * baseATK);\n`
export const gpuDotAtkFinalizer = () => `x.DOT_DMG += x.DOT_ATK_SCALING * (x.ATK + (x.DOT_ATK_P_BOOST + x.ATK_P_BOOST) * baseATK);\n`
export const gpuMemoSkillAtkFinalizer = () => `x.MEMO_SKILL_DMG += x.MEMO_SKILL_ATK_SCALING * (x.ATK + (x.MEMO_SKILL_ATK_P_BOOST + x.ATK_P_BOOST) * baseATK);\n`
export const gpuMemoTalentAtkFinalizer = () => `x.MEMO_TALENT_DMG += x.MEMO_TALENT_ATK_SCALING * (x.ATK + (x.MEMO_TALENT_ATK_P_BOOST + x.ATK_P_BOOST) * baseATK);\n`

export const basicFinalizer = (x: ComputedStatsArray) => x.BASIC_DMG.buff(x.a[Key.BASIC_HP_SCALING] * x.a[Key.HP] + x.a[Key.BASIC_ATK_SCALING] * boostedAtk(x, x.a[Key.BASIC_ATK_P_BOOST]) + x.a[Key.BASIC_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
export const skillFinalizer = (x: ComputedStatsArray) => x.SKILL_DMG.buff(x.a[Key.SKILL_HP_SCALING] * x.a[Key.HP] + x.a[Key.SKILL_ATK_SCALING] * boostedAtk(x, x.a[Key.SKILL_ATK_P_BOOST]) + x.a[Key.SKILL_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
export const ultFinalizer = (x: ComputedStatsArray) => x.ULT_DMG.buff(x.a[Key.ULT_HP_SCALING] * x.a[Key.HP] + x.a[Key.ULT_ATK_SCALING] * boostedAtk(x, x.a[Key.ULT_ATK_P_BOOST]) + x.a[Key.ULT_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
export const fuaFinalizer = (x: ComputedStatsArray) => x.FUA_DMG.buff(x.a[Key.FUA_HP_SCALING] * x.a[Key.HP] + x.a[Key.FUA_ATK_SCALING] * boostedAtk(x, x.a[Key.FUA_ATK_P_BOOST]) + x.a[Key.FUA_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
export const dotFinalizer = (x: ComputedStatsArray) => x.DOT_DMG.buff(x.a[Key.DOT_HP_SCALING] * x.a[Key.HP] + x.a[Key.DOT_ATK_SCALING] * boostedAtk(x, x.a[Key.DOT_ATK_P_BOOST]) + x.a[Key.DOT_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
export const memoSkillFinalizer = (x: ComputedStatsArray) => x.MEMO_SKILL_DMG.buff(x.a[Key.MEMO_SKILL_HP_SCALING] * x.a[Key.HP] + x.a[Key.MEMO_SKILL_ATK_SCALING] * boostedAtk(x, x.a[Key.MEMO_SKILL_ATK_P_BOOST]) + x.a[Key.MEMO_SKILL_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
export const memoTalentFinalizer = (x: ComputedStatsArray) => x.MEMO_TALENT_DMG.buff(x.a[Key.MEMO_TALENT_HP_SCALING] * x.a[Key.HP] + x.a[Key.MEMO_TALENT_ATK_SCALING] * boostedAtk(x, x.a[Key.MEMO_TALENT_ATK_P_BOOST]) + x.a[Key.MEMO_TALENT_DEF_SCALING] * x.a[Key.DEF], Source.NONE)

const atkFinalizersByAbilityType: Record<number, (x: ComputedStatsArray) => void> = {
  [AbilityType.BASIC]: basicAtkFinalizer,
  [AbilityType.SKILL]: skillAtkFinalizer,
  [AbilityType.ULT]: ultAtkFinalizer,
  [AbilityType.FUA]: fuaAtkFinalizer,
  [AbilityType.DOT]: dotAtkFinalizer,
  [AbilityType.MEMO_SKILL]: memoSkillAtkFinalizer,
  [AbilityType.MEMO_TALENT]: memoTalentAtkFinalizer,
}

const gpuAtkFinalizersByAbilityType: Record<number, () => string> = {
  [AbilityType.BASIC]: gpuBasicAtkFinalizer,
  [AbilityType.SKILL]: gpuSkillAtkFinalizer,
  [AbilityType.ULT]: gpuUltAtkFinalizer,
  [AbilityType.FUA]: gpuFuaAtkFinalizer,
  [AbilityType.DOT]: gpuDotAtkFinalizer,
  [AbilityType.MEMO_SKILL]: gpuMemoSkillAtkFinalizer,
  [AbilityType.MEMO_TALENT]: gpuMemoTalentAtkFinalizer,
}

export function standardAtkFinalizers(x: ComputedStatsArray, abilities: AbilityType[]) {
  for (const abilityType of abilities) {
    atkFinalizersByAbilityType[abilityType](x)
  }
}

export function standardFuaAtkFinalizers(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, abilities: AbilityType[], hitMulti: number) {
  for (const abilityType of abilities) {
    if (abilityType == AbilityType.FUA) singleAshblazingFuaFinalizer(x, action, context, hitMulti)
    else atkFinalizersByAbilityType[abilityType](x)
  }
}

export function gpuStandardAtkFinalizers(abilities: AbilityType[]) {
  let result = ''
  for (const abilityType of abilities) {
    result += gpuAtkFinalizersByAbilityType[abilityType]()
  }
  return result
}

export function gpuStandardFuaAtkFinalizers(abilities: AbilityType[], hitMulti: number) {
  let result = ''
  for (const abilityType of abilities) {
    result += abilityType == AbilityType.FUA
      ? gpuSingleAshblazingAtkFuaFinalizer(hitMulti)
      : gpuAtkFinalizersByAbilityType[abilityType]()
  }
  return result
}

export function boostedAtk(x: ComputedStatsArray, abilityBoost: number) {
  return x.a[Key.ATK] + (abilityBoost + x.a[Key.ATK_P_BOOST]) * x.a[Key.BASE_ATK]
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

export function gpuStandardDefFinalizer() {
  return `
x.BASIC_DMG += x.BASIC_SCALING * x.DEF;
x.SKILL_DMG += x.SKILL_SCALING * x.DEF;
x.ULT_DMG += x.ULT_SCALING * x.DEF;
x.FUA_DMG += x.FUA_SCALING * x.DEF;
x.DOT_DMG += x.DOT_SCALING * x.DEF;
`
}

// FUA

export function singleAshblazingFuaFinalizer(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, hitMulti: number) {
  const boostedAtkValue = boostedAtk(x, x.a[Key.FUA_ATK_P_BOOST] + calculateAshblazingSetP(x, action, context, hitMulti))
  x.FUA_DMG.buff(x.a[Key.FUA_HP_SCALING] * x.a[Key.HP] + x.a[Key.FUA_ATK_SCALING] * boostedAtkValue + x.a[Key.FUA_DEF_SCALING] * x.a[Key.DEF], Source.NONE)
}

export function gpuSingleAshblazingAtkFuaFinalizer(hitMulti: number) {
  return `
let boostedAtkValue = x.ATK + (x.FUA_ATK_P_BOOST + x.ATK_P_BOOST + ${ashblazingWgslP(hitMulti)}) * baseATK;
x.FUA_DMG += x.FUA_ATK_SCALING * boostedAtkValue;
`
}

export function standardFuaFinalizer(x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, hitMulti: number) {
  basicFinalizer(x)
  skillFinalizer(x)
  ultFinalizer(x)
  dotFinalizer(x)
  singleAshblazingFuaFinalizer(x, action, context, hitMulti)
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

export const basicAdditionalDmgAtkFinalizer = (x: ComputedStatsArray) => x.BASIC_ADDITIONAL_DMG.buff(x.a[Key.BASIC_ADDITIONAL_DMG_SCALING] * boostedAtk(x, x.a[Key.BASIC_ATK_P_BOOST]), Source.NONE)
export const skillAdditionalDmgAtkFinalizer = (x: ComputedStatsArray) => x.SKILL_ADDITIONAL_DMG.buff(x.a[Key.SKILL_ADDITIONAL_DMG_SCALING] * boostedAtk(x, x.a[Key.SKILL_ATK_P_BOOST]), Source.NONE)
export const ultAdditionalDmgAtkFinalizer = (x: ComputedStatsArray) => x.ULT_ADDITIONAL_DMG.buff(x.a[Key.ULT_ADDITIONAL_DMG_SCALING] * boostedAtk(x, x.a[Key.ULT_ATK_P_BOOST]), Source.NONE)
export const fuaAdditionalDmgAtkFinalizer = (x: ComputedStatsArray) => x.FUA_ADDITIONAL_DMG.buff(x.a[Key.FUA_ADDITIONAL_DMG_SCALING] * boostedAtk(x, x.a[Key.FUA_ATK_P_BOOST]), Source.NONE)

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

export function ashblazingWgslP(hitMulti: number) {
  return ``
}

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
