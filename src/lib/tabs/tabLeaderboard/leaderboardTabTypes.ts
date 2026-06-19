import type { MinifiedCharacter } from 'lib/simulations/leaderboard/profileCompression'
import { type CharacterId } from 'types/character'
import { type LightConeId } from 'types/lightCone'
import type { LeaderboardEidolonGroup } from '../../../../scripts/leaderboard/shared/eidolonConfig'

export type { LeaderboardEidolonGroup }

export interface LeaderboardTeammate {
  characterId: CharacterId
  lightCone: LightConeId
  characterEidolon: number
  lightConeSuperimposition: number
}

export interface LeaderboardEntry {
  rank: number
  score: number
  buildId: string
  candidateId: string
  team: LeaderboardTeammate[]
  characterEidolon: number
  eidolonGroup: LeaderboardEidolonGroup
  deprioritizeBuffs?: boolean
  minifiedCharacter: MinifiedCharacter
  baselineSimScore: number
  benchmarkSimScore: number
  maximumSimScore: number
}
