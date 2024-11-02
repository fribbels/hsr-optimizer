import { baseComputedStatsObject, BasicStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Stats } from 'lib/constants'

type Buff = {
  key: number
  value: number
  source: string
}

type KeysType = keyof typeof baseComputedStatsObject

export const Key: Record<KeysType, number> = Object.keys(baseComputedStatsObject).reduce((acc, key, index) => {
  acc[key as KeysType] = index
  return acc
}, {} as Record<KeysType, number>)

export class ComputedStatsArray {
  static base = new Float32Array(Object.keys(baseComputedStatsObject).length).fill(1)
  static array = new Float32Array(Object.keys(baseComputedStatsObject).length)

  public c: BasicStatsObject
  values: Float32Array
  buffs: Buff[]
  trace: boolean

  constructor(c: BasicStatsObject, trace: boolean = false) {
    ComputedStatsArray.array.set(ComputedStatsArray.base)
    this.c = c
    this.values = ComputedStatsArray.array
    this.buffs = []
    this.trace = false
    Object.freeze(this)
  }

  public static reset(precompute: Float32Array) {
    ComputedStatsArray.base = precompute
  }

  buff(key: number, value: number, source?: string, effect?: string) {
    this.values[key] += value
  }

  set(key: number, value: number, source?: string, effect?: string) {
    this.values[key] = value
  }

  get(key: number) {
    return this.values[key]
  }

  toComputedStatsObject() {
    const result: Partial<ComputedStatsObject> = {}

    for (const key in Key) {
      result[key as keyof ComputedStatsObject] = this.values[Key[key as KeysType]]
    }

    return result as ComputedStatsObject
  }
}

export function buff(x: ComputedStatsArray, key: number, value: number, source?: string, effect?: string) {
  x.buff(key, value, source, effect)
}

export function buffWithSource(source: string) {
  return (x: ComputedStatsArray, key: number, value: number, effect: string) => {
    x.buff(key, value, source, effect)
  }
}

export function buffWithSourceEffect(source: string, effect: string) {
  return (x: ComputedStatsArray, key: number, value: number) => {
    x.buff(key, value, source, effect)
  }
}

export const Source = {
  DEFAULT: 'Default',
  BASE_STATS: 'Basic stats',
  COMBAT_BUFFS: 'Combat buffs',
}
export const Effect = {
  DEFAULT: 'Default',
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
} as const
