import { getGameMetadata } from 'lib/state/gameMetadata'
import { ScoringConfigType } from 'types/metadata'
import { type CharacterId } from 'types/character'

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

