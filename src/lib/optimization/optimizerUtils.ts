import { Constants, Stats } from 'lib/constants/constants'
import { AugmentedStats } from 'lib/relics/relicAugmenter'

export function p4(set: number) {
  return set >> 2
}

export function p2(set: number) {
  return Math.min(1, set >> 1)
}

export function emptyRelic() {
  const augmentedStats = {
    mainStat: Constants.Stats.HP,
    mainValue: 0,
  } as AugmentedStats

  for (const stat of Object.values(Constants.Stats)) {
    augmentedStats[stat] = 0
  }
  return {
    set: -1,
    augmentedStats: augmentedStats,
    substats: [],

  }
}

export function emptyLightCone() {
  return {
    [Stats.HP]: 0,
    [Stats.ATK]: 0,
    [Stats.DEF]: 0,
  }
}
