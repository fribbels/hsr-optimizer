import { FinalStats } from '../../stats/stat'

export type StepAlgorithm = {
  calculate(stat: FinalStats): number
}

export abstract class AbstractStepCalculation implements StepAlgorithm {
  calculate(stat: FinalStats): number {
    return (
      this.base(stat)
      * this.def(
        stat.basic.lv,
        stat.targetDef.baseDef,
        stat.targetDef.percent,
        stat.targetDef.flat,
      )
      * Math.min(Math.max(1 - stat.res, 0.1), 2)
      * this.dmgBoost(stat.dmgBoost)
      * Math.min(1 + stat.vulnerability, 3.5)
      * this.crit(
        Math.min(1, stat.crit.critRate),
        stat.crit.critDmg,
      )
      * this.dmgReduction(stat.dmgReductions)
    )
  }
  protected abstract base(stat: FinalStats): number

  protected abstract dmgBoost(percent: number): number

  protected abstract dmgReduction(reductions: readonly number[]): number

  protected abstract crit(cr: number, cd: number): number

  private def(
    sourceLv: number,
    baseDef: number,
    percent: number,
    flat: number,
  ) {
    const def = Math.max(baseDef * (1 + percent) + flat, 0)
    return 1 - def / (def + 200 + 10 * sourceLv)
  }
}
