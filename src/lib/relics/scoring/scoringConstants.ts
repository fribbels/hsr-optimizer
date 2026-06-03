import {
  Constants,
  Stats,
  type SubStats,
  SubStatValues,
} from 'lib/constants/constants'

export function substatPotentialScale(stat: SubStats): number {
  return 6.48 / SubStatValues[stat][5].high
}

export function substatPotentialUnits(stat: SubStats, value: number): number {
  return value * substatPotentialScale(stat)
}

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
