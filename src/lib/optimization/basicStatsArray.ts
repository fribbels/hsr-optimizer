import { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import {
  Stats,
  StatsValues,
} from 'lib/constants/constants'
import { BuffSource } from 'lib/optimization/buffSource'
import { SetCounts } from 'lib/optimization/calculateStats'

export type Buff = {
  stat: string,
  key: number,
  value: number,
  source: BuffSource,
  memo?: boolean,
}

type BasicStatController = {
  buff: (value: number, source: BuffSource) => void,
  set: (value: number, source: BuffSource) => void,
  get: () => number,
}

type BasicStatsArrayStatExtensions = {
  [K in keyof typeof baseCharacterStats]: BasicStatController
}

export type BasicStatsArray =
  & BasicStatsArrayCore
  & BasicStatsArrayStatExtensions
  & BasicStatsArrayStatDirectAccess

type BasicStatsArrayStatDirectAccess = {
  [K in keyof typeof baseCharacterStats as `$${K}`]: number
}

const baseCharacterStats = {
  HP_P: 0,
  ATK_P: 0,
  DEF_P: 0,
  SPD_P: 0,
  HP: 0.00000001,
  ATK: 0.00000001,
  DEF: 0.00000001,
  SPD: 0.00000001,
  CR: 0.00000001,
  CD: 0.00000001,
  EHR: 0.00000001,
  RES: 0.00000001,
  BE: 0.00000001,
  ERR: 0.00000001,
  OHB: 0.00000001,
  PHYSICAL_DMG_BOOST: 0,
  FIRE_DMG_BOOST: 0,
  ICE_DMG_BOOST: 0,
  LIGHTNING_DMG_BOOST: 0,
  WIND_DMG_BOOST: 0,
  QUANTUM_DMG_BOOST: 0,
  IMAGINARY_DMG_BOOST: 0,
  ELATION: 0,
  ELEMENTAL_DMG: 0,
}

export type BasicKeyType = keyof typeof baseCharacterStats

export const BasicKey: Record<BasicKeyType, number> = Object.keys(baseCharacterStats).reduce(
  (acc, key, index) => {
    acc[key as BasicKeyType] = index
    return acc
  },
  {} as Record<BasicKeyType, number>,
)

export const BasicStatToKey: Record<StatsValues, number> = {
  [Stats.ATK_P]: BasicKey.ATK_P,
  [Stats.ATK]: BasicKey.ATK,
  [Stats.BE]: BasicKey.BE,
  [Stats.CD]: BasicKey.CD,
  [Stats.CR]: BasicKey.CR,
  [Stats.DEF_P]: BasicKey.DEF_P,
  [Stats.DEF]: BasicKey.DEF,
  [Stats.EHR]: BasicKey.EHR,
  [Stats.ERR]: BasicKey.ERR,
  [Stats.Fire_DMG]: BasicKey.FIRE_DMG_BOOST,
  [Stats.HP_P]: BasicKey.HP_P,
  [Stats.HP]: BasicKey.HP,
  [Stats.Ice_DMG]: BasicKey.ICE_DMG_BOOST,
  [Stats.Imaginary_DMG]: BasicKey.IMAGINARY_DMG_BOOST,
  [Stats.Lightning_DMG]: BasicKey.LIGHTNING_DMG_BOOST,
  [Stats.OHB]: BasicKey.OHB,
  [Stats.Physical_DMG]: BasicKey.PHYSICAL_DMG_BOOST,
  [Stats.Quantum_DMG]: BasicKey.QUANTUM_DMG_BOOST,
  [Stats.RES]: BasicKey.RES,
  [Stats.SPD_P]: BasicKey.SPD_P,
  [Stats.SPD]: BasicKey.SPD,
  [Stats.Wind_DMG]: BasicKey.WIND_DMG_BOOST,
  [Stats.Elation]: BasicKey.ELATION,
}

export function baseBasicStatsArray() {
  return Float32Array.from(Object.values(baseCharacterStats))
}

const cachedBasicBaseStatsArray = baseBasicStatsArray()

export class BasicStatsArrayCore {
  a = baseBasicStatsArray()
  m: BasicStatsArray
  buffs: Buff[]
  buffsMemo: Buff[]
  trace: boolean

  relicSetIndex: number
  ornamentSetIndex: number
  sets: SetCounts
  setsArray: number[]
  id: number
  weight: number

  constructor(trace: boolean = false, memosprite = false) {
    // @ts-ignore
    this.m = memosprite ? null : new BasicStatsArrayCore(trace, true, () => this)
    this.buffs = []
    this.buffsMemo = []
    this.trace = trace
    this.relicSetIndex = 0
    this.ornamentSetIndex = 0
    this.sets = { relicMatch2: 0, relicMatch4: 0, ornamentMatch2: 0 }
    this.setsArray = []
    this.id = -1
    this.weight = 0

    Object.keys(baseCharacterStats).forEach((stat, key) => {
      const trace = (value: number, source: BuffSource) => this.trace && this.buffs.push({ stat, key, value, source })
      const traceMemo = (value: number, source: BuffSource) => this.trace && this.buffsMemo.push({ stat, key, value, source })
      const traceOverwrite = (value: number, source: BuffSource) =>
        this.trace && (this.buffs = this.buffs.filter((b) => b.key !== key).concat({ stat, key, value, source }))

      Object.defineProperty(this, stat, {
        value: {
          buff: (value: number, source: BuffSource) => {
            if (value == 0) return
            this.a[key] += value
            trace(value, source)
          },
          set: (value: number, source: BuffSource) => {
            this.a[key] = value
            trace(value, source)
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
      get: () => this.toBasicStatsObject(),
      enumerable: true,
      configurable: true,
    })
  }

  init(relicSetIndex: number, ornamentSetIndex: number, sets: SetCounts, setsArray: number[], id: number) {
    this.relicSetIndex = relicSetIndex
    this.ornamentSetIndex = ornamentSetIndex
    this.sets = sets
    this.setsArray = setsArray
    this.id = id

    this.a.set(cachedBasicBaseStatsArray)
    if (this.trace) {
      this.buffs = []
      this.buffsMemo = []
    }
  }

  initMemo() {
    this.m.a.set(this.a)
    if (this.trace) {
      this.m.buffs = []
      this.m.buffsMemo = []
    }
  }

  set(key: number, value: number, source?: BuffSource) {
    this.a[key] = value
  }

  get(key: number) {
    return this.a[key]
  }

  toBasicStatsObject() {
    return toBasicStatsObject(this.a, this.weight, this.relicSetIndex, this.ornamentSetIndex)
  }
}

export function toBasicStatsObject(a: Float32Array, weight: number = 0, relicSetIndex: number = 0, ornamentSetIndex: number = 0) {
  const result: Partial<BasicStatsObject> = {
    'HP%': a[BasicKey.HP_P],
    'ATK%': a[BasicKey.ATK_P],
    'DEF%': a[BasicKey.DEF_P],
    'SPD%': a[BasicKey.SPD_P],
    'HP': a[BasicKey.HP],
    'ATK': a[BasicKey.ATK],
    'DEF': a[BasicKey.DEF],
    'SPD': a[BasicKey.SPD],
    'CRIT Rate': a[BasicKey.CR],
    'CRIT DMG': a[BasicKey.CD],
    'Effect Hit Rate': a[BasicKey.EHR],
    'Effect RES': a[BasicKey.RES],
    'Break Effect': a[BasicKey.BE],
    'Energy Regeneration Rate': a[BasicKey.ERR],
    'Outgoing Healing Boost': a[BasicKey.OHB],
    'Physical DMG Boost': a[BasicKey.PHYSICAL_DMG_BOOST],
    'Fire DMG Boost': a[BasicKey.FIRE_DMG_BOOST],
    'Ice DMG Boost': a[BasicKey.ICE_DMG_BOOST],
    'Lightning DMG Boost': a[BasicKey.LIGHTNING_DMG_BOOST],
    'Wind DMG Boost': a[BasicKey.WIND_DMG_BOOST],
    'Quantum DMG Boost': a[BasicKey.QUANTUM_DMG_BOOST],
    'Imaginary DMG Boost': a[BasicKey.IMAGINARY_DMG_BOOST],
    'Elation': a[BasicKey.ELATION],
    'ELEMENTAL_DMG': a[BasicKey.ELEMENTAL_DMG],
    'relicSetIndex': relicSetIndex,
    'ornamentSetIndex': ornamentSetIndex,
  }

  return result as BasicStatsObject
}
