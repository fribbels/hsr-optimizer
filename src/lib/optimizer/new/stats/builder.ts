import { Serializable } from '../format/serializable'
import { BasicStats } from './basicStat'
import { HsrElement, LateContext, Trait } from './context'
import { Modifiers } from './modifier'
import { FinalStats, StatAggregator } from './stat'

import type { EarlyConditional as _EC, LateConditional as _LC } from './conditional'
import type { PartialModifiableStats as _PMS } from './stat'

export type StatBuildingContext = {
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
 * A StatFilter matches conditional stats (either a
 * {@link _PMS PartialModifiableStats}, {@link _EC EarlyConditional} or a
 * {@link _LC LateConditional}) and approriately applying them to create the
 * {@link FinalStats}. It does so in 2 step (which corresponding to 2 sources of
 * stats):
 *
 * /// EarlyContext available: the element, trait of this attack.
 * - Initialization: preprocess the majority of the stats (mostly support
 *   buffs), reusing the computed value for 2nd step that can be called multiple
 *   times.
 *
 * /// LateContext available: all of {@link VisibleStats}.
 * - Finalization: calculate the {@link FinalStats} from applied relic stat.
 */
export abstract class StatBuilder {
  constructor(
    public readonly buildingContext: StatBuildingContext,
    public readonly modifier: Modifiers,
  ) {}
  abstract getFinalStats(modifier: Modifiers): FinalStats
}

export class SimpleStatBuilder extends StatBuilder implements Serializable<SimpleStatBuilder, SimpleStatBuilder> {
  private pre: StatAggregator

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
    context: StatBuildingContext,
    modifier: Modifiers,
  ) {
    super(context, modifier)
    this.pre = StatAggregator.zero(context)
    this.preprocess()
  }

  private preprocess() {
    // Let's add the unconditional
    this.modifier.unconditional.forEach((unc) => this.pre.add(unc))
    // We know the type context now
    this.modifier.early
      .filter((cond) => cond.matcher.match(this.buildingContext))
      .forEach((cond) => this.pre.add(cond.statz))
  }

  getFinalStats(extraModifier: Modifiers): FinalStats {
    const curr = StatAggregator.copy(this.pre)
    extraModifier.unconditional.forEach((val) => curr.add(val))
    const ctx: LateContext = {
      stat: curr,
      element: this.buildingContext.element,
      traits: this.buildingContext.traits,
    }
    extraModifier.early
      .filter((cond) => cond.matcher.match(this.buildingContext))
      .forEach((cond) => curr.add(cond.statz))
    this.modifier.late
      .filter((cond) => cond.matcher.match(ctx))
      .forEach((cond) => curr.add(cond.provider.stat(ctx)))
    extraModifier.late
      .filter((cond) => cond.matcher.match(ctx))
      .forEach((cond) => curr.add(cond.provider.stat(ctx)))
    return curr
  }

  serialize(): SimpleStatBuilder {
    return this
  }

  __deserialize(this: undefined, json: SimpleStatBuilder): SimpleStatBuilder {
    // bypass preprocessor by directly assigning properties
    // TODO: change the constructor into a mere property assignment
    return Object.assign(Object.create(SimpleStatBuilder.prototype), json) as SimpleStatBuilder
  }
}

export class AlternativeViewStatFilter extends StatBuilder
  implements Serializable<AlternativeViewStatFilter, AlternativeViewStatFilter> {
  private default: SimpleStatBuilder
  // it is possible to support multiple view by replacing this with a map
  private tagged: SimpleStatBuilder

  constructor(context: StatBuildingContext, modifier: Modifiers, alternativeModifier: Modifiers) {
    super(context, modifier)
    this.default = new SimpleStatBuilder(context, modifier)
    this.tagged = new SimpleStatBuilder(context, alternativeModifier)
  }

  getFinalStats(modifier: Modifiers): FinalStats {
    return this.default.getFinalStats(modifier)
  }

  getAlternativeFinalStats(modifier: Modifiers): FinalStats {
    return this.tagged.getFinalStats(modifier)
  }

  serialize(): AlternativeViewStatFilter {
    return this
  }

  __deserialize(json: AlternativeViewStatFilter): AlternativeViewStatFilter {
    return Object.assign(Object.create(AlternativeViewStatFilter.prototype), json) as AlternativeViewStatFilter
  }
}
