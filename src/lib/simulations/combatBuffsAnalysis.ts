import { PathNames } from 'lib/constants/constants'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { Buff } from 'lib/optimization/computedStatsArray'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import DB from 'lib/state/db'
import { OptimizerForm } from 'types/form'

export function aggregateCombatBuffs(x: ComputedStatsContainer, request: OptimizerForm) {
  const combatBuffs = extractCombatBuffs(x)
  return groupCombatBuffs(combatBuffs, request)
}

function groupCombatBuffs(combatBuffs: CombatBuffs, request: OptimizerForm) {
  const buffGroups = Object.fromEntries(
    Object.values(BUFF_TYPE).map((type) => [type, {}]),
  ) as Record<BUFF_TYPE, Record<string, Buff[]>>

  const hasMemo = DB.getMetadata().characters[request.characterId].path == PathNames.Remembrance

  for (const buff of [...combatBuffs.buffsBasic, ...combatBuffs.buffs, ...(hasMemo ? combatBuffs.buffsMemo : [])]) {
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

function extractCombatBuffs(x: ComputedStatsContainer) {
  // Container buff tracing - x.buffs contains computed stat buffs, x.buffsMemo contains memosprite buffs
  const buffs: Buff[] = x.buffs ?? []
  // Basic stats array also has buffs if tracing was enabled
  const buffsBasic: Buff[] = (x.c as unknown as { buffs?: Buff[] }).buffs ?? []
  // Memosprite buffs from Container
  const buffsMemo: Buff[] = x.buffsMemo ?? []

  const combatBuffs = {
    buffs,
    buffsMemo,
    buffsBasic,
  }

  return combatBuffs
}

type CombatBuffs = {
  buffs: Buff[],
  buffsMemo: Buff[],
  buffsBasic: Buff[],
}
