import type { CharacterId } from 'types/character'

export enum TimelineEventType {
  NEW_BEST = 'new_best',
  NEW_CHARACTER = 'new_character',
}

export type TimelineNewBestEvent = {
  type: TimelineEventType.NEW_BEST,
  characterId: CharacterId,
  uidHash: string,
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
  uidHash: string,
  date: string,
  score: number,
  rank: number,
  entryCount: number,
  buildId: string,
}

export type TimelineEvent = TimelineNewBestEvent | TimelineNewCharacterEvent

export type LeaderboardTimeline = {
  schemaVersion: 1,
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
  generatedAt: string,
  characters: Record<string, LeaderboardSnapshotEntry>,
  userBests?: Record<string, UserCharacterWatermark>,
}
