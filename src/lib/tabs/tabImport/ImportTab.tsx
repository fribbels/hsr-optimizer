import { DownloadOutlined } from '@ant-design/icons'
import {
  Button,
  Flex,
  Tabs,
  Typography,
} from 'antd'
import { Message } from 'lib/interactions/message'
import { SaveState } from 'lib/state/saveState'
import { ClearDataSubmenu } from 'lib/tabs/tabImport/ClearDataSubmenu'
import { LoadDataSubmenu } from 'lib/tabs/tabImport/LoadDataSubmenu'
import { ScannerImportSubmenu } from 'lib/tabs/tabImport/ScannerImportSubmenu'
import { TsUtils } from 'lib/utils/TsUtils'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScannerWebsocket } from './ScannerWebsocketClient'

const { Text } = Typography

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
      TsUtils.consoleWarnWrapper(err)
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
    <Flex vertical gap={5}>
      <Text>
        {t('Label') /* Save your optimizer data to a file. */}
      </Text>
      <Button type='primary' onClick={saveClicked} icon={<DownloadOutlined />} style={{ width: buttonWidth }}>
        {t('ButtonText') /* Save data */}
      </Button>
    </Flex>
  )
}

export default function ImportTab() {
  const tabSize = 'large'
  const { t } = useTranslation('importSaveTab', { keyPrefix: 'TabLabels' })

  return (
    <div>
      <ScannerWebsocket/>

      <Flex vertical gap={5} style={{ marginLeft: 20, width: 1200 }}>
        <Tabs
          defaultActiveKey='1'
          size={tabSize}
          style={{
            marginBottom: 32,
          }}
          items={[
            {
              label: t('Import'),
              key: 'Import',
              children: <ScannerImportSubmenu />,
            },
            {
              label: t('Load'),
              key: 'Load',
              children: <LoadDataSubmenu />,
            },
            {
              label: t('Save'),
              key: 'Save',
              children: <SaveDataSubmenu />,
            },
            {
              label: t('Clear'),
              key: 'Clear',
              children: <ClearDataSubmenu />,
            },
          ]}
        />
      </Flex>
    </div>
  )
}
