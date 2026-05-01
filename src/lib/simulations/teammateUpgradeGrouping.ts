import type { CharacterId } from 'types/character'
import type { TeammateOption } from 'types/setConfig'

export const teammateKeys = ['teammate0', 'teammate1', 'teammate2'] as const

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

interface PreGroupedTeammateSetUpgrade {
  id: CharacterId
  set: Set<TeammateOption['value']>
  oldSet?: TeammateOption['value']
  simScore: number
}

export function groupTeammateSetUpgrades(results: PreTeammateSetUpgrade[]): TeammateSetUpgrade[] {
  // Pass 1: group by (characterId, simScore) — merge sets for same character at same score
  const preGroupMap = new Map<string, PreGroupedTeammateSetUpgrade>()
  for (const result of results) {
    const key = `${result.id}|${result.simScore}`
    const existing = preGroupMap.get(key)
    if (existing) {
      existing.set.add(result.set)
    } else {
      preGroupMap.set(key, {
        id: result.id,
        set: new Set([result.set]),
        oldSet: result.oldSet,
        simScore: result.simScore,
      })
    }
  }

  // Pass 2: group across characters by (oldSet, set-group, simScore)
  const preGrouped = [...preGroupMap.values()]
  preGrouped.sort((a, b) => b.simScore - a.simScore)

  const groupMap = new Map<string, TeammateSetUpgrade>()
  for (const group of preGrouped) {
    const sortedSets = [...group.set].sort().join(',')
    const key = `${group.oldSet ?? ''}|${sortedSets}|${group.simScore}`
    const existing = groupMap.get(key)
    if (existing) {
      existing.ids.add(group.id)
    } else {
      groupMap.set(key, {
        ids: new Set([group.id]),
        set: group.set,
        oldSet: group.oldSet,
        simScore: group.simScore,
      })
    }
  }

  const groupedResults = [...groupMap.values()]
  groupedResults.sort((a, b) => b.simScore - a.simScore)

  return groupedResults
}
