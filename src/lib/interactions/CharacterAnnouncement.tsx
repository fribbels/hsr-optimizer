import { Alert, ConfigProvider } from 'antd'
import { CharacterAnnouncementMessages } from 'lib/constants/constants'

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
      <Alert message={CharacterAnnouncementMessages[characterId]} type='info' showIcon style={{ marginTop: 10 }}/>
    </ConfigProvider>
  )
}
