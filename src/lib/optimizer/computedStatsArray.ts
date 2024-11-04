import { baseComputedStatsObject, BasicStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { Sets, Stats } from 'lib/constants'

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

type StatMethods = {
  buff: (value: number, source: string) => void
  set: (value: number, source: string) => void
  get: () => number
}

type ComputedStatsArrayStatExtensions = {
  [K in keyof typeof baseComputedStatsObject]: StatMethods;
}

type ComputedStatsArrayStatDirectAccess = {
  [K in keyof typeof baseComputedStatsObject as `$${K}`]: number;
}

export type ComputedStatsArray =
  ComputedStatsArrayCore
  & ComputedStatsArrayStatExtensions
  & ComputedStatsArrayStatDirectAccess

export class ComputedStatsArrayCore {
  precomputedStatsArray = TEST_PRECOMPUTE()
  computedStatsArray = TEST_PRECOMPUTE()

  public c: BasicStatsObject
  buffs: Buff[]
  trace: boolean

  constructor(trace: boolean = false) {
    this.c = {} as BasicStatsObject
    this.buffs = []
    this.trace = trace
    Object.keys(baseComputedStatsObject).forEach((key, index) => {
      Object.defineProperty(this, key, {
        value: {
          buff: (value: number, source: string) => {
            this.computedStatsArray[index] += value
          },
          set: (value: number, source: string) => {
            this.computedStatsArray[index] = value
          },
          get: () => this.computedStatsArray[index],
        },
        writable: false,
        enumerable: true,
        configurable: true,
      })

      Object.defineProperty(this, `$${key}`, {
        get: () => this.computedStatsArray[index],
        enumerable: true,
        configurable: true,
      })
    })

    Object.defineProperty(this, `#show`, {
      get: () => this.toComputedStatsObject(),
      enumerable: true,
      configurable: true,
    })
  }

  setPrecompute(precompute: Float32Array) {
    this.precomputedStatsArray = precompute
  }

  setBasic(c: BasicStatsObject) {
    this.c = c
  }

  reset() {
    this.buffs = []
    this.trace = false
    this.computedStatsArray.set(this.precomputedStatsArray)
  }

  buff(key: number, value: number, source?: string) {
    this.computedStatsArray[key] += value
  }

  set(key: number, value: number, source?: string) {
    this.computedStatsArray[key] = value
  }

  get(key: number) {
    return this.computedStatsArray[key]
  }

  toComputedStatsObject() {
    const result: Partial<ComputedStatsObject> = {}

    for (const key in Key) {
      result[key as keyof ComputedStatsObject] = this.computedStatsArray[Key[key as KeysType]]
    }

    return result as ComputedStatsObject
  }
}

export function TEST_PRECOMPUTE() {
  return new Float32Array(Object.keys(baseComputedStatsObject).length).fill(0)
}

export function fromComputedStatsObject(x: ComputedStatsObject) {
  return Float32Array.from(Object.values(x))
}

export function baseComputedStatsArray() {
  return Float32Array.from(Object.values(baseComputedStatsObject))
}

export function buff(x: ComputedStatsArray, key: number, value: number, source?: string) {
  x.buff(key, value, source)
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

export const Source = {
  character(name: string) {
    return {
      SOURCE_BASIC: `${name}_BASIC`,
      SOURCE_SKILL: `${name}_SKILL`,
      SOURCE_ULT: `${name}_ULT`,
      SOURCE_TALENT: `${name}_TALENT`,
      SOURCE_TECHNIQUE: `${name}_TECHNIQUE`,
      SOURCE_TRACE: `${name}_TRACE`,
    }
  },
  NONE: 'NONE',
  BASIC_STATS: 'BASIC_STATS',
  COMBAT_BUFFS: 'COMBAT_BUFFS',
  ...Sets,
}
