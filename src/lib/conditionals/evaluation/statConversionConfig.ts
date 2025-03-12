import { Stats } from 'lib/constants/constants'
import { Key } from 'lib/optimization/computedStatsArray'
import { ComputedStatsObject } from 'lib/optimization/config/computedStatsConfig'

type StatConversionConfigEntry = {
  stat: string
  key: number
  property: StatProperty
  unconvertibleProperty: UnconvertibleProperty
  unconvertibleKey: number
  percentStat?: string
  percentKey?: number
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

const statToUnconvertibleProperty: Record<string, keyof ComputedStatsObject> = {
  [Stats.HP]: 'UNCONVERTIBLE_HP_BUFF',
  [Stats.ATK]: 'UNCONVERTIBLE_ATK_BUFF',
  [Stats.DEF]: 'UNCONVERTIBLE_DEF_BUFF',
  [Stats.SPD]: 'UNCONVERTIBLE_SPD_BUFF',
  [Stats.CR]: 'UNCONVERTIBLE_CR_BUFF',
  [Stats.CD]: 'UNCONVERTIBLE_CD_BUFF',
  [Stats.EHR]: 'UNCONVERTIBLE_EHR_BUFF',
  [Stats.BE]: 'UNCONVERTIBLE_BE_BUFF',
  [Stats.OHB]: 'UNCONVERTIBLE_OHB_BUFF',
  [Stats.RES]: 'UNCONVERTIBLE_RES_BUFF',
  [Stats.ERR]: 'UNCONVERTIBLE_ERR_BUFF',
}

export type UnconvertibleProperty = (typeof statToUnconvertibleProperty)[keyof typeof statToUnconvertibleProperty]

export const statConversionConfig: Record<ConvertibleStatsType, StatConversionConfigEntry> = {
  [Stats.HP]: {
    stat: Stats.HP,
    key: Key.HP,
    property: 'HP',
    unconvertibleProperty: 'UNCONVERTIBLE_HP_BUFF',
    unconvertibleKey: Key.UNCONVERTIBLE_HP_BUFF,
    percentStat: Stats.HP_P,
    percentKey: Key.HP_P,
    baseProperty: 'baseHP',
  },
  [Stats.ATK]: {
    stat: Stats.ATK,
    key: Key.ATK,
    property: 'ATK',
    unconvertibleProperty: 'UNCONVERTIBLE_ATK_BUFF',
    unconvertibleKey: Key.UNCONVERTIBLE_ATK_BUFF,
    percentStat: Stats.ATK_P,
    percentKey: Key.ATK_P,
    baseProperty: 'baseATK',
  },
  [Stats.DEF]: {
    stat: Stats.DEF,
    key: Key.DEF,
    property: 'DEF',
    unconvertibleProperty: 'UNCONVERTIBLE_DEF_BUFF',
    unconvertibleKey: Key.UNCONVERTIBLE_DEF_BUFF,
    percentStat: Stats.DEF_P,
    percentKey: Key.DEF_P,
    baseProperty: 'baseDEF',
  },
  [Stats.SPD]: {
    stat: Stats.SPD,
    key: Key.SPD,
    property: 'SPD',
    unconvertibleProperty: 'UNCONVERTIBLE_SPD_BUFF',
    unconvertibleKey: Key.UNCONVERTIBLE_SPD_BUFF,
    percentStat: Stats.SPD_P,
    percentKey: Key.SPD_P,
    baseProperty: 'baseSPD',
  },
  [Stats.CR]: {
    stat: Stats.CR,
    key: Key.CR,
    property: 'CR',
    unconvertibleKey: Key.UNCONVERTIBLE_CR_BUFF,
    unconvertibleProperty: 'UNCONVERTIBLE_CR_BUFF',
  },
  [Stats.CD]: {
    stat: Stats.CD,
    key: Key.CD,
    property: 'CD',
    unconvertibleKey: Key.UNCONVERTIBLE_CD_BUFF,
    unconvertibleProperty: 'UNCONVERTIBLE_CD_BUFF',
  },
  [Stats.EHR]: {
    stat: Stats.EHR,
    key: Key.EHR,
    property: 'EHR',
    unconvertibleKey: Key.UNCONVERTIBLE_EHR_BUFF,
    unconvertibleProperty: 'UNCONVERTIBLE_EHR_BUFF',
  },
  [Stats.BE]: {
    stat: Stats.BE,
    key: Key.BE,
    property: 'BE',
    unconvertibleKey: Key.UNCONVERTIBLE_BE_BUFF,
    unconvertibleProperty: 'UNCONVERTIBLE_BE_BUFF',
  },
  [Stats.OHB]: {
    stat: Stats.OHB,
    key: Key.OHB,
    property: 'OHB',
    unconvertibleKey: Key.UNCONVERTIBLE_OHB_BUFF,
    unconvertibleProperty: 'UNCONVERTIBLE_OHB_BUFF',
  },
  [Stats.RES]: {
    stat: Stats.RES,
    key: Key.RES,
    property: 'RES',
    unconvertibleKey: Key.UNCONVERTIBLE_RES_BUFF,
    unconvertibleProperty: 'UNCONVERTIBLE_RES_BUFF',
  },
  [Stats.ERR]: {
    stat: Stats.ERR,
    key: Key.ERR,
    property: 'ERR',
    unconvertibleKey: Key.UNCONVERTIBLE_ERR_BUFF,
    unconvertibleProperty: 'UNCONVERTIBLE_ERR_BUFF',
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
