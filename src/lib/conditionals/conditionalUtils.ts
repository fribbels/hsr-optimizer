import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'
import { ComputedStatsArray, Key, Source } from 'lib/optimizer/computedStatsArray'
import { ContentItem } from 'types/Conditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

export const precisionRound = (number: number, precision: number = 8): number => {
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}

// Remove the ashblazing set atk bonus only when calc-ing fua attacks
export const calculateAshblazingSet = (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, hitMulti: number): number => {
  const enabled = p4(x.c.sets.TheAshblazingGrandDuke)
  const valueTheAshblazingGrandDuke = action.setConditionals.valueTheAshblazingGrandDuke
  const ashblazingAtk = 0.06 * valueTheAshblazingGrandDuke * enabled * context.baseATK
  const ashblazingMulti = hitMulti * enabled * context.baseATK

  return ashblazingMulti - ashblazingAtk
}

export const findContentId = (content: ContentItem[], id: string) => {
  return content.find((contentItem) => contentItem.id == id)!
}

export const p4 = (set: number): number => {
  return set >> 2
}

export const ability = (upgradeEidolon: number) => {
  return (eidolon: number, value1: number, value2: number) => {
    return eidolon >= upgradeEidolon ? value2 : value1
  }
}

export const AbilityEidolon = {
  SKILL_TALENT_3_ULT_BASIC_5: {
    basic: ability(5),
    skill: ability(3),
    ult: ability(5),
    talent: ability(3),
  },
  SKILL_BASIC_3_ULT_TALENT_5: {
    basic: ability(3),
    skill: ability(3),
    ult: ability(5),
    talent: ability(5),
  },
  ULT_TALENT_3_SKILL_BASIC_5: {
    basic: ability(5),
    skill: ability(5),
    ult: ability(3),
    talent: ability(3),
  },
  ULT_BASIC_3_SKILL_TALENT_5: {
    basic: ability(3),
    skill: ability(5),
    ult: ability(3),
    talent: ability(5),
  },
  SKILL_ULT_3_BASIC_TALENT_5: {
    basic: ability(5),
    skill: ability(3),
    ult: ability(3),
    talent: ability(5),
  },
}

export function standardAtkFinalizer(x: ComputedStatsObject) {
  x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
  x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
  x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
  x.FUA_DMG += x.FUA_SCALING * x[Stats.ATK]
  x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
}

export function _standardAtkFinalizer(x: ComputedStatsArray) {
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

export function standardHpFinalizer(x: ComputedStatsObject) {
  x.BASIC_DMG += x.BASIC_SCALING * x[Stats.HP]
  x.SKILL_DMG += x.SKILL_SCALING * x[Stats.HP]
  x.ULT_DMG += x.ULT_SCALING * x[Stats.HP]
  x.FUA_DMG += x.FUA_SCALING * x[Stats.HP]
  x.DOT_DMG += x.DOT_SCALING * x[Stats.HP]
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

export function standardDefFinalizer(x: ComputedStatsObject) {
  x.BASIC_DMG += x.BASIC_SCALING * x[Stats.DEF]
  x.SKILL_DMG += x.SKILL_SCALING * x[Stats.DEF]
  x.ULT_DMG += x.ULT_SCALING * x[Stats.DEF]
  x.FUA_DMG += x.FUA_SCALING * x[Stats.DEF]
  x.DOT_DMG += x.DOT_SCALING * x[Stats.DEF]
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

export function standardHpHealFinalizer(x: ComputedStatsObject) {
  x.HEAL_VALUE += x.HEAL_SCALING * x[Stats.HP] + x.HEAL_FLAT
}

export function standardAtkHealFinalizer(x: ComputedStatsObject) {
  x.HEAL_VALUE += x.HEAL_SCALING * x[Stats.ATK] + x.HEAL_FLAT
}

export function standardFlatHealFinalizer(x: ComputedStatsObject) {
  x.HEAL_VALUE += x.HEAL_FLAT
}

export function standardDefShieldFinalizer(x: ComputedStatsObject) {
  x.SHIELD_VALUE += x.SHIELD_SCALING * x[Stats.DEF] + x.SHIELD_FLAT
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

export function gpuStandardDefShieldFinalizer() {
  return `
x.SHIELD_VALUE += x.SHIELD_SCALING * x.DEF + x.SHIELD_FLAT;
`
}

export function standardFuaAtkFinalizer(x: ComputedStatsObject, action: OptimizerAction, context: OptimizerContext, hitMulti: number) {
  x.BASIC_DMG += x.BASIC_SCALING * x[Stats.ATK]
  x.SKILL_DMG += x.SKILL_SCALING * x[Stats.ATK]
  x.ULT_DMG += x.ULT_SCALING * x[Stats.ATK]
  x.FUA_DMG += x.FUA_SCALING * (x[Stats.ATK] + calculateAshblazingSet(x, action, context, hitMulti))
  x.DOT_DMG += x.DOT_SCALING * x[Stats.ATK]
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
