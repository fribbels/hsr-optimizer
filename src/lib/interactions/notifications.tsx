import { UnorderedListOutlined } from '@ant-design/icons'
import { Button, Flex, Space } from 'antd'
import i18next from 'i18next'
import { CURRENT_OPTIMIZER_VERSION } from 'lib/constants/constants'
import { AppPages } from 'lib/state/db'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { Trans } from 'react-i18next'
import semver from 'semver'

export function checkForUpdatesNotification(version: string) {
  const t = i18next.getFixedT(null, 'notifications', 'Changelog')
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
          type='primary'
          icon={<UnorderedListOutlined/>}
          onClick={() => {
            window.notificationApi.destroy()
            window.store.getState().setActiveKey(AppPages.CHANGELOG)
          }}
        >
          {
            t('View')
            // View changelog
          }
        </Button>
        <Button type='default' onClick={() => window.notificationApi.destroy()}>
          {
            t('Dismiss')
            // Dismiss/
          }
        </Button>
      </Space>
    )

    window.notificationApi.success({
      message: t('Message'), // 'New updates!',
      description: t('Description'), // 'Check out the changelog for the latest optimizer updates.',
      btn,
      duration: 30,
    })
  } catch (e) {
    console.error(e)
  }
}

export function webgpuNotSupportedNotification() {
  const t = i18next.getFixedT(null, 'notifications', 'GPU')
  const tCrash = i18next.getFixedT(null, 'notifications', 'GPUCrash')
  // Errors checking for versions shouldn't crash the app
  try {
    window.notificationApi.warning({
      message: t('Message'), // 'WebGPU is not supported on this browser!',
      description: (
        <Flex vertical>
          <div>
            {
              t('Description.l1')
              // Please use one of the following supported environments in order to enable GPU acceleration:
            }
          </div>

          <div>
            <ul>
              <li>{t('Description.l2')/* Windows & Mac — Chrome, Opera, Edge */}</li>
              <li>
                {/* @ts-ignore colorized link takes text prop from translation */}
                <Trans
                  t={t}
                  i18nKey='Description.l3'
                  // @ts-ignore
                  components={{ CustomLink: <ColorizedLinkWithIcon url='https://github.com/gpuweb/gpuweb/wiki/Implementation-Status' linkIcon={true}/> }}
                />
                {/* Linux — <ColorizedLink text='Behind a flag' url='https://github.com/gpuweb/gpuweb/wiki/Implementation-Status'/> */}
              </li>
            </ul>
          </div>

          <p>
            {
              t('Description.l4')
              // If you're on one of the supported browsers and it doesn't work, try another browser, or try switching your browser to use your dedicated graphics card instead of integrated.
            }
          </p>

          <p>
            <Trans
              t={tCrash}
              i18nKey='Description.l2'
              // @ts-ignore
              components={{ CustomLink: <ColorizedLinkWithIcon url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/troubleshooting.md#gpu' linkIcon={true}/> }}
            />
          </p>
        </Flex>
      ),
      duration: 15,
    })
  } catch (e) {
    console.error(e)
  }
}

export function webgpuCrashNotification() {
  const t = i18next.getFixedT(null, 'notifications', 'GPUCrash')
  try {
    window.notificationApi.warning({
      message: t('Message'), // 'WebGPU is not supported on this browser!',
      description: (
        <Flex vertical gap={10}>
          <div>
            {
              t('Description.l1')
              // The GPU acceleration process has crashed - results may be invalid. Please try again or report a bug to the Discord server.
            }
          </div>
          <div>
            <Trans
              t={t}
              i18nKey='Description.l2'
              // @ts-ignore
              components={{ CustomLink: <ColorizedLinkWithIcon url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/troubleshooting.md#gpu' linkIcon={true}/> }}
            />
          </div>
        </Flex>
      ),
      duration: 15,
    })
  } catch (e) {
    console.error(e)
  }
}
