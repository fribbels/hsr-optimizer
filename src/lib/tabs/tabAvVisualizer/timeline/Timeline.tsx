import { Button, Switch } from '@mantine/core'
import { IconPlus } from '@tabler/icons-react'
import { AvVisualTabController } from 'lib/tabs/tabAvVisualizer/avVisualTabController'
import { TimelineRow } from 'lib/tabs/tabAvVisualizer/timeline/TimelineRow'
import type { Intervention, SimEvent } from 'lib/tabs/tabAvVisualizer/types'
import { useAVVisualTabStore } from 'lib/tabs/tabAvVisualizer/useAVVisualTabStore'
import { useTranslation } from 'react-i18next'

export type TimelineCharacter = {
  id: string
  name: string
  spd: number
  baseSpd: number  // White value (no relics), used for percent-based speed buff math
  color: string
  slotIndex: number
}

// Sim event plus the display fields needed for rendering (color, character name, slotIndex). Computed once in
// AvVisualizerTab (shared with ActionDisplayPanel) and passed down to Timeline / Row.
export type EnrichedSimEvent = SimEvent & {
  color: string
  characterName: string
  slotIndex: number
}

type TimelineProps = {
  interventions: Intervention[]
  rowCount: number
  simEvents: EnrichedSimEvent[]
}

export function Timeline({ interventions, rowCount, simEvents }: TimelineProps) {
  const { t: tAv } = useTranslation('avVisualizerTab')
  const mocFirstRow = useAVVisualTabStore((s) => s.savedSession.mocFirstRow)
  const playheadAv = useAVVisualTabStore((s) => s.playheadAv)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
      {Array.from({ length: rowCount }, (_, i) => {
        const rowStart = AvVisualTabController.getRowStart(i, mocFirstRow)
        const rowSize = AvVisualTabController.getRowSize(i, mocFirstRow)
        const rowEnd = rowStart + rowSize
        return (
          <TimelineRow
            key={i}
            rowStart={rowStart}
            rowSize={rowSize}
            simEvents={simEvents.filter((e) => e.av >= rowStart && e.av < rowEnd)}
            interventions={interventions.filter((iv) => iv.triggerAv >= rowStart && iv.triggerAv < rowEnd)}
            onSeek={AvVisualTabController.setPlayheadAv}
            playheadAv={playheadAv}
            topRightOverlay={i === 0 ? (
              <div style={{
                background: 'rgba(0,0,0,0.4)',
                borderRadius: 6,
                padding: '2px 8px',
              }}>
                <Switch
                  size='xs'
                  label={tAv('Timeline.MocToggle')}
                  checked={mocFirstRow}
                  onChange={(e) => AvVisualTabController.setMocFirstRow(e.currentTarget.checked)}
                />
              </div>
            ) : undefined}
          />
        )
      })}

      <Button
        variant='default'
        size='xs'
        leftSection={<IconPlus size={12} />}
        onClick={AvVisualTabController.addRow}
        style={{ marginTop: 4, alignSelf: 'flex-start' }}
      >
        {tAv('Timeline.AddRow')}
      </Button>
    </div>
  )
}
