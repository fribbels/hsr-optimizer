import { useState } from 'react'
import { Message } from '../../lib/message'
import { Button, Flex, Popconfirm, Typography } from 'antd'
import DB from '../../lib/db'
import { importerTabButtonWidth, importerTabSpinnerMs } from './importerTabUiConstants'
import { DeleteOutlined } from '@ant-design/icons'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

export function ClearDataSubmenu() {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation(['importSaveTab', 'common'])

  function clearDataClicked() {
    console.log('Clear data')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      DB.resetStore()

      Message.success(t('cleardata.successmessage'))
    }, importerTabSpinnerMs)
  }

  return (
    <Flex vertical gap={5}>
      <Text>
        {t('cleardata.label')}
      </Text>
      <Popconfirm
        title={t('cleardata.warningtitle')}
        description={t('cleardata.warningdescription')}
        onConfirm={clearDataClicked}
        placement='bottom'
        okText={t('common:yes')}
        cancelText={t('common:cancel')}
      >
        <Button type='primary' icon={<DeleteOutlined/>} loading={loading} style={{ width: importerTabButtonWidth }}>
          {t('cleardata.buttontext')}
        </Button>
      </Popconfirm>
    </Flex>
  )
}
