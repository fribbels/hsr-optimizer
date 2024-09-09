import { Constants, SubStatValues } from './constants.ts'
import { Utils } from './utils'

const maxedMainStats = {
  [Constants.Stats.SPD]: [7.613, 11.419, 16.426, 25.032],
  [Constants.Stats.HP]: [139.991, 281.111, 469.647, 705.600],
  [Constants.Stats.ATK]: [69.996, 140.556, 234.824, 352.800],
  [Constants.Stats.HP_P]: [8.571, 17.211, 28.754, 43.200],
  [Constants.Stats.ATK_P]: [8.571, 17.211, 28.754, 43.200],
  [Constants.Stats.DEF_P]: [10.714, 21.514, 35.942, 54.000],
  [Constants.Stats.CR]: [6.428, 12.908, 21.565, 32.400],
  [Constants.Stats.CD]: [12.856, 25.817, 43.130, 64.800],
  [Constants.Stats.OHB]: [6.856, 13.769, 23.003, 34.561],
  [Constants.Stats.EHR]: [8.571, 17.211, 28.754, 43.200],
  [Constants.Stats.BE]: [12.856, 25.817, 43.130, 64.800],
  [Constants.Stats.ERR]: [3.857, 7.745, 12.939, 19.439],
  [Constants.Stats.Physical_DMG]: [7.714, 15.490, 25.878, 38.880],
  [Constants.Stats.Fire_DMG]: [7.714, 15.490, 25.878, 38.880],
  [Constants.Stats.Ice_DMG]: [7.714, 15.490, 25.878, 38.880],
  [Constants.Stats.Lightning_DMG]: [7.714, 15.490, 25.878, 38.880],
  [Constants.Stats.Wind_DMG]: [7.714, 15.490, 25.878, 38.880],
  [Constants.Stats.Quantum_DMG]: [7.714, 15.490, 25.878, 38.880],
  [Constants.Stats.Imaginary_DMG]: [7.714, 15.490, 25.878, 38.880],
}

export const StatCalculator = {
  getMaxedSubstatValue: (stat, quality = 1) => {
    if (quality == 0.8) {
      return Utils.precisionRound(SubStatValues[stat][5].low)
    }
    if (quality == 0.9) {
      return Utils.precisionRound(SubStatValues[stat][5].mid)
    }
    return Utils.precisionRound(SubStatValues[stat][5].high)
  },
  getMaxedStatValue: (stat) => {
    if (stat === 'NONE') { // Fake stat for relic scoring
      return 0
    }
    const scaling = Utils.isFlat(stat) ? 1 : 100
    return Utils.precisionRound(maxedMainStats[stat][3] / scaling)
  },

  getMaxedMainStat: (relic) => {
    return maxedMainStats[relic.main.stat][relic.grade - 2]
  },

  calculateCv: (relics) => {
    let total = 0
    for (const relic of relics) {
      if (!relic || !relic.condensedStats) continue
      for (const condensedStat of relic.condensedStats) {
        if (condensedStat[0] == Constants.Stats.CD) {
          total += condensedStat[1]
        }
        if (condensedStat[0] == Constants.Stats.CR) {
          total += condensedStat[1] * 2
        }
      }
    }

    return Utils.precisionRound(total * 100)
  },
}
