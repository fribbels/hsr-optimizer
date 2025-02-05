import { ComputedStatsArray } from 'lib/optimization/computedStatsArray'

export function aggregateCombatBuffs(x: ComputedStatsArray) {
  const combatBuffs = extractCombatBuffs(x)

  return combatBuffs
}

export function extractCombatBuffs(x: ComputedStatsArray) {
  const buffs = x.buffs
  const buffsMemo = x.m
    ? [...x.buffsMemo, ...x.m.buffs]
    : []

  const combatBuffs = {
    buffs,
    buffsMemo,
  }

  console.log(combatBuffs)
  console.log(x)

  return combatBuffs
}
