import {
  Button,
  Flex,
} from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconTrash } from '@tabler/icons-react'
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
    <Flex direction='column' gap={5}>
      <div>
        {t('Label') /* Clear all optimizer data. */}
      </div>
      <Button
        leftSection={<IconTrash size={16} />}
        loading={loading}
        w={importerTabButtonWidth}
        onClick={() =>
          modals.openConfirmModal({
            title: t('WarningTitle'),
            children: t('WarningDescription'),
            labels: { confirm: tCommon('Yes'), cancel: tCommon('Cancel') },
            centered: true,
            onConfirm: clearDataClicked,
          })}
      >
        {t('ButtonText') /* Clear data */}
      </Button>
    </Flex>
  )
}
