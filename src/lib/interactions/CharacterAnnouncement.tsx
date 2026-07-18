import { Alert } from '@mantine/core'
import { CharacterAnnouncementMessages } from 'lib/constants/constants'
import { isPreNovaflare } from 'lib/state/gameMetadata'
import type { CharacterId } from 'types/character'

const PRE_NOVAFLARE_MESSAGE =
  'Damage calculations for Pre-Novaflare characters and teammates are no longer supported. Please switch to their Novaflare versions.'

export function CharacterAnnouncement({ characterId, teammateCharacterIds, mt }: {
  characterId?: CharacterId | null,
  teammateCharacterIds?: CharacterId[],
  mt?: number,
}) {
  if (!characterId) return null

  const messages: string[] = []

  const allIds = [characterId, ...(teammateCharacterIds ?? [])]

  for (const id of allIds) {
    if (CharacterAnnouncementMessages[id]) {
      messages.push(CharacterAnnouncementMessages[id])
    }
  }

  if (allIds.some(isPreNovaflare)) {
    messages.push(PRE_NOVAFLARE_MESSAGE)
  }

  const uniqueMessages = [...new Set(messages)]

  if (uniqueMessages.length === 0) {
    return null
  }

  return uniqueMessages.map((message, i) => (
    <Alert color={message === PRE_NOVAFLARE_MESSAGE ? 'orange' : 'blue'} mt={mt} key={i}>
      {message}
    </Alert>
  ))
}
