import { Constants } from 'lib/constants/constants'

export function isFlat(stat: string) {
  return stat == Constants.Stats.HP
    || stat == Constants.Stats.ATK
    || stat == Constants.Stats.DEF
    || stat == Constants.Stats.SPD
}
