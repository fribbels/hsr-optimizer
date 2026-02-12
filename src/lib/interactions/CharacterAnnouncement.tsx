import { Alert } from 'antd'
import i18next from 'i18next'
import { useAsyncSimScoringExecution } from 'lib/characterPreview/useAsyncSimScoringExecution'
import {
  CharacterAnnouncementMessages,
  CURRENT_DATA_VERSION,
} from 'lib/constants/constants'
import { AsyncSimScoringExecution } from 'lib/scoring/dpsScore'
import { ReactElement } from 'types/components'

export function CharacterAnnouncement(props: { characterId: string, asyncSimScoringExecution: AsyncSimScoringExecution }) {
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

  if (messages.length == 0) {
    return <></>
  }

  const render: ReactElement[] = []

  for (let i = 0; i < messages.length; i++) {
    const message = messages[i]
    render.push(
      <Alert
        message={message}
        type='info'
        showIcon
        style={{ marginTop: 10 }}
        key={i}
      />,
    )
  }

  return render
}
