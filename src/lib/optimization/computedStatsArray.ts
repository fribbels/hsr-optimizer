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

export type StatController = {
  buff: (value: number, source: string) => void
  buffDefer: (value: number, source: string) => void
  buffMemo: (value: number, source: string) => void
  buffTeam: (value: number, source: string) => void
  buffDual: (value: number, source: string) => void
  multiply: (value: number, source: string) => void
  multiplyTeam: (value: number, source: string) => void
  set: (value: number, source: string) => void
  buffDynamic: (value: number, source: string, action: OptimizerAction, context: OptimizerContext) => void
  get: () => number
  memoGet: () => number
}

type ComputedStatsArrayStatExtensions = {
  [K in keyof typeof baseComputedStatsObject]: StatController;
}

type ComputedStatsArrayStatDirectAccess = {
  [K in keyof typeof baseComputedStatsObject as `$${K}`]: number;
}

export type ComputedStatsArray =
  ComputedStatsArrayCore
  & ComputedStatsArrayStatExtensions
  & ComputedStatsArrayStatDirectAccess

export class ComputedStatsArrayCore {
  a = baseComputedStatsArray()
  c: BasicStatsObject
  m: ComputedStatsArray
  summoner: () => ComputedStatsArray
  buffs: Buff[]
  trace: boolean

  constructor(trace: boolean = false, memosprite = false, summonerFn?: () => ComputedStatsArray) {
    this.c = {} as BasicStatsObject
    // @ts-ignore
    this.m = memosprite ? null : new ComputedStatsArrayCore(trace, true, () => this)
    // @ts-ignore
    this.summoner = memosprite ? summonerFn : null
    this.buffs = []
    this.trace = trace
    Object.keys(baseComputedStatsObject).forEach((key, index) => {
      Object.defineProperty(this, key, {
        value: {
          buff: (value: number, source: string) => {
            if (value == 0) return
            this.a[index] += value
          },
          buffDefer: (value: number, source: string) => {
            if (value == 0) return
            if (this.m) {
              this.m.a[index] += value
            } else {
              this.a[index] += value
            }
          },
          buffMemo: (value: number, source: string) => {
            if (value == 0) return
            if (this.m) {
              this.m.a[index] += value
            }
          },
          buffDual: (value: number, source: string) => {
            if (value == 0) return
            this.a[index] += value

            if (this.m) {
              this.m.a[index] += value
            }
          },
          buffTeam: (value: number, source: string) => {
            if (value == 0) return
            this.a[index] += value

            if (this.m) {
              this.m.a[index] += value
            }
          },
          multiply: (value: number, source: string) => {
            this.a[index] *= value
          },
          multiplyTeam: (value: number, source: string) => {
            this.a[index] *= value
            if (this.m) {
              this.m.a[index] *= value
            }
          },
          buffDynamic: (value: number, source: string, action: OptimizerAction, context: OptimizerContext) => {
            // Infinite loop guard so self buffing stats will asymptotically reach 0
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

      Object.defineProperty(this, `$${key}`, {
        get: () => this.a[index],
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
    this.a.set(precompute)
    this.buffs = []
    this.trace = false
  }

  setBasic(c: BasicStatsObject) {
    this.c = c
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

export function baseMemoComputedStatsArray() {
  const values = Object.values(baseComputedStatsObject)
  return Float32Array.from([...values, ...values])
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
