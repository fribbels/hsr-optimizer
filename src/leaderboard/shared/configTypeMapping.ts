import { ScoringConfigType } from 'types/metadata'

export enum LeaderboardConfigType {
  DPS = 'dps',
  SUPPORT = 'support',
  HEAL = 'heal',
  SHIELD = 'shield',
}

export const LEADERBOARD_CONFIG_TYPES = [
  LeaderboardConfigType.DPS,
  LeaderboardConfigType.SUPPORT,
  LeaderboardConfigType.HEAL,
  LeaderboardConfigType.SHIELD,
] as const

const CONFIG_TYPE_TO_PUBLIC: Record<ScoringConfigType, LeaderboardConfigType> = {
  [ScoringConfigType.DPS]: LeaderboardConfigType.DPS,
  [ScoringConfigType.BUFFER]: LeaderboardConfigType.SUPPORT,
  [ScoringConfigType.HEAL]: LeaderboardConfigType.HEAL,
  [ScoringConfigType.SHIELD]: LeaderboardConfigType.SHIELD,
}

const PUBLIC_TO_CONFIG_TYPE: Record<LeaderboardConfigType, ScoringConfigType> = {
  [LeaderboardConfigType.DPS]: ScoringConfigType.DPS,
  [LeaderboardConfigType.SUPPORT]: ScoringConfigType.BUFFER,
  [LeaderboardConfigType.HEAL]: ScoringConfigType.HEAL,
  [LeaderboardConfigType.SHIELD]: ScoringConfigType.SHIELD,
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
