import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { Buff, ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import { OptimizerForm } from 'types/form'

export function aggregateCombatBuffs(x: ComputedStatsArray, request: OptimizerForm) {
  const combatBuffs = extractCombatBuffs(x)
  const buffGroups = groupCombatBuffs(combatBuffs, request)

  console.log(buffGroups)

  return buffGroups
}

function groupCombatBuffs(combatBuffs: CombatBuffs, request: OptimizerForm) {
  const buffGroups: Record<BUFF_TYPE, Record<string, Buff[]>> = Object.fromEntries(
    Object.values(BUFF_TYPE).map((type) => [type, {}]),
  ) as Record<BUFF_TYPE, Record<string, Buff[]>>

  if (request.characterId) buffGroups[BUFF_TYPE.CHARACTER][request.characterId] = []
  if (request.lightCone) buffGroups[BUFF_TYPE.LIGHTCONE][request.lightCone] = []

  for (const buff of [...combatBuffs.buffs]) {
    // for (const buff of [...combatBuffs.buffs, ...combatBuffs.buffsMemo]) {
    const id = buff.source.id
    const buffType = buff.source.buffType

    const group = buffGroups[buffType]

    if (!group[id]) {
      group[id] = []
    }

    group[id].push(buff)
  }

  return buffGroups
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

type CombatBuffs = {
  buffs: Buff[]
  buffsMemo: Buff[]
}

const sourceToLabelMapping: Record<string, string> = {
  BASIC: 'Basic',
  SKILL: 'Skill',
  ULT: 'Ult',
  TALENT: 'Talent',
  TECHNIQUE: 'Technique',
  TRACE: 'Trace',
  MEMO: 'Memosprite',
  E1: 'E1',
  E2: 'E2',
  E4: 'E4',
  E6: 'E6',
}
