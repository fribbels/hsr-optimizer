import { IconDownload } from '@tabler/icons-react'
import { Button, Flex, Tabs } from '@mantine/core'
import { Message } from 'lib/interactions/message'
import { SaveState } from 'lib/state/saveState'
import { ClearDataSubmenu } from 'lib/tabs/tabImport/ClearDataSubmenu'
import { LoadDataSubmenu } from 'lib/tabs/tabImport/LoadDataSubmenu'
import { ScannerImportSubmenu } from 'lib/tabs/tabImport/ScannerImportSubmenu'
import {
  ScannerWebsocket,
  useScannerState,
} from 'lib/tabs/tabImport/ScannerWebsocketClient'
import { consoleWarnWrapper } from 'lib/utils/miscUtils'
import React from 'react'
import { useTranslation } from 'react-i18next'

const buttonWidth = 250

// https://web.dev/patterns/files/save-a-file
const saveFile = async (blob: Blob, suggestedName: string) => {
  // Feature detection. The API needs to be supported and the app not run in an iframe.
  const supportsFileSystemAccess = 'showSaveFilePicker' in window
    && (() => {
      try {
        return window.self === window.top
      } catch {
        return false
      }
    })()
  // If the File System Access API is supported…
  if (supportsFileSystemAccess) {
    try {
      // Show the file save dialog.
      const handle = await window.showSaveFilePicker({
        suggestedName,
        types: [{
          description: 'JSON',
          accept: { 'text/json': ['.json'] },
        }],
      })
      // Write the blob to the file.
      const writable = await handle.createWritable()
      await writable.write(blob)
      await writable.close()
    } catch (err: unknown) {
      consoleWarnWrapper(err)
    }
  } else {
    // Fallback if the File System Access API is not supported…
    // Create the blob URL.
    const blobURL = URL.createObjectURL(blob)
    // Create the `<a download>` element and append it invisibly.
    const a = document.createElement('a')
    a.href = blobURL
    a.download = suggestedName
    a.style.display = 'none'
    document.body.append(a)
    // Programmatically click the element.
    a.click()
    // Revoke the blob URL and remove the element.
    setTimeout(() => {
      URL.revokeObjectURL(blobURL)
      a.remove()
    }, 1000)
  }
}

function SaveDataSubmenu() {
  const { t } = useTranslation('importSaveTab', { keyPrefix: 'SaveData' })

  async function saveClicked() {
    try {
      const stateString = SaveState.save()
      if (!stateString) return

      const blob = new Blob(
        [stateString],
        { type: 'text/json;charset=utf-8' },
      )

      await saveFile(blob, 'fribbels-optimizer-save.json')
      Message.success(t('SuccessMessage') /* Done */)
    } catch (e) {
      console.warn(e)
    }
  }

  return (
    <Flex direction='column' gap={5}>
      <div>
        {t('Label') /* Save your optimizer data to a file. */}
      </div>
      <Button onClick={saveClicked} leftSection={<IconDownload size={16} />} w={buttonWidth}>
        {t('ButtonText') /* Save data */}
      </Button>
    </Flex>
  )
}

export function ImportTab() {
  const { t } = useTranslation('importSaveTab', { keyPrefix: 'TabLabels' })
  const ingest = useScannerState((s) => s.ingest)

  return (
    <div>
      {ingest && <ScannerWebsocket />}

      <Flex direction='column' gap={5} ml={20} w={1200}>
        <Tabs
          defaultValue='Import'
          variant='outline'
          mb={32}
          styles={{ tab: { height: 42, paddingInline: 32 }, panel: { paddingTop: 'var(--mantine-spacing-xl)' } }}
        >
          <Tabs.List>
            <Tabs.Tab value='Import'>{t('Import')}</Tabs.Tab>
            <Tabs.Tab value='Load'>{t('Load')}</Tabs.Tab>
            <Tabs.Tab value='Save'>{t('Save')}</Tabs.Tab>
            <Tabs.Tab value='Clear'>{t('Clear')}</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value='Import'><ScannerImportSubmenu /></Tabs.Panel>
          <Tabs.Panel value='Load'><LoadDataSubmenu /></Tabs.Panel>
          <Tabs.Panel value='Save'><SaveDataSubmenu /></Tabs.Panel>
          <Tabs.Panel value='Clear'><ClearDataSubmenu /></Tabs.Panel>
        </Tabs>
      </Flex>
    </div>
  )
}
