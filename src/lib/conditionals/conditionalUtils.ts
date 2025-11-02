import {
  ElementName,
  PathName,
} from 'lib/constants/constants'
import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { CYRENE } from 'lib/simulations/tests/testMetadataConstants'
import { ContentItem } from 'types/conditionals'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

/**
 * Helper methods used in conditional files
 */

export type ContentDefinition<T extends Record<string, unknown>> = {
  [K in keyof T]:
    & ContentItem
    & {
      id: K,
    }
}

export type Conditionals<T extends ContentDefinition<T>> = {
  [K in keyof T]: number
}

export const calculateAshblazingSetP = (x: ComputedStatsArray, action: OptimizerAction, context: OptimizerContext, hitMulti: number): number => {
  if (x.c.sets.TheAshblazingGrandDuke >> 2) {
    const valueTheAshblazingGrandDuke = action.setConditionals.valueTheAshblazingGrandDuke
    const ashblazingAtk = 0.06 * valueTheAshblazingGrandDuke
    return hitMulti - ashblazingAtk
  } else {
    return 0
  }
}

export const ability = (upgradeEidolon: number) => {
  return function<T extends number, K extends number>(eidolon: number, value1: T, value2: K): T | K {
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
  ULT_BASIC_MEMO_TALENT_3_SKILL_TALENT_MEMO_SKILL_5: {
    basic: ability(3),
    skill: ability(5),
    ult: ability(3),
    talent: ability(5),
    memoTalent: ability(3),
    memoSkill: ability(5),
  },
  ULT_TALENT_MEMO_SKILL_3_SKILL_BASIC_MEMO_TALENT_5: {
    basic: ability(5),
    skill: ability(5),
    ult: ability(3),
    talent: ability(3),
    memoTalent: ability(5),
    memoSkill: ability(3),
  },
  ULT_BASIC_MEMO_SKILL_3_SKILL_TALENT_MEMO_TALENT_5: {
    basic: ability(3),
    skill: ability(5),
    ult: ability(3),
    talent: ability(5),
    memoTalent: ability(5),
    memoSkill: ability(3),
  },
}

export function countTeamPath(context: OptimizerContext, path: PathName) {
  return (context.path == path ? 1 : 0)
    + (context.teammate0Metadata?.path == path ? 1 : 0)
    + (context.teammate1Metadata?.path == path ? 1 : 0)
    + (context.teammate2Metadata?.path == path ? 1 : 0)
}

export function countTeamElement(context: OptimizerContext, element: ElementName) {
  return (context.element == element ? 1 : 0)
    + (context.teammate0Metadata?.element == element ? 1 : 0)
    + (context.teammate1Metadata?.element == element ? 1 : 0)
    + (context.teammate2Metadata?.element == element ? 1 : 0)
}

export function teammateMatchesId(context: OptimizerContext, id: string) {
  return (context.teammate0Metadata?.characterId == id ? 1 : 0)
    + (context.teammate1Metadata?.characterId == id ? 1 : 0)
    + (context.teammate2Metadata?.characterId == id ? 1 : 0)
}

export function teamCharacterIds(context: OptimizerContext) {
  return [
    context.characterId,
    context.teammate0Metadata?.characterId,
    context.teammate1Metadata?.characterId,
    context.teammate2Metadata?.characterId,
  ].filter((x) => !!x)
}

export function teammateCharacterIds(context: OptimizerContext) {
  return [
    context.teammate0Metadata?.characterId,
    context.teammate1Metadata?.characterId,
    context.teammate2Metadata?.characterId,
  ].filter((x) => !!x)
}

export function mainIsPath(context: OptimizerContext, path: PathName) {
  return context.path == path
}

export function getCyreneAction(action: OptimizerAction) {
  const cyreneAction = [
    action.teammate0,
    action.teammate1,
    action.teammate2,
  ].find((x) => x && x.actorId == CYRENE)

  return cyreneAction
}

export function cyreneActionExists(action: OptimizerAction) {
  return getCyreneAction(action) ? true :false
}

// Assumes cyreneTeammateSpecialEffectActive returned true
export function cyreneSpecialEffectEidolonUpgraded(action: OptimizerAction) {
  const cyreneAction = [
    action.teammate0,
    action.teammate1,
    action.teammate2,
  ].find((x) => x && x.actorId == CYRENE)!

  return cyreneAction.actorEidolon >= 3
}
