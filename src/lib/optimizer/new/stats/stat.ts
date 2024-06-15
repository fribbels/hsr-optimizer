/**
 * This file contains type for possible in game optimization targets and some
 * operators on them. Everything is percent (i.e: 0.1 RES = 10% RES) unless
 * prefix with flat.
 *
 * TODO: Better encapsulation
 */
import { Serializable } from '../format/serializable'
import { BasicPercentageStats, BasicStats } from './basicStat'
import { HsrElement, Trait } from './context'
import { __DeepPartial, __DeepReadonly } from './typesUtils'

type CritStats = {
  critRate: number
  critDmg: number
}

/**
 * Everything we know (and care) about the source and target.
 */
type __FinalStats = VisibleStats & {
  // -------------
  // VISIBLE STATS
  // -------------
  basic: { lv: number }
  // ------------
  // SOURCE STATS
  // ------------
  weaken: number
  dmgBoost: number
  // ------------
  // TARGET STATS
  // ------------
  targetDef: {
    /**
     * DEF reduce, DEF ignore and DEF Boost
     */
    baseDef: number
    percent: number
    flat: number
  }
  /**
   * RES PEN, RES reduce and RES ignore
   */
  res: number
  targetEffRes: number
  debuffRes: number
  incomingHealing: number
  vulnerability: number
  dmgReductions: number[]
}

/**
 * Visible stats are stats that can be found in character details page. While
 * `dmgBoost` technically also can be found there, the details page for
 * `dmgBoost` is not completed (i.e missing DMG Boost for Follow Up), so it was
 * not considered such. The following note will explain the motivation for this
 * logical separation that can be a limitation. See {@link ConditionalStats} for
 * more discussion about `dmgBoost`.
 *
 * While not an official, visible stats can (and is way more likely in the
 * future) to be used as a condition to modify other stats. For example, Black
 * Swan trace currently uses EHR, or various other set 2/set 4 uses SPD. Thus,
 * stats that can be aggregated together like `outgoingHealing` and
 * `incomingHealing` has separate entries.
 */
export type VisibleStats = {
  basic: BasicStats
  crit: CritStats
  breakEffect: number
  effectHitRate: number
  effectRes: number
  outgoingHealing: number
  energyRegenerationRate: number
}

export type PartialModifiableStats = __DeepPartial<
  Omit<__FinalStats, 'basic' | 'targetDef' | 'element' | 'traits'> & {
    basic: {
      percent: BasicStats
      flat: BasicStats
    }
    targetDef: {
      percent: number
      flat: number
    }
  }
>

/**
 * Stats that can be added together with simple addition and subtraction.
 * Different stats that can be do so without compromising the result is
 * aggregated together into a single entry.
 *
 * For example:
 * - RES PEN, RES reduce and RES ignore -> `res`
 * - DMG Bonus of any condition -> `dmgBoost`
 */
export class StatAggregator implements __FinalStats, Serializable<StatAggregator, StatAggregator> {
  static zero(context: __HitContext) {
    return new StatAggregator(
      new BasicPercentageStats(context.basic.lv, context.basic.base),
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      {
        max: context.maxEnergy,
        regenRate: 0,
      },
      undefined,
      undefined,
      {
        baseDef: context.targetBaseDef,
        percent: 0,
        flat: 0,
      },
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
    )
  }

  static copy(other: StatAggregator) {
    return new StatAggregator(
      BasicPercentageStats.copy(other.basic),
      { ...other.crit },
      other.breakEffect,
      other.effectHitRate,
      other.effectRes,
      other.outgoingHealing,
      { ...other.energy },
      other.weaken,
      other.dmgBoost,
      { ...other.targetDef },
      other.res,
      other.targetEffRes,
      other.debuffRes,
      other.vulnerability,
      ...other.dmgReductions,
    )
  }

  constructor(
    public readonly basic: BasicPercentageStats,
    public crit: CritStats = { critRate: 0, critDmg: 0 },
    public breakEffect: number = 0,
    public effectHitRate: number = 0,
    public effectRes: number = 0,
    public outgoingHealing: number = 0,
    public energy: {
      readonly max: number
      regenRate: number
    },
    public weaken: number = 0,
    public dmgBoost: number = 0,
    public targetDef: {
      readonly baseDef: number
      percent: number
      flat: number
    },
    public res: number = 0,
    public targetEffRes: number = 0,
    public debuffRes: number = 0,
    public incomingHealing: number = 0,
    public vulnerability: number = 0,
    public dmgReductions: number[] = [],
  ) {}

