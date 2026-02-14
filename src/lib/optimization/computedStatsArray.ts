import {
  ElementToResPenType,
  Stats,
} from 'lib/constants/constants'
import { evaluateConditional } from 'lib/gpu/conditionals/dynamicConditionals'
import {
  BasicStatsArray,
  BasicStatsArrayCore,
} from 'lib/optimization/basicStatsArray'
import { BuffSource } from 'lib/optimization/buffSource'
import {
  BaseComputedStatsConfig,
  baseComputedStatsObject,
  ComputedStatsObject,
} from 'lib/optimization/config/computedStatsConfig'
import { StatKey } from 'lib/optimization/engine/config/keys'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import {
  ElementalDamageType,
  ElementalResPenType,
} from 'types/metadata'
import {
  OptimizerAction,
  OptimizerContext,
} from 'types/optimizer'

export type Buff = {
  stat: string,
  key: number,
  value: number,
  source: BuffSource,
  memo?: boolean,
}

export type DefaultActionDamageValues = {
  BASIC_DMG: DamageBreakdown,
  SKILL_DMG: DamageBreakdown,
  ULT_DMG: DamageBreakdown,
  FUA_DMG: DamageBreakdown,
  DOT_DMG: DamageBreakdown,
  BREAK_DMG: DamageBreakdown,
  MEMO_SKILL_DMG: DamageBreakdown,
  MEMO_TALENT_DMG: DamageBreakdown,
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

function generateDefaultDamageValues() {
  function generateDefaultDamageBreakdown(name: string) {
    return {
      name: name,
      abilityDmg: 0,
      additionalDmg: 0,
      breakDmg: 0,
      superBreakDmg: 0,
      jointDmg: 0,
      trueDmg: 0,
      dotDmg: 0,
      memoDmg: 0,
    }
  }

  return {
    BASIC_DMG: generateDefaultDamageBreakdown('BASIC_DMG'),
    SKILL_DMG: generateDefaultDamageBreakdown('SKILL_DMG'),
    ULT_DMG: generateDefaultDamageBreakdown('ULT_DMG'),
    FUA_DMG: generateDefaultDamageBreakdown('FUA_DMG'),
    DOT_DMG: generateDefaultDamageBreakdown('DOT_DMG'),
    BREAK_DMG: generateDefaultDamageBreakdown('BREAK_DMG'),
    MEMO_SKILL_DMG: generateDefaultDamageBreakdown('MEMO_SKILL_DMG'),
    MEMO_TALENT_DMG: generateDefaultDamageBreakdown('MEMO_TALENT_DMG'),
  }
}

export type KeysType = keyof ComputedStatsObject

export const Key: Record<KeysType, number> = Object.keys(baseComputedStatsObject).reduce(
  (acc, key, index) => {
    acc[key as KeysType] = index
    return acc
  },
  {} as Record<KeysType, number>,
)

export type StatController = {
  buff: (value: number, source: BuffSource) => void,
  buffSingle: (value: number, source: BuffSource) => void,
  buffMemo: (value: number, source: BuffSource) => void,
  buffTeam: (value: number, source: BuffSource) => void,
  buffDual: (value: number, source: BuffSource) => void,
  buffBaseDual: (value: number, source: BuffSource) => void,
  multiply: (value: number, source: BuffSource) => void,
  multiplySingle: (value: number, source: BuffSource) => void,
  multiplyTeam: (value: number, source: BuffSource) => void,
  set: (value: number, source: BuffSource) => void,
  config: (value: number, source: BuffSource) => void,
  buffDynamic: (value: number, source: BuffSource, action: OptimizerAction, context: OptimizerContext) => void,
  buffBaseDualDynamic: (value: number, source: BuffSource, action: OptimizerAction, context: OptimizerContext) => void,
  get: () => number,
  memoGet: () => number,
}

type ComputedStatsArrayStatExtensions = {
  [K in keyof typeof BaseComputedStatsConfig]: StatController
}

type ComputedStatsArrayStatDirectAccess = {
  [K in keyof typeof BaseComputedStatsConfig as `$${K}`]: number
}

export type ComputedStatsArray =
  & ComputedStatsArrayCore
  & ComputedStatsArrayStatExtensions
  & ComputedStatsArrayStatDirectAccess

export class ComputedStatsArrayCore {
  a = baseComputedStatsArray()
  c: BasicStatsArray
  m: ComputedStatsArray
  summoner: () => ComputedStatsArray
  buffs: Buff[]
  buffsMemo: Buff[]
  trace: boolean
  dmgSplits: DefaultActionDamageValues

  constructor(trace: boolean = false, memosprite = false, summonerFn?: () => ComputedStatsArray) {
    // @ts-ignore
    this.c = new BasicStatsArrayCore(trace, true, () => this)
    // @ts-ignore
    this.m = memosprite ? null : new ComputedStatsArrayCore(trace, true, () => this)
    // @ts-ignore
    this.summoner = memosprite ? summonerFn : null
    this.buffs = []
    this.buffsMemo = []
    this.trace = trace
    // @ts-ignore
    this.dmgSplits = this.trace ? generateDefaultDamageValues() : null
    Object.keys(baseComputedStatsObject).forEach((stat, key) => {
      const trace = (value: number, source: BuffSource) => this.trace && this.buffs.push({ stat, key, value, source })
      const traceMemo = (value: number, source: BuffSource) => this.trace && this.buffsMemo.push({ stat, key, value, source })
      const traceOverwrite = (value: number, source: BuffSource) =>
        this.trace && (this.buffs = this.buffs.filter((b) => b.key !== key).concat({ stat, key, value, source }))
      const traceMemoOverwrite = (value: number, source: BuffSource) =>
        this.trace && (this.buffsMemo = this.buffsMemo.filter((b) => b.key !== key).concat({ stat, key, value, source }))

      Object.defineProperty(this, stat, {
        value: {
          buff: (value: number, source: BuffSource) => {
            if (value == 0) return
            this.a[key] += value
            trace(value, source)
          },
          buffSingle: (value: number, source: BuffSource) => {
            if (value == 0) return
            if (this.a[Key.DEPRIORITIZE_BUFFS]) return
            if (this.a[Key.MEMO_BUFF_PRIORITY]) {
              this.m.a[key] += value
              traceMemo(value, source)
            } else {
              this.a[key] += value
              trace(value, source)
            }
          },
          buffMemo: (value: number, source: BuffSource) => {
            if (value == 0) return
            if (this.a[Key.DEPRIORITIZE_BUFFS]) return
            if (this.m) {
              this.m.a[key] += value
              traceMemo(value, source)
            }
          },
          buffTeam: (value: number, source: BuffSource) => {
            if (value == 0) return
            this.a[key] += value
            trace(value, source)

            if (this.m) {
              this.m.a[key] += value
              traceMemo(value, source)
            }
          },
          buffDual: (value: number, source: BuffSource) => {
            if (value == 0) return
            if (this.a[Key.DEPRIORITIZE_BUFFS]) return
            this.a[key] += value
            trace(value, source)

            if (this.m) {
              this.m.a[key] += value
              traceMemo(value, source)
            }
          },
          buffBaseDual: (value: number, source: BuffSource) => {
            if (value == 0) return
            this.a[key] += value
            trace(value, source)

            if (this.m) {
              this.m.a[key] += value
              traceMemo(value, source)
            }
          },
          buffBaseDualDynamic: (value: number, source: BuffSource, action: OptimizerAction, context: OptimizerContext) => {
            if (value < 0.001) return
            this.a[key] += value
            trace(value, source)

            if (this.m) {
              this.m.a[key] += value
              traceMemo(value, source)
            }

            for (const conditional of action.conditionalRegistry[KeyToStat[stat]] ?? []) {
              evaluateConditional(conditional, this as unknown as ComputedStatsContainer, action, context)
            }
          },
          multiply: (value: number, source: BuffSource) => {
            if (value == 1) return
            this.a[key] *= value
            trace(value, source)
          },
          multiplySingle: (value: number, source: BuffSource) => {
            if (value == 1) return
            if (this.a[Key.DEPRIORITIZE_BUFFS]) return
            if (this.a[Key.MEMO_BUFF_PRIORITY]) {
              this.m.a[key] *= value
              traceMemo(value, source)
            } else {
              this.a[key] *= value
              trace(value, source)
            }
          },
          multiplyTeam: (value: number, source: BuffSource) => {
            this.a[key] *= value
            trace(value, source)
            if (this.m) {
              this.m.a[key] *= value
              traceMemo(value, source)
            }
          },
          buffDynamic: (value: number, source: BuffSource, action: OptimizerAction, context: OptimizerContext) => {
            if (value < 0.001) return
            this.a[key] += value
            trace(value, source)

            for (const conditional of action.conditionalRegistry[KeyToStat[stat]] || []) {
              evaluateConditional(conditional, this as unknown as ComputedStatsContainer, action, context)
            }
          },
          set: (value: number, source: BuffSource) => {
            this.a[key] = value
            traceOverwrite(value, source)
          },
          config: (value: number, source: BuffSource) => {
            this.a[key] = value
            traceOverwrite(value, source)

            if (this.m) {
              this.m.a[key] = value
              traceMemoOverwrite(value, source)
            }
          },
          get: () => this.a[key],
        },
        writable: false,
        enumerable: true,
        configurable: true,
      })

      Object.defineProperty(this, `$${stat}`, {
        get: () => this.a[key],
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
    this.a.set(precompute)
    this.buffs = []
    this.buffsMemo = []
  }

  tracePrecompute(precompute: ComputedStatsArray) {
    this.buffs = precompute.buffs
    this.buffsMemo = precompute.buffsMemo
  }

  setBasic(c: BasicStatsArray) {
    this.c = c
  }

  get(key: number) {
    return this.a[key]
  }

  toComputedStatsObject() {
    return toComputedStatsObject(this.a)
  }
}

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

export function baseComputedStatsArray() {
  return Float32Array.from(Object.values(baseComputedStatsObject))
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
  ELATION_DMG_BOOST: Stats.Elation_DMG,
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
  ELATION_DMG_BOOST: Stats.Elation_DMG,
}

const ElementToResPenTypeToKey = {
  [ElementToResPenType.Physical]: Key.PHYSICAL_RES_PEN,
  [ElementToResPenType.Fire]: Key.FIRE_RES_PEN,
  [ElementToResPenType.Ice]: Key.ICE_RES_PEN,
  [ElementToResPenType.Lightning]: Key.LIGHTNING_RES_PEN,
  [ElementToResPenType.Wind]: Key.WIND_RES_PEN,
  [ElementToResPenType.Quantum]: Key.QUANTUM_RES_PEN,
  [ElementToResPenType.Imaginary]: Key.IMAGINARY_RES_PEN,
} as const

export function getResPenType(x: ComputedStatsArray, type: ElementalResPenType) {
  return x.a[ElementToResPenTypeToKey[type]]
}

const ElementalDmgTypeToKey = {
  [Stats.Physical_DMG]: StatKey.DMG_BOOST,
  [Stats.Fire_DMG]: StatKey.DMG_BOOST,
  [Stats.Ice_DMG]: StatKey.DMG_BOOST,
  [Stats.Lightning_DMG]: StatKey.DMG_BOOST,
  [Stats.Wind_DMG]: StatKey.DMG_BOOST,
  [Stats.Quantum_DMG]: StatKey.DMG_BOOST,
  [Stats.Imaginary_DMG]: StatKey.DMG_BOOST,
} as const

export function getElementalDamageType(x: ComputedStatsContainer, type: ElementalDamageType) {
  return x.a[ElementalDmgTypeToKey[type]]
}

export function buffElementalDamageType(x: ComputedStatsContainer, type: ElementalDamageType, value: number) {
  const key = ElementalDmgTypeToKey[type]
  x.a[key] += value
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
    | 'ELATION_DMG_BOOST'
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
    ['Elation DMG Boost']: number,
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
  [Stats.Elation_DMG]: Key.ELATION_DMG_BOOST,
}
