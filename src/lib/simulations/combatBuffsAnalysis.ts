import { PathNames } from 'lib/constants/constants'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { Buff, ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import DB from 'lib/state/db'
import { OptimizerForm } from 'types/form'

export function aggregateCombatBuffs(x: ComputedStatsArray, request: OptimizerForm) {
  const combatBuffs = extractCombatBuffs(x)
  const buffGroups = groupCombatBuffs(combatBuffs, request)

  console.log(buffGroups)

  return buffGroups
}

function groupCombatBuffs(combatBuffs: CombatBuffs, request: OptimizerForm) {
  const buffGroups = Object.fromEntries(
    Object.values(BUFF_TYPE).map((type) => [type, {}]),
  ) as Record<BUFF_TYPE, Record<string, Buff[]>>

  const hasMemo = DB.getMetadata().characters[request.characterId].path == PathNames.Remembrance

  for (const buff of [...combatBuffs.buffsBasic, ...combatBuffs.buffs, ...(hasMemo ? combatBuffs.buffsMemo : [])]) {
    // for (const buff of [...combatBuffs.buffs, ...combatBuffs.buffsMemo]) {
    const id = buff.source.id
    const buffType = request.characterId == id ? BUFF_TYPE.PRIMARY : buff.source.buffType

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
  const buffsBasic = x.c.buffs
  const buffsMemo = x.m
    ? [...x.buffsMemo, ...x.m.buffs]
    : []

  buffsMemo.forEach((buff) => buff.memo = true)

  const combatBuffs = {
    buffs,
    buffsMemo,
    buffsBasic,
  }

  console.log(combatBuffs)
  console.log(x)

  return combatBuffs
}

type CombatBuffs = {
  buffs: Buff[]
  buffsMemo: Buff[]
  buffsBasic: Buff[]
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
