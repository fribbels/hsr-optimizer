/**
 * Either a buff/debuff,...anything that could affect stats.
 */
import { StepAwareModifier } from '../step/formula'
import { EarlyConditional, LateConditional } from './conditional'
import { PartialModifiableStats } from './stat'

export type Modifiers = {
  unconditional: PartialModifiableStats[]
  early: EarlyConditional[]
  late: LateConditional[]
}

export type MapLikeModifiers = {
  [K in keyof Modifiers]?: Modifiers[K] extends (infer T)[] ?
    Map<string, StepAwareModifier<T>>
    : never
}

export class ModifiersBuilder {
  constructor(
    private unconditional: PartialModifiableStats[] = [],
    private early: EarlyConditional[] = [],
    private late: LateConditional[] = [],
  ) {}

  static copy(other: ModifiersBuilder) {
    return new ModifiersBuilder(
      [...other.unconditional],
      [...other.early],
      [...other.late],
    )
  }

  addUnconditionalStats(...others: PartialModifiableStats[]): this {
    this.unconditional.push(...others)
    return this
  }

  /**
   * @returns the old value
   */
  setUnconditionalStats(
    val: PartialModifiableStats[],
  ): PartialModifiableStats[] {
    const old = this.unconditional
    this.unconditional = val
    return old
  }

  addEarlyConditional(...others: EarlyConditional[]): this {
    this.early.push(...others)
    return this
  }

  /**
   * @returns the old value
   */
  setEarlyConditionals(val: EarlyConditional[]): EarlyConditional[] {
    const old = this.early
    this.early = val
    return old
  }

  addLateConditional(...others: LateConditional[]): this {
    this.late.push(...others)
    return this
  }

  /**
   * @returns the old value
   */
  setLateConditionals(val: LateConditional[]): LateConditional[] {
    const old = this.late
    this.late = val
    return old
  }

  /**
   * @param reset reset this builder to a zero state.
   */
  build(reset: boolean = false): Modifiers {
    const retVal: Modifiers = {
      unconditional: this.unconditional,
      early: this.early,
      late: this.late,
    }
    if (reset) {
      this.unconditional = []
      this.early = []
      this.late = []
    }
    return retVal
  }
}

export class MapLikeModifiersBuidler {
  constructor(
    private uncond: Map<
      string,
      StepAwareModifier<PartialModifiableStats>
    > = new Map(),
    private eleTr: Map<string, StepAwareModifier<EarlyConditional>> = new Map(),
    private st: Map<string, StepAwareModifier<LateConditional>> = new Map(),
  ) {}

  unconditional(
    key: string,
    mod: StepAwareModifier<PartialModifiableStats> | undefined,
  ): this {
    if (mod === undefined) this.uncond.delete(key)
    else this.uncond.set(key, mod)
    return this
  }

  early(
    key: string,
    mod: StepAwareModifier<EarlyConditional> | undefined,
  ): this {
    if (mod === undefined) this.eleTr.delete(key)
    else this.eleTr.set(key, mod)
    return this
  }

  late(key: string, mod: StepAwareModifier<LateConditional> | undefined): this {
    if (mod === undefined) this.st.delete(key)
    else this.st.set(key, mod)
    return this
  }

  build(): MapLikeModifiers {
    const retVal: MapLikeModifiers = {}
    if (this.uncond.size > 0) retVal.unconditional = this.uncond
    if (this.eleTr.size > 0) retVal.early = this.eleTr
    if (this.st.size > 0) retVal.late = this.st
    return retVal
  }
}
