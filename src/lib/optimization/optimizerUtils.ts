import { Stats } from 'lib/constants/constants'

export function emptyLightCone() {
  return {
    [Stats.HP]: 0,
    [Stats.ATK]: 0,
    [Stats.DEF]: 0,
  }
}
