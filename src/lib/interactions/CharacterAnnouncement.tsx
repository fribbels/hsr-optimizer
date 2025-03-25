import { Alert } from 'antd'
import i18next from 'i18next'
import { CharacterAnnouncementMessages, CURRENT_DATA_VERSION } from 'lib/constants/constants'

export function CharacterAnnouncement(props: { characterId: string }) {
  const { characterId } = props
  if (!characterId || !CharacterAnnouncementMessages[characterId]) {
    return (
      <></>
    )
  }
  return (
    <Alert
      message={CharacterAnnouncementMessages[characterId].replace('__VERSION__', i18next.t('CurrentVersion', { Version: CURRENT_DATA_VERSION }))}
      type='info'
      showIcon
      style={{ marginTop: 10 }}
    />
  )
}
