import { isLeaderboardConfigType } from 'leaderboard/shared/configTypeMapping'
import {
  type TimelineEvent,
  TimelineEventType,
  type TimelineNewBestEvent,
  type TimelineNewCharacterEvent,
} from 'leaderboard/timeline/timelineTypes'
import type { CharacterId } from 'types/character'

const CANDIDATE_ID_PATTERN = /^[0-9a-f]{12}$/

type TimelineWireIdentity = {
  candidateId?: string,
  uidHash?: string,
}

type TimelineNewBestEventWire = Omit<TimelineNewBestEvent, 'candidateId'> & TimelineWireIdentity
type TimelineNewCharacterEventWire = Omit<TimelineNewCharacterEvent, 'candidateId'> & TimelineWireIdentity
type TimelineEventWire = TimelineNewBestEventWire | TimelineNewCharacterEventWire

type UnknownTimelineEvent = {
  type?: unknown,
  characterId?: unknown,
  configType?: unknown,
  candidateId?: unknown,
  uidHash?: unknown,
  date?: unknown,
  score?: unknown,
  previousScore?: unknown,
  rank?: unknown,
  previousRank?: unknown,
  entryCount?: unknown,
  buildId?: unknown,
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isCandidateId(value: string | undefined): value is string {
  return value != null && CANDIDATE_ID_PATTERN.test(value)
}

export function parseTimelineEventWire(value: unknown): TimelineEventWire | null {
  if (value == null || typeof value !== 'object' || Array.isArray(value)) return null

  const event = value as UnknownTimelineEvent
  if (
    typeof event.characterId !== 'string'
    || typeof event.configType !== 'string'
    || !isLeaderboardConfigType(event.configType)
    || typeof event.date !== 'string'
    || !isFiniteNumber(event.score)
    || !isFiniteNumber(event.rank)
    || typeof event.buildId !== 'string'
  ) {
    return null
  }

  const identity = {
    ...(typeof event.candidateId === 'string' ? { candidateId: event.candidateId } : {}),
    ...(typeof event.uidHash === 'string' ? { uidHash: event.uidHash } : {}),
  }

  if (event.type === TimelineEventType.NEW_BEST) {
    if (!isFiniteNumber(event.previousScore) || !isFiniteNumber(event.previousRank)) return null
    return {
      type: TimelineEventType.NEW_BEST,
      characterId: event.characterId as CharacterId,
      configType: event.configType,
      ...identity,
      date: event.date,
      score: event.score,
      previousScore: event.previousScore,
      rank: event.rank,
      previousRank: event.previousRank,
      buildId: event.buildId,
    }
  }

  if (event.type === TimelineEventType.NEW_CHARACTER) {
    if (!isFiniteNumber(event.entryCount)) return null
    return {
      type: TimelineEventType.NEW_CHARACTER,
      characterId: event.characterId as CharacterId,
      configType: event.configType,
      ...identity,
      date: event.date,
      score: event.score,
      rank: event.rank,
      entryCount: event.entryCount,
      buildId: event.buildId,
    }
  }

  return null
}

export function completeTimelineEventIdentity(
  event: TimelineEventWire,
  legacyCandidateId: string | undefined,
): TimelineEvent | null {
  if (event.candidateId != null && legacyCandidateId != null && event.candidateId !== legacyCandidateId) return null

  const candidateId = event.candidateId ?? legacyCandidateId
  if (!isCandidateId(candidateId)) return null

  const { uidHash: _, candidateId: __, ...rest } = event
  return { ...rest, candidateId } as TimelineEvent
}
