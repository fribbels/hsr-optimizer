/* eslint-disable @typescript-eslint/no-namespace */
import { AbstractExpression, Expression, TODO } from '..'

namespace Expression {
  export namespace Damage {
    export interface BaseDamage extends Expression<number, TODO> {}
    export namespace Multiplier {
      export interface DEF extends Expression<number, TODO> {}
      export interface RES extends Expression<number, TODO> {}
      export interface DamageBonus extends Expression<number, TODO> {}
      export interface Vulnerability extends Expression<number, TODO> {}
      export interface Weaken extends Expression<number, TODO> {}
      export interface Crit extends Expression<number, TODO> {}
      export interface DamageReduction extends Expression<number, TODO> {}
    }
  }
}

type Dependency = {
  base: Expression.Damage.BaseDamage
  def: Expression.Damage.Multiplier.DEF
  res: Expression.Damage.Multiplier.RES
  dmgBonus: Expression.Damage.Multiplier.DamageBonus
  vulnerability: Expression.Damage.Multiplier.Vulnerability
  weaken: Expression.Damage.Multiplier.Weaken
  crit: Expression.Damage.Multiplier.Crit
  dmgReduction: Expression.Damage.Multiplier.DamageReduction
}

export class DamageExpression extends AbstractExpression<number, Dependency> {
  evaluate(): number {
    const dependency = this.children
    return dependency.base.evaluate()
      * dependency.def.evaluate()
      * dependency.res.evaluate()
      * dependency.dmgBonus.evaluate()
      * dependency.vulnerability.evaluate()
      * dependency.weaken.evaluate()
      * dependency.crit.evaluate()
      * dependency.dmgReduction.evaluate()
  }
}
