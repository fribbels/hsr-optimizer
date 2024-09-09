import { Button, Flex, Space } from 'antd'
import semver from 'semver'
import { AppPages } from 'lib/db'
import { CURRENT_OPTIMIZER_VERSION } from 'lib/constants'
import { UnorderedListOutlined } from '@ant-design/icons'
import { ColorizedLink } from 'components/common/ColorizedLink'

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
        <Button
          type='primary' icon={<UnorderedListOutlined/>} onClick={() => {
            window.notificationApi.destroy()
            window.store.getState().setActiveKey(AppPages.CHANGELOG)
          }}
        >
          View changelog
        </Button>
        <Button type='default' onClick={() => window.notificationApi.destroy()}>
          Dismiss
        </Button>
      </Space>
    )

    window.notificationApi.success({
      message: 'New updates!',
      description: 'Check out the changelog for the latest optimizer updates.',
      btn,
      duration: 30,
    })
  } catch (e) {
    console.error(e)
  }
}

export function webgpuNotSupportedNotification() {
  // Errors checking for versions shouldn't crash the app
  try {
    window.notificationApi.warning({
      message: 'WebGPU is not supported on this browser!',
      description: (
        <Flex vertical>
          <div>
            Please use one of the following supported environments in order to enable GPU acceleration:
          </div>
          <div>
            <ul>
              <li>Windows & Mac — Chrome, Opera, Edge</li>
              <li>
                Linux — <ColorizedLink text='Behind a flag' url='https://github.com/gpuweb/gpuweb/wiki/Implementation-Status'/>
              </li>
            </ul>
          </div>

          <div>
            If you're on one of the supported browsers and it doesn't work, try another browser, or try switching your browser to use your dedicated graphics card instead of integrated.
          </div>
        </Flex>
      ),
      duration: 15,
    })
  } catch (e) {
    console.error(e)
  }
}
