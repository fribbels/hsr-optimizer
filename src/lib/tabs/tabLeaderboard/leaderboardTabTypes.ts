import type { LeaderboardEidolonGroup } from 'leaderboard/shared/eidolonConfig'
import type { MinifiedCharacter } from 'leaderboard/shared/profileCompression'
import {
  type CharacterId,
  type ExFlags,
} from 'types/character'
import { type LightConeId } from 'types/lightCone'

export type { LeaderboardEidolonGroup }

export enum LeaderboardExFilter {
  All = 'all',
  Off = 'off',
  On = 'on',
}

export interface LeaderboardTeammate {
  characterId: CharacterId
  lightCone: LightConeId
  characterEidolon: number
  characterEx: ExFlags
  lightConeSuperimposition: number
}

export interface LeaderboardEntry {
  rank: number
  score: number
  buildId: string
  candidateId: string
  team: LeaderboardTeammate[]
  characterEidolon: number
  characterEx: ExFlags
  eidolonGroup: LeaderboardEidolonGroup
  deprioritizeBuffs?: boolean
  minifiedCharacter: MinifiedCharacter
  baselineSimScore: number
  benchmarkSimScore: number
  maximumSimScore: number
  fetchedAt: number
}
