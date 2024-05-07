import { Button, Space } from 'antd'
import semver from 'semver'
import { AppPages } from 'lib/db'
import { CURRENT_OPTIMIZER_VERSION } from 'lib/constants'
import { UnorderedListOutlined } from '@ant-design/icons'

export function checkForUpdatesNotification(version: string) {
  // Errors checking for versions shouldn't crash the app
  try {
    const isOutOfDate = !version || semver.lt(version, CURRENT_OPTIMIZER_VERSION)
    console.log(`Is out of date? ${isOutOfDate}`, version, CURRENT_OPTIMIZER_VERSION)
    if (!isOutOfDate) {
      return
    }

    const btn = (
      <Space>
        <Button type="primary" icon={<UnorderedListOutlined />} onClick={() => {
          window.notificationApi.destroy()
          window.store.getState().setActiveKey(AppPages.CHANGELOG)
        }}>
          View changelog
        </Button>
        <Button type="default" onClick={() => window.notificationApi.destroy()}>
          Dismiss
        </Button>
      </Space>
    );

    window.notificationApi.success({
      message: 'New updates!',
      description: 'Check out the changelog for the latest optimizer updates.',
      btn,
      duration: 30,
    });
  } catch (e) {
    console.error(e)
  }
}