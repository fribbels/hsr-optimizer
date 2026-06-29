import { ActionIcon, Button, SegmentedControl, Stack, Text, Tooltip } from '@mantine/core'
import { modals } from '@mantine/modals'
import { IconChevronLeft, IconChevronRight, IconDownload, IconRefresh, IconScissors, IconTrash, IconUpload } from '@tabler/icons-react'
import { Message } from 'lib/interactions/message'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import type { ActiveIntervention } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { useRef, type ChangeEvent } from 'react'
import { useTranslation } from 'react-i18next'

type GlobalActionsPanelProps = {
  // Live state at the current Playhead — used to seed a new Wave when "cutting" the current one (see
  // handleCutWave). The same maps AvVisualizerTab already computes for the energy overview panel.
  energyAtPlayhead: Map<string, number>
  activeInterventionsAtPlayhead: Map<string, ActiveIntervention[]>
  teamSpAtPlayhead: { sp: number; spMax: number }
}

// Sticky sidebar to the right of the whole AV Visualizer, for actions that operate on the whole saved
// session rather than any one panel — export/import, resetting the timeline, switching/display-mode
// toggles, and Wave (混沌回忆换面) management.
export function GlobalActionsPanel({ energyAtPlayhead, activeInterventionsAtPlayhead, teamSpAtPlayhead }: GlobalActionsPanelProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const displayMode = useAVVisualTabStore((s) => s.timelineDisplayMode)
  const playheadAv = useAVVisualTabStore((s) => s.playheadAv)
  const currentWaveIndex = useAVVisualTabStore((s) => s.savedSession.currentWaveIndex)
  const waveCount = useAVVisualTabStore((s) => s.savedSession.waves.length)
  // Cutting only makes sense from the latest wave — cutting an earlier one would orphan whatever already
  // continues from it. Deleting is the mirror image: only the LAST wave can ever be removed.
  const isViewingLastWave = currentWaveIndex === waveCount - 1

  function handleCutWave() {
    modals.openConfirmModal({
      title: tAv('GlobalActions.CutWaveConfirmTitle'),
      children: tAv('GlobalActions.CutWaveConfirmBody'),
      labels: { confirm: tAv('GlobalActions.CutWave'), cancel: tAv('GlobalActions.ResetCancel') },
      confirmProps: { color: 'orange' },
      centered: true,
      onConfirm: () => {
        AvVisualTabController.cutWaveAtPlayhead(playheadAv, {
          energyByChar: Object.fromEntries(energyAtPlayhead),
          activeInterventionsByChar: Object.fromEntries(activeInterventionsAtPlayhead),
          teamSp: { ...teamSpAtPlayhead },
        })
        Message.success(tAv('GlobalActions.CutWaveSuccess'))
      },
    })
  }

  function handleRemoveLastWave() {
    modals.openConfirmModal({
      title: tAv('GlobalActions.RemoveWaveConfirmTitle'),
      children: tAv('GlobalActions.RemoveWaveConfirmBody'),
      labels: { confirm: tAv('GlobalActions.RemoveWave'), cancel: tAv('GlobalActions.ResetCancel') },
      confirmProps: { color: 'red' },
      centered: true,
      onConfirm: () => {
        AvVisualTabController.removeLastWave()
        Message.success(tAv('GlobalActions.RemoveWaveSuccess'))
      },
    })
  }

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

      <Stack gap={2}>
        <Text size='xs' c='dimmed'>{tAv('GlobalActions.Wave')}</Text>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Tooltip label={tAv('GlobalActions.PrevWave')} position='top'>
            <ActionIcon
              variant='default'
              size='sm'
              disabled={currentWaveIndex <= 0}
              onClick={() => AvVisualTabController.setCurrentWaveIndex(currentWaveIndex - 1)}
            >
              <IconChevronLeft size={14} />
            </ActionIcon>
          </Tooltip>
          <Text size='xs' fw={600} style={{ flex: 1, textAlign: 'center' }}>
            {currentWaveIndex + 1} / {waveCount}
          </Text>
          <Tooltip label={tAv('GlobalActions.NextWave')} position='top'>
            <ActionIcon
              variant='default'
              size='sm'
              disabled={currentWaveIndex >= waveCount - 1}
              onClick={() => AvVisualTabController.setCurrentWaveIndex(currentWaveIndex + 1)}
            >
              <IconChevronRight size={14} />
            </ActionIcon>
          </Tooltip>
        </div>
        <Tooltip label={tAv('GlobalActions.CutWaveHint')} position='top' multiline w={220}>
          <Button
            size='xs'
            fullWidth
            variant='outline'
            color='orange'
            leftSection={<IconScissors size={14} />}
            disabled={!isViewingLastWave}
            onClick={handleCutWave}
          >
            {tAv('GlobalActions.CutWave')}
          </Button>
        </Tooltip>
        <Button
          size='xs'
          fullWidth
          variant='outline'
          color='red'
          leftSection={<IconTrash size={14} />}
          disabled={waveCount <= 1}
          onClick={handleRemoveLastWave}
        >
          {tAv('GlobalActions.RemoveWave')}
        </Button>
      </Stack>

      <Stack gap={2}>
        <Text size='xs' c='dimmed'>{tAv('GlobalActions.DisplayMode')}</Text>
        <SegmentedControl
          size='xs'
          fullWidth
          value={displayMode}
          onChange={(v) => AvVisualTabController.setTimelineDisplayMode(v as 'all' | 'single')}
          data={[
            { label: tAv('GlobalActions.DisplayModeAll'), value: 'all' },
            { label: tAv('GlobalActions.DisplayModeSingle'), value: 'single' },
          ]}
        />
      </Stack>

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
