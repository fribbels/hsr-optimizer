import {
  Constants,
  MainStats,
  Stats,
  SubStats,
  SubStatValues,
} from 'lib/constants/constants'
import { precisionRound } from 'lib/utils/mathUtils'
import { isFlat } from 'lib/utils/statUtils'

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
  getMaxedSubstatValue: (stat: SubStats, quality = 1) => {
    if (quality == 0.8) {
      return precisionRound(SubStatValues[stat][5].low)
    }
    if (quality == 0.9) {
      return precisionRound(SubStatValues[stat][5].mid)
    }
    return precisionRound(SubStatValues[stat][5].high)
  },
  getMaxedStatValue: (stat: MainStats) => {
    if (!stat) return 0
    const scaling = isFlat(stat) ? 1 : 100
    return precisionRound(maxedMainStats[stat][3] / scaling)
  },

  getZeroes: () => {
    return {
      [Stats.ATK]: 0,
      [Stats.DEF]: 0,
      [Stats.HP]: 0,
      [Stats.ATK_P]: 0,
      [Stats.DEF_P]: 0,
      [Stats.HP_P]: 0,
      [Stats.SPD]: 0,
      [Stats.SPD_P]: 0,
      [Stats.CR]: 0,
      [Stats.CD]: 0,
      [Stats.EHR]: 0,
      [Stats.RES]: 0,
      [Stats.BE]: 0,
      [Stats.ERR]: 0,
      [Stats.OHB]: 0,
      [Stats.Physical_DMG]: 0,
      [Stats.Fire_DMG]: 0,
      [Stats.Ice_DMG]: 0,
      [Stats.Lightning_DMG]: 0,
      [Stats.Wind_DMG]: 0,
      [Stats.Quantum_DMG]: 0,
      [Stats.Imaginary_DMG]: 0,
      [Stats.Elation_DMG]: 0,
    }
  },

  getZeroesSubstats: () => {
    return {
      [Stats.ATK]: 0,
      [Stats.DEF]: 0,
      [Stats.HP]: 0,
      [Stats.ATK_P]: 0,
      [Stats.DEF_P]: 0,
      [Stats.HP_P]: 0,
      [Stats.SPD]: 0,
      [Stats.CR]: 0,
      [Stats.CD]: 0,
      [Stats.EHR]: 0,
      [Stats.RES]: 0,
      [Stats.BE]: 0,
    }
  },
}
