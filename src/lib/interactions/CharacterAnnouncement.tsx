import { Alert, ConfigProvider } from 'antd'
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
    <ConfigProvider
      theme={{
        components: {
          Alert: {
            colorInfo: '#4bc65d',
            colorInfoBg: '#1f3464',
            colorInfoBorder: '#334d8a',
          },
        },
      }}
    >
      <Alert
        message={CharacterAnnouncementMessages[characterId].replace('__VERSION__', i18next.t('CurrentVersion', { Version: CURRENT_DATA_VERSION }))}
        type='info'
        showIcon
        style={{ marginTop: 10 }}
      />
    </ConfigProvider>
  )
}
