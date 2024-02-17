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

/*
 * normal: JL, Dr.Ratio
 * reversed: Topaz
 */
export const skill = (eidolon: number, value1: number, value2: number): number => {
  return eidolon >= 3 ? value2 : value1
}
export const talent = skill
export const ultRev = skill
export const basicRev = skill

export const ult = (eidolon: number, value1: number, value2: number): number => {
  return eidolon >= 5 ? value2 : value1
}
export const basic = ult
export const skillRev = ult
export const talentRev = ult
