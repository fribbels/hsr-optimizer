import { PathNames } from 'lib/constants/constants'
import { BUFF_TYPE } from 'lib/optimization/buffSource'
import { Buff } from 'lib/optimization/basicStatsArray'
import { ComputedStatsContainer } from 'lib/optimization/engine/container/computedStatsContainer'
import { ActionBuffSnapshot, RotationBuffStep } from 'lib/simulations/statSimulationTypes'
import DB from 'lib/state/db'
import { OptimizerForm } from 'types/form'

export type BuffGroups = Record<BUFF_TYPE, Record<string, Buff[]>>

export type RotationStepEntry = {
  actionType: string
  groups: BuffGroups
}

export type PerActionBuffGroups = {
  byAction: Record<string, BuffGroups>
  rotationSteps: RotationStepEntry[]
  primaryAction: string
}

export function aggregateCombatBuffs(x: ComputedStatsContainer, request: OptimizerForm): BuffGroups {
  const combatBuffs = extractCombatBuffs(x)
  return groupCombatBuffs(combatBuffs, request)
}

export function aggregatePerActionBuffs(
  actionBuffSnapshots: Record<string, ActionBuffSnapshot>,
  rotationBuffSteps: RotationBuffStep[],
  x: ComputedStatsContainer,
  request: OptimizerForm,
  primaryAbilityKey: string,
): PerActionBuffGroups {
  const hasMemo = DB.getMetadata().characters[request.characterId].path == PathNames.Remembrance
  const buffsBasic: Buff[] = (x.c as unknown as { buffs?: Buff[] }).buffs ?? []

  const byAction: Record<string, BuffGroups> = {}
  for (const [actionName, snapshot] of Object.entries(actionBuffSnapshots)) {
    byAction[actionName] = groupSnapshot(snapshot, buffsBasic, hasMemo, request)
  }

  const rotationSteps: RotationStepEntry[] = rotationBuffSteps.map((step) => ({
    actionType: step.actionType,
    groups: groupSnapshot(step.snapshot, buffsBasic, hasMemo, request),
  }))

  return { byAction, rotationSteps, primaryAction: primaryAbilityKey }
}

function groupSnapshot(snapshot: ActionBuffSnapshot, buffsBasic: Buff[], hasMemo: boolean, request: OptimizerForm): BuffGroups {
  const combatBuffs: CombatBuffs = {
    buffsBasic,
    buffs: snapshot.buffs,
    buffsMemo: hasMemo ? snapshot.buffsMemo : [],
  }
  return groupCombatBuffs(combatBuffs, request)
}

function groupCombatBuffs(combatBuffs: CombatBuffs, request: OptimizerForm) {
  const buffGroups = Object.fromEntries(
    Object.values(BUFF_TYPE).map((type) => [type, {}]),
  ) as BuffGroups

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
  const buffs: Buff[] = x.buffs ?? []
  const buffsBasic: Buff[] = (x.c as unknown as { buffs?: Buff[] }).buffs ?? []
  const buffsMemo: Buff[] = x.buffsMemo ?? []

  return { buffs, buffsMemo, buffsBasic }
}

type CombatBuffs = {
  buffs: Buff[],
  buffsMemo: Buff[],
  buffsBasic: Buff[],
}
