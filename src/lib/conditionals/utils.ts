import { Constants } from 'lib/constants'
import { ContentItem } from 'types/Conditionals'

export const precisionRound = (number: number, precision: number = 8): number => {
  const factor = Math.pow(10, precision)
  return Math.round(number * factor) / factor
}

// Remove the ashblazing set atk bonus only when calc-ing fua attacks
export const calculateAshblazingSet = (c, request, hitMulti): {
  ashblazingMulti: number
  ashblazingAtk: number
} => {
  const enabled = p4(c.sets.TheAshblazingGrandDuke)
  const valueTheAshblazingGrandDuke = request.setConditionals[Constants.Sets.TheAshblazingGrandDuke][1]
  const ashblazingAtk = 0.06 * valueTheAshblazingGrandDuke * enabled * request.baseAtk * enabled
  const ashblazingMulti = hitMulti * enabled * request.baseAtk

  return {
    ashblazingMulti,
    ashblazingAtk,
  }
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
