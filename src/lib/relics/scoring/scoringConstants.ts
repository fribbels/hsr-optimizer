import {
  Constants,
  Stats,
  type SubStats,
  SubStatValues,
} from 'lib/constants/constants'

// Shared normalization table for relic scoring
// Precise values: SPD=25.032 (relicFilters previously used rounded 25)
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
  [Constants.Stats.SPD]: 64.8 / 25.032,
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

export const PERCENT_TO_SCORE = 0.582
export const MIN_ROLL_VALUE = 5.1
export const FLAT_STAT_SCALING = { HP: 0.4, ATK: 0.4, DEF: 0.4 } as const
export const POSSIBLE_SUBSTATS = new Set(Constants.SubStats)

export const RATINGS = ['F', 'F', 'F', 'F+', 'D', 'D+', 'C', 'C+', 'B', 'B+', 'A', 'A+', 'S', 'S+', 'SS', 'SS+', 'SSS', 'SSS+', 'WTF', 'WTF+'] as const

// Pre-computed toFixed(1) lookup — avoids expensive Number.toFixed() in hot path
// Lazy-initialized on first call so users without relics pay zero cost
let _toFixed1Table: string[] | undefined

export function toFixed1(n: number): string {
  if (!_toFixed1Table) {
    _toFixed1Table = Array.from({ length: 600 }, (_, i) => (i / 10).toFixed(1))
  }
  const idx = Math.round(n * 10)
  return idx >= 0 && idx < 600 ? _toFixed1Table[idx] : n.toFixed(1)
}

export const DMG_MAINSTATS = [
  Stats.Physical_DMG,
  Stats.Fire_DMG,
  Stats.Ice_DMG,
  Stats.Lightning_DMG,
  Stats.Wind_DMG,
  Stats.Quantum_DMG,
  Stats.Imaginary_DMG,
]
