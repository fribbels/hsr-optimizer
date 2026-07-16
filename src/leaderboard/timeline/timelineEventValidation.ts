import { isLeaderboardConfigType } from 'leaderboard/shared/configTypeMapping'
import { isFiniteNumber } from 'leaderboard/shared/typeGuards'
import {
  type TimelineEvent,
  TimelineEventType,
  type TimelineNewBestEventBase,
  type TimelineNewCharacterEventBase,
} from 'leaderboard/timeline/timelineTypes'
import type { CharacterId } from 'types/character'

const CANDIDATE_ID_PATTERN = /^[0-9a-f]{12}$/

type TimelineNewBestEventWire = TimelineNewBestEventBase & {
  candidateId?: string,
  uidHash?: string,
}
type TimelineNewCharacterEventWire = TimelineNewCharacterEventBase & {
  candidateId?: string,
  uidHash?: string,
}
type TimelineEventWire = TimelineNewBestEventWire | TimelineNewCharacterEventWire

export type RawTimelineEvent = Partial<{
  type: string,
  characterId: string,
  configType: string,
  candidateId: string,
  uidHash: string,
  date: string,
  score: number,
  previousScore: number,
  rank: number,
  previousRank: number,
  entryCount: number,
  buildId: string,
}>

function isCandidateId(value: string | undefined): value is string {
  return value != null && CANDIDATE_ID_PATTERN.test(value)
}

export function parseTimelineEventWire(value: RawTimelineEvent): TimelineEventWire | null {
  if (
    typeof value.characterId !== 'string'
    || typeof value.configType !== 'string'
    || !isLeaderboardConfigType(value.configType)
    || typeof value.date !== 'string'
    || !isFiniteNumber(value.score)
    || !isFiniteNumber(value.rank)
    || typeof value.buildId !== 'string'
  ) {
    return null
  }

  const common = {
    characterId: value.characterId as CharacterId,
    configType: value.configType,
    candidateId: typeof value.candidateId === 'string' ? value.candidateId : undefined,
    uidHash: typeof value.uidHash === 'string' ? value.uidHash : undefined,
    date: value.date,
    score: value.score,
    rank: value.rank,
    buildId: value.buildId,
  }

  if (value.type === TimelineEventType.NEW_BEST) {
    if (!isFiniteNumber(value.previousScore) || !isFiniteNumber(value.previousRank)) return null
    return {
      ...common,
      type: TimelineEventType.NEW_BEST,
      previousScore: value.previousScore,
      previousRank: value.previousRank,
    }
  }

  if (value.type === TimelineEventType.NEW_CHARACTER) {
    if (!isFiniteNumber(value.entryCount)) return null
    return {
      ...common,
      type: TimelineEventType.NEW_CHARACTER,
      entryCount: value.entryCount,
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
