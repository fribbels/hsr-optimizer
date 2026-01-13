import { Stats } from 'lib/constants/constants'
import { AKey, AKeyValue } from 'lib/optimization/engine/config/keys'
import { ComputedStatsObject } from 'lib/optimization/config/computedStatsConfig'

type StatConversionConfigEntry = {
  stat: string,
  key: AKeyValue,
  property: StatProperty,
  unconvertibleProperty: UnconvertibleProperty,
  unconvertibleKey: AKeyValue,
  percentStat?: string,
  percentKey?: AKeyValue,
  baseProperty?: 'baseHP' | 'baseATK' | 'baseDEF' | 'baseSPD',
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
    key: AKey.HP,
    property: 'HP',
    unconvertibleProperty: 'UNCONVERTIBLE_HP_BUFF',
    unconvertibleKey: AKey.UNCONVERTIBLE_HP_BUFF,
    percentStat: Stats.HP_P,
    percentKey: AKey.HP_P,
    baseProperty: 'baseHP',
  },
  [Stats.ATK]: {
    stat: Stats.ATK,
    key: AKey.ATK,
    property: 'ATK',
    unconvertibleProperty: 'UNCONVERTIBLE_ATK_BUFF',
    unconvertibleKey: AKey.UNCONVERTIBLE_ATK_BUFF,
    percentStat: Stats.ATK_P,
    percentKey: AKey.ATK_P,
    baseProperty: 'baseATK',
  },
  [Stats.DEF]: {
    stat: Stats.DEF,
    key: AKey.DEF,
    property: 'DEF',
    unconvertibleProperty: 'UNCONVERTIBLE_DEF_BUFF',
    unconvertibleKey: AKey.UNCONVERTIBLE_DEF_BUFF,
    percentStat: Stats.DEF_P,
    percentKey: AKey.DEF_P,
    baseProperty: 'baseDEF',
  },
  [Stats.SPD]: {
    stat: Stats.SPD,
    key: AKey.SPD,
    property: 'SPD',
    unconvertibleProperty: 'UNCONVERTIBLE_SPD_BUFF',
    unconvertibleKey: AKey.UNCONVERTIBLE_SPD_BUFF,
    percentStat: Stats.SPD_P,
    percentKey: AKey.SPD_P,
    baseProperty: 'baseSPD',
  },
  [Stats.CR]: {
    stat: Stats.CR,
    key: AKey.CR,
    property: 'CR',
    unconvertibleKey: AKey.UNCONVERTIBLE_CR_BUFF,
    unconvertibleProperty: 'UNCONVERTIBLE_CR_BUFF',
  },
  [Stats.CD]: {
    stat: Stats.CD,
    key: AKey.CD,
    property: 'CD',
    unconvertibleKey: AKey.UNCONVERTIBLE_CD_BUFF,
    unconvertibleProperty: 'UNCONVERTIBLE_CD_BUFF',
  },
  [Stats.EHR]: {
    stat: Stats.EHR,
    key: AKey.EHR,
    property: 'EHR',
    unconvertibleKey: AKey.UNCONVERTIBLE_EHR_BUFF,
    unconvertibleProperty: 'UNCONVERTIBLE_EHR_BUFF',
  },
  [Stats.BE]: {
    stat: Stats.BE,
    key: AKey.BE,
    property: 'BE',
    unconvertibleKey: AKey.UNCONVERTIBLE_BE_BUFF,
    unconvertibleProperty: 'UNCONVERTIBLE_BE_BUFF',
  },
  [Stats.OHB]: {
    stat: Stats.OHB,
    key: AKey.OHB,
    property: 'OHB',
    unconvertibleKey: AKey.UNCONVERTIBLE_OHB_BUFF,
    unconvertibleProperty: 'UNCONVERTIBLE_OHB_BUFF',
  },
  [Stats.RES]: {
    stat: Stats.RES,
    key: AKey.RES,
    property: 'RES',
    unconvertibleKey: AKey.UNCONVERTIBLE_RES_BUFF,
    unconvertibleProperty: 'UNCONVERTIBLE_RES_BUFF',
  },
  [Stats.ERR]: {
    stat: Stats.ERR,
    key: AKey.ERR,
    property: 'ERR',
    unconvertibleKey: AKey.UNCONVERTIBLE_ERR_BUFF,
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
