import { Serializable } from '../format/serializable'
import { EarlyConditional, LateConditional } from './conditional'
import { LateContext } from './context'
import { __HitContext, FinalStats, PartialModifiableStats, StatCollector } from './stat'

/**
 * A stat aggregator that work over multiple steps, producing a
 * {@link FinalStats} at the end.
 * - Preprocess: where unconditional and type conditional modifiers will be
 *   added. The result of this phase will be reused.
 * - Relic: add relic stats
 * - Build: stats conditional will be addressed, producing the final
 *   {@link FinalStats}
 */
export class StatBuilder implements Serializable<StatBuilder, StatBuilder> {
  private pre: StatCollector

  /**
   * See {@link EarlyConditional} for a more through discussion of why are there
   * 3 fields used to separate buffs/debuffs.
   * @param context Character base stats, traces,...
   * @param unconditional anything buffs, debuffs that don't require a specific
   * element/trait or other stats
   * @param early conditional that can be evaluate before relic stats are loaded
   * @param element the element of this damage/healing/chance instance (if any
   * is relevant)
   * @param traits traits of this damage/healing/chance instance
   */
  constructor(
    private context: __HitContext,
    private unconditional: PartialModifiableStats[],
    private early: EarlyConditional[],
    private late: LateConditional[],
  ) {
    this.pre = StatCollector.zero(context)
    this.preprocess()
  }

  private preprocess() {
    // Let's add the unconditional
    this.unconditional.forEach((unc) => this.pre.add(unc))
    // We know the type context now
    this.early
      .filter((cond) => cond.matcher.match(this.context))
      .forEach((cond) => this.pre.add(cond.statz))
  }

  getFinalStats(
    uncond: PartialModifiableStats[],
    early: EarlyConditional[],
    additional: LateConditional[],
  ): FinalStats {
    const curr = StatCollector.copy(this.pre)
    uncond.forEach((val) => curr.add(val))
    const ctx: LateContext = {
      stat: curr,
      element: this.context.element,
      traits: this.context.traits,
    }
    early
      .filter((cond) => cond.matcher.match(this.context))
      .forEach((cond) => curr.add(cond.statz))
    this.late
      .filter((cond) => cond.matcher.match(ctx))
      .forEach((cond) => curr.add(cond.provider.stat(ctx)))
    additional
      .filter((cond) => cond.matcher.match(ctx))
      .forEach((cond) => curr.add(cond.provider.stat(ctx)))
    return curr
  }

  serialize(): StatBuilder {
    return this
  }

  __deserialize(this: undefined, json: StatBuilder): StatBuilder {
    // bypass preprocessor by directly assigning properties
    // TODO: change the constructor into a mere property assignment
    return Object.assign(Object.create(StatBuilder.prototype), json) as StatBuilder
  }
}
