import { Button, Flex, Space } from 'antd'
import semver from 'semver'
import { AppPages } from 'lib/db'
import { CURRENT_OPTIMIZER_VERSION } from 'lib/constants'
import { DiscordOutlined, UnorderedListOutlined } from '@ant-design/icons'
import { ColorizedLinkWithIcon } from 'components/common/ColorizedLink'
import { Trans } from 'react-i18next'
import i18next from 'i18next'

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
          {
            i18next.t('notifications:Changelog.View')
            // View changelog
          }
        </Button>
        <Button type='default' onClick={() => window.notificationApi.destroy()}>
          {
            i18next.t('notifications:Changelog.Dismiss')
            // Dismiss/
          }
        </Button>
      </Space>
    )

    const translationsBtn = (
      <Space>
        <Button
          type='primary' icon={<DiscordOutlined/>} onClick={() => {
          window.notificationApi.destroy()
          window.open('https://discord.gg/rDmB4Un7qg', '_blank')
        }}
        >
          Discord
        </Button>
        <Button type='default' onClick={() => window.notificationApi.destroy()}>
          {
            i18next.t('notifications:Changelog.Dismiss')
          }
        </Button>
      </Space>
    )

    window.notificationApi.success({
      message: 'I18N coming soon!',
      description: 'Looking for contributors to help to translate content into other languages. Check out the Discord server for more info!',
      btn: translationsBtn,
      duration: 30,
    })

    window.notificationApi.success({
      message: i18next.t('notifications:Changelog.Message'), // 'New updates!',
      description: i18next.t('notifications:Changelog.Description'), // 'Check out the changelog for the latest optimizer updates.',
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
            {
              i18next.t('notifications:GPU.Description.l1')
              // Please use one of the following supported environments in order to enable GPU acceleration:
            }
          </div>
          <div>
            <ul>
              <li>{i18next.t('notifications:GPU.Description.l2')/* Windows & Mac — Chrome, Opera, Edge */}</li>
              <li>
                {/* @ts-ignore colorized link takes text prop from translation */}
                <Trans t={i18next.t} i18nKey='notifications:GPU.Description.l3' components={{ CustomLink: <ColorizedLinkWithIcon url='https://github.com/gpuweb/gpuweb/wiki/Implementation-Status' linkIcon={true}/> }}/>
                {/* Linux — <ColorizedLink text='Behind a flag' url='https://github.com/gpuweb/gpuweb/wiki/Implementation-Status'/> */}
              </li>
            </ul>
          </div>

          <div>
            {
              i18next.t('notifications:GPU.Description.l4')
              // If you're on one of the supported browsers and it doesn't work, try another browser, or try switching your browser to use your dedicated graphics card instead of integrated.
            }
          </div>
        </Flex>
      ),
      duration: 15,
    })
  } catch (e) {
    console.error(e)
  }
}
