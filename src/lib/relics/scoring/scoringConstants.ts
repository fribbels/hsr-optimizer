import {
  Constants,
  Stats,
  type SubStats,
  SubStatValues,
} from 'lib/constants/constants'

// Relic scoring normalization: denominator = stat's +15 main-stat ceiling, scaled so CD (64.8) = 1.0,
// so one high roll of any stat is worth 6.48 — weight alone sets relative value.
export const STAT_NORMALIZATION: Record<SubStats, number> = {
  [Constants.Stats.HP_P]: 64.8 / 43.2,
  [Constants.Stats.ATK_P]: 64.8 / 43.2,
  [Constants.Stats.DEF_P]: 64.8 / 54,
  [Constants.Stats.HP]: (64.8 / 43.2) * SubStatValues[Constants.Stats.HP_P][5].high / SubStatValues[Constants.Stats.HP][5].high,
  [Constants.Stats.ATK]: (64.8 / 43.2) * SubStatValues[Constants.Stats.ATK_P][5].high / SubStatValues[Constants.Stats.ATK][5].high,
  [Constants.Stats.DEF]: (64.8 / 54) * SubStatValues[Constants.Stats.DEF_P][5].high / SubStatValues[Constants.Stats.DEF][5].high,
  [Constants.Stats.CR]: 64.8 / 32.4,
  [Constants.Stats.CD]: 64.8 / 64.8,
  [Constants.Stats.EHR]: 64.8 / 43.2,
  [Constants.Stats.RES]: 64.8 / 43.2,
  [Constants.Stats.SPD]: 64.8 / 26.0, // synthetic 26.0, real is 25.032
  [Constants.Stats.BE]: 64.8 / 64.8,
} as const

// Grade configuration — replaces scattered switch statements for maxMainstat and maxEnhance
export const GRADE_CONFIG = {
  2: { maxEnhance: 6, maxMainstat: 12.8562 },
  3: { maxEnhance: 9, maxMainstat: 25.8165 },
  4: { maxEnhance: 12, maxMainstat: 43.1304 },
  5: { maxEnhance: 15, maxMainstat: 64.8 },
} as const
export type ValidGrade = keyof typeof GRADE_CONFIG

export const FLAT_STAT_SCALING = { HP: 0.4, ATK: 0.4, DEF: 0.4 } as const
export const POSSIBLE_SUBSTATS = new Set(Constants.SubStats)


export const DMG_MAINSTATS = [
  Stats.Physical_DMG,
  Stats.Fire_DMG,
  Stats.Ice_DMG,
  Stats.Lightning_DMG,
  Stats.Wind_DMG,
  Stats.Quantum_DMG,
  Stats.Imaginary_DMG,
]
