import { IconFileImport } from '@tabler/icons-react'
import { Button, Drawer, Flex } from '@mantine/core'
import { modals } from '@mantine/modals'
import sampleSave from 'data/sample-save.json' with { type: 'json' }
import {
  OpenCloseIDs,
  useOpenClose,
} from 'lib/hooks/useOpenClose'
import { Message } from 'lib/interactions/message'
import * as persistenceService from 'lib/services/persistenceService'
import { SaveState } from 'lib/state/saveState'
import { ColorizedLinkWithIcon } from 'lib/ui/ColorizedLink'
import { useTranslation } from 'react-i18next'
import { type HsrOptimizerSaveFormat } from 'types/store'

export function GettingStartedDrawer() {
  const { t } = useTranslation(['getStartedTab', 'common'])

  const { close: closeBeginnerDrawer, isOpen: isOpenBeginnerDrawer } = useOpenClose(OpenCloseIDs.GETTING_STARTED_DRAWER)

  function tryItOutClicked() {
    // Manually save for test files
    persistenceService.loadSaveData(JSON.parse(JSON.stringify(sampleSave)) as HsrOptimizerSaveFormat, false)
    SaveState.save()
    Message.success(t('TryOut.SuccessMessage')) // 'Successfully loaded data'
  }

  return (
    <Drawer
      title={t('TryOut.Header')} /* 'Try it out!' */
      position='right'
      onClose={closeBeginnerDrawer}
      opened={isOpenBeginnerDrawer}
      size={250}
    >
      {isOpenBeginnerDrawer && (
        <Flex direction="column" gap={20}>
          <ColorizedLinkWithIcon
            text={t('TryOut.DocumentationTitle') /* See full guide */}
            linkIcon={true}
            url='https://github.com/fribbels/hsr-optimizer/blob/main/docs/guides/en/optimizer.md'
          />

          <Button
            leftSection={<IconFileImport size={16} />}
            style={{ width: 200 }}
            onClick={() => modals.openConfirmModal({
              title: t('common:Confirm'),
              children: (
                <Flex style={{ whiteSpace: 'preserve-breaks', textAlign: 'center' }}>
                  {t('TryOut.description')}
                </Flex>
              ),
              labels: { confirm: t('common:Yes'), cancel: t('common:Cancel') },
              centered: true,
              onConfirm: tryItOutClicked,
            })}
          >
            {t('TryOut.ButtonText') /* Try it out! */}
          </Button>
        </Flex>
      )}
    </Drawer>
  )
}
