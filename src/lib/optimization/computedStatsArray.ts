import { baseComputedStatsObject, BasicStatsObject, ComputedStatsObject } from 'lib/conditionals/conditionalConstants'
import { ElementToResPenType, Sets, Stats } from 'lib/constants/constants'
import { evaluateConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import { OptimizerAction, OptimizerContext } from 'types/optimizer'

type Buff = {
  key: number
  value: number
  source: string
}

export type KeysType = keyof typeof baseComputedStatsObject

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
            if (value == 0) return
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
      get: () => this.toComputedStatsObject(false),
      enumerable: true,
      configurable: true,
    })
  }

  setPrecompute(precompute: Float32Array) {
    this.precomputedStatsArray = precompute
    this.a.set(precompute)
    this.buffs = []
    this.trace = false
  }

  setBasic(c: BasicStatsObject) {
    this.c = c
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

  toComputedStatsObject(internal: boolean) {
    if (internal) {
      const result: Partial<ComputedStatsObject> = {}

      for (const key in Key) {
        const numericKey = Key[key as KeysType]
        result[key as keyof ComputedStatsObject] = this.a[numericKey]
      }
      return result as ComputedStatsObject
    } else {
      const result: Partial<ComputedStatsObjectExternal> = {}

      for (const key in Key) {
        const externalKey = InternalKeyToExternal[key] ?? key
        const numericKey = Key[key as KeysType]
        result[externalKey as keyof ComputedStatsObjectExternal] = this.a[numericKey]
      }
      return result as ComputedStatsObjectExternal
    }
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

export const InternalKeyToExternal: Record<string, string> = {
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
      return x.a[Key.PHYSICAL_DMG_BOOST] += value
    case Stats.Fire_DMG:
      return x.a[Key.FIRE_DMG_BOOST] += value
    case Stats.Ice_DMG:
      return x.a[Key.ICE_DMG_BOOST] += value
    case Stats.Lightning_DMG:
      return x.a[Key.LIGHTNING_DMG_BOOST] += value
    case Stats.Wind_DMG:
      return x.a[Key.WIND_DMG_BOOST] += value
    case Stats.Quantum_DMG:
      return x.a[Key.QUANTUM_DMG_BOOST] += value
    case Stats.Imaginary_DMG:
      return x.a[Key.IMAGINARY_DMG_BOOST] += value
  }
}

export type ComputedStatsObjectExternal = Omit<ComputedStatsObject,
  'HP_P'
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
> & {
  ['HP%']: number
  ['ATK%']: number
  ['DEF%']: number
  ['SPD%']: number
  ['HP']: number
  ['ATK']: number
  ['DEF']: number
  ['SPD']: number
  ['CRIT Rate']: number
  ['CRIT DMG']: number
  ['Effect Hit Rate']: number
  ['Effect RES']: number
  ['Break Effect']: number
  ['Energy Regeneration Rate']: number
  ['Outgoing Healing Boost']: number

  ['Physical DMG Boost']: number
  ['Fire DMG Boost']: number
  ['Ice DMG Boost']: number
  ['Lightning DMG Boost']: number
  ['Wind DMG Boost']: number
  ['Quantum DMG Boost']: number
  ['Imaginary DMG Boost']: number
}

export function augmentExternalStats(x: ComputedStatsObject): ComputedStatsObjectExternal {
  return {
    ...x,
    ['HP%']: x.HP_P,
    ['ATK%']: x.ATK_P,
    ['DEF%']: x.DEF_P,
    ['SPD%']: x.SPD_P,
    ['HP']: x.HP,
    ['ATK']: x.ATK,
    ['DEF']: x.DEF,
    ['SPD']: x.SPD,
    ['CRIT Rate']: x.CD,
    ['CRIT DMG']: x.CR,
    ['Effect Hit Rate']: x.EHR,
    ['Effect RES']: x.RES,
    ['Break Effect']: x.BE,
    ['Energy Regeneration Rate']: x.ERR,
    ['Outgoing Healing Boost']: x.OHB,
    ['Physical DMG Boost']: x.PHYSICAL_DMG_BOOST,
    ['Fire DMG Boost']: x.FIRE_DMG_BOOST,
    ['Ice DMG Boost']: x.ICE_DMG_BOOST,
    ['Lightning DMG Boost']: x.LIGHTNING_DMG_BOOST,
    ['Wind DMG Boost']: x.WIND_DMG_BOOST,
    ['Quantum DMG Boost']: x.QUANTUM_DMG_BOOST,
    ['Imaginary DMG Boost']: x.IMAGINARY_DMG_BOOST,
  }
}
