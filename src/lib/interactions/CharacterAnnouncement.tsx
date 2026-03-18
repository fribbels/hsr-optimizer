import { Alert } from '@mantine/core'
import { CharacterAnnouncementMessages } from 'lib/constants/constants'
import type { SimulationScore } from 'lib/scoring/simScoringUtils'
import type { CharacterId } from 'types/character'

export function CharacterAnnouncement({ characterId, scoringResult }: {
  characterId: CharacterId
  scoringResult: SimulationScore | null
}) {
  const messages: string[] = []

  if (characterId && CharacterAnnouncementMessages[characterId]) {
    messages.push(CharacterAnnouncementMessages[characterId])
  }

  if (scoringResult) {
    for (const teammate of scoringResult.simulationMetadata.teammates) {
      if (CharacterAnnouncementMessages[teammate.characterId]) {
        messages.push(CharacterAnnouncementMessages[teammate.characterId])
      }
    }
  }

  if (messages.length === 0) {
    return <></>
  }

  return messages.map((message, i) => (
    <Alert color='blue' mt={10} key={i}>
      {message}
    </Alert>
  ))
}
