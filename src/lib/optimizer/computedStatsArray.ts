import { baseComputedStatsObject, BasicStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { ElementToResPenType, Sets, Stats } from 'lib/constants'
import { evaluateConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { OptimizerAction, OptimizerContext } from 'types/Optimizer'

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
  multiply: (value: number, source: string) => void
  set: (value: number, source: string) => void
  buffDynamic: (value: number, source: string, action: OptimizerAction, context: OptimizerContext) => void
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
  precomputedStatsArray = baseComputedStatsArray()
  a = baseComputedStatsArray()
  c: BasicStatsObject
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
            this.a[index] += value
          },
          multiply: (value: number, source: string) => {
            this.a[index] *= value
          },
          buffDynamic: (value: number, source: string, action: OptimizerAction, context: OptimizerContext) => {
            // Self buffing stats will asymptotically reach 0
            if (value < 0.0001) {
              return
            }

            this.a[index] += value

            for (const conditional of action.conditionalRegistry[KeyToStat[key]] || []) {
              evaluateConditional(conditional, this as unknown as ComputedStatsArray, action, context)
            }
          },
          set: (value: number, source: string) => {
            this.a[index] = value
          },
          get: () => this.a[index],
        },
        writable: false,
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
    this.a.set(this.precomputedStatsArray)
  }

  buff(key: number, value: number, source?: string) {
    this.a[key] += value
  }

  set(key: number, value: number, source?: string) {
    this.a[key] = value
  }

  get(key: number) {
    return this.a[key]
  }

  toComputedStatsObject() {
    const result: Partial<ComputedStatsObject> = {}

    for (const key in Key) {
      result[key as keyof ComputedStatsObject] = this.a[Key[key as KeysType]]
    }

    return result as ComputedStatsObject
  }
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

export const KeyToStat: Record<string, string> = {
  [Key.ATK_P]: Stats.ATK_P,
  [Key.ATK]: Stats.ATK,
  [Key.BE]: Stats.BE,
  [Key.CD]: Stats.CD,
  [Key.CR]: Stats.CR,
  [Key.DEF_P]: Stats.DEF_P,
  [Key.DEF]: Stats.DEF,
  [Key.EHR]: Stats.EHR,
  [Key.ERR]: Stats.ERR,
  [Key.FIRE_DMG_BOOST]: Stats.Fire_DMG,
  [Key.HP_P]: Stats.HP_P,
  [Key.HP]: Stats.HP,
  [Key.ICE_DMG_BOOST]: Stats.Ice_DMG,
  [Key.IMAGINARY_DMG_BOOST]: Stats.Imaginary_DMG,
  [Key.LIGHTNING_DMG_BOOST]: Stats.Lightning_DMG,
  [Key.OHB]: Stats.OHB,
  [Key.PHYSICAL_DMG_BOOST]: Stats.Physical_DMG,
  [Key.QUANTUM_DMG_BOOST]: Stats.Quantum_DMG,
  [Key.RES]: Stats.RES,
  [Key.SPD_P]: Stats.SPD_P,
  [Key.SPD]: Stats.SPD,
  [Key.WIND_DMG_BOOST]: Stats.Wind_DMG,
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

export function getResPenType(x: ComputedStatsArray, type: string) {
  switch (type) {
    case ElementToResPenType.Physical:
      return x.a[Key.PHYSICAL_RES_PEN]
    case ElementToResPenType.Fire:
      return x.a[Key.FIRE_RES_PEN]
    case ElementToResPenType.Ice:
      return x.a[Key.ICE_RES_PEN]
    case ElementToResPenType.Lightning:
      return x.a[Key.LIGHTNING_RES_PEN]
    case ElementToResPenType.Wind:
      return x.a[Key.WIND_RES_PEN]
    case ElementToResPenType.Quantum:
      return x.a[Key.QUANTUM_RES_PEN]
    case ElementToResPenType.Imaginary:
      return x.a[Key.IMAGINARY_RES_PEN]
    default:
      return 0
  }
}

export function getElementalDamageType(x: ComputedStatsArray, type: string) {
  switch (type) {
    case Stats.Physical_DMG:
      return x.a[Key.PHYSICAL_DMG_BOOST]
    case Stats.Fire_DMG:
      return x.a[Key.FIRE_DMG_BOOST]
    case Stats.Ice_DMG:
      return x.a[Key.ICE_DMG_BOOST]
    case Stats.Lightning_DMG:
      return x.a[Key.LIGHTNING_DMG_BOOST]
    case Stats.Wind_DMG:
      return x.a[Key.WIND_DMG_BOOST]
    case Stats.Quantum_DMG:
      return x.a[Key.QUANTUM_DMG_BOOST]
    case Stats.Imaginary_DMG:
      return x.a[Key.IMAGINARY_DMG_BOOST]
    default:
      return 0
  }
}

export function buffElementalDamageType(x: ComputedStatsArray, type: string, value: number) {
  switch (type) {
    case Stats.Physical_DMG:
      return x.PHYSICAL_DMG_BOOST.buff(value, Source.NONE)
    case Stats.Fire_DMG:
      return x.FIRE_DMG_BOOST.buff(value, Source.NONE)
    case Stats.Ice_DMG:
      return x.ICE_DMG_BOOST.buff(value, Source.NONE)
    case Stats.Lightning_DMG:
      return x.LIGHTNING_DMG_BOOST.buff(value, Source.NONE)
    case Stats.Wind_DMG:
      return x.WIND_DMG_BOOST.buff(value, Source.NONE)
    case Stats.Quantum_DMG:
      return x.QUANTUM_DMG_BOOST.buff(value, Source.NONE)
    case Stats.Imaginary_DMG:
      return x.IMAGINARY_DMG_BOOST.buff(value, Source.NONE)
  }
}
