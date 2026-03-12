import { Alert } from '@mantine/core'
import { useAsyncSimScoringExecution } from 'lib/characterPreview/useAsyncSimScoringExecution'
import { CharacterAnnouncementMessages } from 'lib/constants/constants'
import { AsyncSimScoringExecution } from 'lib/scoring/dpsScore'
import { CharacterId } from 'types/character'

export function CharacterAnnouncement(props: { characterId: CharacterId, asyncSimScoringExecution: AsyncSimScoringExecution }) {
  const { characterId } = props
  const simScoringExecution = useAsyncSimScoringExecution(props.asyncSimScoringExecution)

  const result = simScoringExecution?.result
  const messages: string[] = []

  if (characterId && CharacterAnnouncementMessages[characterId]) {
    messages.push(CharacterAnnouncementMessages[characterId])
  }

  if (result) {
    for (const teammate of result.simulationMetadata.teammates) {
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