  public get energyRegenerationRate(): number {
    return this.energy.regenRate
  }

  public set energyRegenerationRate(val: number) {
    this.energy.regenRate = val
  }

  add(other: PartialModifiableStats) {
    // Just in case you ask, yes, I hate this. These checks are both a visual
    // clutter and potentially even more inefficient. Not only it fucks with cpu
    // branch predictor, it also is so fucking difficult for the JIT. And this
    // fucking method is called in a hot loop. It is possible to use a cheeky
    // version of this as long as `other` prototype is not fucked around, which
    // is likely with object literal, but that seems rather unsafe to me. All
    // this could be avoided if other is not a partial, but that will place a
    // lot of burden into consumer, which is kinda annoying to work with. I did
    // my bwest :(
    /**
     * The value `doc` is used to force jsdoc rendering for the following code.
     * It is the aforementioned hack. It would work as long as `other` isn't a
     * class that extends another class, also currently doesn't work since we
     * also have to consider nested property for `basic`, at which point it
     * probably has way too much overhead.
     * @example
     *
     * const keys = Object.getOwnPropertyNames(other)
     * keys.push(...Object.getOwnPropertyNames(Object.getPrototypeOf(other)))
     *
     * for (const key in keys.filter(val => val !== "constructor")) {
     * if (Object.prototype.hasOwnProperty.call(Object.getPrototypeOf(this),key) ||
     * Object.prototype.hasOwnProperty.call(this, key)
     * ) {
     *   this[key] += other[key]
     * }
     * }
     */
    const doc = other.basic?.percent
    // Counting in case I missed something...VISUAL...
    if (doc) this.addBasic(this.basic.percent, doc)
    if (other.basic?.flat) this.addBasic(this.basic.flat, other.basic.flat)

    // Crit
    if (other.crit?.critRate) this.crit.critRate += other.crit.critRate
    if (other.crit?.critDmg) this.crit.critDmg += other.crit.critDmg

    // Others
    if (other.breakEffect) this.breakEffect += other.breakEffect
    if (other.effectRes) this.effectRes += other?.effectRes
    if (other.outgoingHealing) this.outgoingHealing += other.outgoingHealing
    if (other.energyRegenerationRate) {
      this.energy.regenRate += other.energyRegenerationRate
    }
    if (other.effectHitRate) this.effectHitRate += other.effectHitRate
    // SOURCE
    if (other.weaken) this.weaken += other.weaken
    if (other.dmgBoost) this.dmgBoost += other.dmgBoost

    // TARGET
    if (other.targetDef?.percent) {
      this.targetDef.percent += other.targetDef.percent
    }
    if (other.targetDef?.flat) this.targetDef.flat += other.targetDef.flat
    if (other.res) this.res += other.res
    if (other.targetEffRes) this.targetEffRes += other.targetEffRes
    if (other.debuffRes) this.debuffRes += other.debuffRes
    if (other.incomingHealing) this.incomingHealing += other.incomingHealing
    if (other.vulnerability) this.vulnerability += other.vulnerability
    if (other.dmgReductions) this.dmgReductions.push(...other.dmgReductions)
  }

  private addBasic(thisArg: BasicStats, other: Partial<BasicStats>) {
    if (other.atk) thisArg.atk += other.atk
    if (other.hp) thisArg.hp += other.hp
    if (other.def) thisArg.def += other.def
    if (other.speed) thisArg.speed += other.speed
  }

  serialize(): StatAggregator {
    return this
  }

  __deserialize(json: StatAggregator): StatAggregator {
    return StatAggregator.copy(json)
  }
}

export type __HitContext = {
  basic: {
    lv: number
    base: BasicStats
  }
  element?: HsrElement
  traits: Trait[]
  maxEnergy: number
  targetBaseDef: number
}

/**
 * Possibly better type maneuver, but it will be compiled away anyway.
 */
export type FinalStats = __DeepReadonly<__FinalStats>
