import { Serializable } from '../format/serializable'
import { HsrElement, Trait } from '../stats/context'
import { MapLikeModifiers } from '../stats/modifier'
import { FinalStats, VisibleStats } from '../stats/stat'

// This file will need a lot of cleaning. That's all I have to say. Note to
// self: write better code next time.

// TODO: write each step type into its own file
type MinMax = {
  min?: number
  max?: number
}

export type StatLimit = {
  [K in keyof VisibleStats]?: K extends 'basic' ? {
      atk?: MinMax
      def?: MinMax
      hp?: MinMax
      speed?: MinMax
    }
    : K extends 'crit' ? {
        critRate?: MinMax
        critDmg?: MinMax
      }
    : MinMax
}

export enum StepType {
  NORMAL_DAMAGE,
  DOT_DAMAGE,
  BREAK_DAMAGE,
  NO_DAMAGE,
}
export enum CritType {
  AVERAGE,
  NO_CRIT,
  ALWAYS_CRIT,
}
const CRIT_MAP: { [K in CritType]: (cr: number, cd: number) => number } = {
  [CritType.AVERAGE]: (cr: number, cd: number) => 1 + cr * cd,
  [CritType.NO_CRIT]: (_cr: number, _cd: number) => 1,
  [CritType.ALWAYS_CRIT]: (_cr: number, cd: number) => 1 + cd,
}

/**
 * A step contains the instruction to get the optimization target index that
 * could be used for comparision. Each step has a single final
 * {@link FinalStats} that it could works with, it cannot modify any stats.
 */
export type Step = {
  calculate(stat: FinalStats): number
  readonly mods: MapLikeModifiers
  readonly element: HsrElement
  readonly traits: Trait[]
  limit?: StatLimit
}

export abstract class DamageStep implements Step {
  constructor(
    protected broken: boolean,
    public readonly mods: MapLikeModifiers,
    public readonly element: HsrElement,
    public readonly traits: Trait[],
    protected critType: CritType,
    public readonly limit?: StatLimit,
  ) {}

  calculate(stat: FinalStats): number {
    return (
      this.base(stat)
      * this.def(
        stat.basic.lv,
        stat.targetDef.baseDef,
        stat.targetDef.percent,
        stat.targetDef.flat,
      )
      * Math.min(Math.max(1 - stat.res, 0.1), 2)
      * this.dmgBoost(stat.dmgBoost)
      * Math.min(1 + stat.vulnerability, 3.5)
      * (this.broken ? 1 : 0.9)
      * CRIT_MAP[this.critType](
        Math.min(1, stat.crit.critRate),
        stat.crit.critDmg,
      )
      * this.dmgReduction(stat.dmgReductions)
    )
  }
  protected abstract base(stat: FinalStats): number

  protected dmgBoost(percent: number) {
    return 1 + percent
  }

  protected dmgReduction(reductions: readonly number[]) {
    return reductions.reduce((prev, val) => prev * (1 - val), 1)
  }

  private def(
    sourceLv: number,
    baseDef: number,
    percent: number,
    flat: number,
  ) {
    const def = Math.max(baseDef * (1 + percent) + flat, 0)
    return 1 - def / (def + 200 + 10 * sourceLv)
  }
}

type __SerializedStep = {
  broken: boolean
  // We don't need to serialize mods, because web worker doesn't need them.
  // Everything is already calculated in formula into 'pre' StatCollector.
  /* mods: MapLikeModifiers */
  element: HsrElement
  traits: Trait[]
  multiplier: number
  statType: 'atk' | 'hp' | 'def'
  critType: CritType
  limit?: StatLimit
}

export class NormalDamageStep extends DamageStep implements Serializable<__SerializedStep, NormalDamageStep> {
  constructor(
    broken: boolean,
    mods: MapLikeModifiers,
    element: HsrElement,
    traits: Trait[],
    private multiplier: number,
    private statType: 'atk' | 'hp' | 'def',
    crit: CritType = CritType.AVERAGE,
    limit?: StatLimit,
  ) {
    super(broken, mods, element, traits, crit, limit)
  }

  protected override base(stat: FinalStats): number {
    return this.multiplier * stat.basic[this.statType]
  }

  serialize(): __SerializedStep {
    return {
      broken: this.broken,
      element: this.element,
      traits: this.traits,
      multiplier: this.multiplier,
      statType: this.statType,
      critType: this.critType,
    }
  }

  __deserialize(json: __SerializedStep): NormalDamageStep {
    return new NormalDamageStep(
      json.broken,
      {},
      json.element,
      json.traits,
      json.multiplier,
      json.statType,
      json.critType,
      json.limit,
    )
  }
}

export class DotDamageStep extends NormalDamageStep {
  constructor(
    broken: boolean,
    mods: MapLikeModifiers,
    element: HsrElement,
    traits: Trait[],
    multiplier: number,
    statType: 'atk' | 'hp' | 'def',
    limit?: StatLimit,
  ) {
    super(
      broken,
      mods,
      element,
      traits,
      multiplier,
      statType,
      CritType.NO_CRIT,
      limit,
    )
  }
}

export abstract class BreakDamage extends DotDamageStep {
  protected dmgBoost(_: number): number {
    return 1
  }

  protected dmgReduction(_s: number[]): number {
    return 1
  }
  protected abstract base(stat: FinalStats): number
}

export class NoDamageStep implements Step {
  public readonly type: StepType
  constructor(
    public readonly mods: MapLikeModifiers,
    public readonly element: HsrElement,
    public readonly traits: Trait[],
  ) {
    this.type = StepType.NO_DAMAGE
  }

  calculate(_stat: FinalStats): number {
    return 0
  }
}
