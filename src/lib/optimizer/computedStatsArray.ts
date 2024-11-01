import { baseComputedStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'

type Buff = {
  key: number
  value: number
  source: string
}

export class ComputedStatsArray {
  static base = new Float32Array(Object.keys(baseComputedStatsObject).length)
  static array = new Float32Array(Object.keys(baseComputedStatsObject).length)

  values: Float32Array
  buffs: Buff[]
  trace: boolean

  constructor(trace: boolean = false) {
    ComputedStatsArray.array.set(ComputedStatsArray.base)
    this.values = ComputedStatsArray.array
    this.buffs = []
    this.trace = false
  }

  static reset(precompute: Float32Array) {
    ComputedStatsArray.base = precompute
  }

  buff(key: number, value: number, source?: string) {
    this.values[key] += value
  }

  set(key: number, value: number, source: string) {
    this.values[key] = value
  }

  get(key: number) {
    return this.values[key]
  }

  toComputedStatsObject() {
    const result: Partial<ComputedStatsObject> = {}

    for (const key in Key) {
      result[key as keyof KeysType] = this.values[Key[key as KeysType]]
    }

    return result as ComputedStatsObject
  }
}

type KeysType = keyof typeof baseComputedStatsObject

export const Key: Record<KeysType, number> = Object.keys(baseComputedStatsObject).reduce((acc, key, index) => {
  acc[key as KeysType] = index
  return acc
}, {} as Record<KeysType, number>)

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
} as const
