import { IconTrash } from '@tabler/icons-react'
import { PopConfirm } from 'lib/ui/PopConfirm'
import { Button, Flex } from '@mantine/core'
import { Message } from 'lib/interactions/message'
import * as persistenceService from 'lib/services/persistenceService'
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
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      persistenceService.resetAll()

      Message.success(t('SuccessMessage') /* Cleared data */)
    }, importerTabSpinnerMs)
  }

  return (
    <Flex direction="column" gap={5}>
      <div>
        {t('Label') /* Clear all optimizer data. */}
      </div>
      <PopConfirm
        title={t('WarningTitle') /* Erase all data */}
        description={t('WarningDescription') /* Are you sure you want to clear all relics and characters */}
        onConfirm={clearDataClicked}
        placement='bottom'
        okText={tCommon('Yes') /* Yes */}
        cancelText={tCommon('Cancel') /* Cancel */}
      >
        <Button leftSection={<IconTrash size={16} />} loading={loading} w={importerTabButtonWidth}>
          {t('ButtonText') /* Clear data */}
        </Button>
      </PopConfirm>
    </Flex>
  )
}
