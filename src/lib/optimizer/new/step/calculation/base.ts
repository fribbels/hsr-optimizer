import { FinalStats } from '../../stats/stat'

export type BaseDamageCalculator = {
  calculate(stat: FinalStats): number
}

export class CommonScaling implements BaseDamageCalculator {
  constructor(private multiplier: number, private statType: 'atk' | 'hp' | 'def') {}

  calculate(stat: FinalStats): number {
    return this.multiplier * stat.basic[this.statType]
  }
}
