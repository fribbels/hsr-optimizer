import { BuildCandidate } from 'lib/optimizer/new/opt/iteration/build'
import { AbstractExpression, TODO } from '..'
import { AggregatedStatExpressionDependency } from '../stat'

export class StatExpressionSource extends AbstractExpression<AggregatedStatExpressionDependency, TODO> {
  evaluate(): AggregatedStatExpressionDependency {
    throw new Error('Method not implemented.')
  }
}

type RelicStat = {
  [K in keyof Omit<AggregatedStatExpressionDependency, 'static'>]: number
}

export class RelicExpressionSource extends AbstractExpression<RelicStat, BuildCandidate> implements RelicStat {
  // There should be better way to do this, but will need some sampling so that
  // we can group commonly used expressions together. Also I need Cxx macros.

  // TODO: set effects.
  public get atkFlat(): number {
    return (this.children.head.basic.flat?.atk ?? 0)
      + this.children.hand.basic.flat.atk
      + (this.children.body.basic?.flat?.atk ?? 0)
      + (this.children.feet.basic?.flat?.atk ?? 0)
      + (this.children.sphere.basic?.flat?.atk ?? 0)
      + (this.children.feet.basic?.flat?.atk ?? 0)
  }

  public get atkPercent(): number {
    return (this.children.head.basic.percent?.atk ?? 0)
      + (this.children.hand.basic.percent?.atk ?? 0)
      + (this.children.body.basic?.percent?.atk ?? 0)
      + (this.children.feet.basic?.percent?.atk ?? 0)
      + (this.children.sphere.basic?.percent?.atk ?? 0)
      + (this.children.feet.basic?.percent?.atk ?? 0)
  }

  public get defFlat(): number {
    return (this.children.head.basic.flat?.def ?? 0)
      + (this.children.hand.basic.flat?.def ?? 0)
      + (this.children.body.basic?.flat?.def ?? 0)
      + (this.children.feet.basic?.flat?.hp ?? 0)
      + (this.children.sphere.basic?.flat?.def ?? 0)
      + (this.children.feet.basic?.flat?.def ?? 0)
  }

  public get defPercent(): number {
    return (this.children.head.basic.percent?.def ?? 0)
      + (this.children.hand.basic.percent?.def ?? 0)
      + (this.children.body.basic?.percent?.def ?? 0)
      + (this.children.feet.basic?.percent?.def ?? 0)
      + (this.children.sphere.basic?.percent?.def ?? 0)
      + (this.children.feet.basic?.percent?.def ?? 0)
  }

  public get hpFlat(): number {
    return this.children.head.basic.flat.hp
      + (this.children.hand.basic.flat?.hp ?? 0)
      + (this.children.body.basic?.flat?.hp ?? 0)
      + (this.children.feet.basic?.flat?.hp ?? 0)
      + (this.children.sphere.basic?.flat?.hp ?? 0)
      + (this.children.feet.basic?.flat?.hp ?? 0)
  }

  public get hpPercent(): number {
    return (this.children.head.basic.percent?.hp ?? 0)
      + (this.children.hand.basic.percent?.hp ?? 0)
      + (this.children.body.basic?.percent?.hp ?? 0)
      + (this.children.feet.basic?.percent?.hp ?? 0)
      + (this.children.sphere.basic?.percent?.hp ?? 0)
      + (this.children.feet.basic?.percent?.hp ?? 0)
  }

  public get speedFlat(): number {
    return (this.children.head.basic.flat.speed ?? 0)
      + (this.children.hand.basic.flat?.speed ?? 0)
      + (this.children.body.basic?.flat?.speed ?? 0)
      + (this.children.feet.basic?.flat?.speed ?? 0)
      + (this.children.sphere.basic?.flat?.speed ?? 0)
      + (this.children.feet.basic?.flat?.speed ?? 0)
  }

  public get speedPercent(): number {
    return 0
  }

  public get critRate(): number {
    return (this.children.head.crit?.critRate ?? 0)
      + (this.children.hand.crit?.critRate ?? 0)
      + (this.children.body.crit?.critRate ?? 0)
      + (this.children.feet.crit?.critRate ?? 0)
      + (this.children.sphere.crit?.critRate ?? 0)
      + (this.children.feet.crit?.critRate ?? 0)
  }

  public get critDmg(): number {
    return (this.children.head.crit?.critDmg ?? 0)
      + (this.children.hand.crit?.critDmg ?? 0)
      + (this.children.body.crit?.critDmg ?? 0)
      + (this.children.feet.crit?.critDmg ?? 0)
      + (this.children.sphere.crit?.critDmg ?? 0)
      + (this.children.feet.crit?.critDmg ?? 0)
  }

  evaluate(): RelicStat {
    return this
  }
}
