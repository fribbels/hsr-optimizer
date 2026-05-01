import { teammateOrnamentOptions } from 'lib/sets/setConfigRegistry'
import { precisionRound } from 'lib/utils/mathUtils'
import type { CharacterId } from 'types/character'
import type { Form } from 'types/form'
import type { TeammateOption } from 'types/setConfig'

export const teammateKeys = ['teammate0', 'teammate1', 'teammate2'] as const
export const TEAMMATE_UPGRADE_PRECISION = 2

export function computeTeammateOrnamentUpgrades(
  form: Form,
  simulate: (modifiedForm: Form) => number,
): TeammateSetUpgrade[] {
  const results: PreTeammateSetUpgrade[] = []
  for (const key of teammateKeys) {
    if (!form[key].characterId) continue
    for (const option of teammateOrnamentOptions) {
      if (option.value === form[key].teamOrnamentSet) continue
      const modifiedForm = { ...form, [key]: { ...form[key], teamOrnamentSet: option.value } }
      results.push({
        id: form[key].characterId,
        set: option.value,
        oldSet: form[key].teamOrnamentSet,
        simScore: precisionRound(simulate(modifiedForm), TEAMMATE_UPGRADE_PRECISION),
      })
    }
  }
  return groupTeammateSetUpgrades(results)
}

export interface TeammateSetUpgrade {
  ids: Set<CharacterId>
  set: Set<TeammateOption['value']>
  oldSet?: TeammateOption['value']
  simScore: number
}

export interface PreTeammateSetUpgrade {
  id: CharacterId
  set: TeammateOption['value']
  oldSet?: TeammateOption['value']
  simScore: number
}

export function groupTeammateSetUpgrades(results: PreTeammateSetUpgrade[]): TeammateSetUpgrade[] {
  const groupMap = new Map<string, TeammateSetUpgrade>()
  for (const result of results) {
    const key = `${result.oldSet ?? ''}|${result.set}|${result.simScore}`
    const existing = groupMap.get(key)
    if (existing) {
      existing.ids.add(result.id)
    } else {
      groupMap.set(key, {
        ids: new Set([result.id]),
        set: new Set([result.set]),
        oldSet: result.oldSet,
        simScore: result.simScore,
      })
    }
  }

  const groupedResults = [...groupMap.values()]
  groupedResults.sort((a, b) => b.simScore - a.simScore)

  return groupedResults
}
