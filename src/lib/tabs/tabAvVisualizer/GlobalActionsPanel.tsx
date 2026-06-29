import { Button, Stack, Text } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconDownload, IconRefresh, IconUpload } from '@tabler/icons-react'
import { Message } from 'lib/interactions/message'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { useRef, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

// Sticky sidebar to the right of the whole AV Visualizer, for actions that operate on the whole saved
// session rather than any one panel — for now just export/import (e.g. so a precise reproducible state
// can be shared when reporting a bug); more global actions (reset timeline, etc.) can land here later.
export function GlobalActionsPanel() {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleExport() {
    AvVisualTabController.exportSession()
  }

  function handleImportClick() {
    fileInputRef.current?.click()
  }

  function handleResetClick() {
    modals.openConfirmModal({
      title: tAv('GlobalActions.ResetConfirmTitle'),
      children: tAv('GlobalActions.ResetConfirmBody'),
      labels: { confirm: tAv('GlobalActions.Reset'), cancel: tAv('GlobalActions.ResetCancel') },
      confirmProps: { color: 'red' },
      centered: true,
      onConfirm: () => {
        AvVisualTabController.resetTimeline()
        Message.success(tAv('GlobalActions.ResetSuccess'))
      },
    })
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''   // allow re-selecting the same file next time
    if (!file) return

    const reader = new FileReader()
    reader.onload = () => {
      try {
        const json = JSON.parse(String(reader.result))
        const ok = AvVisualTabController.importSession(json)
        if (ok) {
          Message.success(tAv('GlobalActions.ImportSuccess'))
        } else {
          Message.error(tAv('GlobalActions.ImportError'))
        }
      } catch {
        Message.error(tAv('GlobalActions.ImportError'))
      }
    }
    reader.readAsText(file)
  }

  return (
    <Stack gap={8} style={{
      width: 180,
      flexShrink: 0,
      background: 'var(--layer-1)',
      boxShadow: 'var(--shadow-card)',
      borderRadius: 8,
      padding: 16,
    }}>
      <Text size='sm' fw={700}>{tAv('GlobalActions.Title')}</Text>
      <Button size='xs' leftSection={<IconDownload size={14} />} onClick={handleExport}>
        {tAv('GlobalActions.Export')}
      </Button>
      <Button size='xs' variant='default' leftSection={<IconUpload size={14} />} onClick={handleImportClick}>
        {tAv('GlobalActions.Import')}
      </Button>
      <Button size='xs' variant='outline' color='red' leftSection={<IconRefresh size={14} />} onClick={handleResetClick}>
        {tAv('GlobalActions.Reset')}
      </Button>
      <input ref={fileInputRef} type='file' accept='.json' style={{ display: 'none' }} onChange={handleFileChange} />
    </Stack>
  )
}
