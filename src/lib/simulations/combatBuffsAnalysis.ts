import { Sets } from 'lib/constants/constants'
import { Source } from 'lib/optimization/buffSource'
import { Buff, ComputedStatsArray } from 'lib/optimization/computedStatsArray'
import DB from 'lib/state/db'
import { DBMetadata } from 'types/metadata'

export function aggregateCombatBuffs(x: ComputedStatsArray) {
  const combatBuffs = extractCombatBuffs(x)
  const namedBuffs = extractBuffNames(combatBuffs)

  return namedBuffs
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

export type NamedBuff = {
  name: string
} & Buff

type CombatBuffs = {
  buffs: Buff[]
  buffsMemo: Buff[]
}
type NamedCombatBuffs = {
  buffs: NamedBuff[]
  buffsMemo: NamedBuff[]
}

function extractBuffNames(combatBuffs: CombatBuffs): NamedCombatBuffs {
  const metadata = DB.getMetadata()
  const setMap = new Map(Object.entries(Sets))

  return {
    buffs: combatBuffs.buffs.map((buff) => extractSingleBuffName(buff, metadata, setMap)),
    buffsMemo: combatBuffs.buffsMemo.map((buff) => extractSingleBuffName(buff, metadata, setMap)),
  }
}

function extractSingleBuffName(buff: Buff, metadata: DBMetadata, setMap: Map<string, string>): NamedBuff {
  const source = buff.source

  if (source == Source.NONE) {
    return { name: 'None', ...buff }
  }

  if (setMap.has(source)) {
    const name = setMap.get(source)!
    return { name, ...buff }
  }

  const [id, label] = source.split('_')

  if (metadata.characters[id]) {
    const name = metadata.characters[id].name + ' - ' + sourceToLabelMapping[label]
    return { name, ...buff }
  }

  if (metadata.lightCones[id]) {
    const name = metadata.lightCones[id].name
    return { name, ...buff }
  }

  return { name: 'None', ...buff }
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
