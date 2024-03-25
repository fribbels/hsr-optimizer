import { StepAwareModifier } from './formula'
import { MapLikeModifiersBuidler } from '../modifier'
import { EarlyConditional, LateConditional } from '../stats/conditional'
import { Trait } from '../stats/context'
import { HsrElement } from '../stats/context'
import { PartialModifiableStats } from '../stats/stat'
import { CritType, NormalDamageStep, StatLimit } from './step'

type __StatType = 'atk' | 'hp' | 'def'
export class StepBuilder {
  static damage(
    element: HsrElement,
    traits: Trait[],
    multiplier: number,
    statType: __StatType,
  ): NormalDamageStepBuilder {
    return new NormalDamageStepBuilder(element, traits, multiplier, statType)
  }
}

export type __MapLikeModiferBuilder = {
  unconditional(
    key: string,
    mod: StepAwareModifier<PartialModifiableStats> | undefined,
  ): __MapLikeModiferBuilder
  early(
    key: string,
    mod: StepAwareModifier<EarlyConditional> | undefined,
  ): __MapLikeModiferBuilder
  late(
    key: string,
    mod: StepAwareModifier<LateConditional> | undefined,
  ): __MapLikeModiferBuilder
}

export class NormalDamageStepBuilder {
  private mods = new MapLikeModifiersBuidler()

  constructor(
    private ele: HsrElement,
    private tr: Trait[],
    private mul: number,
    private type: __StatType,
    private brok: boolean = false,
    private crit: CritType = CritType.AVERAGE,
    private lim?: StatLimit,
  ) {}

  broken(brok: boolean) {
    this.brok = brok
    return this
  }

  element(ele: HsrElement) {
    this.ele = ele
    return this
  }

  traits(...traits: Trait[]) {
    this.tr = traits
    return this
  }

  multiplier(mul: number) {
    this.mul = mul
    return this
  }

  stat(stat: 'atk' | 'hp' | 'def') {
    this.type = stat
    return this
  }

  with(fn: (modsBuilder: __MapLikeModiferBuilder) => void): this {
    fn(this.mods)
    return this
  }

  averageCrit(): this {
    this.crit = CritType.AVERAGE
    return this
  }

  neverCrit(): this {
    this.crit = CritType.NO_CRIT
    return this
  }

  alwaysCrit(): this {
    this.crit = CritType.ALWAYS_CRIT
    return this
  }

  limit(limit?: StatLimit) {
    this.lim = limit
    return this
  }

  build(): NormalDamageStep {
    return new NormalDamageStep(
      this.brok,
      this.mods.build(),
      this.ele,
      this.tr,
      this.mul,
      this.type,
      this.crit,
      this.lim,
    )
  }
}
