import { HsrElement } from 'lib/optimizer/new/stats/context'
import { AbstractExpression, Expression, TODO } from '..'
import {
  AtkFlatExpression,
  AtkPercentExpression,
  DefFlatExpression,
  DefPercentExpression,
  HpFlatExpression,
  HpPercentExpression,
  SpeedFlatExpression,
  SpeedPercentExpression,
} from './percent'
import { StaticStatExpression } from './static'

/* eslint-disable @typescript-eslint/no-namespace */
namespace Percentage {
  export interface ATK {
    atkBase: number
    atkFlat: number
    atkPercent: number
  }
  export interface DEF {
    defBase: number
    defFlat: number
    defPercent: number
  }
  export interface HP {
    hpBase: number
    hpFlat: number
    hpPercent: number
  }
  export interface Speed {
    speedBase: number
    speedFlat: number
    speedPercent: number
  }
}

interface Healing {
  outgoingHealing: number
  incomingHealing: number
}

interface _DamageBonus {
  [HsrElement.FIRE]: number
  [HsrElement.ICE]: number
  [HsrElement.IMAGINARY]: number
  [HsrElement.LIGHTING]: number
  [HsrElement.PHYSICAL]: number
  [HsrElement.QUANTUM]: number
  [HsrElement.WIND]: number
}
/**
 * Every stats contributed to the {@link FinalStat}, expanded.
 */
export interface AggregatedStat
  extends FinalStat, Percentage.ATK, Percentage.DEF, Percentage.HP, Percentage.Speed, Healing {
}
/**
 * The stat used to calculate damage. Nothing here changes anymore.
 */
export interface FinalStat {
  lv: number

  atk: number
  def: number
  hp: number
  speed: number

  critRate: number
  critDmg: number

  breakEffect: number
  effectHitRate: number
  effectRes: number

  healing: number

  dmgBonus: number

  weaken: number

  targetDef: number
  targetRes: number

  targetVulnerability: number
  targetDmgReductions: number[]
}

type CritRateExrepssion = Expression<number, TODO>
type CritDmgExpression = Expression<number, TODO>

type BreakEffectExpression = Expression<number, TODO>
type EffectHitRateExpression = Expression<number, TODO>
type EffectResExpression = Expression<number, TODO>

type IncomingHealingExpression = Expression<number, TODO>
type OutgoingHealingExpression = Expression<number, TODO>

type DamageBonusExpression = Expression<number, TODO>

type WeakenExpression = Expression<number, TODO>
type TargetDefExpression = Expression<number, TODO>
type TargetResExpression = Expression<number, TODO>
type TargetVulnerabilityExpression = Expression<number, TODO>
type TargetDmgReductionsExpression = Expression<number[], TODO>

export type AggregatedStatExpressionDependency = {
  static: StaticStatExpression

  atkFlat: AtkFlatExpression
  atkPercent: AtkPercentExpression

  defFlat: DefFlatExpression
  defPercent: DefPercentExpression

  hpFlat: HpFlatExpression
  hpPercent: HpPercentExpression

  speedFlat: SpeedFlatExpression
  speedPercent: SpeedPercentExpression

  critRate: CritRateExrepssion
  critDmg: CritDmgExpression

  breakEffect: BreakEffectExpression
  effectHitRate: EffectHitRateExpression
  effectRes: EffectResExpression

  incomingHealing: IncomingHealingExpression
  outgoingHealing: OutgoingHealingExpression

  dmgBonus: DamageBonusExpression

  weaken: WeakenExpression
  targetDef: TargetDefExpression
  targetRes: TargetResExpression
  targetVulnerability: TargetVulnerabilityExpression
  targetDmgReductions: TargetDmgReductionsExpression
}

export class AggregatedStatExpression extends AbstractExpression<AggregatedStat, AggregatedStatExpressionDependency>
  implements AggregatedStat, FinalStat {
  get lv(): number {
    return this.children.static.evaluate().lv
  }

  get atk(): number {
    return this.children.static.evaluate().atkBase * (this.children.atkPercent.evaluate() + 1)
      + this.children.atkFlat.evaluate()
  }

  get def(): number {
    return this.children.static.evaluate().defBase * (this.children.defPercent.evaluate() + 1)
      + this.children.defFlat.evaluate()
  }

  get hp(): number {
    return this.hpBase * (this.hpPercent + 1) + this.hpFlat
  }

  get speed(): number {
    return this.speedBase * (this.speedPercent + 1) + this.speedFlat
  }

  get critRate(): number {
    return this.children.critRate.evaluate()
  }

  get critDmg(): number {
    return this.children.critDmg.evaluate()
  }

  get breakEffect(): number {
    return this.children.breakEffect.evaluate()
  }

  get effectHitRate(): number {
    return this.children.effectHitRate.evaluate()
  }

  get effectRes(): number {
    return this.children.effectRes.evaluate()
  }

  get healing(): number {
    return this.incomingHealing + this.outgoingHealing
  }

  get dmgBonus(): number {
    return this.children.dmgBonus.evaluate()
  }

  get weaken(): number {
    return this.children.weaken.evaluate()
  }

  get targetDef(): number {
    return this.children.targetDef.evaluate()
  }

  get targetRes(): number {
    return this.children.targetRes.evaluate()
  }

  get targetVulnerability(): number {
    return this.children.targetVulnerability.evaluate()
  }

  get targetDmgReductions(): number[] {
    return this.children.targetDmgReductions.evaluate()
  }

  get atkBase(): number {
    return this.children.static.evaluate().atkBase
  }

  get atkFlat(): number {
    return this.children.atkFlat.evaluate()
  }

  get atkPercent(): number {
    return this.children.atkPercent.evaluate()
  }

  get defBase(): number {
    return this.children.static.evaluate().defBase
  }

  get defFlat(): number {
    return this.children.defFlat.evaluate()
  }

  get defPercent(): number {
    return this.children.defPercent.evaluate()
  }

  get hpBase(): number {
    return this.children.static.evaluate().hpBase
  }

  get hpFlat(): number {
    return this.children.hpFlat.evaluate()
  }

  get hpPercent(): number {
    return this.children.hpPercent.evaluate()
  }

  get speedBase(): number {
    return this.children.static.evaluate().speedBase
  }

  get speedFlat(): number {
    return this.children.speedFlat.evaluate()
  }

  get speedPercent(): number {
    return this.children.speedPercent.evaluate()
  }

  get outgoingHealing(): number {
    return this.children.outgoingHealing.evaluate()
  }

  get incomingHealing(): number {
    return this.children.incomingHealing.evaluate()
  }

  evaluate(): AggregatedStat {
    return this
  }
}
