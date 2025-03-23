import { ImportOutlined } from '@ant-design/icons'
import { Button, Drawer, Flex, Popconfirm } from 'antd'
import sampleSave from 'data/sample-save.json'
import { Message } from 'lib/interactions/message'
import DB from 'lib/state/db'
import { SaveState } from 'lib/state/saveState'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { HsrOptimizerSaveFormat } from 'types/store'

export const GettingStartedDrawer = () => {
  const { t } = useTranslation(['getStartedTab', 'common'])

  const gettingStartedDrawerOpen = window.store((s) => s.gettingStartedDrawerOpen)
  const setGettingStartedDrawerOpen = window.store((s) => s.setGettingStartedDrawerOpen)

  function tryItOutClicked() {
    // Manually save for test files
    DB.setStore(JSON.parse(JSON.stringify(sampleSave)) as HsrOptimizerSaveFormat, false)
    SaveState.save()
    Message.success(t('TryOut.SuccessMessage'))// 'Successfully loaded data'
  }

  return (
    <Drawer
      title={t('TryOut.Header')}/* 'Try it out!' */
      placement='right'
      onClose={() => setGettingStartedDrawerOpen(false)}
      open={gettingStartedDrawerOpen}
      width={250}
    >
      <Flex vertical gap={20}>
        <ColorizedLinkWithIcon
          text={t('TryOut.DocumentationTitle')/* See full guide */}
          linkIcon={true}
          url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/optimizer.md'
        />

        <Popconfirm
          title={t('common:Confirm')}// Confirm!
          description={(
            <Flex
              style={{ whiteSpace: 'preserve-breaks', textAlign: 'center' }}
            >
              {t('TryOut.description')/* 'Load a sample save file?' */}
            </Flex>
          )}
          onConfirm={tryItOutClicked}
          placement='bottomLeft'
          okText={t('common:Yes')}// 'Yes'
          cancelText={t('common:Cancel')}// 'Cancel'
        >
          <Button type='primary' icon={<ImportOutlined/>} style={{ width: 200 }}>
            {t('TryOut.ButtonText')/* Try it out! */}
          </Button>
        </Popconfirm>
      </Flex>
    </Drawer>
  )
}
