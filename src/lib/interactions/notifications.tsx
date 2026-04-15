import {
  Button,
  Flex,
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import { IconList } from '@tabler/icons-react'
import i18next from 'i18next'
import { AppPages } from 'lib/constants/appPages'
import { CURRENT_OPTIMIZER_VERSION } from 'lib/constants/constants'
import { useGlobalStore } from 'lib/stores/app/appStore'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { isVersionOutdated } from 'lib/utils/miscUtils'
import { Trans } from 'react-i18next'

export function checkForUpdatesNotification(version: string) {
  const t = i18next.getFixedT(null, 'notifications', 'Changelog')
  try {
    const isOutOfDate = !version || isVersionOutdated(version, CURRENT_OPTIMIZER_VERSION)
    console.log(`Is out of date? ${isOutOfDate}`, version, CURRENT_OPTIMIZER_VERSION)
    if (!isOutOfDate) {
      return
    }

    notifications.show({
      id: 'update-notification',
      title: t('Message'),
      message: (
        <Flex direction='column' gap={8}>
          <div>{t('Description')}</div>
          <Flex gap={8}>
            <Button
              leftSection={<IconList size={16} />}
              onClick={() => {
                notifications.hide('update-notification')
                useGlobalStore.getState().setActiveKey(AppPages.CHANGELOG)
              }}
            >
              {t('View')}
            </Button>
            <Button variant='default' onClick={() => notifications.hide('update-notification')}>
              {t('Dismiss')}
            </Button>
          </Flex>
        </Flex>
      ),
      color: 'green',
      autoClose: 30000,
    })
  } catch (e) {
    console.error(e)
  }
}

export function webgpuNotSupportedNotification() {
  const t = i18next.getFixedT(null, 'notifications', 'GPU')
  try {
    notifications.show({
      title: t('Message'),
      message: (
        <Flex direction='column'>
          <div>{t('Description.l1')}</div>
          <div>
            <ul>
              <li>{t('Description.l2')}</li>
              <li>
                <Trans
                  ns='notifications'
                  i18nKey='GPU.Description.l3'
                  components={{ CustomLink: <ColorizedLinkWithIcon url='https://github.com/gpuweb/gpuweb/wiki/Implementation-Status' linkIcon={true} /> }}
                />
              </li>
            </ul>
          </div>
          <p>{t('Description.l4')}</p>
          <p>
            <Trans
              ns='notifications'
              i18nKey='GPUCrash.Description.l2'
              components={{
                CustomLink: (
                  <ColorizedLinkWithIcon url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/troubleshooting.md#gpu' linkIcon={true} />
                ),
              }}
            />
          </p>
        </Flex>
      ),
      color: 'yellow',
      autoClose: 15000,
    })
  } catch (e) {
    console.error(e)
  }
}

export function webgpuCrashNotification() {
  const t = i18next.getFixedT(null, 'notifications', 'GPUCrash')
  try {
    notifications.show({
      title: t('Message'),
      message: (
        <Flex direction='column' gap={10}>
          <div>{t('Description.l1')}</div>
          <div>
            <Trans
              ns='notifications'
              i18nKey='GPUCrash.Description.l2'
              components={{
                CustomLink: (
                  <ColorizedLinkWithIcon url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/troubleshooting.md#gpu' linkIcon={true} />
                ),
              }}
            />
          </div>
        </Flex>
      ),
      color: 'yellow',
      autoClose: 15000,
    })
  } catch (e) {
    console.error(e)
  }
}
