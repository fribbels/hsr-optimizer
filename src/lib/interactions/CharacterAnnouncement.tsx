import { Alert } from '@mantine/core'
import { CharacterAnnouncementMessages } from 'lib/constants/constants'
import type { CharacterId } from 'types/character'
import type { SimulationMetadata } from 'types/metadata'

export function CharacterAnnouncement({ characterId, simulationMetadata }: {
  characterId: CharacterId
  simulationMetadata: SimulationMetadata | null
}) {
  const messages: string[] = []

  if (CharacterAnnouncementMessages[characterId]) {
    messages.push(CharacterAnnouncementMessages[characterId])
  }

  if (simulationMetadata) {
    for (const teammate of simulationMetadata.teammates) {
      if (CharacterAnnouncementMessages[teammate.characterId]) {
        messages.push(CharacterAnnouncementMessages[teammate.characterId])
      }
    }
  }

  const uniqueMessages = [...new Set(messages)]

  if (uniqueMessages.length === 0) {
    return null
  }

  return uniqueMessages.map((message, i) => (
    <Alert color='blue' mt={10} key={i}>
      {message}
    </Alert>
  ))
}
