import { DeleteOutlined } from '@ant-design/icons'
import {
  Button,
  Flex,
  Popconfirm,
  Typography,
} from 'antd'
import { Message } from 'lib/interactions/message'
import DB from 'lib/state/db'
import {
  importerTabButtonWidth,
  importerTabSpinnerMs,
} from 'lib/tabs/tabImport/importerTabUiConstants'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

const { Text } = Typography

export function ClearDataSubmenu() {
  const [loading, setLoading] = useState(false)
  const { t } = useTranslation(['importSaveTab'], { keyPrefix: 'ClearData' })
  const { t: tCommon } = useTranslation('common')

  function clearDataClicked() {
    console.log('Clear data')
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      DB.resetStore()

      Message.success(t('SuccessMessage') /* Cleared data */)
    }, importerTabSpinnerMs)
  }

  return (
    <Flex vertical gap={5}>
      <Text>
        {t('Label') /* Clear all optimizer data. */}
      </Text>
      <Popconfirm
        title={t('WarningTitle') /* Erase all data */}
        description={t('WarningDescription') /* Are you sure you want to clear all relics and characters */}
        onConfirm={clearDataClicked}
        placement='bottom'
        okText={tCommon('Yes') /* Yes */}
        cancelText={tCommon('Cancel') /* Cancel */}
      >
        <Button type='primary' icon={<DeleteOutlined />} loading={loading} style={{ width: importerTabButtonWidth }}>
          {t('ButtonText') /* Clear data */}
        </Button>
      </Popconfirm>
    </Flex>
  )
}
