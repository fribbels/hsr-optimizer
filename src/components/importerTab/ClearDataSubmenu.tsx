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

      Message.success(t('ClearData.SuccessMessage'))
    }, importerTabSpinnerMs)
  }

  return (
    <Flex vertical gap={5}>
      <Text>
        {t('ClearData.Label')}
      </Text>
      <Popconfirm
        title={t('ClearData.WarningTitle')}
        description={t('ClearData.WarningDescription')}
        onConfirm={clearDataClicked}
        placement='bottom'
        okText={t('common:Yes')}
        cancelText={t('common:Cancel')}
      >
        <Button type='primary' icon={<DeleteOutlined/>} loading={loading} style={{ width: importerTabButtonWidth }}>
          {t('ClearData.ButtonText')}
        </Button>
      </Popconfirm>
    </Flex>
  )
}
