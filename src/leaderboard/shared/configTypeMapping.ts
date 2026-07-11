import { ScoringConfigType } from 'types/metadata'

export const LEADERBOARD_CONFIG_TYPES = ['dps', 'support', 'heal', 'shield'] as const
export type LeaderboardConfigType = typeof LEADERBOARD_CONFIG_TYPES[number]

const CONFIG_TYPE_TO_PUBLIC: Record<ScoringConfigType, LeaderboardConfigType> = {
  [ScoringConfigType.DPS]: 'dps',
  [ScoringConfigType.BUFFER]: 'support',
  [ScoringConfigType.HEAL]: 'heal',
  [ScoringConfigType.SHIELD]: 'shield',
}

const PUBLIC_TO_CONFIG_TYPE: Record<LeaderboardConfigType, ScoringConfigType> = {
  dps: ScoringConfigType.DPS,
  support: ScoringConfigType.BUFFER,
  heal: ScoringConfigType.HEAL,
  shield: ScoringConfigType.SHIELD,
}

export function isLeaderboardConfigType(value: string): value is LeaderboardConfigType {
  return (LEADERBOARD_CONFIG_TYPES as readonly string[]).includes(value)
}

export function configTypeToPublic(config: ScoringConfigType): LeaderboardConfigType {
  return CONFIG_TYPE_TO_PUBLIC[config]
}

export function publicToConfigType(key: LeaderboardConfigType): ScoringConfigType {
  return PUBLIC_TO_CONFIG_TYPE[key]
}
