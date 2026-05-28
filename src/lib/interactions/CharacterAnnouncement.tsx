import { Alert } from '@mantine/core'
import { CharacterAnnouncementMessages } from 'lib/constants/constants'
import { getGameMetadata } from 'lib/state/gameMetadata'
import type { CharacterId } from 'types/character'

const PRE_NOVAFLARE_MESSAGE = 'Damage calculations for Pre-Novaflare characters and teammates are no longer supported. Please switch to their Novaflare versions.'

function isPreNovaflare(id: CharacterId): boolean {
  const b1 = getGameMetadata().characters[`${id}b1` as CharacterId]
  return !!b1 && !b1.unreleased
}

export function CharacterAnnouncement({ characterId, teammateCharacterIds }: {
  characterId?: CharacterId | null,
  teammateCharacterIds?: CharacterId[],
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
    <Alert color={message === PRE_NOVAFLARE_MESSAGE ? 'orange' : 'blue'} mt={10} key={i}>
      {message}
    </Alert>
  ))
}
