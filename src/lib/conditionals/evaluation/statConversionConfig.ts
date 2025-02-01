import { ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants/constants'
import { Key } from 'lib/optimization/computedStatsArray'

type StatConversionConfigEntry = {
  stat: string
  key: number
  property: StatProperty
  preconvertedProperty: PreconvertedProperty
  preconvertedKey?: number
  percentStat?: string
  percentKey?: number
  percentPreconvertedProperty?: PreconvertedProperty
  percentPreconvertedKey?: number
  baseProperty?: 'baseHP' | 'baseATK' | 'baseDEF' | 'baseSPD'
}

const statToStatProperty = {
  [Stats.ATK_P]: 'ATK_P',
  [Stats.ATK]: 'ATK',
  [Stats.BE]: 'BE',
  [Stats.CD]: 'CD',
  [Stats.CR]: 'CR',
  [Stats.DEF_P]: 'DEF_P',
  [Stats.DEF]: 'DEF',
  [Stats.EHR]: 'EHR',
  [Stats.ERR]: 'ERR',
  [Stats.HP_P]: 'HP_P',
  [Stats.HP]: 'HP',
  [Stats.OHB]: 'OHB',
  [Stats.RES]: 'RES',
  [Stats.SPD_P]: 'SPD_P',
  [Stats.SPD]: 'SPD',
} as const

export type StatProperty = (typeof statToStatProperty)[keyof typeof statToStatProperty]

const statToRatioProperty: Record<string, keyof ComputedStatsObject> = {
  [Stats.HP]: 'RATIO_BASED_HP_BUFF',
  [Stats.HP_P]: 'RATIO_BASED_HP_P_BUFF',
  [Stats.ATK]: 'RATIO_BASED_ATK_BUFF',
  [Stats.ATK_P]: 'RATIO_BASED_ATK_P_BUFF',
  [Stats.DEF]: 'RATIO_BASED_DEF_BUFF',
  [Stats.DEF_P]: 'RATIO_BASED_DEF_P_BUFF',
  [Stats.SPD]: 'RATIO_BASED_SPD_BUFF',
  [Stats.CD]: 'RATIO_BASED_CD_BUFF',
}

export type PreconvertedProperty = (typeof statToRatioProperty)[keyof typeof statToRatioProperty]

export const statConversionConfig: Record<ConvertibleStatsType, StatConversionConfigEntry> = {
  [Stats.HP]: {
    stat: Stats.HP,
    key: Key.HP,
    property: 'HP',
    preconvertedProperty: 'RATIO_BASED_HP_BUFF',
    preconvertedKey: Key.RATIO_BASED_HP_BUFF,
    percentStat: Stats.HP_P,
    percentKey: Key.HP_P,
    percentPreconvertedProperty: 'RATIO_BASED_HP_P_BUFF',
    percentPreconvertedKey: Key.RATIO_BASED_HP_P_BUFF,
    baseProperty: 'baseHP',
  },
  [Stats.ATK]: {
    stat: Stats.ATK,
    key: Key.ATK,
    property: 'ATK',
    preconvertedProperty: 'RATIO_BASED_ATK_BUFF',
    preconvertedKey: Key.RATIO_BASED_ATK_BUFF,
    percentStat: Stats.ATK_P,
    percentKey: Key.ATK_P,
    percentPreconvertedProperty: 'RATIO_BASED_ATK_P_BUFF',
    percentPreconvertedKey: Key.RATIO_BASED_ATK_P_BUFF,
    baseProperty: 'baseATK',
  },
  [Stats.DEF]: {
    stat: Stats.DEF,
    key: Key.DEF,
    property: 'DEF',
    preconvertedProperty: 'RATIO_BASED_DEF_BUFF',
    preconvertedKey: Key.RATIO_BASED_DEF_BUFF,
    percentStat: Stats.DEF_P,
    percentKey: Key.DEF_P,
    percentPreconvertedProperty: 'RATIO_BASED_DEF_P_BUFF',
    percentPreconvertedKey: Key.RATIO_BASED_DEF_P_BUFF,
    baseProperty: 'baseDEF',
  },
  [Stats.SPD]: {
    stat: Stats.SPD,
    key: Key.SPD,
    property: 'SPD',
    preconvertedProperty: 'RATIO_BASED_SPD_BUFF',
    preconvertedKey: Key.RATIO_BASED_SPD_BUFF,
    percentStat: Stats.SPD_P,
    percentKey: Key.SPD_P,
    percentPreconvertedProperty: 'RATIO_BASED_SPD_P_BUFF',
    percentPreconvertedKey: Key.RATIO_BASED_SPD_P_BUFF,
    baseProperty: 'baseSPD',
  },
  [Stats.CR]: {
    stat: Stats.CR,
    key: Key.CR,
    property: 'CR',
    preconvertedKey: Key.RATIO_BASED_CR_BUFF,
    preconvertedProperty: 'RATIO_BASED_CR_BUFF',
  },
  [Stats.CD]: {
    stat: Stats.CD,
    key: Key.CD,
    property: 'CD',
    preconvertedKey: Key.RATIO_BASED_CD_BUFF,
    preconvertedProperty: 'RATIO_BASED_CD_BUFF',
  },
  [Stats.EHR]: {
    stat: Stats.EHR,
    key: Key.EHR,
    property: 'EHR',
    preconvertedKey: Key.RATIO_BASED_EHR_BUFF,
    preconvertedProperty: 'RATIO_BASED_EHR_BUFF',
  },
  [Stats.BE]: {
    stat: Stats.BE,
    key: Key.BE,
    property: 'BE',
    preconvertedKey: Key.RATIO_BASED_BE_BUFF,
    preconvertedProperty: 'RATIO_BASED_BE_BUFF',
  },
  [Stats.OHB]: {
    stat: Stats.OHB,
    key: Key.OHB,
    property: 'OHB',
    preconvertedKey: Key.RATIO_BASED_OHB_BUFF,
    preconvertedProperty: 'RATIO_BASED_OHB_BUFF',
  },
  [Stats.RES]: {
    stat: Stats.RES,
    key: Key.RES,
    property: 'RES',
    preconvertedKey: Key.RATIO_BASED_RES_BUFF,
    preconvertedProperty: 'RATIO_BASED_RES_BUFF',
  },
  [Stats.ERR]: {
    stat: Stats.ERR,
    key: Key.ERR,
    property: 'ERR',
    preconvertedKey: Key.RATIO_BASED_ERR_BUFF,
    preconvertedProperty: 'RATIO_BASED_ERR_BUFF',
  },
}

const convertibleStats = [
  Stats.HP,
  Stats.ATK,
  Stats.DEF,
  Stats.SPD,
  Stats.CR,
  Stats.CD,
  Stats.EHR,
  Stats.BE,
  Stats.OHB,
  Stats.RES,
  Stats.ERR,
]

export type ConvertibleStatsType = (typeof convertibleStats)[number]
