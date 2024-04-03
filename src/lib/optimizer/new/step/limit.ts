import { FinalStats } from '../stats/stat'
import { StatLimit } from './step'

/**
 * @returns true if the check passed, false otherwise
 */
export function checkLimit(stat: FinalStats, limit: StatLimit) {
  // I honestly doubt we had a better way...Fuck this shit
  if (limit.basic?.atk && !checkInRange(stat.basic.atk, limit.basic.atk)) {
    return false
  }
  if (limit.basic?.def && !checkInRange(stat.basic.def, limit.basic.def)) {
    return false
  }
  if (limit.basic?.hp && !checkInRange(stat.basic.hp, limit.basic.hp)) {
    return false
  }
  if (limit.basic?.speed && !checkInRange(stat.basic.speed, limit.basic.speed)) {
    return false
  }
  if (limit?.breakEffect && !checkInRange(stat.breakEffect, limit.breakEffect)) {
    return false
  }
  if (
    limit?.crit?.critRate
    && !checkInRange(stat.crit.critRate, limit.crit.critRate)
  ) {
    return false
  }
  if (
    limit?.crit?.critDmg
    && !checkInRange(stat.crit.critDmg, limit.crit.critDmg)
  ) {
    return false
  }
  if (
    limit?.crit?.critRate
    && !checkInRange(stat.crit.critRate, limit.crit.critRate)
  ) {
    return false
  }
  if (
    limit?.effectHitRate
    && !checkInRange(stat.effectHitRate, limit.effectHitRate)
  ) {
    return false
  }
  if (limit?.effectRes && !checkInRange(stat.effectRes, limit.effectRes)) {
    return false
  }
  if (
    limit?.energyRegenerationRate
    && !checkInRange(stat.energyRegenerationRate, limit.energyRegenerationRate)
  ) {
    return false
  }
  if (
    limit?.outgoingHealing
    && !checkInRange(stat.outgoingHealing, limit.outgoingHealing)
  ) {
    return false
  }
  return true
}

function checkInRange(
  val: number,
  { min, max }: { min?: number; max?: number },
): boolean {
  if (min && min > val) {
    return false
  }
  if (max && max < val) {
    return false
  }
  return true
}
