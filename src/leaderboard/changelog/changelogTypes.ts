import type { CharacterId } from 'types/character'

export enum ChangelogEventType {
  NEW_BEST = 'new_best',
  NEW_CHARACTER = 'new_character',
}

export type ChangelogNewBestEvent = {
  type: ChangelogEventType.NEW_BEST,
  characterId: CharacterId,
  date: string,
  score: number,
  previousScore: number,
  rank: number,
  previousRank: number,
  buildId: string,
}

export type ChangelogNewCharacterEvent = {
  type: ChangelogEventType.NEW_CHARACTER,
  characterId: CharacterId,
  date: string,
  score: number,
  rank: number,
  entryCount: number,
  buildId: string,
}

export type ChangelogEvent = ChangelogNewBestEvent | ChangelogNewCharacterEvent

export type LeaderboardChangelog = {
  schemaVersion: 1,
  generatedAt: string,
  events: ChangelogEvent[],
}

export type LeaderboardSnapshotEntry = {
  topScore: number,
  highWatermark: number,
  rank: number,
  entryCount: number,
}

export type LeaderboardSnapshot = {
  generatedAt: string,
  characters: Record<string, LeaderboardSnapshotEntry>,
}
