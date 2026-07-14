import type { LeaderboardConfigType } from 'leaderboard/shared/configTypeMapping'
import type { CharacterId } from 'types/character'

export const TIMELINE_SCHEMA_VERSION = 2
export const TIMELINE_MIN_SCORE = 1.5

export enum TimelineEventType {
  NEW_BEST = 'new_best',
  NEW_CHARACTER = 'new_character',
}

export type TimelineNewBestEvent = {
  type: TimelineEventType.NEW_BEST,
  characterId: CharacterId,
  configType: LeaderboardConfigType,
  candidateId: string,
  date: string,
  score: number,
  previousScore: number,
  rank: number,
  previousRank: number,
  buildId: string,
}

export type TimelineNewCharacterEvent = {
  type: TimelineEventType.NEW_CHARACTER,
  characterId: CharacterId,
  configType: LeaderboardConfigType,
  candidateId: string,
  date: string,
  score: number,
  rank: number,
  entryCount: number,
  buildId: string,
}

export type TimelineEvent = TimelineNewBestEvent | TimelineNewCharacterEvent

type TimelineWireIdentity = {
  candidateId?: string,
  uidHash?: string,
}

export type TimelineNewBestEventWire = Omit<TimelineNewBestEvent, 'candidateId'> & TimelineWireIdentity
export type TimelineNewCharacterEventWire = Omit<TimelineNewCharacterEvent, 'candidateId'> & TimelineWireIdentity
export type TimelineEventWire = TimelineNewBestEventWire | TimelineNewCharacterEventWire

export type LeaderboardTimeline = {
  schemaVersion: number,
  generatedAt: string,
  events: TimelineEvent[],
}

export type LeaderboardSnapshotEntry = {
  topScore: number,
  highWatermark: number,
  rank: number,
  entryCount: number,
}

export type UserCharacterWatermark = {
  highWatermark: number,
  rank: number,
}

export type LeaderboardSnapshot = {
  schemaVersion?: number,
  generatedAt: string,
  characters: Record<string, LeaderboardSnapshotEntry>,
  userBests?: Record<string, UserCharacterWatermark>,
}
