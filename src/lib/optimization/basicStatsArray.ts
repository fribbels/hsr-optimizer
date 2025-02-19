import { BasicStatsObject } from 'lib/conditionals/conditionalConstants'
import { BuffSource } from 'lib/optimization/buffSource'
import { SetCounts } from 'lib/optimization/calculateStats'
import { Buff, Key, StatController } from 'lib/optimization/computedStatsArray'

type BasicStatsArrayStatExtensions = {
  [K in keyof typeof baseCharacterStats]: StatController;
}

export type BasicStatsArray =
  BasicStatsArrayCore
  & BasicStatsArrayStatExtensions
  & BasicStatsArrayStatDirectAccess

type BasicStatsArrayStatDirectAccess = {
  [K in keyof typeof baseCharacterStats as `$${K}`]: number;
}

const baseCharacterStats = {
  HP_P: 0,
  ATK_P: 0,
  DEF_P: 0,
  SPD_P: 0,
  HP: 0.000001,
  ATK: 0.000001,
  DEF: 0.000001,
  SPD: 0.000001,
  CR: 0.000001,
  CD: 0.000001,
  EHR: 0.000001,
  RES: 0.000001,
  BE: 0.000001,
  ERR: 0.000001,
  OHB: 0.000001,
  PHYSICAL_DMG_BOOST: 0.000001,
  FIRE_DMG_BOOST: 0.000001,
  ICE_DMG_BOOST: 0.000001,
  LIGHTNING_DMG_BOOST: 0.000001,
  WIND_DMG_BOOST: 0.000001,
  QUANTUM_DMG_BOOST: 0.000001,
  IMAGINARY_DMG_BOOST: 0.000001,
  ELEMENTAL_DMG: 0.000001,
}

export type BasicCharacterStats = keyof typeof baseCharacterStats

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
    // @ts-ignore
    this.sets = {}
    this.id = -1
    this.weight = 0

    Object.keys(baseCharacterStats).forEach((stat, key) => {
      const trace
        = (value: number, source: BuffSource) => this.trace && this.buffs.push({ stat, key, value, source })
      const traceMemo
        = (value: number, source: BuffSource) => this.trace && this.buffsMemo.push({ stat, key, value, source })
      const traceOverwrite
        = (value: number, source: BuffSource) => this.trace && (this.buffs = this.buffs.filter((b) => b.key !== key).concat({ stat, key, value, source }))

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

  init(relicSetIndex: number, ornamentSetIndex: number, sets: SetCounts, id: number) {
    this.relicSetIndex = relicSetIndex
    this.ornamentSetIndex = ornamentSetIndex
    this.sets = sets
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

  setWeight(weight: number) {
    this.weight = weight
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
    'HP%': a[Key.HP_P],
    'ATK%': a[Key.ATK_P],
    'DEF%': a[Key.DEF_P],
    'SPD%': a[Key.SPD_P],
    'HP': a[Key.HP],
    'ATK': a[Key.ATK],
    'DEF': a[Key.DEF],
    'SPD': a[Key.SPD],
    'CRIT Rate': a[Key.CR],
    'CRIT DMG': a[Key.CD],
    'Effect Hit Rate': a[Key.EHR],
    'Effect RES': a[Key.RES],
    'Break Effect': a[Key.BE],
    'Energy Regeneration Rate': a[Key.ERR],
    'Outgoing Healing Boost': a[Key.OHB],
    'Physical DMG Boost': a[Key.PHYSICAL_DMG_BOOST],
    'Fire DMG Boost': a[Key.FIRE_DMG_BOOST],
    'Ice DMG Boost': a[Key.ICE_DMG_BOOST],
    'Lightning DMG Boost': a[Key.LIGHTNING_DMG_BOOST],
    'Wind DMG Boost': a[Key.WIND_DMG_BOOST],
    'Quantum DMG Boost': a[Key.QUANTUM_DMG_BOOST],
    'Imaginary DMG Boost': a[Key.IMAGINARY_DMG_BOOST],
    'ELEMENTAL_DMG': a[Key.ELEMENTAL_DMG],
    'WEIGHT': weight,
    'relicSetIndex': relicSetIndex,
    'ornamentSetIndex': ornamentSetIndex,
  }

  return result as BasicStatsObject
}
