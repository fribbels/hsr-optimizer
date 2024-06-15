import { StatBuildingContext } from './builder'
import { EarlyConditional, LateConditional } from './conditional'
import { LateContext } from './context'
import { FinalStats, PartialModifiableStats, StatAggregator } from './stat'
import { __DeepReadonly } from './typesUtils'

export type Modifiers = {
  unconditional: PartialModifiableStats[]
  early: EarlyConditional[]
  late: LateConditional[]
}

export type CombatAwareModifier = {
  noncombat: Omit<Modifiers, 'late'>
  combat: Modifiers
}

export type ModifiersLike = Modifiers | CombatAwareModifier

export type NoncombatBuiltStat = {
  combat: FinalStats
  noncombat: FinalStats
}
export type BuiltStat = NoncombatBuiltStat | FinalStats

interface StatBuilder<T extends ModifiersLike = Modifiers, K extends BuiltStat = FinalStats> {
  readonly context: __DeepReadonly<StatBuildingContext>
  readonly modifiers: __DeepReadonly<T>
  build(modifiers: T): K
}

class AbstractStatBuilder<T extends ModifiersLike> {
  constructor(public readonly context: StatBuildingContext, public readonly modifiers: T) {}

  protected addUnconditional(unconditional: PartialModifiableStats[], stat: StatAggregator) {
    unconditional.forEach((cond) => stat.add(cond))
  }

  protected filterAndAddEarly(early: EarlyConditional[], stat: StatAggregator) {
    early.filter((cond) => cond.matcher.match(this.context))
      .forEach((cond) => stat.add(cond.statz))
  }

  protected filterAndAddLate(late: LateConditional[], stat: StatAggregator, context: LateContext) {
    late.filter((cond) => cond.matcher.match(context))
      .forEach((cond) => stat.add(cond.provider.stat(context)))
  }
}

class SimpleStatBuilder extends AbstractStatBuilder<Modifiers> implements StatBuilder {
  private pre: StatAggregator
  constructor(context: StatBuildingContext, modifiers: Modifiers) {
    super(context, modifiers)
    this.pre = StatAggregator.zero(context)
    this.preprocess()
  }

  private preprocess() {
    // Let's add the unconditional
    this.addUnconditional(this.modifiers.unconditional, this.pre)
    // We know the type context now
    this.filterAndAddEarly(this.modifiers.early, this.pre)
  }

  build(modifiers: Modifiers): FinalStats {
    const stat = StatAggregator.copy(this.pre)
    this.addUnconditional(modifiers.unconditional, stat)
    this.filterAndAddEarly(modifiers.early, stat)

    const context: LateContext = {
      stat,
      element: this.context.element,
      traits: this.context.traits,
    }
    this.filterAndAddLate(this.modifiers.late, stat, context)
    this.filterAndAddLate(modifiers.late, stat, context)
    return stat
  }
}

class NonCombatCapable extends AbstractStatBuilder<CombatAwareModifier>
  implements StatBuilder<CombatAwareModifier, NoncombatBuiltStat> {
  private nonCombatPre: StatAggregator
  private combatPre: StatAggregator
  constructor(context: StatBuildingContext, modifiers: CombatAwareModifier) {
    super(context, modifiers)
    this.nonCombatPre = StatAggregator.zero(context)
    this.combatPre = StatAggregator.zero(context)
    this.preprocess()
  }

  /**
   * Non-combat stat = non-combat early pre relic + non-combat early post relic
   * Combat stat = Non-combat stat + anything else
   */
  private preprocess() {
    this.addUnconditional(this.modifiers.noncombat.unconditional, this.nonCombatPre)
    this.filterAndAddEarly(this.modifiers.noncombat.early, this.nonCombatPre)

    this.addUnconditional(this.modifiers.combat.unconditional, this.combatPre)
    this.filterAndAddEarly(this.modifiers.combat.early, this.combatPre)
  }

  build(modifiers: CombatAwareModifier): NoncombatBuiltStat {
    const noncombat = StatAggregator.copy(this.nonCombatPre)

    this.addUnconditional(modifiers.noncombat.unconditional, noncombat)
    this.filterAndAddEarly(modifiers.noncombat.early, noncombat)

    // We completed the calculation of non combat stat

    const combat = StatAggregator.copy(noncombat)
    combat.add(this.combatPre)

    this.addUnconditional(modifiers.combat.unconditional, combat)
    this.filterAndAddEarly(modifiers.combat.early, combat)

    const ctx: LateContext = {
      stat: combat,
      element: this.context.element,
      traits: this.context.traits,
    }

    this.filterAndAddLate(this.modifiers.combat.late, combat, ctx)
    this.filterAndAddLate(modifiers.combat.late, combat, ctx)

    return { combat, noncombat }
  }
}

export const StatBuilder = {
  simple(context: StatBuildingContext, modifiers: Modifiers): StatBuilder {
    return new SimpleStatBuilder(context, modifiers)
  },

  noncombat(
    context: StatBuildingContext,
    modifiers: CombatAwareModifier,
  ): StatBuilder<CombatAwareModifier, NoncombatBuiltStat> {
    return new NonCombatCapable(context, modifiers)
  },
}
