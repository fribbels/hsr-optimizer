import { IconTrash } from '@tabler/icons-react'
import { PopConfirm } from 'lib/ui/PopConfirm'
import { Button, Flex, Text } from '@mantine/core'
import { Message } from 'lib/interactions/message'
import DB from 'lib/state/db'
import {
  importerTabButtonWidth,
  importerTabSpinnerMs,
} from 'lib/tabs/tabImport/importerTabUiConstants'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

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
    <Flex direction="column" gap={5}>
      <Text>
        {t('Label') /* Clear all optimizer data. */}
      </Text>
      <PopConfirm
        title={t('WarningTitle') /* Erase all data */}
        description={t('WarningDescription') /* Are you sure you want to clear all relics and characters */}
        onConfirm={clearDataClicked}
        placement='bottom'
        okText={tCommon('Yes') /* Yes */}
        cancelText={tCommon('Cancel') /* Cancel */}
      >
        <Button leftSection={<IconTrash size={16} />} loading={loading} style={{ width: importerTabButtonWidth }}>
          {t('ButtonText') /* Clear data */}
        </Button>
      </PopConfirm>
    </Flex>
  )
}
