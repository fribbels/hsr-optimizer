import { IconList } from '@tabler/icons-react'
import { Button, Flex } from '@mantine/core'
import i18next from 'i18next'
import { CURRENT_OPTIMIZER_VERSION } from 'lib/constants/constants'
import { useGlobalStore } from 'lib/stores/appStore'
import { AppPages } from 'lib/constants/appPages'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { Trans } from 'react-i18next'
import semver from 'semver'
import { notifications } from '@mantine/notifications'

export function checkForUpdatesNotification(version: string) {
  const t = i18next.getFixedT(null, 'notifications', 'Changelog')
  try {
    const isOutOfDate = !version || semver.lt(version, CURRENT_OPTIMIZER_VERSION)
    console.log(`Is out of date? ${isOutOfDate}`, version, CURRENT_OPTIMIZER_VERSION)
    if (!isOutOfDate) {
      return
    }

    notifications.show({
      id: 'update-notification',
      title: t('Message'),
      message: (
        <Flex direction="column" gap={8}>
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
      withCloseButton: true,
    })
  } catch (e) {
    console.error(e)
  }
}

export function webgpuNotSupportedNotification() {
  const t = i18next.getFixedT(null, 'notifications', 'GPU')
  const tCrash = i18next.getFixedT(null, 'notifications', 'GPUCrash')
  try {
    notifications.show({
      title: t('Message'),
      message: (
        <Flex direction="column">
          <div>{t('Description.l1')}</div>
          <div>
            <ul>
              <li>{t('Description.l2')}</li>
              <li>
                {/* @ts-ignore */}
                <Trans
                  t={t}
                  i18nKey='Description.l3'
                  // @ts-ignore
                  components={{ CustomLink: <ColorizedLinkWithIcon url='https://github.com/gpuweb/gpuweb/wiki/Implementation-Status' linkIcon={true} /> }}
                />
              </li>
            </ul>
          </div>
          <p>{t('Description.l4')}</p>
          <p>
            <Trans
              t={tCrash}
              i18nKey='Description.l2'
              // @ts-ignore
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
      withCloseButton: true,
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
        <Flex direction="column" gap={10}>
          <div>{t('Description.l1')}</div>
          <div>
            <Trans
              t={t}
              i18nKey='Description.l2'
              // @ts-ignore
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
      withCloseButton: true,
    })
  } catch (e) {
    console.error(e)
  }
}
