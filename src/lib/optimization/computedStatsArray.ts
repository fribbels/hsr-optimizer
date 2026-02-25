import { Stats } from 'lib/constants/constants'
import { BuffSource } from 'lib/optimization/buffSource'
import { baseComputedStatsObject, ComputedStatsObject, } from 'lib/optimization/config/computedStatsConfig'

export type Buff = {
  stat: string,
  key: number,
  value: number,
  source: BuffSource,
  memo?: boolean,
}

export type DamageBreakdown = {
  name: string,
  abilityDmg: number,
  additionalDmg: number,
  breakDmg: number,
  superBreakDmg: number,
  jointDmg: number,
  trueDmg: number,
  dotDmg: number,
  memoDmg: number,
}

export type KeysType = keyof ComputedStatsObject

export const Key: Record<KeysType, number> = Object.keys(baseComputedStatsObject).reduce(
  (acc, key, index) => {
    acc[key as KeysType] = index
    return acc
  },
  {} as Record<KeysType, number>,
)

export function toComputedStatsObject(a: Float32Array) {
  const result: Partial<ComputedStatsObjectExternal> = {}

  for (const key in Key) {
    const typedKey = key as KeysType

    const externalKey = InternalKeyToExternal[typedKey] ?? typedKey
    const numericKey = Key[typedKey]
    result[externalKey] = a[numericKey]
  }

  return result as ComputedStatsObjectExternal
}

export const InternalKeyToExternal: Record<string, keyof ComputedStatsObjectExternal> = {
  ATK_P: Stats.ATK_P,
  ATK: Stats.ATK,
  BE: Stats.BE,
  CD: Stats.CD,
  CR: Stats.CR,
  DEF_P: Stats.DEF_P,
  DEF: Stats.DEF,
  EHR: Stats.EHR,
  ERR: Stats.ERR,
  FIRE_DMG_BOOST: Stats.Fire_DMG,
  HP_P: Stats.HP_P,
  HP: Stats.HP,
  ICE_DMG_BOOST: Stats.Ice_DMG,
  IMAGINARY_DMG_BOOST: Stats.Imaginary_DMG,
  LIGHTNING_DMG_BOOST: Stats.Lightning_DMG,
  OHB: Stats.OHB,
  PHYSICAL_DMG_BOOST: Stats.Physical_DMG,
  QUANTUM_DMG_BOOST: Stats.Quantum_DMG,
  RES: Stats.RES,
  SPD_P: Stats.SPD_P,
  SPD: Stats.SPD,
  WIND_DMG_BOOST: Stats.Wind_DMG,
  ELATION: Stats.Elation,
}

export type ComputedStatsObjectExternal =
  & Omit<
    ComputedStatsObject,
    | 'HP_P'
    | 'ATK_P'
    | 'DEF_P'
    | 'SPD_P'
    | 'HP'
    | 'ATK'
    | 'DEF'
    | 'SPD'
    | 'CD'
    | 'CR'
    | 'EHR'
    | 'RES'
    | 'BE'
    | 'ERR'
    | 'OHB'
    | 'PHYSICAL_DMG_BOOST'
    | 'FIRE_DMG_BOOST'
    | 'ICE_DMG_BOOST'
    | 'LIGHTNING_DMG_BOOST'
    | 'WIND_DMG_BOOST'
    | 'QUANTUM_DMG_BOOST'
    | 'IMAGINARY_DMG_BOOST'
    | 'ELATION'
  >
  & {
    ['HP%']: number,
    ['ATK%']: number,
    ['DEF%']: number,
    ['SPD%']: number,
    ['HP']: number,
    ['ATK']: number,
    ['DEF']: number,
    ['SPD']: number,
    ['CRIT Rate']: number,
    ['CRIT DMG']: number,
    ['Effect Hit Rate']: number,
    ['Effect RES']: number,
    ['Break Effect']: number,
    ['Energy Regeneration Rate']: number,
    ['Outgoing Healing Boost']: number,

    ['Physical DMG Boost']: number,
    ['Fire DMG Boost']: number,
    ['Ice DMG Boost']: number,
    ['Lightning DMG Boost']: number,
    ['Wind DMG Boost']: number,
    ['Quantum DMG Boost']: number,
    ['Imaginary DMG Boost']: number,
    ['Elation']: number,
  }

export const StatToKey: Record<string, number> = {
  [Stats.ATK_P]: Key.ATK_P,
  [Stats.ATK]: Key.ATK,
  [Stats.BE]: Key.BE,
  [Stats.CD]: Key.CD,
  [Stats.CR]: Key.CR,
  [Stats.DEF_P]: Key.DEF_P,
  [Stats.DEF]: Key.DEF,
  [Stats.EHR]: Key.EHR,
  [Stats.ERR]: Key.ERR,
  [Stats.Fire_DMG]: Key.FIRE_DMG_BOOST,
  [Stats.HP_P]: Key.HP_P,
  [Stats.HP]: Key.HP,
  [Stats.Ice_DMG]: Key.ICE_DMG_BOOST,
  [Stats.Imaginary_DMG]: Key.IMAGINARY_DMG_BOOST,
  [Stats.Lightning_DMG]: Key.LIGHTNING_DMG_BOOST,
  [Stats.OHB]: Key.OHB,
  [Stats.Physical_DMG]: Key.PHYSICAL_DMG_BOOST,
  [Stats.Quantum_DMG]: Key.QUANTUM_DMG_BOOST,
  [Stats.RES]: Key.RES,
  [Stats.SPD_P]: Key.SPD_P,
  [Stats.SPD]: Key.SPD,
  [Stats.Wind_DMG]: Key.WIND_DMG_BOOST,
  [Stats.Elation]: Key.ELATION,
}
