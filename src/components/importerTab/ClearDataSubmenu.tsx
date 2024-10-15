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

      Message.success(t('ClearData.SuccessMessage')/* Cleared data */)
    }, importerTabSpinnerMs)
  }

  return (
    <Flex vertical gap={5}>
      <Text>
        {t('ClearData.Label')/* Clear all optimizer data. */}
      </Text>
      <Popconfirm
        title={t('ClearData.WarningTitle')/* Erase all data */}
        description={t('ClearData.WarningDescription')/* Are you sure you want to clear all relics and characters */}
        onConfirm={clearDataClicked}
        placement='bottom'
        okText={t('common:Yes', { capitalizeLength: 1 })/* Yes */}
        cancelText={t('common:Cancel', { capitalizeLength: 1 })/* Cancel */}
      >
        <Button type='primary' icon={<DeleteOutlined/>} loading={loading} style={{ width: importerTabButtonWidth }}>
          {t('ClearData.ButtonText')/* Clear data */}
        </Button>
      </Popconfirm>
    </Flex>
  )
}
