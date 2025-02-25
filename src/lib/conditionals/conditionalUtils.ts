import { p4New } from 'lib/optimization/calculateStats'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { SetsConfig } from 'lib/optimization/config/setsConfig'
import { ContentItem } from 'types/conditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

/**
 * Helper methods used in conditional files
 */

export type ContentDefinition<T extends Record<string, unknown>> = {
  [K in keyof T]: ContentItem &
  {
    id: K
  }
}

export type Conditionals<T extends ContentDefinition<T>> = {
  [K in keyof T]: number;
}

// Remove the ashblazing set atk bonus only when calc-ing fua attacks
export const calculateAshblazingSet = (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, hitMulti: number): number => {
  const enabled = p4New(SetsConfig.TheAshblazingGrandDuke, x.c.sets)
  const valueTheAshblazingGrandDuke = action.setConditionals.valueTheAshblazingGrandDuke
  const ashblazingAtk = 0.06 * valueTheAshblazingGrandDuke * enabled * context.baseATK
  const ashblazingMulti = hitMulti * enabled * context.baseATK

  return ashblazingMulti - ashblazingAtk
}

export const p4 = (set: number): number => {
  return set >> 2
}

export const ability = (upgradeEidolon: number) => {
  return function <T extends number, K extends number>(eidolon: number, value1: T, value2: K): T | K {
    return eidolon >= upgradeEidolon ? value2 : value1
  }
}

// Different characters have different ability activations at E3 / E5, this maps the known types
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
  SKILL_BASIC_MEMO_TALENT_3_ULT_TALENT_MEMO_SKILL_5: {
    basic: ability(3),
    skill: ability(3),
    ult: ability(5),
    talent: ability(5),
    memoTalent: ability(3),
    memoSkill: ability(5),
  },
  SKILL_TALENT_MEMO_TALENT_3_ULT_BASIC_MEMO_SKILL_5: {
    basic: ability(5),
    skill: ability(3),
    ult: ability(5),
    talent: ability(3),
    memoTalent: ability(3),
    memoSkill: ability(5),
  },
}

export function countTeamPath(context: OptimizerContext, path: string) {
  return (context.path == path ? 1 : 0)
    + (context.teammate0Metadata?.path == path ? 1 : 0)
    + (context.teammate1Metadata?.path == path ? 1 : 0)
    + (context.teammate2Metadata?.path == path ? 1 : 0)
}

export function mainIsPath(context: OptimizerContext, path: string) {
  return context.path == path
}
