import {
  Constants,
  Stats,
} from 'lib/constants/constants'

export function isFlat(stat: string) {
  return stat == Constants.Stats.HP
    || stat == Constants.Stats.ATK
    || stat == Constants.Stats.DEF
    || stat == Constants.Stats.SPD
}

export const validSubstats: Record<string, boolean> = {
  [Stats.HP_P]: true,
  [Stats.ATK_P]: true,
  [Stats.DEF_P]: true,
  [Stats.HP]: true,
  [Stats.ATK]: true,
  [Stats.DEF]: true,
  [Stats.SPD]: true,
  [Stats.CR]: true,
  [Stats.CD]: true,
  [Stats.EHR]: true,
  [Stats.RES]: true,
  [Stats.BE]: true,
}

export function isSubstat(stat: string) {
  return validSubstats[stat] != null
}
