import { BaseDamageCalculator } from './base'
import { AbstractStepCalculation } from './calculation'

import { FinalStats } from '../../stats/stat'

export class DotDamageCalculation extends AbstractStepCalculation {
  constructor(private baseFn: BaseDamageCalculator) {
    super()
  }

  protected crit(_cr: number, _cd: number): number {
    return 1
  }

  base(stat: FinalStats): number {
    return this.baseFn.calculate(stat)
  }

  dmgBoost(percent: number): number {
    return 1 + percent
  }

  dmgReduction(reductions: number[]): number {
    return reductions.reduce((prev, val) => prev * (1 - val), 1)
  }
}

export enum CritMode {
  AVERAGE,
  NO_CRIT,
  ALWAYS_CRIT,
}

const CRIT_MAP: {
  [K in CritMode]: (cr: number, cd: number) => number
} = {
  [CritMode.AVERAGE]: (cr, cd) => 1 + cr * cd,
  [CritMode.NO_CRIT]: (_cr, _cd) => 1,
  [CritMode.ALWAYS_CRIT]: (_cr, cd) => 1 + cd,
}

export class GeneralDamageCalculation extends DotDamageCalculation {
  constructor(baseFn: BaseDamageCalculator, private critMode: CritMode = CritMode.AVERAGE) {
    super(baseFn)
  }

  protected crit(cr: number, cd: number): number {
    return CRIT_MAP[this.critMode](cr, cd)
  }
}
