import { getGameMetadata } from 'lib/state/gameMetadata'
import { type CharacterId } from 'types/character'
import { ScoringConfigType } from 'types/metadata'

export const IS_LOCALHOST = location.hostname === 'localhost' || location.hostname === '127.0.0.1'

let cachedCharacters: CharacterId[] | null = null

export function getLeaderboardCharacters(): CharacterId[] {
  if (cachedCharacters) return cachedCharacters
  const metadata = getGameMetadata()
  cachedCharacters = Object.values(metadata.characters)
    .filter((c) => c.rarity === 5 && getCharacterLeaderboardConfigTypes(c.id).length > 0)
    .map((c) => c.id)
    .sort((a, b) => a.localeCompare(b))
  return cachedCharacters
}

export function getCharacterLeaderboardConfigTypes(characterId: CharacterId): ScoringConfigType[] {
  const scoringMetadata = getGameMetadata().characters[characterId]?.scoringMetadata
  const configTypes: ScoringConfigType[] = []
  if (scoringMetadata?.simulation) configTypes.push(ScoringConfigType.DPS)
  if (scoringMetadata?.supportSimulation) configTypes.push(ScoringConfigType.BUFFER)
  if (scoringMetadata?.healSimulation) configTypes.push(ScoringConfigType.HEAL)
  if (scoringMetadata?.shieldSimulation) configTypes.push(ScoringConfigType.SHIELD)
  return configTypes
}

export function isCharacterLeaderboardEnabled(characterId: CharacterId): boolean {
  const scoringMetadata = getGameMetadata().characters[characterId]?.scoringMetadata
  if (!scoringMetadata) return false
  const sims = [
    scoringMetadata.simulation,
    scoringMetadata.supportSimulation,
    scoringMetadata.healSimulation,
    scoringMetadata.shieldSimulation,
  ]
  return sims.some((sim) => sim?.leaderboardEnabled === true)
}
